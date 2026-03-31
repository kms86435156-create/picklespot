"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, Save, Upload } from "lucide-react";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const RECRUIT_STATUSES = [
  { value: "모집중", label: "모집중" },
  { value: "상시모집", label: "상시모집" },
  { value: "모집마감", label: "모집마감" },
];

const LEVEL_OPTIONS = [
  { value: "초급환영", label: "초급환영" },
  { value: "중급이상", label: "중급이상" },
  { value: "무관", label: "무관" },
];

interface ClubFormData {
  name: string;
  region: string;
  homeVenue: string;
  contactName: string;
  contact: string;
  contactKakao: string;
  foundedAt: string;
  memberCount: number | string;
  recruitStatus: string;
  meetingSchedule: string;
  fee: string;
  level: string;
  description: string;
  logoUrl: string;
  snsLink: string;
  isPublished: boolean;
}

const EMPTY: ClubFormData = {
  name: "", region: "", homeVenue: "", contactName: "", contact: "", contactKakao: "",
  foundedAt: "", memberCount: "", recruitStatus: "모집중", meetingSchedule: "",
  fee: "", level: "", description: "", logoUrl: "", snsLink: "", isPublished: true,
};

export default function ClubForm({ initialData, clubId }: { initialData?: Partial<ClubFormData & Record<string, any>>; clubId?: string }) {
  const router = useRouter();
  const isEdit = !!clubId;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ClubFormData>(() => {
    if (!initialData) return EMPTY;
    return {
      ...EMPTY,
      ...initialData,
      homeVenue: initialData.homeVenue || initialData.meetingVenue || "",
      contact: initialData.contact || initialData.contactPhone || initialData.contactPhoneOrKakao || "",
      contactKakao: initialData.contactKakao || "",
      recruitStatus: initialData.recruitStatus || (initialData.isRecruiting === false ? "모집마감" : "모집중"),
      isPublished: initialData.isPublished !== false,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setField<K extends keyof ClubFormData>(key: K, value: ClubFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setField("logoUrl", data.url);
      else alert(data.error || "업로드 실패");
    } catch { alert("이미지 업로드에 실패했습니다."); }
    setUploading(false);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "동호회명을 입력해주세요.";
    if (!form.region) e.region = "지역을 선택해주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/admin/clubs/${clubId}` : "/api/admin/clubs";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, memberCount: Number(form.memberCount) || 0 }),
      });
      if (res.ok) { router.push("/admin/clubs"); router.refresh(); }
      else { const data = await res.json(); alert(data.error || "저장에 실패했습니다."); }
    } catch { alert("서버에 연결할 수 없습니다."); }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 text-text-muted hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-xl font-bold text-white">{isEdit ? "동호회 수정" : "동호회 등록"}</h1>
          <p className="text-xs text-text-muted mt-0.5">{isEdit ? "정보를 수정하고 저장하세요" : "새 동호회 정보를 입력하세요"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <Field label="동호회명" required error={errors.name}>
            <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="강남피클러스" className={inputCls(errors.name)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="지역" required error={errors.region}>
              <select value={form.region} onChange={e => setField("region", e.target.value)} className={inputCls(errors.region)}>
                <option value="">선택해주세요</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="활동 장소">
              <input type="text" value={form.homeVenue} onChange={e => setField("homeVenue", e.target.value)} placeholder="OO 피클볼 센터" className={inputCls()} />
            </Field>
          </div>
          <Field label="설립일">
            <input type="date" value={form.foundedAt} onChange={e => setField("foundedAt", e.target.value)} className={inputCls()} />
          </Field>
        </Section>

        {/* 연락처 */}
        <Section title="연락처">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="대표자명">
              <input type="text" value={form.contactName} onChange={e => setField("contactName", e.target.value)} placeholder="홍길동" className={inputCls()} />
            </Field>
            <Field label="전화번호">
              <input type="tel" value={form.contact} onChange={e => setField("contact", e.target.value)} placeholder="010-0000-0000" className={inputCls()} />
            </Field>
            <Field label="카카오톡">
              <input type="text" value={form.contactKakao} onChange={e => setField("contactKakao", e.target.value)} placeholder="카톡 ID 또는 오픈채팅 링크" className={inputCls()} />
            </Field>
          </div>
        </Section>

        {/* 활동 정보 */}
        <Section title="활동 정보">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="회원 수">
              <input type="number" value={form.memberCount} onChange={e => setField("memberCount", e.target.value)} placeholder="35" min={0} className={inputCls()} />
            </Field>
            <Field label="모집 상태">
              <select value={form.recruitStatus} onChange={e => setField("recruitStatus", e.target.value)} className={inputCls()}>
                {RECRUIT_STATUSES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="활동 요일/시간">
            <input type="text" value={form.meetingSchedule} onChange={e => setField("meetingSchedule", e.target.value)} placeholder="매주 토/일 14:00~17:00" className={inputCls()} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="회비 정보">
              <input type="text" value={form.fee} onChange={e => setField("fee", e.target.value)} placeholder="월 30,000원" className={inputCls()} />
            </Field>
            <Field label="실력 수준">
              <select value={form.level} onChange={e => setField("level", e.target.value)} className={inputCls()}>
                <option value="">선택</option>
                {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* 소개 & 이미지 */}
        <Section title="소개 & 이미지">
          <Field label="소개글">
            <textarea value={form.description} onChange={e => setField("description", e.target.value)} placeholder="동호회에 대한 소개글을 작성하세요..." rows={5} className={`${inputCls()} resize-y`} />
          </Field>
          <Field label="로고/대표 이미지">
            <div className="flex items-start gap-4">
              {form.logoUrl ? (
                <div className="relative w-24 h-24 bg-dark rounded-lg overflow-hidden border border-ui-border">
                  <img src={form.logoUrl} alt="로고" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setField("logoUrl", "")} className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-24 h-24 flex flex-col items-center justify-center gap-1.5 bg-dark border-2 border-dashed border-ui-border rounded-lg text-text-muted hover:border-brand-cyan/50 hover:text-brand-cyan transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px]">{uploading ? "업로드중..." : "이미지 선택"}</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }} />
              <div className="text-[11px] text-text-muted space-y-1 pt-1"><p>JPG, PNG, WebP, GIF</p><p>최대 5MB</p></div>
            </div>
          </Field>
          <Field label="SNS 링크 (인스타그램, 밴드, 카페 등)">
            <input type="url" value={form.snsLink} onChange={e => setField("snsLink", e.target.value)} placeholder="https://..." className={inputCls()} />
          </Field>
        </Section>

        {/* 공개 설정 */}
        <Section title="공개 설정">
          <Field label="공개 여부">
            <label className="flex items-center gap-3 cursor-pointer">
              <button type="button" onClick={() => setField("isPublished", !form.isPublished)} className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? "bg-brand-cyan" : "bg-white/10"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPublished ? "left-[22px]" : "left-0.5"}`} />
              </button>
              <span className={`text-sm ${form.isPublished ? "text-brand-cyan" : "text-text-muted"}`}>{form.isPublished ? "공개" : "비공개"}</span>
            </label>
          </Field>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ui-border">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm text-text-muted hover:text-white border border-ui-border rounded-lg transition-colors">취소</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? "저장 중..." : isEdit ? "수정 완료" : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="bg-surface border border-ui-border rounded-lg p-5"><h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-ui-border">{title}</h2><div className="space-y-4">{children}</div></div>);
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (<div><label className="block text-xs text-text-muted mb-1.5 font-medium">{label} {required && <span className="text-red-400">*</span>}</label>{children}{error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}</div>);
}

function inputCls(error?: string) {
  return `w-full px-3 py-2.5 bg-dark border rounded-lg text-sm text-white placeholder:text-text-muted/40 focus:outline-none transition-colors ${error ? "border-red-400/50 focus:border-red-400" : "border-ui-border focus:border-brand-cyan/50"}`;
}
