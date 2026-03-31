"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Search, Car, Sun, Home, Phone, Clock, ChevronRight, ArrowRight, Map, List, Crosshair } from "lucide-react";
import KakaoMap, { getDistanceKm } from "@/components/map/KakaoMap";
import type { MapPin as MapPinType } from "@/components/map/KakaoMap";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const TYPES = [
  { value: "", label: "전체" },
  { value: "실내", label: "실내" },
  { value: "실외", label: "실외" },
  { value: "겸용", label: "겸용" },
];
const RADIUS_OPTIONS = [
  { value: 0, label: "전체" },
  { value: 3, label: "3km" },
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
];

export default function VenuesPage({ venues }: { venues: any[] }) {
  const [region, setRegion] = useState("전체");
  const [typeFilter, setTypeFilter] = useState("");
  const [parkingOnly, setParkingOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "courtCount" | "distance">("name");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(0);
  const [locating, setLocating] = useState(false);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) { alert("위치 서비스를 사용할 수 없습니다."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy("distance");
        if (!radius) setRadius(10);
        setLocating(false);
      },
      () => { alert("위치 정보를 가져올 수 없습니다."); setLocating(false); },
      { enableHighAccuracy: true }
    );
  }, [radius]);

  const filtered = useMemo(() => {
    let result = venues.filter(v => {
      if (region !== "전체" && v.region !== region && v.regionDepth1 !== region) return false;
      if (typeFilter) {
        const vType = (v.indoorOutdoor || v.courtType || v.type || "").toLowerCase();
        const match = vType === typeFilter ||
          (typeFilter === "실내" && (vType === "indoor" || vType.includes("실내"))) ||
          (typeFilter === "실외" && (vType === "outdoor" || vType.includes("실외"))) ||
          (typeFilter === "겸용" && (vType === "both" || vType.includes("겸용") || vType.includes("실내+실외")));
        if (!match) return false;
      }
      if (parkingOnly && !v.parkingAvailable && !v.hasParking && !(v.amenities || "").includes("주차")) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (!v.name?.toLowerCase().includes(kw) && !v.address?.toLowerCase().includes(kw) && !v.roadAddress?.toLowerCase().includes(kw)) return false;
      }
      // Radius filter
      if (myPos && radius > 0 && v.lat && v.lng) {
        const dist = getDistanceKm(myPos.lat, myPos.lng, v.lat, v.lng);
        if (dist > radius) return false;
      }
      return true;
    });

    // Add distance data
    if (myPos) {
      result = result.map(v => ({
        ...v,
        _distance: v.lat && v.lng ? getDistanceKm(myPos.lat, myPos.lng, v.lat, v.lng) : 999,
      }));
    }

    if (sortBy === "distance" && myPos) result.sort((a, b) => (a._distance || 999) - (b._distance || 999));
    else if (sortBy === "courtCount") result.sort((a, b) => (b.courtCount || 0) - (a.courtCount || 0));
    else result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return result;
  }, [venues, region, typeFilter, parkingOnly, keyword, sortBy, myPos, radius]);

  const featured = useMemo(() => venues.filter(v => v.isFeatured).slice(0, 4), [venues]);
  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    venues.forEach(v => { c[v.region] = (c[v.region] || 0) + 1; });
    return c;
  }, [venues]);

  const mapPins: MapPinType[] = useMemo(() =>
    filtered.filter(v => v.lat && v.lng).map(v => ({
      id: v.id,
      lat: v.lat,
      lng: v.lng,
      label: v.name,
      sub: `${v.indoorOutdoor || "실내"} · 코트 ${v.courtCount || "?"}면${v._distance ? ` · ${v._distance.toFixed(1)}km` : ""}`,
      type: "venue" as const,
    })),
  [filtered]);

  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-cyan/5 to-transparent border-b border-ui-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-brand-cyan" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">전국 피클볼장</h1>
                <p className="text-sm text-text-muted">가까운 피클볼장을 찾아보세요</p>
              </div>
            </div>
            {/* View Toggle */}
            <div className="flex bg-surface border border-ui-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-brand-cyan/10 text-brand-cyan" : "text-text-muted hover:text-white"}`}>
                <List className="w-3.5 h-3.5" /> 리스트
              </button>
              <button onClick={() => setViewMode("map")}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "map" ? "bg-brand-cyan/10 text-brand-cyan" : "text-text-muted hover:text-white"}`}>
                <Map className="w-3.5 h-3.5" /> 지도
              </button>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <span><span className="text-brand-cyan font-bold text-lg">{filtered.length}</span> <span className="text-text-muted">{region === "전체" && !typeFilter && !parkingOnly && !keyword ? "전체 장소" : "검색 결과"}</span></span>
            <span><span className="text-text-muted/60 font-bold text-lg">{venues.length}</span> <span className="text-text-muted">전체 등록</span></span>
          </div>
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

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Featured (list mode only) */}
        {viewMode === "list" && featured.length > 0 && region === "전체" && !keyword && (
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
                        <span>{v.indoorOutdoor || "실내"} · 코트 {v.courtCount}면</span>
                      </div>
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
              {myPos && <option value="distance">가까운순</option>}
            </select>
          </div>
          {/* My location + Radius */}
          <div className="flex flex-wrap gap-2 items-center mt-3 pt-3 border-t border-ui-border">
            <button onClick={handleMyLocation} disabled={locating}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${myPos ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" : "border-ui-border text-text-muted hover:text-white hover:border-text-muted"}`}>
              <Crosshair className="w-3.5 h-3.5" /> {locating ? "위치 확인 중..." : myPos ? "내 위치 ON" : "내 주변"}
            </button>
            {myPos && (
              <div className="flex gap-1">
                {RADIUS_OPTIONS.map(r => (
                  <button key={r.value} onClick={() => setRadius(r.value)}
                    className={`px-2.5 py-1 text-[11px] rounded-full transition-colors ${radius === r.value ? "bg-brand-cyan text-dark font-bold" : "bg-white/5 text-text-muted hover:text-white"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && (
          <KakaoMap
            pins={mapPins}
            height="500px"
            showMyLocation
            center={myPos || undefined}
            level={myPos ? 6 : 8}
          />
        )}

        {/* Results (list view) */}
        {viewMode === "list" && (
          <div>
            <p className="text-sm text-text-muted mb-4">{filtered.length}개 장소</p>
            {filtered.length === 0 ? (
              <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
                <MapPin className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
                <p className="text-text-muted font-medium mb-1">
                  {venues.length === 0 ? "등록된 피클볼장이 없습니다" : "해당 조건의 피클볼장이 없습니다"}
                </p>
                <p className="text-xs text-text-muted/70 mb-4">다른 조건으로 검색해보세요.</p>
                <Link href="/courts/register" className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
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
                            {v.indoorOutdoor || "실내"}
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
                            {v._distance && <span className="text-[10px] px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan rounded">{v._distance.toFixed(1)}km</span>}
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
        )}
      </div>
    </div>
  );
}
