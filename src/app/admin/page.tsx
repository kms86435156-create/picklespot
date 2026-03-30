"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, MapPin, Users, UserPlus, Clock, Star, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(setHealth).catch(() => {});

    Promise.all([
      fetch("/api/admin/tournaments").then(r => r.json()),
      fetch("/api/admin/venues").then(r => r.json()),
      fetch("/api/admin/clubs").then(r => r.json()),
      fetch("/api/leads").then(r => r.json()),
    ]).then(([tournaments, venues, clubs, leads]) => {
      const t = Array.isArray(tournaments) ? tournaments : [];
      const v = Array.isArray(venues) ? venues : [];
      const c = Array.isArray(clubs) ? clubs : [];
      const l = Array.isArray(leads) ? leads : [];

      setData({
        tournaments: { total: t.length, open: t.filter((x: any) => x.status === "open").length, featured: t.filter((x: any) => x.isFeatured).length },
        venues: { total: v.length, featured: v.filter((x: any) => x.isFeatured).length },
        clubs: { total: c.length, featured: c.filter((x: any) => x.isFeatured).length },
        leads: { total: l.length, new: l.filter((x: any) => x.status === "new").length },
        recentItems: [
          ...t.slice(-5).map((x: any) => ({ type: "대회", name: x.title, date: x.createdAt?.slice(0, 10) })),
          ...v.slice(-3).map((x: any) => ({ type: "장소", name: x.name, date: x.createdAt?.slice(0, 10) })),
          ...c.slice(-2).map((x: any) => ({ type: "동호회", name: x.name, date: x.createdAt?.slice(0, 10) })),
        ].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 10),
      });
    }).catch(() => {});
  }, []);

  if (!data) return <div className="p-8 text-center text-text-muted">로딩 중...</div>;

  const isDemo = health?.storage === "json_fallback" || health?.isDemoMode;

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">관리자 대시보드</h1>

      {/* Storage Status Banner */}
      {health && (
        <div className={`rounded-lg border p-3 mb-6 flex items-start gap-3 ${
          isDemo
            ? "bg-yellow-500/5 border-yellow-500/20"
            : "bg-green-500/5 border-green-500/20"
        }`}>
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isDemo ? "bg-yellow-400" : "bg-green-400"}`} />
          <div>
            <p className={`text-sm font-bold ${isDemo ? "text-yellow-400" : "text-green-400"}`}>
              {isDemo ? "데모 모드 (JSON 파일)" : "실운영 모드 (Supabase)"}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {isDemo
                ? "현재 로컬 JSON 파일에 데이터를 저장합니다. 실운영 전환을 위해 Supabase를 연결하세요."
                : `Supabase 연결됨 · 대회 ${health.supabase?.tournamentCount ?? "?"}건`
              }
            </p>
            <p className="text-[10px] text-text-muted/60 font-mono mt-1">
              storage: {health.storage} · env: {health.environment}
              {health.issues?.length > 0 && ` · issues: ${health.issues.length}건`}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={<Trophy className="w-5 h-5 text-brand-cyan" />} label="전체 대회" value={data.tournaments.total} sub={`접수중 ${data.tournaments.open}`} href="/admin/tournaments" />
        <StatCard icon={<MapPin className="w-5 h-5 text-brand-cyan" />} label="전체 장소" value={data.venues.total} sub={`추천 ${data.venues.featured}`} href="/admin/venues" />
        <StatCard icon={<Users className="w-5 h-5 text-brand-cyan" />} label="전체 동호회" value={data.clubs.total} sub={`추천 ${data.clubs.featured}`} href="/admin/clubs" />
        <StatCard icon={<UserPlus className="w-5 h-5 text-yellow-400" />} label="운영자 리드" value={data.leads.total} sub={`신규 ${data.leads.new}`} href="/admin/leads" color="yellow" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <QuickAction label="대회 등록" desc="새 대회를 수동 등록합니다" href="/admin/tournaments" />
        <QuickAction label="CSV 업로드" desc="대량 데이터를 일괄 등록합니다" href="/admin/tournaments" />
        <QuickAction label="접수 관리" desc="대회 신청자를 승인/거부합니다" href="/admin/registrations" />
      </div>

      {/* Featured summary */}
      <div className="bg-surface border border-ui-border rounded-lg p-4 mb-8">
        <h2 className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> 추천(Featured) 현황</h2>
        <div className="flex gap-6 text-sm">
          <span>대회 <span className="font-bold text-brand-cyan">{data.tournaments.featured}</span>개</span>
          <span>장소 <span className="font-bold text-brand-cyan">{data.venues.featured}</span>개</span>
          <span>동호회 <span className="font-bold text-brand-cyan">{data.clubs.featured}</span>개</span>
        </div>
        <p className="text-xs text-text-muted mt-2">각 관리 페이지에서 ★ 아이콘을 클릭하면 홈 추천에 즉시 반영됩니다.</p>
      </div>

      {/* Recent items */}
      <div className="bg-surface border border-ui-border rounded-lg p-4">
        <h2 className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-brand-cyan" /> 최근 등록</h2>
        {data.recentItems.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">등록된 데이터가 없습니다</p>
        ) : (
          <div className="space-y-1">
            {data.recentItems.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-ui-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted rounded">{item.type}</span>
                  <span className="text-sm text-white truncate max-w-[300px]">{item.name}</span>
                </div>
                <span className="text-xs text-text-muted font-mono">{item.date || ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, href, color }: { icon: React.ReactNode; label: string; value: number; sub: string; href: string; color?: string }) {
  return (
    <Link href={href} className="block">
      <div className="bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/30 transition-all group">
        <div className="flex items-center justify-between mb-2">
          {icon}
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-cyan transition-colors" />
        </div>
        <p className={`text-2xl font-bold font-mono ${color === "yellow" ? "text-yellow-400" : "text-white"}`}>{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-[10px] text-text-muted/70 mt-0.5">{sub}</p>
      </div>
    </Link>
  );
}

function QuickAction({ label, desc, href }: { label: string; desc: string; href: string }) {
  return (
    <Link href={href} className="block">
      <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-4 hover:bg-brand-cyan/10 transition-all group">
        <p className="font-bold text-white group-hover:text-brand-cyan transition-colors text-sm">{label}</p>
        <p className="text-xs text-text-muted">{desc}</p>
      </div>
    </Link>
  );
}
