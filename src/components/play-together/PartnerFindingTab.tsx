"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Shield, Star, Award, ArrowUpDown } from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import ClipButton from "@/components/ui/ClipButton";
import FilterBar from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";

const filters = [
  { key: "region", label: "지역", options: ["전체", "서울", "경기", "부산", "인천", "대전"] },
  { key: "level", label: "실력", options: ["전체", "D이하", "D~C", "C~B", "B이상", "A이상"] },
  { key: "vibe", label: "성향", options: ["전체", "가볍게", "빡겜"] },
  { key: "days", label: "요일", options: ["전체", "평일", "주말"] },
];

export default function PartnerFindingTab({ partnerPosts = [] }: { partnerPosts?: any[] }) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<"recent" | "trust" | "manner">("recent");
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const result = partnerPosts.filter((p) => {
      if (activeFilters.vibe && activeFilters.vibe !== "전체") {
        if (activeFilters.vibe === "가볍게" && p.vibe !== "casual") return false;
        if (activeFilters.vibe === "빡겜" && p.vibe !== "competitive") return false;
      }
      if (activeFilters.days && activeFilters.days !== "전체") {
        const weekdays = ["월", "화", "수", "목", "금"];
        const weekends = ["토", "일"];
        if (activeFilters.days === "평일" && !p.preferredDays.some((d) => weekdays.includes(d))) return false;
        if (activeFilters.days === "주말" && !p.preferredDays.some((d) => weekends.includes(d))) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "recent": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "trust": return b.trustScore - a.trustScore;
        case "manner": return b.authorMannerScore - a.authorMannerScore;
        default: return 0;
      }
    });
    return result;
  }, [activeFilters, sortBy]);

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-text-muted">
          <span className="text-brand-cyan font-bold">{filtered.length}</span>명 파트너 모집중
        </span>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "trust" | "manner")}
            className="bg-transparent text-xs text-text-muted border border-ui-border rounded-sm px-2 py-1.5 min-h-[36px] focus:border-brand-cyan/40 focus:outline-none cursor-pointer"
          >
            <option value="recent" className="bg-dark">최신순</option>
            <option value="trust" className="bg-dark">신뢰도순</option>
            <option value="manner" className="bg-dark">매너순</option>
          </select>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
      />

      {filtered.length === 0 ? (
        <div className="relative bg-ui-bg/20 border border-ui-border rounded-sm p-10 text-center card-grid-bg">
          <TechCorners />
          <div className="text-4xl mb-3">🤝</div>
          <p className="font-bold mb-1">조건에 맞는 파트너 글이 없습니다</p>
          <p className="text-sm text-text-muted mb-4">직접 파트너를 구해보세요!</p>
          <ClipButton variant="cyan" onClick={() => toast("파트너 구하기 기능은 준비중입니다.", "info")}>파트너 구하기</ClipButton>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 md:p-5 hover:border-brand-cyan/30 transition-all group">
                <TechCorners />

                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* 프로필 */}
                  <div className="flex items-start gap-3 shrink-0">
                    <div className="w-11 h-11 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center clip-angled shrink-0">
                      <span className="text-brand-cyan font-bold">{p.authorName[0]}</span>
                    </div>
                    <div className="md:w-28">
                      <div className="font-bold text-sm">{p.authorName}</div>
                      <div className="text-xs text-text-muted">Lv.{p.authorLevel}</div>
                      {/* 신뢰 지표 */}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
                        <span className="flex items-center gap-0.5" title="신뢰점수">
                          <Shield className="w-2.5 h-2.5" />{p.trustScore}
                        </span>
                        <span className="flex items-center gap-0.5" title="매너점수">
                          <Star className="w-2.5 h-2.5 text-yellow-400" />{p.authorMannerScore}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        참석률 {p.authorAttendRate}% · {p.noShowCount === 0 ? <span className="text-brand-cyan">노쇼0</span> : `노쇼${p.noShowCount}`}
                      </div>
                      <div className="text-[10px] text-text-muted">{p.authorTotalGames}경기</div>
                    </div>
                  </div>

                  {/* 본문 */}
                  <div className="flex-1 min-w-0">
                    {/* 구하는 유형 */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-brand-cyan">{p.lookingFor}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${
                        p.vibe === "casual"
                          ? "text-green-400 bg-green-400/10 border-green-400/20"
                          : "text-brand-red bg-brand-red/10 border-brand-red/20"
                      }`}>
                        {p.vibe === "casual" ? "가볍게" : "빡겜"}
                      </span>
                    </div>

                    <p className="text-sm mb-3 leading-relaxed">{p.message}</p>

                    {/* 조건 */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted mb-2">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-brand-cyan/50" />{p.region}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-brand-cyan/50" />{p.preferredTime}
                      </span>
                    </div>

                    {/* 선호 요일 */}
                    <div className="flex items-center gap-1 mb-2">
                      {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                        <span
                          key={day}
                          className={`w-6 h-6 flex items-center justify-center text-[10px] rounded-sm ${
                            p.preferredDays.includes(day)
                              ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 font-bold"
                              : "bg-white/[0.02] text-text-muted/30 border border-transparent"
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* 배지 */}
                    {p.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.badges.map((b) => (
                          <span key={b} className="text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5" />{b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex flex-col gap-2">
                    <ClipButton variant="cyan" onClick={() => toast("연락 기능은 준비중입니다. 곧 제공됩니다.", "info")}>연락하기</ClipButton>
                    <span className="text-[10px] text-text-muted text-center">
                      {new Date(p.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
