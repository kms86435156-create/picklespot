"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ArrowLeft, Save } from "lucide-react";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const DIVISION_OPTIONS = [
  "남자단식", "여자단식", "남자복식", "여자복식", "혼합복식",
];

const STATUS_OPTIONS = [
  { value: "open", label: "접수중" },
  { value: "closing", label: "마감임박" },
  { value: "closed", label: "접수마감" },
  { value: "completed", label: "종료" },
];

interface TournamentFormData {
  title: string;
  startDate: string;
  endDate: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  venueName: string;
  venueAddress: string;
  region: string;
  divisions: string;
  fee: number | string;
  maxParticipants: number | string;
  organizer: string;
  description: string;
  posterUrl: string;
  status: string;
  detailUrl: string;
}

const EMPTY_FORM: TournamentFormData = {
  title: "",
  startDate: "",
  endDate: "",
  registrationOpenAt: "",
  registrationCloseAt: "",
  venueName: "",
  venueAddress: "",
  region: "",
  divisions: "",
  fee: "",
  maxParticipants: "",
  organizer: "",
  description: "",
  posterUrl: "",
  status: "open",
  detailUrl: "",
};

export default function TournamentForm({
  initialData,
  tournamentId,
}: {
  initialData?: Partial<TournamentFormData>;
  tournamentId?: string;
}) {
  const router = useRouter();
  const isEdit = !!tournamentId;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<TournamentFormData>(() => {
    if (!initialData) return EMPTY_FORM;
    return {
      ...EMPTY_FORM,
      ...initialData,
      // 호환성 매핑
      divisions: initialData.divisions || (initialData as any).eventTypes || "",
      fee: initialData.fee ?? (initialData as any).entryFee ?? "",
      organizer: initialData.organizer || (initialData as any).organizerName || "",
      registrationCloseAt: initialData.registrationCloseAt || (initialData as any).registrationDeadline || "",
    };
  });

  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(() => {
    const d = form.divisions;
    if (!d) return [];
    return d.split(",").map(s => s.trim()).filter(Boolean);
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setField<K extends keyof TournamentFormData>(key: K, value: TournamentFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function toggleDivision(d: string) {
    setSelectedDivisions(prev => {
      const next = prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d];
      setField("divisions", next.join(", "));
      return next;
    });
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setField("posterUrl", data.url);
      } else {
        alert(data.error || "업로드 실패");
      }
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    }
    setUploading(false);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "대회명을 입력해주세요.";
    if (!form.startDate) e.startDate = "시작일을 선택해주세요.";
    if (!form.endDate) e.endDate = "종료일을 선택해주세요.";
    if (!form.registrationOpenAt) e.registrationOpenAt = "접수 시작일을 선택해주세요.";
    if (!form.registrationCloseAt) e.registrationCloseAt = "접수 마감일을 선택해주세요.";
    if (!form.venueName.trim()) e.venueName = "장소명을 입력해주세요.";
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
      const url = isEdit ? `/api/admin/tournaments/${tournamentId}` : "/api/admin/tournaments";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fee: Number(form.fee) || 0,
          maxParticipants: Number(form.maxParticipants) || 0,
        }),
      });

      if (res.ok) {
        router.push("/admin/tournaments");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "저장에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
    setSaving(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 text-text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{isEdit ? "대회 수정" : "대회 등록"}</h1>
          <p className="text-xs text-text-muted mt-0.5">{isEdit ? "정보를 수정하고 저장하세요" : "새 대회 정보를 입력하세요"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <Field label="대회명" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={e => setField("title", e.target.value)}
              placeholder="제1회 서울 오픈 피클볼 대회"
              className={inputCls(errors.title)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="대회 시작일" required error={errors.startDate}>
              <input type="date" value={form.startDate} onChange={e => setField("startDate", e.target.value)} className={inputCls(errors.startDate)} />
            </Field>
            <Field label="대회 종료일" required error={errors.endDate}>
              <input type="date" value={form.endDate} onChange={e => setField("endDate", e.target.value)} className={inputCls(errors.endDate)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="접수 시작일" required error={errors.registrationOpenAt}>
              <input type="date" value={form.registrationOpenAt} onChange={e => setField("registrationOpenAt", e.target.value)} className={inputCls(errors.registrationOpenAt)} />
            </Field>
            <Field label="접수 마감일" required error={errors.registrationCloseAt}>
              <input type="date" value={form.registrationCloseAt} onChange={e => setField("registrationCloseAt", e.target.value)} className={inputCls(errors.registrationCloseAt)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="상태" required>
              <select value={form.status} onChange={e => setField("status", e.target.value)} className={inputCls()}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="지역" required error={errors.region}>
              <select value={form.region} onChange={e => setField("region", e.target.value)} className={inputCls(errors.region)}>
                <option value="">선택해주세요</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* 장소 */}
        <Section title="장소">
          <Field label="장소명" required error={errors.venueName}>
            <input type="text" value={form.venueName} onChange={e => setField("venueName", e.target.value)} placeholder="잠실실내체육관" className={inputCls(errors.venueName)} />
          </Field>
          <Field label="장소 주소">
            <input type="text" value={form.venueAddress} onChange={e => setField("venueAddress", e.target.value)} placeholder="서울시 송파구 올림픽로 25" className={inputCls()} />
          </Field>
        </Section>

        {/* 대회 상세 */}
        <Section title="대회 상세">
          <Field label="종목 (복수선택)">
            <div className="flex flex-wrap gap-2">
              {DIVISION_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDivision(d)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    selectedDivisions.includes(d)
                      ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan font-medium"
                      : "bg-dark border-ui-border text-text-muted hover:border-text-muted"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="참가비 (원)">
              <input type="number" value={form.fee} onChange={e => setField("fee", e.target.value)} placeholder="30000" min={0} className={inputCls()} />
            </Field>
            <Field label="정원 (명)">
              <input type="number" value={form.maxParticipants} onChange={e => setField("maxParticipants", e.target.value)} placeholder="64" min={0} className={inputCls()} />
            </Field>
          </div>

          <Field label="주최/주관">
            <input type="text" value={form.organizer} onChange={e => setField("organizer", e.target.value)} placeholder="서울시피클볼연합" className={inputCls()} />
          </Field>

          <Field label="상세 설명">
            <textarea
              value={form.description}
              onChange={e => setField("description", e.target.value)}
              placeholder="대회에 대한 상세 설명을 입력하세요..."
              rows={6}
              className={`${inputCls()} resize-y`}
            />
          </Field>
        </Section>

        {/* 포스터 & 링크 */}
        <Section title="포스터 & 외부 링크">
          <Field label="포스터 이미지">
            <div className="flex items-start gap-4">
              {form.posterUrl ? (
                <div className="relative w-32 h-40 bg-dark rounded-lg overflow-hidden border border-ui-border">
                  <img src={form.posterUrl} alt="포스터" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setField("posterUrl", "")}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-32 h-40 flex flex-col items-center justify-center gap-2 bg-dark border-2 border-dashed border-ui-border rounded-lg text-text-muted hover:border-brand-cyan/50 hover:text-brand-cyan transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px]">{uploading ? "업로드중..." : "이미지 선택"}</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
              <div className="text-[11px] text-text-muted space-y-1 pt-1">
                <p>JPG, PNG, WebP, GIF</p>
                <p>최대 5MB</p>
              </div>
            </div>
          </Field>

          <Field label="외부 접수 링크 (URL)">
            <input type="url" value={form.detailUrl} onChange={e => setField("detailUrl", e.target.value)} placeholder="https://..." className={inputCls()} />
          </Field>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ui-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm text-text-muted hover:text-white border border-ui-border rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "저장 중..." : isEdit ? "수정 완료" : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-ui-border rounded-lg p-5">
      <h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-ui-border">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-text-muted mb-1.5 font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full px-3 py-2.5 bg-dark border rounded-lg text-sm text-white placeholder:text-text-muted/40 focus:outline-none transition-colors ${
    error ? "border-red-400/50 focus:border-red-400" : "border-ui-border focus:border-brand-cyan/50"
  }`;
}
