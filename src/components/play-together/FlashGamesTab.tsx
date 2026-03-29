"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, Shield, Star, ArrowUpDown, ChevronRight, Users } from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import ClipButton from "@/components/ui/ClipButton";
import FilterBar from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";

const filters = [
  { key: "region", label: "지역", options: ["전체", "서울", "경기", "부산", "인천", "대전"] },
  { key: "time", label: "시간대", options: ["전체", "오전(~12시)", "오후(12~18시)", "저녁(18시~)"] },
  { key: "level", label: "실력", options: ["전체", "전체레벨", "D이하", "C~D", "C~B", "B이상"] },
  { key: "vibe", label: "성향", options: ["전체", "가볍게", "빡겜"] },
  { key: "beginner", label: "초보", options: ["전체", "초보환영"] },
];

type SortKey = "date" | "spots" | "trust";

export default function FlashGamesTab({ flashGames = [] }: { flashGames?: any[] }) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortKey>("date");

  const filtered = useMemo(() => {
    const result = flashGames.filter((g) => {
      if (activeFilters.region && activeFilters.region !== "전체" && g.region !== activeFilters.region) return false;
      if (activeFilters.vibe && activeFilters.vibe !== "전체") {
        if (activeFilters.vibe === "가볍게" && g.vibe !== "casual") return false;
        if (activeFilters.vibe === "빡겜" && g.vibe !== "competitive") return false;
      }
      if (activeFilters.beginner === "초보환영" && !g.beginnerWelcome) return false;
      if (activeFilters.time && activeFilters.time !== "전체") {
        const hour = new Date(g.dateTime).getHours();
        if (activeFilters.time === "오전(~12시)" && hour >= 12) return false;
        if (activeFilters.time === "오후(12~18시)" && (hour < 12 || hour >= 18)) return false;
        if (activeFilters.time === "저녁(18시~)" && hour < 18) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "date": return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        case "spots": return (a.maxPlayers - a.currentPlayers) - (b.maxPlayers - b.currentPlayers);
        case "trust": return b.authorTrustScore - a.authorTrustScore;
        default: return 0;
      }
    });
    return result;
  }, [activeFilters, sortBy]);

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-text-muted">
          <span className="text-brand-cyan font-bold">{filtered.length}</span>개 번개
        </span>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-transparent text-xs text-text-muted border border-ui-border rounded-sm px-2 py-1.5 min-h-[36px] focus:border-brand-cyan/40 focus:outline-none cursor-pointer"
          >
            <option value="date" className="bg-dark">날짜순</option>
            <option value="spots" className="bg-dark">자리 적은순</option>
            <option value="trust" className="bg-dark">신뢰도순</option>
          </select>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
      />

      {filtered.length === 0 ? (
        <EmptyFlashGames />
      ) : (
        <div className="space-y-3">
          {filtered.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Link href={`/play-together/${g.id}`} className="block relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 md:p-5 hover:border-brand-cyan/30 transition-all group">
                  <TechCorners />

                  {/* 상단: 상태 + 태그 */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <StatusBadge status={g.status === "full" ? "full" : "open"} />
                    {g.beginnerWelcome && (
                      <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded-sm border border-brand-cyan/20">초보환영</span>
                    )}
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${
                      g.vibe === "casual"
                        ? "text-green-400 bg-green-400/10 border-green-400/20"
                        : "text-brand-red bg-brand-red/10 border-brand-red/20"
                    }`}>
                      {g.vibe === "casual" ? "가볍게" : "빡겜"}
                    </span>
                    {g.gender && (
                      <span className="text-[10px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded-sm border border-ui-border">{g.gender}</span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      {/* 제목 */}
                      <h3 className="font-bold text-base mb-2 group-hover:text-brand-cyan transition-colors">{g.title}</h3>

                      {/* 메타 정보 2열 */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-text-muted mb-2">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-cyan/50 shrink-0" />{g.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-cyan/50 shrink-0" />
                          {new Date(g.dateTime).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })}
                          {" "}
                          {new Date(g.dateTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-brand-cyan/50 shrink-0" />실력: {g.level}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          ⏱ {g.duration}
                          {g.costPerPerson && <span className="ml-1">· ₩{g.costPerPerson.toLocaleString()}/인</span>}
                        </span>
                      </div>

                      {/* 주최자 신뢰 정보 */}
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center shrink-0">
                            <span className="text-brand-cyan text-[9px] font-bold">{(g.authorName || "?")[0]}</span>
                          </div>
                          <span>{g.authorName}</span>
                          <span className="text-text-muted/50">Lv.{g.authorLevel}</span>
                        </div>
                        <span className="flex items-center gap-0.5">
                          <Shield className="w-3 h-3" />{g.authorTrustScore}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400" />{g.authorMannerScore}
                        </span>
                        {g.authorNoShow === 0 && <span className="text-brand-cyan">노쇼0</span>}
                        <span className="text-text-muted/40">참석률 {g.authorAttendRate}%</span>
                      </div>
                    </div>

                    {/* 오른쪽: 인원 + CTA */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* 인원 원형 */}
                      <div className="text-center">
                        <div className="relative w-14 h-14">
                          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                            <circle
                              cx="28" cy="28" r="24" fill="none"
                              stroke={g.status === "full" ? "#8A8A93" : "#00D4FF"}
                              strokeWidth="3"
                              strokeDasharray={`${(g.currentPlayers / g.maxPlayers) * 151} 151`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-sm font-black font-mono ${g.status === "full" ? "text-text-muted" : "text-brand-cyan"}`}>
                              {g.currentPlayers}/{g.maxPlayers}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-text-muted block mt-0.5">
                          {g.maxPlayers - g.currentPlayers > 0 ? `${g.maxPlayers - g.currentPlayers}자리` : "마감"}
                        </span>
                      </div>

                      <div className="hidden md:flex items-center">
                        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-cyan transition-colors" />
                      </div>
                    </div>
                  </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

function EmptyFlashGames() {
  const { toast } = useToast();
  return (
    <div className="relative bg-ui-bg/20 border border-ui-border rounded-sm p-10 text-center card-grid-bg">
      <TechCorners />
      <div className="text-4xl mb-3">🏓</div>
      <p className="font-bold mb-1">조건에 맞는 번개가 없습니다</p>
      <p className="text-sm text-text-muted mb-4">필터를 바꿔보거나, 직접 번개를 만들어보세요!</p>
      <ClipButton variant="cyan" onClick={() => toast("번개 만들기 기능은 준비중입니다.", "info")}>번개 만들기</ClipButton>
    </div>
  );
}
