"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowUpDown, SlidersHorizontal, Clock, Car, Droplets, Lightbulb, Wrench } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import FilterBar from "@/components/ui/FilterBar";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";

const filters = [
  { key: "region", label: "지역", options: ["전체", "서울", "경기", "부산", "인천"] },
  { key: "type", label: "유형", options: ["전체", "실내", "실외", "겸용"] },
  { key: "price", label: "가격", options: ["전체", "1.5만 이하", "1.5~2만", "2만 이상"] },
  { key: "amenity", label: "편의", options: ["전체", "주차", "샤워실", "장비대여", "조명"] },
];

type SortKey = "rating" | "price-low" | "price-high" | "courts" | "reviews";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CourtsContent({ venues }: { venues: any[] }) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [showFilters, setShowFilters] = useState(true);
  const [mapHover, setMapHover] = useState<string | null>(null);

  const courts = venues;

  const filtered = useMemo(() => {
    const result = courts.filter((c: any) => {
      if (activeFilters.region && activeFilters.region !== "전체" && c.region !== activeFilters.region) return false;
      if (activeFilters.type && activeFilters.type !== "전체") {
        const m: Record<string, string> = { "실내": "indoor", "실외": "outdoor", "겸용": "both" };
        if (c.type !== m[activeFilters.type]) return false;
      }
      if (activeFilters.price && activeFilters.price !== "전체") {
        if (activeFilters.price === "1.5만 이하" && c.pricePerHour > 15000) return false;
        if (activeFilters.price === "1.5~2만" && (c.pricePerHour < 15000 || c.pricePerHour > 20000)) return false;
        if (activeFilters.price === "2만 이상" && c.pricePerHour < 20000) return false;
      }
      if (activeFilters.amenity && activeFilters.amenity !== "전체") {
        const amenityMap: Record<string, keyof typeof c> = { "주차": "hasParking", "샤워실": "hasShower", "장비대여": "hasEquipmentRental", "조명": "hasLighting" };
        const key = amenityMap[activeFilters.amenity];
        if (key && !c[key]) return false;
      }
      return true;
    });
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "price-low": return a.pricePerHour - b.pricePerHour;
        case "price-high": return b.pricePerHour - a.pricePerHour;
        case "courts": return b.courtCount - a.courtCount;
        case "reviews": return b.reviewCount - a.reviewCount;
        default: return 0;
      }
    });
    return result;
  }, [courts, activeFilters, sortBy]);

  const totalAvail = courts.reduce((s: number, c: any) => s + (c.availableSlots || []).filter((sl: any) => sl.status === "available").length, 0);
  const typeLabel = (t: string) => t === "indoor" ? "실내" : t === "outdoor" ? "실외" : "실내/실외";

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader sysLabel="SYS.COURT" title="코트" highlight="예약" subtitle="내 주변 피클볼장을 찾고 바로 예약하세요" />

        {/* 요약 통계 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-2 mb-5">
          <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-3"><TechCorners />
            <div className="text-xs text-text-muted">등록 피클볼장</div>
            <div className="text-lg font-black text-brand-cyan font-mono">{courts.length}곳</div>
          </div>
          <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-3"><TechCorners />
            <div className="text-xs text-text-muted">오늘 예약 가능</div>
            <div className="text-lg font-black text-brand-cyan font-mono">{totalAvail}슬롯</div>
          </div>
          <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-3"><TechCorners />
            <div className="text-xs text-text-muted">평균 평점</div>
            <div className="text-lg font-black text-yellow-400 font-mono flex items-center gap-1"><Star className="w-4 h-4" />{courts.length > 0 ? (courts.reduce((s, c) => s + c.rating, 0) / courts.length).toFixed(1) : "—"}</div>
          </div>
        </motion.div>

        {/* 지도 — 인터랙티브 placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative bg-surface border border-ui-border rounded-sm overflow-hidden mb-6 h-[200px] md:h-[300px]">
          <div className="absolute inset-0 card-grid-bg" />
          {/* 지도 도트 */}
          {filtered.map((c, i) => {
            const isHover = mapHover === c.id;
            const avail = (c.availableSlots || []).filter((s: any) => s.status === "available").length;
            return (
              <Link key={c.id} href={`/courts/${c.id}`}>
                <button
                  onMouseEnter={() => setMapHover(c.id)}
                  onMouseLeave={() => setMapHover(null)}
                  className="absolute transition-all group cursor-pointer"
                  style={{ top: `${15 + ((i * 17 + 10) % 65)}%`, left: `${10 + ((i * 22 + 5) % 75)}%` }}
                >
                  <span className={`block rounded-full transition-all ${isHover ? "w-5 h-5 bg-brand-cyan shadow-[0_0_16px_rgba(0,212,255,0.7)]" : "w-3 h-3 bg-brand-cyan/60 hover:bg-brand-cyan"}`} />
                  {isHover && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-dark/95 border border-brand-cyan/30 rounded-sm px-3 py-2 whitespace-nowrap z-10 text-left">
                      <div className="text-xs font-bold">{c.name}</div>
                      <div className="text-[10px] text-text-muted">{typeLabel(c.type)} · ₩{(c.pricePerHour / 1000).toFixed(0)}K/h · 예약가능 {avail}</div>
                    </div>
                  )}
                </button>
              </Link>
            );
          })}
          <div className="absolute bottom-3 right-3 bg-dark/80 backdrop-blur-sm border border-ui-border rounded-sm px-3 py-1.5">
            <span className="text-brand-cyan font-mono font-bold">{filtered.length}</span>
            <span className="text-xs text-text-muted ml-1">피클볼장</span>
          </div>
          <div className="absolute top-3 left-3 text-[10px] font-mono text-text-muted/30">카카오맵 API 연동 예정</div>
        </motion.div>

        {/* 필터 토글 + 정렬 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-cyan transition-colors min-h-[36px]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showFilters ? "필터 접기" : "필터 펼치기"}
          </button>
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="bg-transparent text-xs text-text-muted border border-ui-border rounded-sm px-2 py-1.5 min-h-[36px] focus:border-brand-cyan/40 focus:outline-none cursor-pointer">
              <option value="rating" className="bg-dark">평점순</option>
              <option value="price-low" className="bg-dark">가격 낮은순</option>
              <option value="price-high" className="bg-dark">가격 높은순</option>
              <option value="courts" className="bg-dark">코트 수 많은순</option>
              <option value="reviews" className="bg-dark">리뷰 많은순</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }}>
            <FilterBar filters={filters} onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))} />
          </motion.div>
        )}

        <div className="text-sm text-text-muted mb-4">
          검색 결과 <span className="text-brand-cyan font-bold">{filtered.length}</span>곳
        </div>

        {/* 코트 카드 리스트 */}
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const avail = (c.availableSlots || []).filter((s: any) => s.status === "available").length;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
                <Link href={`/courts/${c.id}`}>
                  <div
                    className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 md:p-5 hover:border-brand-cyan/30 transition-all group cursor-pointer"
                    onMouseEnter={() => setMapHover(c.id)}
                    onMouseLeave={() => setMapHover(null)}
                  >
                    <TechCorners />
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        {/* 이름 + 태그 */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-base group-hover:text-brand-cyan transition-colors">{c.name}</h3>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm">{typeLabel(c.type)}</span>
                          {avail > 0 ? <StatusBadge status="open" /> : <StatusBadge status="full" />}
                        </div>
                        {/* 주소 */}
                        <div className="flex items-center gap-1.5 text-sm text-text-muted mb-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-cyan/50" />{c.address}
                        </div>
                        {/* 메타 2열 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-text-muted mb-2">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{c.rating} ({c.reviewCount})</span>
                          <span>코트 {c.courtCount}면</span>
                          <span className="font-mono">₩{c.pricePerHour.toLocaleString()}/h</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.operatingHours}</span>
                        </div>
                        {/* 편의시설 아이콘 */}
                        <div className="flex items-center gap-3 text-[10px] text-text-muted">
                          {c.hasParking && <span className="flex items-center gap-0.5"><Car className="w-3 h-3" />주차</span>}
                          {c.hasShower && <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" />샤워</span>}
                          {c.hasLighting && <span className="flex items-center gap-0.5"><Lightbulb className="w-3 h-3" />조명</span>}
                          {c.hasEquipmentRental && <span className="flex items-center gap-0.5"><Wrench className="w-3 h-3" />대여</span>}
                        </div>
                      </div>
                      {/* 오른쪽: 예약 가능 현황 */}
                      <div className="shrink-0 text-center md:text-right">
                        <div className="text-xs text-text-muted mb-1">오늘 예약 가능</div>
                        <div className={`text-2xl font-black font-mono ${avail > 0 ? "text-brand-cyan" : "text-text-muted"}`}>{avail}</div>
                        <div className="text-[10px] text-text-muted">슬롯</div>
                        <div className="text-[10px] text-text-muted mt-1">혼잡: {(c.peakHours || "").split(",")[0] || "—"}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
