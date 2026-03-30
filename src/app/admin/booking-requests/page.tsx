"use client";

import { useState, useEffect } from "react";
import { Phone, Copy } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  contacted: { label: "연락완료", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  confirmed: { label: "확정", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  rejected: { label: "거절", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  completed: { label: "완료", color: "text-text-muted bg-white/5 border-ui-border" },
};

export default function AdminBookingRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    const qs = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/admin/booking-requests${qs}`).then(r => r.json()).then(d => { setRequests(d.bookingRequests || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/booking-requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  if (loading) return <div className="p-8 text-center text-text-muted">로딩 중...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">예약 요청 관리</h1>
          {pendingCount > 0 && <p className="text-sm text-yellow-400 mt-1">{pendingCount}건 처리 대기</p>}
        </div>
        <span className="text-sm text-text-muted">총 {requests.length}건</span>
      </div>

      {/* 필터 */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {[{ k: "all", l: "전체" }, { k: "pending", l: "대기" }, { k: "contacted", l: "연락완료" }, { k: "confirmed", l: "확정" }, { k: "rejected", l: "거절" }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`px-3 py-1.5 text-xs rounded border shrink-0 ${filter === f.k ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" : "border-ui-border text-text-muted hover:text-white"}`}>
            {f.l}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
          <Phone className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
          <p className="text-text-muted">예약 요청이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(r => {
            const s = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
            return (
              <div key={r.id} className="bg-surface border border-ui-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${s.color}`}>{s.label}</span>
                      <span className="text-xs text-text-muted">{r.bookingDate} {r.bookingTime}</span>
                    </div>
                    <h3 className="font-bold text-sm">{r.venueName || "장소 미정"}</h3>
                    <div className="text-xs text-text-muted mt-1">
                      <span className="font-medium text-white">{r.requesterName}</span> · {r.requesterPhone} · {r.playerCount}명
                    </div>
                    {r.memo && <div className="text-xs text-text-muted mt-1 bg-dark/30 rounded p-1.5">{r.memo}</div>}
                    <div className="text-[10px] text-text-muted/50 mt-1">{new Date(r.createdAt).toLocaleString("ko-KR")}</div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {/* 연락처 복사 */}
                    <button onClick={() => copyToClipboard(r.requesterPhone)} className="flex items-center gap-1 px-2 py-1 text-xs text-brand-cyan border border-brand-cyan/20 rounded hover:bg-brand-cyan/10">
                      <Copy className="w-3 h-3" />연락처 복사
                    </button>
                    {/* 상태 변경 */}
                    {r.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(r.id, "contacted")} className="px-2 py-1 text-xs text-blue-400 border border-blue-400/20 rounded hover:bg-blue-400/10">연락완료</button>
                        <button onClick={() => updateStatus(r.id, "confirmed")} className="px-2 py-1 text-xs text-green-400 border border-green-400/20 rounded hover:bg-green-400/10">확정</button>
                        <button onClick={() => updateStatus(r.id, "rejected")} className="px-2 py-1 text-xs text-red-400 border border-red-400/20 rounded hover:bg-red-400/10">거절</button>
                      </>
                    )}
                    {r.status === "contacted" && (
                      <>
                        <button onClick={() => updateStatus(r.id, "confirmed")} className="px-2 py-1 text-xs text-green-400 border border-green-400/20 rounded hover:bg-green-400/10">확정</button>
                        <button onClick={() => updateStatus(r.id, "rejected")} className="px-2 py-1 text-xs text-red-400 border border-red-400/20 rounded hover:bg-red-400/10">거절</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
