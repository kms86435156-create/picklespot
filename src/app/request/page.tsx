"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Send } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const REQUEST_TYPES = [
  { value: "tournament", label: "대회", desc: "피클볼 대회 정보를 등록 요청합니다" },
  { value: "court", label: "피클볼장", desc: "피클볼장/코트 정보를 등록 요청합니다" },
  { value: "club", label: "동호회", desc: "동호회 정보를 등록 요청합니다" },
];

export default function RequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [type, setType] = useState(searchParams.get("type") || "");
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=/request");
    }
  }, [user, authLoading, router]);

  // 로그인한 사용자 정보를 제출자 필드에 자동 채움
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        submitterName: prev.submitterName || user.name,
        submitterContact: prev.submitterContact || "",
      }));
    }
  }, [user]);

  function setField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!type) { setError("요청 유형을 선택해주세요."); return; }
    if (!form.name?.trim()) { setError("이름/대회명을 입력해주세요."); return; }
    if (!form.submitterName?.trim()) { setError("제출자 이름을 입력해주세요."); return; }
    if (!form.submitterContact?.trim()) { setError("연락처를 입력해주세요."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "제출에 실패했습니다.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">등록 요청이 제출되었습니다</h2>
          <p className="text-sm text-text-muted mb-6">
            관리자가 검토 후 승인하면 사이트에 반영됩니다.<br />
            문의사항은 제출하신 연락처로 안내드립니다.
          </p>
          <button onClick={() => { setSubmitted(false); setType(""); setForm({}); }} className="px-6 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors">
            다른 정보 등록 요청
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">정보 등록 요청</h1>
          <p className="text-sm text-text-muted mt-1">대회, 피클볼장, 동호회 정보를 알려주세요. 검토 후 사이트에 등록됩니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          {/* 유형 선택 */}
          <div className="space-y-2">
            <label className="block text-xs text-text-muted font-medium mb-2">요청 유형 <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-3">
              {REQUEST_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    type === t.value
                      ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan"
                      : "bg-surface border-ui-border text-text-muted hover:border-text-muted"
                  }`}
                >
                  <p className="font-bold text-sm">{t.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {type && (
            <>
              {/* 공통: 이름 */}
              <Section title="기본 정보">
                <Field label={type === "tournament" ? "대회명" : type === "court" ? "장소명" : "동호회명"} required>
                  <input type="text" value={form.name || ""} onChange={e => setField("name", e.target.value)} placeholder="이름을 입력해주세요" className={inputCls} />
                </Field>
                <Field label="지역">
                  <select value={form.region || ""} onChange={e => setField("region", e.target.value)} className={inputCls}>
                    <option value="">선택</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>

                {/* 대회 전용 */}
                {type === "tournament" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="시작일">
                        <input type="date" value={form.startDate || ""} onChange={e => setField("startDate", e.target.value)} className={inputCls} />
                      </Field>
                      <Field label="종료일">
                        <input type="date" value={form.endDate || ""} onChange={e => setField("endDate", e.target.value)} className={inputCls} />
                      </Field>
                    </div>
                    <Field label="장소">
                      <input type="text" value={form.venueName || ""} onChange={e => setField("venueName", e.target.value)} placeholder="대회 개최 장소" className={inputCls} />
                    </Field>
                    <Field label="주최/주관">
                      <input type="text" value={form.organizer || ""} onChange={e => setField("organizer", e.target.value)} placeholder="주최 단체명" className={inputCls} />
                    </Field>
                  </>
                )}

                {/* 피클볼장 전용 */}
                {type === "court" && (
                  <>
                    <Field label="주소">
                      <input type="text" value={form.address || ""} onChange={e => setField("address", e.target.value)} placeholder="상세 주소" className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="코트 수">
                        <input type="number" value={form.courtCount || ""} onChange={e => setField("courtCount", e.target.value)} placeholder="6" min={0} className={inputCls} />
                      </Field>
                      <Field label="코트 타입">
                        <select value={form.courtType || ""} onChange={e => setField("courtType", e.target.value)} className={inputCls}>
                          <option value="">선택</option>
                          <option value="실내">실내</option>
                          <option value="실외">실외</option>
                          <option value="겸용">겸용</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="연락처">
                      <input type="text" value={form.phone || ""} onChange={e => setField("phone", e.target.value)} placeholder="02-1234-5678" className={inputCls} />
                    </Field>
                  </>
                )}

                {/* 동호회 전용 */}
                {type === "club" && (
                  <>
                    <Field label="대표자명">
                      <input type="text" value={form.contactName || ""} onChange={e => setField("contactName", e.target.value)} placeholder="동호회 대표" className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="회원 수">
                        <input type="number" value={form.memberCount || ""} onChange={e => setField("memberCount", e.target.value)} placeholder="30" min={0} className={inputCls} />
                      </Field>
                      <Field label="활동 일정">
                        <input type="text" value={form.meetingSchedule || ""} onChange={e => setField("meetingSchedule", e.target.value)} placeholder="매주 토/일 14:00" className={inputCls} />
                      </Field>
                    </div>
                  </>
                )}

                <Field label="상세 설명">
                  <textarea value={form.description || ""} onChange={e => setField("description", e.target.value)} placeholder="추가 정보를 자유롭게 작성해주세요" rows={4} className={`${inputCls} resize-y`} />
                </Field>
              </Section>

              {/* 제출자 정보 */}
              <Section title="제출자 정보">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="이름" required>
                    <input type="text" value={form.submitterName || ""} onChange={e => setField("submitterName", e.target.value)} placeholder="홍길동" className={inputCls} />
                  </Field>
                  <Field label="연락처" required>
                    <input type="text" value={form.submitterContact || ""} onChange={e => setField("submitterContact", e.target.value)} placeholder="010-0000-0000" className={inputCls} />
                  </Field>
                </div>
                <Field label="비고">
                  <input type="text" value={form.note || ""} onChange={e => setField("note", e.target.value)} placeholder="기타 참고사항" className={inputCls} />
                </Field>
              </Section>

              <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
                {submitting ? "제출 중..." : "등록 요청 제출"}
              </button>
            </>
          )}
        </form>
      </div>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-text-muted mb-1.5 font-medium">{label} {required && <span className="text-red-400">*</span>}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-brand-cyan/50 transition-colors";
