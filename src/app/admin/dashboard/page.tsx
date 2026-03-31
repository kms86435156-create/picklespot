"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, MapPin, Users, ClipboardList, Clock, ArrowRight } from "lucide-react";

interface DashboardData {
  stats: {
    tournaments: { total: number; open: number; closed: number };
    venues: { total: number };
    clubs: { total: number };
    registrations: { total: number; pending: number };
    meetups: { total: number; open: number };
    bookingRequests: { total: number; pending: number };
    leads: { total: number; new: number };
  };
  recentActivity: { type: string; label: string; name: string; date: string; id: string }[];
}

const TYPE_LINK_MAP: Record<string, string> = {
  tournament: "/admin/tournaments",
  venue: "/admin/venues",
  club: "/admin/clubs",
  registration: "/admin/registrations",
};

const TYPE_COLOR_MAP: Record<string, string> = {
  대회: "text-brand-cyan",
  피클볼장: "text-green-400",
  동호회: "text-purple-400",
  "등록 요청": "text-yellow-400",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("대시보드 데이터를 불러올 수 없습니다."));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-lg" />
      </div>
    );
  }

  const { stats, recentActivity } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">대시보드</h1>
          <p className="text-xs text-text-muted mt-0.5">PBL.SYS 관리 현황</p>
        </div>
        <div className="text-[10px] text-text-muted font-mono">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          iconColor="text-brand-cyan"
          title="등록된 대회"
          value={stats.tournaments.total}
          details={[
            { label: "접수중", value: stats.tournaments.open, color: "text-green-400" },
            { label: "종료", value: stats.tournaments.closed, color: "text-text-muted" },
          ]}
          href="/admin/tournaments"
        />
        <StatCard
          icon={<MapPin className="w-5 h-5" />}
          iconColor="text-green-400"
          title="등록된 피클볼장"
          value={stats.venues.total}
          href="/admin/venues"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          iconColor="text-purple-400"
          title="등록된 동호회"
          value={stats.clubs.total}
          href="/admin/clubs"
        />
        <StatCard
          icon={<ClipboardList className="w-5 h-5" />}
          iconColor="text-yellow-400"
          title="대기중 등록 요청"
          value={stats.registrations.pending}
          details={[
            { label: "전체", value: stats.registrations.total, color: "text-text-muted" },
          ]}
          href="/admin/registrations"
          highlight={stats.registrations.pending > 0}
        />
      </div>

      {/* Sub Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MiniStat label="번개모임" value={stats.meetups.total} sub={`진행중 ${stats.meetups.open}`} href="/admin/meetups" />
        <MiniStat label="예약 요청" value={stats.bookingRequests.total} sub={`대기중 ${stats.bookingRequests.pending}`} href="/admin/booking-requests" />
        <MiniStat label="사전등록 리드" value={stats.leads.total} sub={`신규 ${stats.leads.new}`} href="/admin/leads" />
      </div>

      {/* Recent Activity */}
      <div className="bg-surface border border-ui-border rounded-lg">
        <div className="px-5 py-4 border-b border-ui-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-cyan" />
            최근 활동
          </h2>
          <span className="text-[10px] text-text-muted font-mono">최근 5건</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-text-muted">
            등록된 데이터가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-ui-border/50">
            {recentActivity.map((item, i) => (
              <Link
                key={`${item.id}-${i}`}
                href={TYPE_LINK_MAP[item.type] || "/admin"}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${TYPE_COLOR_MAP[item.label] || "text-text-muted"} bg-white/5`}>
                    {item.label}
                  </span>
                  <span className="text-sm text-white truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className="text-xs text-text-muted font-mono">
                    {item.date ? formatRelativeDate(item.date) : ""}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted/30 group-hover:text-brand-cyan transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, iconColor, title, value, details, href, highlight,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  value: number;
  details?: { label: string; value: number; color: string }[];
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className="block group">
      <div className={`relative bg-surface border rounded-lg p-5 transition-all overflow-hidden ${
        highlight
          ? "border-yellow-500/30 hover:border-yellow-500/50"
          : "border-ui-border hover:border-brand-cyan/30"
      }`}>
        {highlight && (
          <div className="absolute top-0 right-0 w-2 h-2 m-3 rounded-full bg-yellow-400 animate-ping-slow" />
        )}
        <div className="flex items-center justify-between mb-3">
          <div className={iconColor}>{icon}</div>
          <ArrowRight className="w-4 h-4 text-text-muted/30 group-hover:text-brand-cyan transition-colors" />
        </div>
        <p className="text-3xl font-bold font-mono text-white">{value}</p>
        <p className="text-xs text-text-muted mt-1">{title}</p>
        {details && details.length > 0 && (
          <div className="flex gap-3 mt-2.5 pt-2.5 border-t border-ui-border/50">
            {details.map(d => (
              <span key={d.label} className="text-[11px]">
                <span className="text-text-muted">{d.label}</span>{" "}
                <span className={`font-mono font-bold ${d.color}`}>{d.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function MiniStat({ label, value, sub, href }: { label: string; value: number; sub: string; href: string }) {
  return (
    <Link href={href} className="block group">
      <div className="bg-surface border border-ui-border rounded-lg px-4 py-3 hover:border-brand-cyan/20 transition-all flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-lg font-bold font-mono text-white">{value}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-text-muted">{sub}</p>
          <ArrowRight className="w-3.5 h-3.5 text-text-muted/30 group-hover:text-brand-cyan transition-colors ml-auto mt-1" />
        </div>
      </div>
    </Link>
  );
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}
