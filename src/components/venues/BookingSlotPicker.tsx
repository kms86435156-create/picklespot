"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Calendar, Clock, Check } from "lucide-react";

interface BookingSlotPickerProps {
  venueId: string;
  venueName?: string;
}

export default function BookingSlotPicker({ venueId }: BookingSlotPickerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [slots, setSlots] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [memo, setMemo] = useState("");
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Date navigation helpers
  const dates = useMemo(() => {
    const arr: { value: string; label: string; day: string; isToday: boolean; isWeekend: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      arr.push({
        value: d.toISOString().split("T")[0],
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        day: days[d.getDay()],
        isToday: i === 0,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    setLoading(true);
    setSelectedSlot(null);
    fetch(`/api/court-bookings?venueId=${venueId}&date=${selectedDate}`)
      .then(r => r.json())
      .then(d => {
        setSlots(d.slots || []);
        setResources(d.resources || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [venueId, selectedDate]);

  // Group slots by hour
  const timeGrid = useMemo(() => {
    if (resources.length === 0) return [];
    const hours = new Set<number>();
    slots.forEach(s => {
      const h = parseInt(s.startAt.split("T")[1].split(":")[0], 10);
      hours.add(h);
    });
    return Array.from(hours).sort((a, b) => a - b).map(h => ({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00`,
      courts: resources.map(r => {
        const slot = slots.find(s => s.resourceId === r.id && s.startAt.includes(`T${String(h).padStart(2, "0")}:`));
        return { resource: r, slot };
      }),
    }));
  }, [slots, resources]);

  async function handleBook() {
    if (!user) { router.push(`/login?from=/courts/${venueId}`); return; }
    if (!selectedSlot) return;
    setBooking(true);
    setError("");
    try {
      const res = await fetch("/api/court-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot.id, playerCount, memo }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "예약에 실패했습니다."); return; }
      setSuccess(true);
      setSelectedSlot(null);
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setBooking(false);
    }
  }

  if (slots.length === 0 && !loading && resources.length === 0) {
    return null; // No booking data for this venue
  }

  return (
    <div className="bg-surface border border-ui-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-ui-border">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-cyan" /> 예약 가능 시간
        </h2>
      </div>

      {/* Date selector */}
      <div className="flex gap-1 p-3 overflow-x-auto border-b border-ui-border">
        {dates.map(d => (
          <button key={d.value} onClick={() => setSelectedDate(d.value)}
            className={`shrink-0 px-3 py-2 rounded-lg text-center min-w-[60px] transition-colors ${
              selectedDate === d.value
                ? "bg-brand-cyan text-dark font-bold"
                : d.isWeekend
                  ? "bg-white/5 text-red-400 hover:bg-white/10"
                  : "bg-white/5 text-text-muted hover:bg-white/10"
            }`}>
            <p className="text-[10px]">{d.day}</p>
            <p className="text-sm font-bold">{d.label}</p>
            {d.isToday && <p className="text-[8px]">오늘</p>}
          </button>
        ))}
      </div>

      {/* Time grid */}
      <div className="p-4">
        {loading ? (
          <div className="py-8 text-center text-text-muted text-sm animate-pulse">시간표 로딩 중...</div>
        ) : timeGrid.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-sm">이 날짜에 예약 가능한 시간이 없습니다.</div>
        ) : (
          <>
            {/* Court headers */}
            <div className="flex gap-1 mb-2">
              <div className="w-16 shrink-0" />
              {resources.map(r => (
                <div key={r.id} className="flex-1 text-center text-[10px] text-text-muted font-medium">{r.name}</div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {timeGrid.map(row => (
                <div key={row.hour} className="flex gap-1">
                  <div className="w-16 shrink-0 text-xs text-text-muted flex items-center">
                    <Clock className="w-3 h-3 mr-1" />{row.label}
                  </div>
                  {row.courts.map(({ resource, slot }) => {
                    if (!slot) return <div key={resource.id} className="flex-1 h-10 bg-white/[0.02] rounded border border-ui-border/30" />;
                    const isAvailable = slot.status === "available";
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <button key={resource.id} disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedSlot(isSelected ? null : slot)}
                        className={`flex-1 h-10 rounded border text-[10px] font-medium transition-all ${
                          isSelected
                            ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan"
                            : isAvailable
                              ? "bg-green-400/5 border-green-400/20 text-green-400 hover:bg-green-400/10 hover:border-green-400/40 cursor-pointer"
                              : "bg-white/[0.02] border-ui-border/30 text-text-muted/30 cursor-not-allowed"
                        }`}>
                        {isSelected ? "✓" : isAvailable ? `₩${(slot.price / 1000).toFixed(0)}k` : "예약됨"}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-ui-border">
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <span className="w-3 h-3 rounded bg-green-400/10 border border-green-400/20" /> 예약가능
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <span className="w-3 h-3 rounded bg-white/[0.02] border border-ui-border/30" /> 예약됨
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <span className="w-3 h-3 rounded bg-brand-cyan/20 border border-brand-cyan" /> 선택됨
              </span>
            </div>
          </>
        )}
      </div>

      {/* Booking form */}
      {selectedSlot && (
        <div className="px-4 pb-4 border-t border-ui-border pt-4">
          <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-4 mb-3">
            <p className="text-sm font-bold text-brand-cyan mb-1">선택한 시간</p>
            <p className="text-xs text-text-muted">
              {selectedDate} {selectedSlot.startAt.split("T")[1].slice(0, 5)} ~ {selectedSlot.endAt.split("T")[1].slice(0, 5)}
              {" · "}₩{selectedSlot.price.toLocaleString()}
            </p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-xs text-red-400 mb-3">{error}</div>}
          {success && (
            <div className="bg-green-400/10 border border-green-400/30 rounded-lg px-4 py-3 text-sm text-green-400 flex items-center gap-2 mb-3">
              <Check className="w-4 h-4" /> 예약 신청 완료! 운영자 승인을 기다려주세요.
            </div>
          )}

          {!success && (
            <>
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-[10px] text-text-muted mb-1">인원수</label>
                  <select value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}명</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-text-muted mb-1">메모 (선택)</label>
                  <input type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="요청사항"
                    className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none" />
                </div>
              </div>
              <button onClick={handleBook} disabled={booking}
                className="w-full py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
                {booking ? "신청 중..." : user ? "예약 신청" : "로그인 후 예약"}
              </button>
              <p className="text-[10px] text-text-muted/50 text-center mt-2">운영자 확인 후 예약이 확정됩니다.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
