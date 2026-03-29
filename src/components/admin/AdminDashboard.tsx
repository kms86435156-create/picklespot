"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, AlertTriangle, XCircle, BarChart3 } from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/bookings/pending"),
      ]);
      setStats(await statsRes.json());
      const pd = await pendingRes.json();
      setPending(pd.bookings || []);
    } catch { toast("데이터 로딩 실패", "warning"); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/bookings/${id}/approve`, { method: "POST" });
    if (res.ok) { toast("예약이 승인되었습니다.", "success"); loadData(); }
    else {
      const data = await res.json().catch(() => ({}));
      toast(data.isDemoMode ? "데모 환경이라 저장되지 않습니다." : (data.error || "승인 실패"), "warning");
    }
  };

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/admin/bookings/${id}/reject`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "운영진 판단에 의한 거절" }),
    });
    if (res.ok) { toast("예약이 거절되었습니다.", "success"); loadData(); }
    else {
      const data = await res.json().catch(() => ({}));
      toast(data.isDemoMode ? "데모 환경이라 저장되지 않습니다." : (data.error || "거절 실패"), "warning");
    }
  };

  if (loading) return <div className="text-text-muted text-center py-20">로딩 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Calendar className="w-5 h-5 text-brand-cyan" />} label="오늘 예약" value={stats?.todayBookingCount || 0} />
        <StatCard icon={<Clock className="w-5 h-5 text-yellow-400" />} label="승인 대기" value={stats?.pendingCount || 0} accent={stats?.pendingCount > 0 ? "yellow" : undefined} />
        <StatCard icon={<XCircle className="w-5 h-5 text-brand-red" />} label="취소" value={stats?.cancelledCount || 0} />
        <StatCard icon={<BarChart3 className="w-5 h-5 text-brand-cyan" />} label="오늘 점유율" value={`${stats?.occupancyRate || 0}%`} />
      </div>

      {/* 승인 대기 */}
      <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-5 mb-6">
        <TechCorners />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            승인 대기 ({pending.length})
          </h2>
          <Link href="/admin/bookings?status=pending_approval" className="text-xs text-brand-cyan hover:underline">전체보기</Link>
        </div>

        {pending.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">승인 대기 중인 예약이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 5).map((b: any) => (
              <div key={b.id} className="bg-dark/30 border border-ui-border rounded-sm p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status="pending" />
                    <span className="text-xs font-mono text-text-muted">{b.bookingCode}</span>
                  </div>
                  <div className="text-sm font-bold">{b.participants?.[0]?.name || "게스트"}</div>
                  <div className="text-xs text-text-muted">
                    {b.startAt?.split("T")[0]} {b.startAt?.slice(11, 16)}~{b.endAt?.slice(11, 16)} · ₩{(b.totalAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => handleApprove(b.id)} className="px-3 py-1.5 text-xs font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm hover:bg-brand-cyan/20 transition-all min-h-[36px]">
                    승인
                  </button>
                  <button type="button" onClick={() => handleReject(b.id)} className="px-3 py-1.5 text-xs font-bold bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-sm hover:bg-brand-red/20 transition-all min-h-[36px]">
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 예약 */}
      <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-5">
        <TechCorners />
        <h2 className="font-bold mb-4">최근 예약</h2>
        {(stats?.recentBookings || []).length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">아직 예약이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {(stats?.recentBookings || []).map((b: any) => (
              <div key={b.id} className="bg-dark/30 border border-ui-border rounded-sm p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-xs font-mono text-text-muted">{b.bookingCode}</span>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {b.startAt?.split("T")[0]} {b.startAt?.slice(11, 16)} · {b.participants?.[0]?.name || "게스트"}
                  </div>
                </div>
                <span className="text-xs font-mono text-text-muted">₩{(b.totalAmount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  const borderColor = accent === "yellow" ? "border-yellow-500/30" : "border-ui-border";
  return (
    <div className={`relative bg-ui-bg/40 border ${borderColor} rounded-sm p-4`}>
      <TechCorners />
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-text-muted">{label}</span></div>
      <div className="text-2xl font-black font-mono">{value}</div>
    </div>
  );
}
