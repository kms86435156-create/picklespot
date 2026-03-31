"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Users, Send } from "lucide-react";

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const LEVELS = ["전 급수", "입문~초급", "초급~중급", "중급~상급"];
const inputCls = "w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-brand-cyan/50 transition-colors";

export default function CreateClubPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ name: "", region: "", level: "전 급수", meetingSchedule: "", fee: "", contactPhone: "", description: "", isRecruiting: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!loading && !user) router.push("/login?from=/clubs/create"); }, [user, loading, router]);

  function set(k: string, v: any) { setForm(prev => ({ ...prev, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("동호회명을 입력해주세요."); return; }
    if (!form.region) { setError("지역을 선택해주세요."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clubs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "생성에 실패했습니다."); return; }
      router.push(`/clubs/${data.club.id}`);
    } catch { setError("서버에 연결할 수 없습니다."); }
    finally { setSubmitting(false); }
  }

  if (loading || !user) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-text-muted text-sm animate-pulse">로딩 중...</div></div>;

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">동호회 만들기</h1>
            <p className="text-sm text-text-muted">새로운 피클볼 동호회를 만들어보세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

          <div className="bg-surface border border-ui-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-ui-border">기본 정보</h2>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">동호회명 <span className="text-red-400">*</span></label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="예: 강남피클러스" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">지역 <span className="text-red-400">*</span></label>
                <select value={form.region} onChange={e => set("region", e.target.value)} className={inputCls}>
                  <option value="">선택</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">실력대</label>
                <select value={form.level} onChange={e => set("level", e.target.value)} className={inputCls}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">활동 일정</label>
              <input type="text" value={form.meetingSchedule} onChange={e => set("meetingSchedule", e.target.value)} placeholder="예: 매주 토/일 14:00~17:00" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">회비</label>
                <input type="text" value={form.fee} onChange={e => set("fee", e.target.value)} placeholder="예: 월 3만원" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">연락처</label>
                <input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="010-0000-0000" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">소개글</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="동호회를 소개해주세요" rows={4} className={`${inputCls} resize-y`} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isRecruiting} onChange={e => set("isRecruiting", e.target.checked)} className="accent-brand-cyan" />
              <span className="text-sm text-text-muted">회원 모집중</span>
            </label>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" /> {submitting ? "생성 중..." : "동호회 만들기"}
          </button>
        </form>
      </div>
    </div>
  );
}
