"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Zap, Send } from "lucide-react";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];
const SKILL_OPTIONS = ["무관", "입문~초급", "초급~중급", "중급~상급"];
const PLAY_TYPES = ["복식", "단식", "자유"];

const inputCls = "w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-brand-cyan/50 transition-colors";

export default function CreateMatchPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [venues, setVenues] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "", meetupDate: "", meetupTime: "", region: "",
    venueName: "", playType: "복식", maxPlayers: "4",
    skillLevel: "무관", fee: "0", description: "", hostPhone: "",
  });
  const [useCustomVenue, setUseCustomVenue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login?from=/matches/create");
  }, [user, loading, router]);

  useEffect(() => {
    fetch("/api/venues").then(r => r.json()).then(d => setVenues(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  function set(key: string, val: string) { setForm(prev => ({ ...prev, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!form.meetupDate) { setError("날짜를 선택해주세요."); return; }
    if (!form.meetupTime) { setError("시간을 선택해주세요."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxPlayers: parseInt(form.maxPlayers, 10) || 4,
          fee: parseInt(form.fee, 10) || 0,
          hostName: user?.name || "",
          hostPhone: form.hostPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "생성에 실패했습니다."); return; }
      router.push(`/matches/${data.meetup.id}`);
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-text-muted text-sm animate-pulse">로딩 중...</div></div>;
  }

  const regionVenues = form.region ? venues.filter(v => v.region === form.region) : venues;

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">번개 만들기</h1>
            <p className="text-sm text-text-muted">함께 칠 사람을 모집해보세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          {/* 기본 정보 */}
          <div className="bg-surface border border-ui-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-ui-border">기본 정보</h2>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">제목 <span className="text-red-400">*</span></label>
              <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                placeholder='예: "토요일 오후 복식 2판"' className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">날짜 <span className="text-red-400">*</span></label>
                <input type="date" value={form.meetupDate} onChange={e => set("meetupDate", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">시간 <span className="text-red-400">*</span></label>
                <input type="time" value={form.meetupTime} onChange={e => set("meetupTime", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* 장소 */}
          <div className="bg-surface border border-ui-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-ui-border">장소</h2>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">지역</label>
              <select value={form.region} onChange={e => set("region", e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-text-muted">장소</label>
                <button type="button" onClick={() => setUseCustomVenue(!useCustomVenue)}
                  className="text-[10px] text-brand-cyan hover:underline">
                  {useCustomVenue ? "목록에서 선택" : "직접 입력"}
                </button>
              </div>
              {useCustomVenue ? (
                <input type="text" value={form.venueName} onChange={e => set("venueName", e.target.value)}
                  placeholder="장소명을 직접 입력" className={inputCls} />
              ) : (
                <select value={form.venueName} onChange={e => set("venueName", e.target.value)} className={inputCls}>
                  <option value="">등록된 피클볼장에서 선택</option>
                  {regionVenues.map(v => (
                    <option key={v.id} value={v.name}>{v.name} ({v.region})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 모집 조건 */}
          <div className="bg-surface border border-ui-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-ui-border">모집 조건</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">유형</label>
                <div className="flex gap-2">
                  {PLAY_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => set("playType", t)}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${form.playType === t ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan" : "bg-dark border-ui-border text-text-muted hover:text-white"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">정원 (2~20명)</label>
                <input type="number" value={form.maxPlayers} onChange={e => set("maxPlayers", e.target.value)}
                  min={2} max={20} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">실력대</label>
                <select value={form.skillLevel} onChange={e => set("skillLevel", e.target.value)} className={inputCls}>
                  {SKILL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">참가비</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">₩</span>
                  <input type="number" value={form.fee} onChange={e => set("fee", e.target.value)}
                    min={0} step={1000} className={`${inputCls} pl-7`} />
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-surface border border-ui-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-ui-border">추가 정보</h2>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">연락처</label>
              <input type="tel" value={form.hostPhone} onChange={e => set("hostPhone", e.target.value)}
                placeholder="010-0000-0000 (선택)" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">메모</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="추가 안내사항 (준비물, 주의사항 등)" rows={3} className={`${inputCls} resize-y`} />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" />
            {submitting ? "생성 중..." : "번개 만들기"}
          </button>
        </form>
      </div>
    </div>
  );
}
