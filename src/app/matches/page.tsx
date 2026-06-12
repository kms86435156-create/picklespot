"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MapPin, Calendar, Users, Plus, Filter,
  Search, X
} from "lucide-react";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const SKILL_LEVELS = ["전체", "처음이에요", "초보", "초중급", "중급", "중상급", "상급", "무관"];
const SKILL_COLORS: Record<string, string> = {
  "처음이에요": "bg-emerald-400/15 text-emerald-400",
  "초보": "bg-green-400/15 text-green-400",
  "초중급": "bg-lime-400/15 text-lime-400",
  "중급": "bg-yellow-400/15 text-yellow-400",
  "중상급": "bg-orange-400/15 text-orange-400",
  "상급": "bg-red-400/15 text-red-400",
  "무관": "bg-white/10 text-text-muted",
  "전체": "bg-white/10 text-text-muted",
};

function SkillBadge({ level }: { level: string }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${SKILL_COLORS[level] || "bg-white/10 text-text-muted"}`}>
      {level}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const wd = weekdays[d.getDay()];
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
  const prefix = diff === 0 ? "오늘" : diff === 1 ? "내일" : diff === 2 ? "모레" : `${month}/${day}`;
  return `${prefix} (${wd})`;
}

export default function MatchesPage() {
  const [meetups, setMeetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState("전체");
  const [skill, setSkill] = useState("전체");
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  function fetchMeetups() {
    setLoading(true);
    const params = new URLSearchParams({ status: "open" });
    if (region !== "전체") params.set("region", region);
    if (skill !== "전체" && skill !== "무관") params.set("skillLevel", skill);
    if (beginnerOnly) params.set("beginnerOnly", "1");
    fetch(`/api/meetups?${params}`)
      .then(r => r.json())
      .then(d => setMeetups(d.meetups || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchMeetups(); }, [region, skill, beginnerOnly]);

  const filtered = useMemo(() => {
    if (!keyword) return meetups;
    const kw = keyword.toLowerCase();
    return meetups.filter(m =>
      m.title?.toLowerCase().includes(kw) ||
      m.venueName?.toLowerCase().includes(kw) ||
      m.region?.includes(keyword)
    );
  }, [meetups, keyword]);

  const activeFilters = [
    region !== "전체" ? region : null,
    skill !== "전체" ? skill : null,
    beginnerOnly ? "초보환영" : null,
  ].filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-cyan" />
            <h1 className="text-2xl font-black text-white">번개 모집</h1>
          </div>
          <Link
            href="/matches/create"
            id="matches-create-btn"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-cyan text-dark font-black rounded-xl text-sm hover:bg-brand-cyan/90 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20"
          >
            <Plus className="w-4 h-4" />
            번개 만들기
          </Link>
        </div>
        <p className="text-text-muted text-sm">오늘 같이 칠 사람을 찾아보세요. 신청 즉시 확정!</p>
      </div>

      {/* 검색 + 필터 버튼 */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="번개명, 장소 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-ui-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${showFilters || activeFilters.length > 0 ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" : "bg-surface border-ui-border text-text-muted hover:text-white"}`}
        >
          <Filter className="w-4 h-4" />
          필터
          {activeFilters.length > 0 && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-brand-cyan text-dark text-[10px] font-black flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* 필터 패널 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-surface border border-ui-border rounded-xl p-4 space-y-4">
              {/* 지역 */}
              <div>
                <p className="text-xs font-bold text-text-muted mb-2">지역</p>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setRegion(r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${region === r ? "bg-brand-cyan text-dark" : "bg-white/[0.06] text-text-muted hover:text-white border border-ui-border"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* 실력 */}
              <div>
                <p className="text-xs font-bold text-text-muted mb-2">실력 수준</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_LEVELS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSkill(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${skill === s ? "bg-brand-cyan text-dark" : "bg-white/[0.06] text-text-muted hover:text-white border border-ui-border"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 초보 환영 토글 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">초보 환영만 보기</p>
                  <p className="text-xs text-text-muted">초보자 환영 표시된 번개만 표시</p>
                </div>
                <button
                  onClick={() => setBeginnerOnly(!beginnerOnly)}
                  className={`relative w-11 h-6 rounded-full transition-all ${beginnerOnly ? "bg-brand-cyan" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${beginnerOnly ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              {/* 초기화 */}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => { setRegion("전체"); setSkill("전체"); setBeginnerOnly(false); }}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" /> 필터 초기화
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 활성 필터 태그 */}
      {activeFilters.length > 0 && !showFilters && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {activeFilters.map(f => (
            <span key={f} className="flex items-center gap-1 px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full text-xs font-bold text-brand-cyan">
              {f}
            </span>
          ))}
          <button
            onClick={() => { setRegion("전체"); setSkill("전체"); setBeginnerOnly(false); }}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] rounded-full text-xs text-text-muted hover:text-white border border-ui-border transition-colors"
          >
            <X className="w-3 h-3" /> 초기화
          </button>
        </div>
      )}

      {/* 결과 수 */}
      {!loading && (
        <p className="text-xs text-text-muted mb-4">
          {filtered.length > 0 ? `${filtered.length}개의 번개` : "번개 없음"}
        </p>
      )}

      {/* 번개 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface border border-ui-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((m, i) => {
            const filled = m.currentPlayers || 0;
            const max = m.maxPlayers || 4;
            const pct = Math.min((filled / max) * 100, 100);
            const isFull = filled >= max;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/matches/${m.id}`} className="block group">
                  <div className={`bg-surface border rounded-xl p-4 transition-all ${isFull ? "border-ui-border opacity-60" : "border-ui-border hover:border-brand-cyan/40 hover:bg-brand-cyan/[0.02]"}`}>
                    <div className="flex items-start gap-3">
                      {/* 날짜 블록 */}
                      <div className="shrink-0 w-12 text-center">
                        <div className="text-xs font-bold text-brand-cyan">{formatDate(m.date).split("(")[0].trim()}</div>
                        <div className="text-[10px] text-text-muted">({m.date ? new Date(m.date).toLocaleDateString("ko", { weekday: "short" }) : ""})</div>
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <SkillBadge level={m.skillLevel || "무관"} />
                          {m.isBeginnerFriendly && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">초보환영</span>
                          )}
                          {isFull
                            ? <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-text-muted">마감</span>
                            : <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">모집중</span>
                          }
                        </div>
                        <h3 className={`font-bold text-sm mb-1 line-clamp-1 transition-colors ${isFull ? "text-text-muted" : "text-white group-hover:text-brand-cyan"}`}>
                          {m.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {m.startTime}{m.endTime ? `~${m.endTime}` : ""}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {m.region}{m.venueName ? ` · ${m.venueName}` : ""}
                          </span>
                        </div>
                      </div>

                      {/* 인원 */}
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-black text-white">{filled}<span className="text-text-muted font-normal">/{max}</span></div>
                        <Users className="w-3.5 h-3.5 text-text-muted ml-auto mt-0.5" />
                        {m.fee > 0
                          ? <div className="text-[10px] text-brand-cyan font-bold mt-1">₩{m.fee.toLocaleString()}</div>
                          : <div className="text-[10px] text-emerald-400 font-bold mt-1">무료</div>
                        }
                      </div>
                    </div>

                    {/* 인원 progress bar */}
                    <div className="mt-3 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isFull ? "bg-white/20" : "bg-brand-cyan"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-ui-border rounded-xl bg-surface/50">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="font-bold text-white text-lg mb-2">조건에 맞는 번개가 없어요</h3>
          <p className="text-text-muted text-sm mb-6">
            {activeFilters.length > 0 ? "필터를 바꿔보거나 직접 번개를 만들어보세요!" : "첫 번개를 만들어 같이 칠 사람을 모아보세요!"}
          </p>
          <Link
            href="/matches/create"
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-cyan text-dark font-black rounded-xl hover:bg-brand-cyan/90 transition-all"
          >
            <Zap className="w-4 h-4" />
            번개 만들기
          </Link>
        </div>
      )}
    </div>
  );
}
