"use client";

import { useState, useEffect } from "react";
// icons
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

const statusFilters = ["전체", "pending_approval", "confirmed", "cancelled", "rejected"];
const statusLabels: Record<string, string> = { "전체": "전체", pending_approval: "승인 대기", confirmed: "확정", cancelled: "취소", rejected: "거절" };

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("전체");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBookings = async () => {
    setLoading(true);
    const qs = filter !== "전체" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/bookings${qs}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  useEffect(() => { loadBookings(); }, [filter]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/admin/bookings/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: action === "reject" ? "운영진 거절" : undefined }),
    });
    if (res.ok) {
      toast(action === "approve" ? "승인 완료" : "거절 완료", "success");
      loadBookings();
    } else toast("처리 실패", "warning");
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">예약 관리</h1>

      {/* 필터 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs font-bold rounded-sm border min-h-[36px] shrink-0 ${filter === s ? "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30" : "bg-ui-bg text-text-muted border-ui-border hover:border-white/20"}`}>
            {statusLabels[s] || s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-muted text-center py-10">로딩 중...</p>
      ) : bookings.length === 0 ? (
        <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-10 text-center">
          <TechCorners />
          <p className="text-text-muted">해당 조건의 예약이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b: any) => (
            <div key={b.id} className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4">
              <TechCorners />
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={b.status} />
                    <span className="text-xs font-mono text-text-muted">{b.bookingCode}</span>
                    {b.bookingMode && <span className="text-[10px] font-mono text-text-muted/50">{b.bookingMode}</span>}
                  </div>
                  <div className="text-sm font-bold">{b.participants?.[0]?.name || "게스트"}</div>
                  <div className="text-xs text-text-muted">
                    {b.startAt?.split("T")[0]} {b.startAt?.slice(11, 16)}~{b.endAt?.slice(11, 16)}
                    {b.participants?.[0]?.phone && <span className="ml-2">{b.participants[0].phone}</span>}
                  </div>
                  <div className="text-xs font-mono text-text-muted mt-0.5">₩{(b.totalAmount || 0).toLocaleString()}</div>
                </div>

                {/* 액션 */}
                {b.status === "pending_approval" && (
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => handleAction(b.id, "approve")} className="px-3 py-1.5 text-xs font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm hover:bg-brand-cyan/20 transition-all min-h-[36px]">
                      승인
                    </button>
                    <button type="button" onClick={() => handleAction(b.id, "reject")} className="px-3 py-1.5 text-xs font-bold bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-sm hover:bg-brand-red/20 transition-all min-h-[36px]">
                      거절
                    </button>
                  </div>
                )}
                {b.status === "rejected" && b.rejectReason && (
                  <div className="text-xs text-brand-red shrink-0">사유: {b.rejectReason}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
