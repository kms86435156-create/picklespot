"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import FilterBar from "@/components/ui/FilterBar";
import TournamentCard from "./TournamentCard";

const filters = [
  { key: "region", label: "지역", options: ["전체", "서울", "경기", "부산", "인천", "대전", "대구", "광주", "제주"] },
  { key: "type", label: "종목", options: ["전체", "단식", "복식", "혼합복식", "팀전"] },
  { key: "level", label: "수준", options: ["전체", "전체레벨", "D이하", "D~C", "D~B", "C이상", "B이상"] },
  { key: "fee", label: "참가비", options: ["전체", "3만원 이하", "3~5만원", "5만원 이상"] },
  { key: "status", label: "상태", options: ["전체", "모집중", "마감임박", "대기자 가능", "마감"] },
];

type SortKey = "date" | "closing" | "popular" | "fee-low" | "fee-high";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "date", label: "날짜순" },
  { key: "closing", label: "마감임박순" },
  { key: "popular", label: "인기순" },
  { key: "fee-low", label: "참가비 낮은순" },
  { key: "fee-high", label: "참가비 높은순" },
];

export default function TournamentsContent({ tournaments }: { tournaments: any[] }) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [showFilters, setShowFilters] = useState(true);

  const filtered = useMemo(() => {
    const result = tournaments.filter((t) => {
      if (activeFilters.region && activeFilters.region !== "전체" && t.region !== activeFilters.region) return false;

      if (activeFilters.type && activeFilters.type !== "전체") {
        const typeMap: Record<string, string[]> = {
          "단식": ["singles"],
          "복식": ["doubles"],
          "혼합복식": ["mixed"],
          "팀전": ["team"],
        };
        if (typeMap[activeFilters.type] && !typeMap[activeFilters.type].includes(t.type)) return false;
      }

      if (activeFilters.level && activeFilters.level !== "전체" && activeFilters.level !== "전체레벨") {
        if (t.level !== activeFilters.level && t.level !== "전체") return false;
      }

      if (activeFilters.fee && activeFilters.fee !== "전체") {
        if (activeFilters.fee === "3만원 이하" && t.entryFee > 30000) return false;
        if (activeFilters.fee === "3~5만원" && (t.entryFee < 30000 || t.entryFee > 50000)) return false;
        if (activeFilters.fee === "5만원 이상" && t.entryFee < 50000) return false;
      }

      if (activeFilters.status && activeFilters.status !== "전체") {
        const statusMap: Record<string, string[]> = {
          "모집중": ["open"],
          "마감임박": ["closing"],
          "대기자 가능": ["waitlist"],
          "마감": ["closed"],
        };
        if (statusMap[activeFilters.status] && !statusMap[activeFilters.status].includes(t.status)) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "closing": {
          const statusOrder: Record<string, number> = { closing: 0, open: 1, waitlist: 2, ongoing: 3, closed: 4 };
          return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
        }
        case "popular":
          return b.currentSlots - a.currentSlots;
        case "fee-low":
          return a.entryFee - b.entryFee;
        case "fee-high":
          return b.entryFee - a.entryFee;
        default:
          return 0;
      }
    });

    return result;
  }, [tournaments, activeFilters, sortBy]);

  const openCount = tournaments.filter((t) => t.status === "open" || t.status === "closing").length;
  const closingCount = tournaments.filter((t) => t.status === "closing").length;

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          sysLabel="SYS.TOURNAMENT"
          title="대회 검색 &"
          highlight="원클릭 신청"
          subtitle="전국 피클볼 대회를 비교하고, 바로 신청하세요"
        />

        {/* 요약 통계 바 */}
        <div className="flex items-center gap-4 mb-5 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm px-3 py-1.5 shrink-0">
            <span className="text-xs text-text-muted">모집중</span>
            <span className="text-sm font-black text-brand-cyan font-mono">{openCount}</span>
          </div>
          {closingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-brand-red/10 border border-brand-red/20 rounded-sm px-3 py-1.5 shrink-0 animate-pulse">
              <span className="text-xs text-text-muted">마감임박</span>
              <span className="text-sm font-black text-brand-red font-mono">{closingCount}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/5 border border-ui-border rounded-sm px-3 py-1.5 shrink-0">
            <span className="text-xs text-text-muted">전체</span>
            <span className="text-sm font-black font-mono">{tournaments.length}</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted/40 shrink-0 ml-auto">수동 등록 기준</span>
        </div>

        {/* 필터 토글 + 정렬 */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-cyan transition-colors min-h-[36px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showFilters ? "필터 접기" : "필터 펼치기"}
            {Object.values(activeFilters).filter((v) => v && v !== "전체").length > 0 && (
              <span className="bg-brand-cyan/20 text-brand-cyan text-[10px] font-mono px-1.5 py-0.5 rounded-sm">
                {Object.values(activeFilters).filter((v) => v && v !== "전체").length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-transparent text-xs text-text-muted border border-ui-border rounded-sm px-2 py-1.5 min-h-[36px] focus:border-brand-cyan/40 focus:outline-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key} className="bg-dark">{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 필터 */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FilterBar
              filters={filters}
              onFilterChange={(key, value) =>
                setActiveFilters((prev) => ({ ...prev, [key]: value }))
              }
            />
          </motion.div>
        )}

        {/* 결과 수 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-muted">
            검색 결과 <span className="text-brand-cyan font-bold">{filtered.length}</span>개
          </span>
        </div>

        {/* 카드 그리드 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="font-bold mb-1">조건에 맞는 대회가 없습니다</p>
            <p className="text-sm">필터를 조정해 보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <TournamentCard tournament={t} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
