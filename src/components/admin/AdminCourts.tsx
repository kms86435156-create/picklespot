"use client";

import { useState, useEffect } from "react";
import TechCorners from "@/components/ui/TechCorners";

export default function AdminCourts() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/venues").then(r => r.json()).then(d => { setVenues(d.venues || []); setLoading(false); });
  }, []);

  const modeLabels: Record<string, { label: string; color: string }> = {
    native_auto_confirm: { label: "자동 확정", color: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20" },
    native_approval_required: { label: "승인 필요", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    outbound_link: { label: "외부 예약", color: "text-text-muted bg-white/5 border-white/10" },
  };

  if (loading) return <p className="text-text-muted text-center py-10">로딩 중...</p>;

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">코트 관리</h1>
      <div className="space-y-3">
        {venues.map((v: any) => {
          const mode = modeLabels[v.bookingMode] || modeLabels.outbound_link;
          return (
            <div key={v.id} className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4">
              <TechCorners />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm">{v.name}</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${mode.color}`}>{mode.label}</span>
                    {v.isVerified && <span className="text-[10px] text-brand-cyan font-mono">검증됨</span>}
                  </div>
                  <div className="text-xs text-text-muted">{v.address} · {v.type === "indoor" ? "실내" : v.type === "outdoor" ? "실외" : "실내/실외"} · {v.courtCount}면</div>
                  <div className="text-xs text-text-muted mt-0.5">{v.phone} · ₩{(v.pricePerHour || 0).toLocaleString()}/h</div>
                </div>
                <div className="text-right text-xs text-text-muted shrink-0">
                  <div className="font-mono">{v.id}</div>
                  <div>{v.region}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
