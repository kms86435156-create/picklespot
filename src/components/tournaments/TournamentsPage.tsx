"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, MapPin, Calendar, Search, Users, Clock, ArrowRight, Star, Mail, Bell } from "lucide-react";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const STATUSES = [
  { value: "", label: "전체" },
  { value: "open", label: "접수중" },
  { value: "closing", label: "마감임박" },
  { value: "closed", label: "접수마감" },
  { value: "completed", label: "종료" },
];

function daysUntil(dateStr: string) {
  if (!dateStr) return 999;
  const ms = new Date(dateStr).getTime();
  if (isNaN(ms)) return 999;
  return Math.ceil((ms - Date.now()) / 86400000);
}

function getStatusLabel(t: any) {
  if (t.status === "cancelled") return { label: "취소", color: "bg-red-500/15 text-red-400" };
  if (t.status === "closed" || t.status === "completed") return { label: "마감", color: "bg-white/5 text-text-muted" };
  const dl = daysUntil(t.registrationDeadline || t.startDate);
  if (dl <= 0) return { label: "마감", color: "bg-white/5 text-text-muted" };
  if (dl <= 7) return { label: `D-${dl}`, color: "bg-red-500/15 text-red-400" };
  return { label: "접수중", color: "bg-green-400/10 text-green-400" };
}

function getMonth(dateStr: string) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return d.getMonth() + 1;
}

export default function TournamentsPage({ tournaments }: { tournaments: any[] }) {
  const [region, setRegion] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(0);
  const [keyword, setKeyword] = useState("");

  // 이번 주 마감 대회
  const closingSoon = useMemo(() =>
    tournaments.filter(t => {
      const dl = daysUntil(t.registrationDeadline || t.startDate);
      return dl > 0 && dl <= 7 && t.status !== "closed" && t.status !== "completed" && t.status !== "cancelled";
    }).sort((a, b) => daysUntil(a.registrationDeadline || a.startDate) - daysUntil(b.registrationDeadline || b.startDate)),
  [tournaments]);

  // Featured
  const featured = useMemo(() =>
    tournaments.filter(t => t.isFeatured && t.status !== "completed" && t.status !== "cancelled").slice(0, 3),
  [tournaments]);

  // Filtered list
  const filtered = useMemo(() => {
    return tournaments.filter(t => {
      if (region !== "전체" && t.region !== region) return false;
      if (statusFilter) {
        if (statusFilter === "open" && (t.status !== "open" && t.status !== "draft")) return false;
        if (statusFilter === "closing" && daysUntil(t.registrationDeadline || t.startDate) > 7) return false;
        if (statusFilter === "closed" && t.status !== "closed") return false;
        if (statusFilter === "completed" && t.status !== "completed") return false;
      }
      if (monthFilter && getMonth(t.startDate) !== monthFilter) return false;
      if (keyword && !t.title?.includes(keyword) && !t.venueName?.includes(keyword) && !t.organizerName?.includes(keyword)) return false;
      return true;
    }).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
  }, [tournaments, region, statusFilter, monthFilter, keyword]);

  const months = useMemo(() => {
    const m = new Set<number>();
    tournaments.forEach(t => { const mo = getMonth(t.startDate); if (mo) m.add(mo); });
    return Array.from(m).sort((a, b) => a - b);
  }, [tournaments]);

  const openCount = tournaments.filter(t => t.status === "open" || (t.status === "draft" && daysUntil(t.registrationDeadline || t.startDate) > 0)).length;

  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-cyan/5 to-transparent border-b border-ui-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">전국 피클볼 대회</h1>
              <p className="text-sm text-text-muted">대회를 찾고 바로 신청하세요</p>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <span><span className="text-brand-cyan font-bold text-lg">{tournaments.length}</span> <span className="text-text-muted">전체 대회</span></span>
            <span><span className="text-green-400 font-bold text-lg">{openCount}</span> <span className="text-text-muted">접수중</span></span>
            <span><span className="text-red-400 font-bold text-lg">{closingSoon.length}</span> <span className="text-text-muted">이번주 마감</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400" />
              <h2 className="font-bold text-white">추천 대회</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map(t => (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                  <div className="relative bg-gradient-to-br from-brand-cyan/5 to-transparent border border-brand-cyan/20 rounded-lg p-5 hover:border-brand-cyan/40 transition-all group h-full">
                    <div className="absolute top-3 right-3"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /></div>
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded mb-3 ${getStatusLabel(t).color}`}>{getStatusLabel(t).label}</span>
                    <h3 className="font-bold text-white group-hover:text-brand-cyan transition-colors mb-2 leading-snug">{t.title}</h3>
                    <div className="space-y-1 text-xs text-text-muted">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-brand-cyan" />{t.startDate}{t.endDate && t.endDate !== t.startDate ? ` ~ ${t.endDate}` : ""}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-brand-cyan" />{t.venueName || "장소 확인중"}</div>
                      <div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-brand-cyan" />{t.eventTypes || "종별 확인중"}</div>
                    </div>
                    {t.maxParticipants > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-text-muted mb-1">
                          <span>{t.currentParticipants}/{t.maxParticipants}명</span>
                          <span>{Math.round((t.currentParticipants / t.maxParticipants) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-cyan rounded-full transition-all" style={{ width: `${Math.min((t.currentParticipants / t.maxParticipants) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-ui-border flex items-center justify-between">
                      <span className="text-sm font-bold text-brand-cyan">₩{(t.entryFee || 0).toLocaleString()}</span>
                      <span className="text-[11px] text-brand-cyan font-mono group-hover:translate-x-1 transition-transform">상세보기 →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 이번 주 마감 */}
        {closingSoon.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-red-400" />
              <h2 className="font-bold text-white">이번 주 마감 대회</h2>
              <span className="text-xs text-red-400 font-bold">{closingSoon.length}건</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
              {closingSoon.slice(0, 4).map(t => {
                const dl = daysUntil(t.registrationDeadline || t.startDate);
                return (
                  <Link key={t.id} href={`/tournaments/${t.id}`} className="block min-w-[240px] md:min-w-0">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 hover:border-red-500/40 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded">D-{dl}</span>
                        <span className="text-[10px] text-text-muted">{t.registrationDeadline || t.startDate} 마감</span>
                      </div>
                      <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors mb-1 truncate">{t.title}</h3>
                      <p className="text-xs text-text-muted truncate">{t.venueName} · ₩{(t.entryFee || 0).toLocaleString()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Filters */}
        <section>
          <div className="bg-surface border border-ui-border rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text" placeholder="대회명, 장소, 주최 검색..."
                  value={keyword} onChange={e => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <select value={region} onChange={e => setRegion(e.target.value)}
                className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {/* Month pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button onClick={() => setMonthFilter(0)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${!monthFilter ? "bg-brand-cyan text-dark" : "bg-white/5 text-text-muted hover:text-white"}`}>
                전체
              </button>
              {months.map(m => (
                <button key={m} onClick={() => setMonthFilter(m)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${monthFilter === m ? "bg-brand-cyan text-dark" : "bg-white/5 text-text-muted hover:text-white"}`}>
                  {m}월
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section>
          <p className="text-sm text-text-muted mb-4">{filtered.length}개 대회</p>
          {filtered.length === 0 ? (
            <TournamentEmptyState hasData={tournaments.length > 0} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t, i) => {
                const sl = getStatusLabel(t);
                return (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                    <Link href={`/tournaments/${t.id}`} className="block h-full">
                      <div className="bg-surface border border-ui-border rounded-lg p-5 hover:border-brand-cyan/30 transition-all group h-full flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${sl.color}`}>{sl.label}</span>
                          <span className="text-[10px] text-text-muted font-mono">{t.region}</span>
                        </div>
                        <h3 className="font-bold text-white group-hover:text-brand-cyan transition-colors mb-2 leading-snug line-clamp-2">{t.title}</h3>
                        <div className="space-y-1.5 text-xs text-text-muted flex-1">
                          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 shrink-0" /><span>{t.startDate || "일정 미정"}{t.endDate && t.endDate !== t.startDate ? ` ~ ${t.endDate}` : ""}</span></div>
                          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{t.venueName || "장소 확인중"}</span></div>
                          <div className="flex items-center gap-1.5"><Users className="w-3 h-3 shrink-0" /><span>{t.eventTypes || "종별 확인중"}</span></div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-ui-border flex items-center justify-between">
                          <span className="text-sm font-bold text-white">₩{(t.entryFee || 0).toLocaleString()}</span>
                          {t.maxParticipants > 0 && (
                            <span className="text-[10px] text-text-muted">{t.currentParticipants}/{t.maxParticipants}명</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-brand-cyan/10 to-brand-red/5 border border-brand-cyan/20 rounded-lg p-6 md:p-8 text-center">
          <h2 className="text-lg font-bold text-white mb-2">대회를 개최하시나요?</h2>
          <p className="text-sm text-text-muted mb-4">PBL.SYS로 대회 접수, 참가자 관리, 결과 기록까지 한 곳에서 운영하세요.</p>
          <Link href="/tournaments/register" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors">
            대회 등록 요청하기 <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function TournamentEmptyState({ hasData }: { hasData: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactName: email, clubName: "", region: "", phone: "", memo: "대회 알림 신청", currentProblem: "tournament_notification" }),
      });
      setSubmitted(true);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface border border-dashed border-ui-border rounded-lg p-10 text-center">
      <Trophy className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
      <p className="text-text-muted font-medium mb-1">
        {hasData ? "해당 조건에 맞는 대회가 없습니다" : "현재 등록된 대회가 없습니다"}
      </p>
      <p className="text-xs text-text-muted/70 mb-6">
        {hasData ? "다른 조건으로 검색하거나, 대회를 등록해보세요." : "대회 정보가 등록되면 이곳에 표시됩니다."}
      </p>

      {!hasData && (
        <div className="max-w-sm mx-auto mb-6">
          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
              <Bell className="w-4 h-4" />
              알림 신청이 완료되었습니다!
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 px-4 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? "..." : "대회 알림 신청"}
              </button>
            </form>
          )}
          <p className="text-[10px] text-text-muted/50 mt-2">대회 정보가 등록되면 이메일로 알려드립니다</p>
        </div>
      )}

      <Link href="/tournaments/register" className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
        대회 등록 요청하기 <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
