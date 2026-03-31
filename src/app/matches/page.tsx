"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, MapPin, Calendar, Users, Search, ArrowRight, Plus, Target, Filter, Map, List } from "lucide-react";
import KakaoMap from "@/components/map/KakaoMap";
import type { MapPin as MapPinType } from "@/components/map/KakaoMap";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const SKILL_LEVELS = ["전체", "입문", "초급", "중급", "상급", "무관"];
const TYPES = ["전체", "복식", "단식", "자유"];
const STATUSES = [
  { value: "", label: "전체" },
  { value: "open", label: "모집중" },
  { value: "closed", label: "마감" },
  { value: "completed", label: "완료" },
];
const TIME_SLOTS = [
  { value: "", label: "전체" },
  { value: "morning", label: "오전 (06~12)" },
  { value: "afternoon", label: "오후 (12~18)" },
  { value: "evening", label: "저녁 (18~24)" },
];

function getTimeSlot(time: string): string {
  if (!time) return "";
  const h = parseInt(time.split(":")[0], 10);
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function statusStyle(s: string) {
  if (s === "open") return "bg-green-400/10 text-green-400";
  if (s === "closed") return "bg-yellow-500/10 text-yellow-400";
  if (s === "completed") return "bg-white/5 text-text-muted";
  return "bg-red-500/10 text-red-400";
}

function statusLabel(s: string) {
  if (s === "open") return "모집중";
  if (s === "closed") return "마감";
  if (s === "completed") return "완료";
  if (s === "cancelled") return "취소";
  return s;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [skillFilter, setSkillFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [venues, setVenues] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/meetups")
      .then(r => r.json())
      .then(d => setMatches(d.meetups || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    fetch("/api/venues")
      .then(r => r.json())
      .then(d => setVenues(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (region !== "전체" && m.region !== region) return false;
      if (statusFilter && m.status !== statusFilter) return false;
      if (timeSlot && getTimeSlot(m.meetupTime) !== timeSlot) return false;
      if (typeFilter !== "전체" && m.playType !== typeFilter && !(typeFilter === "자유" && !m.playType)) return false;
      if (skillFilter !== "전체" && m.skillLevel !== skillFilter && m.skillLevel !== "무관" && m.skillLevel !== "전체") return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (!m.title?.toLowerCase().includes(kw) && !m.venueName?.toLowerCase().includes(kw) && !m.region?.includes(kw)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.status === "open" && b.status !== "open") return -1;
      if (a.status !== "open" && b.status === "open") return 1;
      return (a.meetupDate || "").localeCompare(b.meetupDate || "") || (a.meetupTime || "").localeCompare(b.meetupTime || "");
    });
  }, [matches, region, statusFilter, timeSlot, typeFilter, skillFilter, keyword]);

  const openCount = matches.filter(m => m.status === "open").length;

  // Map pins: match open matches to venue coords
  const venueMap = useMemo(() => {
    const m: Record<string, any> = {};
    venues.forEach(v => { if (v.name) m[v.name] = v; });
    return m;
  }, [venues]);

  const mapPins: MapPinType[] = useMemo(() =>
    filtered.filter(m => m.status === "open" && m.venueName && venueMap[m.venueName]?.lat).map(m => {
      const v = venueMap[m.venueName];
      return {
        id: m.id,
        lat: v.lat,
        lng: v.lng,
        label: m.title,
        sub: `${m.meetupDate} ${m.meetupTime} · ${m.currentPlayers}/${m.maxPlayers}명`,
        type: "match" as const,
      };
    }),
  [filtered, venueMap]);

  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-cyan/5 to-transparent border-b border-ui-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-cyan" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">피클볼 번개</h1>
                <p className="text-sm text-text-muted">지금 바로 함께 칠 사람을 찾아보세요</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex bg-surface border border-ui-border rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-brand-cyan/10 text-brand-cyan" : "text-text-muted hover:text-white"}`}>
                  <List className="w-3.5 h-3.5" /> 리스트
                </button>
                <button onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "map" ? "bg-brand-cyan/10 text-brand-cyan" : "text-text-muted hover:text-white"}`}>
                  <Map className="w-3.5 h-3.5" /> 지도
                </button>
              </div>
              <Link href="/matches/create"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors">
                <Plus className="w-4 h-4" /> 번개 만들기
              </Link>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <span><span className="text-brand-cyan font-bold text-lg">{matches.length}</span> <span className="text-text-muted">전체</span></span>
            <span><span className="text-green-400 font-bold text-lg">{openCount}</span> <span className="text-text-muted">모집중</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-surface border border-ui-border rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="제목, 장소 검색..." value={keyword} onChange={e => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none" />
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
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1 text-xs text-text-muted mr-1"><Filter className="w-3 h-3" /> 상세</div>
            <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
              className="px-3 py-1.5 bg-dark border border-ui-border rounded text-xs text-white focus:border-brand-cyan focus:outline-none">
              {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-dark border border-ui-border rounded text-xs text-white focus:border-brand-cyan focus:outline-none">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
              className="px-3 py-1.5 bg-dark border border-ui-border rounded text-xs text-white focus:border-brand-cyan focus:outline-none">
              {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile CTA */}
        <Link href="/matches/create"
          className="sm:hidden flex items-center justify-center gap-2 py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors">
          <Plus className="w-4 h-4" /> 번개 만들기
        </Link>

        {/* Map View */}
        {viewMode === "map" && mapPins.length > 0 && (
          <KakaoMap
            pins={mapPins}
            height="450px"
            showMyLocation
            onPinClick={(pin) => { window.location.href = `/matches/${pin.id}`; }}
          />
        )}
        {viewMode === "map" && mapPins.length === 0 && !loading && (
          <div className="bg-surface border border-dashed border-ui-border rounded-lg p-8 text-center">
            <Map className="w-10 h-10 text-text-muted/20 mx-auto mb-2" />
            <p className="text-text-muted text-sm">지도에 표시할 번개가 없습니다</p>
            <p className="text-text-muted/50 text-xs">장소가 등록된 피클볼장의 모집중 번개만 지도에 표시됩니다.</p>
          </div>
        )}

        {/* Results (list) */}
        {viewMode === "list" && (<div>
          <p className="text-sm text-text-muted mb-4">{filtered.length}개 번개</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface border border-ui-border rounded-lg p-5 animate-pulse">
                  <div className="h-5 w-2/3 bg-white/5 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-white/5 rounded mb-4" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
              <Zap className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
              <p className="text-text-muted font-medium mb-1">
                {matches.length === 0 ? "아직 등록된 번개가 없습니다" : "해당 조건의 번개가 없습니다"}
              </p>
              <p className="text-xs text-text-muted/70 mb-4">직접 번개를 만들어보세요!</p>
              <Link href="/matches/create" className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
                번개 만들기 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                  <Link href={`/matches/${m.id}`} className="block h-full">
                    <div className={`bg-surface border rounded-lg p-5 transition-all group h-full flex flex-col ${m.status === "open" ? "border-ui-border hover:border-brand-cyan/30" : "border-ui-border/50 opacity-75"}`}>
                      {/* Status + Region */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${statusStyle(m.status)}`}>{statusLabel(m.status)}</span>
                        <span className="text-[10px] text-text-muted font-mono">{m.region}</span>
                      </div>
                      {/* Title */}
                      <h3 className="font-bold text-white group-hover:text-brand-cyan transition-colors mb-2 leading-snug line-clamp-2">{m.title}</h3>
                      {/* Info */}
                      <div className="space-y-1.5 text-xs text-text-muted flex-1">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 shrink-0" /><span>{m.meetupDate} {m.meetupTime}</span></div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{m.venueName || "장소 미정"}</span></div>
                        <div className="flex items-center gap-1.5"><Target className="w-3 h-3 shrink-0" /><span>{m.skillLevel || "무관"} · {m.playType || "자유"}</span></div>
                      </div>
                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-ui-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-brand-cyan" />
                          <span className="text-sm font-bold text-white">{m.currentPlayers}/{m.maxPlayers}</span>
                          <span className="text-[10px] text-text-muted">명</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.fee > 0 && <span className="text-xs text-text-muted">₩{m.fee.toLocaleString()}</span>}
                          {m.status === "open" && (
                            <span className="text-[10px] text-brand-cyan font-bold">참가 가능</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
}
