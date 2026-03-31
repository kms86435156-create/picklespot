"use client";

import { useState } from "react";
import { CheckCircle, Send, MapPin } from "lucide-react";
import Link from "next/link";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

export default function CourtRegisterPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name?.trim()) { setError("장소명을 입력해주세요."); return; }
    if (!form.address?.trim()) { setError("주소를 입력해주세요."); return; }
    if (!form.submitterName?.trim()) { setError("제보자 이름을 입력해주세요."); return; }
    if (!form.submitterContact?.trim()) { setError("제보자 연락처를 입력해주세요."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "court" }),
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
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 pt-14">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">피클볼장 등록 요청이 제출되었습니다</h2>
          <p className="text-sm text-text-muted mb-6">
            관리자가 검토 후 승인하면 사이트에 반영됩니다.<br />
            문의사항은 제출하신 연락처로 안내드립니다.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); setForm({}); }} className="px-5 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors">
              다른 장소 제보하기
            </button>
            <Link href="/courts" className="px-5 py-2.5 bg-surface border border-ui-border text-white text-sm rounded-lg hover:bg-white/5 transition-colors">
              피클볼장 목록으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">피클볼장 등록 요청</h1>
              <p className="text-sm text-text-muted">알고 계신 피클볼장 정보를 알려주세요. 검토 후 등록됩니다.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="bg-surface border border-ui-border rounded-lg p-5">
            <h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-ui-border">장소 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">장소명 <span className="text-red-400">*</span></label>
                <input type="text" value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="예: OO 피클볼 센터" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">주소 <span className="text-red-400">*</span></label>
                <input type="text" value={form.address || ""} onChange={e => set("address", e.target.value)} placeholder="상세 주소를 입력해주세요" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">지역</label>
                  <select value={form.region || ""} onChange={e => set("region", e.target.value)} className={inputCls}>
                    <option value="">선택</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">실내/실외</label>
                  <select value={form.courtType || ""} onChange={e => set("courtType", e.target.value)} className={inputCls}>
                    <option value="">선택</option>
                    <option value="실내">실내</option>
                    <option value="실외">실외</option>
                    <option value="실내+실외">실내+실외</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">코트 수</label>
                  <input type="number" value={form.courtCount || ""} onChange={e => set("courtCount", e.target.value)} placeholder="예: 4" min={0} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">운영시간</label>
                  <input type="text" value={form.operatingHours || ""} onChange={e => set("operatingHours", e.target.value)} placeholder="예: 09:00~22:00" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">연락처</label>
                <input type="text" value={form.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="장소 연락처 (선택)" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">기타 메모</label>
                <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="추가 정보 (주차, 편의시설 등)" rows={3} className={`${inputCls} resize-y`} />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-ui-border rounded-lg p-5">
            <h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-ui-border">제보자 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">이름 <span className="text-red-400">*</span></label>
                  <input type="text" value={form.submitterName || ""} onChange={e => set("submitterName", e.target.value)} placeholder="홍길동" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">연락처 <span className="text-red-400">*</span></label>
                  <input type="text" value={form.submitterContact || ""} onChange={e => set("submitterContact", e.target.value)} placeholder="010-0000-0000" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" />
            {submitting ? "제출 중..." : "피클볼장 등록 요청"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-brand-cyan/50 transition-colors";
