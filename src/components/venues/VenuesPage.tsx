"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Search, Car, Sun, Home, Phone, Clock, ChevronRight, ArrowRight } from "lucide-react";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const TYPES = [
  { value: "", label: "전체" },
  { value: "실내", label: "실내" },
  { value: "실외", label: "실외" },
  { value: "실내+실외", label: "실내+실외" },
];

export default function VenuesPage({ venues }: { venues: any[] }) {
  const [region, setRegion] = useState("전체");
  const [typeFilter, setTypeFilter] = useState("");
  const [parkingOnly, setParkingOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "courtCount">("name");

  const filtered = useMemo(() => {
    const result = venues.filter(v => {
      if (region !== "전체" && v.region !== region) return false;
      if (typeFilter && v.indoorOutdoor !== typeFilter && v.type !== (typeFilter === "실내" ? "indoor" : typeFilter === "실외" ? "outdoor" : "both")) return false;
      if (parkingOnly && !v.parkingAvailable && !v.hasParking) return false;
      if (keyword && !v.name?.includes(keyword) && !v.address?.includes(keyword) && !v.roadAddress?.includes(keyword)) return false;
      return true;
    });
    if (sortBy === "courtCount") result.sort((a, b) => (b.courtCount || 0) - (a.courtCount || 0));
    else result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return result;
  }, [venues, region, typeFilter, parkingOnly, keyword, sortBy]);

  const featured = useMemo(() => venues.filter(v => v.isFeatured).slice(0, 4), [venues]);
  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    venues.forEach(v => { c[v.region] = (c[v.region] || 0) + 1; });
    return c;
  }, [venues]);

  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-cyan/5 to-transparent border-b border-ui-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">전국 피클볼장</h1>
              <p className="text-sm text-text-muted">가까운 피클볼장을 찾아보세요</p>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <span><span className="text-brand-cyan font-bold text-lg">{venues.length}</span> <span className="text-text-muted">전체 장소</span></span>
            <span><span className="text-green-400 font-bold text-lg">{venues.filter(v => v.isFeatured).length}</span> <span className="text-text-muted">추천 장소</span></span>
          </div>
          {/* Region quick pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([r, c]) => (
              <button key={r} onClick={() => setRegion(r)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${region === r ? "bg-brand-cyan text-dark" : "bg-white/5 text-text-muted hover:text-white"}`}>
                {r} {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Featured */}
        {featured.length > 0 && region === "전체" && !keyword && (
          <section>
            <h2 className="font-bold text-white mb-4">추천 피클볼장</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(v => (
                <Link key={v.id} href={`/courts/${v.id}`} className="block">
                  <div className="bg-gradient-to-br from-brand-cyan/5 to-transparent border border-brand-cyan/20 rounded-lg p-4 hover:border-brand-cyan/40 transition-all group h-full">
                    <h3 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors mb-2">{v.name}</h3>
                    <div className="space-y-1 text-xs text-text-muted">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /><span className="truncate">{v.address || v.roadAddress || v.region}</span></div>
                      <div className="flex items-center gap-1.5">
                        {v.indoorOutdoor === "실내" || v.type === "indoor" ? <Home className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                        <span>{v.indoorOutdoor || (v.type === "indoor" ? "실내" : v.type === "outdoor" ? "실외" : "실내+실외")} · 코트 {v.courtCount}면</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(v.parkingAvailable || v.hasParking) && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted rounded">주차</span>}
                      {v.operatingHours && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted rounded">{v.operatingHours}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="bg-surface border border-ui-border rounded-lg p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="장소명, 주소 검색..." value={keyword} onChange={e => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none" />
            </div>
            <select value={region} onChange={e => setRegion(e.target.value)}
              className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm text-text-muted hover:text-white">
              <input type="checkbox" checked={parkingOnly} onChange={e => setParkingOnly(e.target.checked)} className="w-4 h-4 accent-brand-cyan" />
              <Car className="w-3.5 h-3.5" /> 주차
            </label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
              <option value="name">이름순</option>
              <option value="courtCount">코트 많은순</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-sm text-text-muted mb-4">{filtered.length}개 장소</p>
          {filtered.length === 0 ? (
            <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
              <MapPin className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
              <p className="text-text-muted font-medium mb-1">등록된 피클볼장이 없습니다</p>
              <p className="text-xs text-text-muted/70 mb-4">피클볼장 정보가 등록되면 이곳에 표시됩니다.</p>
              <Link href="/request?type=court" className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
                장소 등록 요청하기 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                  <Link href={`/courts/${v.id}`} className="block h-full">
                    <div className="bg-surface border border-ui-border rounded-lg p-5 hover:border-brand-cyan/30 transition-all group h-full flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white group-hover:text-brand-cyan transition-colors leading-snug">{v.name}</h3>
                        <span className="shrink-0 ml-2 text-[10px] px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan rounded">
                          {v.indoorOutdoor || (v.type === "indoor" ? "실내" : v.type === "outdoor" ? "실외" : "실내+실외")}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-text-muted flex-1">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{v.roadAddress || v.address || v.region}</span></div>
                        {v.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" /><span>{v.phone}</span></div>}
                        {v.operatingHours && <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 shrink-0" /><span>{v.operatingHours}</span></div>}
                      </div>
                      <div className="mt-3 pt-3 border-t border-ui-border flex items-center justify-between">
                        <div className="flex gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted rounded">코트 {v.courtCount || "?"}면</span>
                          {(v.parkingAvailable || v.hasParking) && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted rounded">주차 가능</span>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-cyan transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
