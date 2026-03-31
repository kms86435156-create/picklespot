"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, Save, Plus } from "lucide-react";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const COURT_TYPES = [
  { value: "실내", label: "실내" },
  { value: "실외", label: "실외" },
  { value: "겸용", label: "겸용" },
];

const FLOOR_TYPES = [
  { value: "우레탄", label: "우레탄" },
  { value: "아크릴", label: "아크릴" },
  { value: "콘크리트", label: "콘크리트" },
  { value: "체육관마루", label: "체육관마루" },
  { value: "기타", label: "기타" },
];

const AMENITY_OPTIONS = [
  "주차장", "샤워실", "탈의실", "음수대", "매점", "조명", "관중석",
];

interface CourtFormData {
  name: string;
  address: string;
  region: string;
  lat: string;
  lng: string;
  courtCount: number | string;
  courtType: string;
  floorType: string;
  operatingHours: string;
  pricing: string;
  amenities: string;
  phone: string;
  website: string;
  images: string[];
  description: string;
  isPublished: boolean;
}

const EMPTY_FORM: CourtFormData = {
  name: "",
  address: "",
  region: "",
  lat: "",
  lng: "",
  courtCount: "",
  courtType: "",
  floorType: "",
  operatingHours: "",
  pricing: "",
  amenities: "",
  phone: "",
  website: "",
  images: [],
  description: "",
  isPublished: true,
};

export default function CourtForm({
  initialData,
  courtId,
}: {
  initialData?: Partial<CourtFormData & Record<string, any>>;
  courtId?: string;
}) {
  const router = useRouter();
  const isEdit = !!courtId;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CourtFormData>(() => {
    if (!initialData) return EMPTY_FORM;
    return {
      ...EMPTY_FORM,
      ...initialData,
      lat: String(initialData.lat || ""),
      lng: String(initialData.lng || ""),
      courtType: initialData.courtType || initialData.indoorOutdoor || "",
      address: initialData.address || initialData.addressRoad || initialData.roadAddress || "",
      region: initialData.region || initialData.regionDepth1 || "",
      images: Array.isArray(initialData.images) ? initialData.images : [],
      isPublished: initialData.isPublished !== false,
    };
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    const a = form.amenities;
    if (!a) return [];
    return a.split(",").map(s => s.trim()).filter(Boolean);
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setField<K extends keyof CourtFormData>(key: K, value: CourtFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function toggleAmenity(a: string) {
    setSelectedAmenities(prev => {
      const next = prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a];
      setField("amenities", next.join(", "));
      return next;
    });
  }

  async function handleImageUpload(file: File) {
    if (form.images.length >= 5) {
      alert("최대 5장까지 업로드 가능합니다.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setField("images", [...form.images, data.url]);
      } else {
        alert(data.error || "업로드 실패");
      }
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    }
    setUploading(false);
  }

  function removeImage(idx: number) {
    setField("images", form.images.filter((_, i) => i !== idx));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "장소명을 입력해주세요.";
    if (!form.address.trim()) e.address = "주소를 입력해주세요.";
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
      const url = isEdit ? `/api/admin/courts/${courtId}` : "/api/admin/courts";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          courtCount: Number(form.courtCount) || 0,
          lat: form.lat ? Number(form.lat) : null,
          lng: form.lng ? Number(form.lng) : null,
        }),
      });

      if (res.ok) {
        router.push("/admin/courts");
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
          <h1 className="text-xl font-bold text-white">{isEdit ? "피클볼장 수정" : "피클볼장 등록"}</h1>
          <p className="text-xs text-text-muted mt-0.5">{isEdit ? "정보를 수정하고 저장하세요" : "새 피클볼장 정보를 입력하세요"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <Field label="장소명" required error={errors.name}>
            <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="OO 피클볼 아레나" className={inputCls(errors.name)} />
          </Field>

          <Field label="주소" required error={errors.address}>
            <input type="text" value={form.address} onChange={e => setField("address", e.target.value)} placeholder="서울시 송파구 올림픽로 25" className={inputCls(errors.address)} />
          </Field>

          <Field label="지역" required error={errors.region}>
            <select value={form.region} onChange={e => setField("region", e.target.value)} className={inputCls(errors.region)}>
              <option value="">선택해주세요</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="위도">
              <input type="text" value={form.lat} onChange={e => setField("lat", e.target.value)} placeholder="37.5665" className={inputCls()} />
            </Field>
            <Field label="경도">
              <input type="text" value={form.lng} onChange={e => setField("lng", e.target.value)} placeholder="126.9780" className={inputCls()} />
            </Field>
          </div>
        </Section>

        {/* 코트 정보 */}
        <Section title="코트 정보">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="코트 수">
              <input type="number" value={form.courtCount} onChange={e => setField("courtCount", e.target.value)} placeholder="6" min={0} className={inputCls()} />
            </Field>
            <Field label="코트 타입">
              <select value={form.courtType} onChange={e => setField("courtType", e.target.value)} className={inputCls()}>
                <option value="">선택</option>
                {COURT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="바닥 재질">
              <select value={form.floorType} onChange={e => setField("floorType", e.target.value)} className={inputCls()}>
                <option value="">선택</option>
                {FLOOR_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* 운영 정보 */}
        <Section title="운영 정보">
          <Field label="운영 시간">
            <input type="text" value={form.operatingHours} onChange={e => setField("operatingHours", e.target.value)} placeholder="평일 09:00~22:00, 주말 08:00~18:00" className={inputCls()} />
          </Field>

          <Field label="이용 요금">
            <input type="text" value={form.pricing} onChange={e => setField("pricing", e.target.value)} placeholder="1시간 15,000원 / 2시간 25,000원" className={inputCls()} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="연락처">
              <input type="text" value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="02-1234-5678" className={inputCls()} />
            </Field>
            <Field label="홈페이지/네이버지도 링크">
              <input type="url" value={form.website} onChange={e => setField("website", e.target.value)} placeholder="https://..." className={inputCls()} />
            </Field>
          </div>
        </Section>

        {/* 편의시설 */}
        <Section title="편의시설">
          <Field label="편의시설 (복수선택)">
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    selectedAmenities.includes(a)
                      ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan font-medium"
                      : "bg-dark border-ui-border text-text-muted hover:border-text-muted"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* 사진 */}
        <Section title="사진 (최대 5장)">
          <div className="flex flex-wrap gap-3">
            {form.images.map((url, i) => (
              <div key={i} className="relative w-28 h-28 bg-dark rounded-lg overflow-hidden border border-ui-border">
                <img src={url} alt={`사진 ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {form.images.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-28 h-28 flex flex-col items-center justify-center gap-1.5 bg-dark border-2 border-dashed border-ui-border rounded-lg text-text-muted hover:border-brand-cyan/50 hover:text-brand-cyan transition-colors"
              >
                {uploading ? (
                  <span className="text-[10px]">업로드중...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px]">{form.images.length}/5</span>
                  </>
                )}
              </button>
            )}
          </div>
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
          <p className="text-[10px] text-text-muted mt-2">JPG, PNG, WebP, GIF · 최대 5MB/장</p>
        </Section>

        {/* 상세 설명 & 공개 */}
        <Section title="상세 설명 & 공개 설정">
          <Field label="상세 설명">
            <textarea
              value={form.description}
              onChange={e => setField("description", e.target.value)}
              placeholder="피클볼장에 대한 상세 설명을 입력하세요..."
              rows={5}
              className={`${inputCls()} resize-y`}
            />
          </Field>

          <Field label="공개 여부">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setField("isPublished", !form.isPublished)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? "bg-brand-cyan" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPublished ? "left-[22px]" : "left-0.5"}`} />
              </button>
              <span className={`text-sm ${form.isPublished ? "text-brand-cyan" : "text-text-muted"}`}>
                {form.isPublished ? "공개" : "비공개"}
              </span>
            </label>
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

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
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
