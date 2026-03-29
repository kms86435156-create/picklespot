"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, Clock, Car, Droplets, Lightbulb, Wrench,
  Share2, Phone, CheckCircle, Loader2, AlertTriangle, Users,
} from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import ClipButton from "@/components/ui/ClipButton";
import TimeSlotPicker from "./TimeSlotPicker";
import { useToast } from "@/components/ui/Toast";

type BookingStep = "idle" | "holding" | "confirming" | "processing" | "done" | "error";

export default function CourtDetailContent({ venue: c }: { venue: any }) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookingStep, setBookingStep] = useState<BookingStep>("idle");
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const { toast } = useToast();

  const isNative = c?.bookingMode === "native_auto_confirm" || c?.bookingMode === "native_approval_required";
  const isApprovalRequired = c?.bookingMode === "native_approval_required";

  // 실제 슬롯 조회 (native만)
  const loadAvailability = async (date: string) => {
    if (!isNative) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/venues/${c.id}/availability?date=${date}`);
      const data = await res.json();
      setAvailability(data.availability || []);
      if (data.availability?.length > 0 && !selectedResource) {
        setSelectedResource(data.availability[0].resource.id);
      }
    } catch {
      toast("슬롯 조회에 실패했습니다.", "warning");
    }
    setLoadingSlots(false);
  };

  // 날짜 변경 시 슬롯 로드
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setBookingStep("idle");
    loadAvailability(date);
  };

  // 초기 로드
  if (isNative && availability.length === 0 && !loadingSlots) {
    loadAvailability(selectedDate);
  }

  if (!c) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-text-muted">피클볼장을 찾을 수 없습니다.</p>
        <Link href="/courts" className="text-brand-cyan text-sm mt-2 inline-block">← 목록으로</Link>
      </div>
    );
  }

  const typeLabel = c.type === "indoor" ? "실내" : c.type === "outdoor" ? "실외" : "실내/실외";

  // 현재 선택된 resource의 슬롯
  const currentSlots = availability.find((a: any) => a.resource.id === selectedResource)?.slots || [];
  const availCount = currentSlots.filter((s: any) => s.status === "available").length;

  // ═══ 실제 예약 흐름 ═══
  const handleBook = async () => {
    if (!selectedSlot || !isNative) return;
    setBookingStep("holding");
    try {
      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot, userId: "user-1" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.isDemoMode) {
          toast("데모 환경이라 예약이 저장되지 않습니다. Supabase를 연결하세요.", "info");
        } else {
          toast(data.error || data.message || "슬롯 선택에 실패했습니다.", "warning");
        }
        setBookingStep("idle");
        loadAvailability(selectedDate);
        return;
      }
      setHoldToken(data.holdToken);
      setBookingStep("confirming");
    } catch {
      toast("서버 오류가 발생했습니다.", "warning");
      setBookingStep("idle");
    }
  };

  const handleConfirm = async () => {
    if (!holdToken) return;
    setBookingStep("processing");
    try {
      // 1. checkout (booking 생성)
      const checkoutRes = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdToken, userId: "user-1", userName: "이정호", userPhone: "010-1234-5678", bookingMode: c.bookingMode }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        toast(checkoutData.error || "예약 생성에 실패했습니다.", "warning");
        setBookingStep("idle");
        return;
      }

      if (isApprovalRequired) {
        // 승인 대기 — 확정하지 않음
        setBookingResult(checkoutData.booking);
        setBookingStep("done");
        loadAvailability(selectedDate);
      } else {
        // 2. auto confirm
        const confirmRes = await fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: checkoutData.booking.id }),
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) {
          toast(confirmData.error || "결제 확인에 실패했습니다.", "warning");
          setBookingStep("idle");
          return;
        }
        setBookingResult(confirmData.booking);
        setBookingStep("done");
        loadAvailability(selectedDate);
      }
    } catch {
      toast("서버 오류가 발생했습니다.", "warning");
      setBookingStep("error");
    }
  };

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/courts" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-cyan transition-colors mb-6 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> 코트 목록
        </Link>

        {/* ── 헤더 ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="relative bg-ui-bg/50 border border-ui-border rounded-sm p-5 md:p-8 card-grid-bg mb-5">
            <TechCorners color="rgba(0,212,255,0.2)" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm">{typeLabel}</span>
                  {availCount > 0 ? <StatusBadge status="open" size="md" /> : <StatusBadge status="full" size="md" />}
                </div>
                <h1 className="text-2xl md:text-3xl font-black leading-tight mb-2">{c.name}</h1>
                <p className="text-text-muted text-sm leading-relaxed">{c.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => toast("링크가 복사되었습니다.", "success")} className="p-2.5 bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" title="공유"><Share2 className="w-4 h-4 text-text-muted" /></button>
                <button type="button" onClick={() => toast("전화 연결 기능은 준비중입니다.", "info")} className="p-2.5 bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" title="전화"><Phone className="w-4 h-4 text-text-muted" /></button>
              </div>
            </div>

            {/* 핵심 정보 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { icon: <MapPin className="w-4 h-4" />, label: "주소", value: c.address },
                { icon: <Clock className="w-4 h-4" />, label: "운영시간", value: c.operatingHours },
                { icon: <Users className="w-4 h-4" />, label: "코트", value: `${c.courtCount}면 · ${c.surface}` },
                { icon: <Star className="w-4 h-4 text-yellow-400" />, label: "평점", value: `${c.rating} (${c.reviewCount}개 리뷰)` },
              ].map((item, i) => (
                <div key={i} className="bg-dark/30 border border-ui-border rounded-sm p-3">
                  <div className="flex items-center gap-1.5 text-brand-cyan/50 mb-1">{item.icon}<span className="text-[10px] font-mono text-text-muted uppercase">{item.label}</span></div>
                  <div className="text-sm font-bold">{item.value}</div>
                </div>
              ))}
            </div>

            {/* 가격표 */}
            <div className="bg-dark/30 border border-ui-border rounded-sm p-4 mb-5">
              <h3 className="text-sm font-bold mb-2">가격</h3>
              <div className="flex items-center gap-6">
                <div><span className="text-xs text-text-muted">평일</span><div className="text-lg font-black text-brand-cyan font-mono">₩{c.pricePerHour.toLocaleString()}<span className="text-xs text-text-muted font-normal">/시간</span></div></div>
                {c.priceWeekend && <div><span className="text-xs text-text-muted">주말/공휴일</span><div className="text-lg font-black text-yellow-400 font-mono">₩{c.priceWeekend.toLocaleString()}<span className="text-xs text-text-muted font-normal">/시간</span></div></div>}
              </div>
            </div>

            {/* 편의시설 */}
            <div className="bg-dark/30 border border-ui-border rounded-sm p-4 mb-5">
              <h3 className="text-sm font-bold mb-2">편의시설</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { has: c.hasParking, icon: <Car className="w-4 h-4" />, label: "주차" },
                  { has: c.hasShower, icon: <Droplets className="w-4 h-4" />, label: "샤워실" },
                  { has: c.hasLighting, icon: <Lightbulb className="w-4 h-4" />, label: "조명" },
                  { has: c.hasEquipmentRental, icon: <Wrench className="w-4 h-4" />, label: "장비대여" },
                ].map((a, i) => (
                  <div key={i} className={`flex flex-col items-center gap-1 py-2 rounded-sm border text-xs ${a.has ? "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5" : "text-text-muted/30 border-ui-border"}`}>
                    {a.icon}
                    <span>{a.label}</span>
                  </div>
                ))}
                {(c.amenities || []).filter((a: string) => !["주차", "샤워실", "조명", "장비대여"].includes(a)).map((a: string) => (
                  <div key={a} className="flex flex-col items-center gap-1 py-2 rounded-sm border text-xs text-text-muted border-ui-border">
                    <span className="text-base">✓</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 혼잡 시간대 */}
            <div className="bg-dark/30 border border-ui-border rounded-sm p-4 mb-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-yellow-400">혼잡 시간대</span>
                  <p className="text-sm text-text-muted">{c.peakHours}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 예약 섹션 — booking_mode별 분기 ── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative bg-ui-bg/50 border border-ui-border rounded-sm p-5 md:p-8 card-grid-bg mb-5">
            <TechCorners color="rgba(0,212,255,0.2)" />

            {/* ═══ outbound_link — 외부 예약 ═══ */}
            {!isNative && (
              <div className="text-center py-6">
                <div className="text-xs font-mono text-text-muted mb-2">예약 방식: 외부 예약</div>
                <p className="text-sm text-text-muted mb-4">
                  {c.bookingNotice || "해당 시설에 직접 문의하여 예약하세요."}
                </p>
                {c.phone && (
                  <p className="text-sm mb-4">
                    전화: <span className="text-brand-cyan font-mono">{c.phone}</span>
                  </p>
                )}
                {c.externalBookingUrl ? (
                  <a href={c.externalBookingUrl} target="_blank" rel="noopener noreferrer">
                    <ClipButton variant="cyan" arrow>외부 예약으로 이동</ClipButton>
                  </a>
                ) : (
                  <button type="button" onClick={() => toast("전화 또는 방문으로 예약해주세요.", "info")} className="px-6 py-3 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 hover:text-white transition-all min-h-[44px]">
                    전화 예약 문의
                  </button>
                )}
              </div>
            )}

            {/* ═══ native — 실제 예약 ═══ */}
            {isNative && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black">코트 예약</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${isApprovalRequired ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20"}`}>
                      {isApprovalRequired ? "운영진 승인 필요" : "실시간 확정"}
                    </span>
                    <span className="text-xs text-text-muted font-mono">예약 가능 <span className="text-brand-cyan font-bold">{availCount}</span></span>
                  </div>
                </div>

                {/* 날짜 선택 */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const ds = d.toISOString().split("T")[0];
                    const isSelected = selectedDate === ds;
                    return (
                      <button key={ds} type="button" onClick={() => handleDateChange(ds)} className={`px-3 py-2 text-xs font-mono rounded-sm border min-h-[40px] shrink-0 ${isSelected ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan font-bold" : "bg-ui-bg/30 border-ui-border text-text-muted hover:border-brand-cyan/30"}`}>
                        {d.toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })}
                      </button>
                    );
                  })}
                </div>

                {/* 코트 선택 (2면 이상일 때) */}
                {availability.length > 1 && (
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {availability.map((a: any) => (
                      <button key={a.resource.id} type="button" onClick={() => { setSelectedResource(a.resource.id); setSelectedSlot(null); }} className={`px-3 py-2 text-xs rounded-sm border min-h-[36px] shrink-0 ${selectedResource === a.resource.id ? "bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan font-bold" : "bg-ui-bg/30 border-ui-border text-text-muted hover:border-brand-cyan/30"}`}>
                        {a.resource.name}
                      </button>
                    ))}
                  </div>
                )}

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-brand-cyan animate-spin" /></div>
                ) : bookingStep === "idle" || bookingStep === "holding" ? (
                  <>
                    <TimeSlotPicker slots={currentSlots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center gap-4 text-[10px] text-text-muted">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-brand-cyan/60 rounded-sm" /> 예약 가능</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-white/10 rounded-sm" /> 마감</span>
                      </div>
                      <ClipButton variant="cyan" onClick={handleBook} disabled={!selectedSlot || bookingStep === "holding"}>
                        {bookingStep === "holding" ? "처리중..." : isApprovalRequired ? "예약 요청" : "예약하기"}
                      </ClipButton>
                    </div>
                  </>
                ) : bookingStep === "confirming" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark/30 border border-brand-cyan/20 rounded-sm p-5">
                    <h3 className="font-bold mb-3">예약 확인</h3>
                    <div className="space-y-2 text-sm text-text-muted mb-3">
                      <div className="flex justify-between"><span>장소</span><span className="text-white font-bold">{c.name}</span></div>
                      <div className="flex justify-between"><span>날짜</span><span className="font-mono">{selectedDate}</span></div>
                      <div className="flex justify-between"><span>시간</span><span className="font-mono">{currentSlots.find((s: any) => s.id === selectedSlot)?.startAt?.slice(11, 16) || ""} ~ {currentSlots.find((s: any) => s.id === selectedSlot)?.endAt?.slice(11, 16) || ""}</span></div>
                      <div className="flex justify-between"><span>비용</span><span className="text-brand-cyan font-mono">₩{(currentSlots.find((s: any) => s.id === selectedSlot)?.price || c.pricePerHour || 0).toLocaleString()}</span></div>
                    </div>
                    <p className="text-[10px] text-yellow-400 mb-4">⏱ 5분 안에 결제를 완료해주세요.</p>
                    <div className="flex gap-2">
                      <ClipButton variant="cyan" className="flex-1 justify-center" onClick={handleConfirm}>
                    {isApprovalRequired ? "예약 요청 제출" : "결제 및 예약 확정"}
                  </ClipButton>
                      <button type="button" onClick={() => setBookingStep("idle")} className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors">취소</button>
                    </div>
                  </motion.div>
                ) : bookingStep === "processing" ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-3" />
                    <p className="font-bold">결제 및 예약 처리 중...</p>
                  </div>
                ) : bookingStep === "done" ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="w-14 h-14 bg-brand-cyan/15 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-7 h-7 text-brand-cyan" />
                    </div>
                    <h3 className="text-lg font-black mb-1">
                      {isApprovalRequired ? "예약 요청이 접수되었습니다!" : "예약이 확정되었습니다!"}
                    </h3>
                    <p className="text-sm text-text-muted mb-2">
                      예약 코드: <span className="font-mono text-brand-cyan">{bookingResult?.bookingCode}</span>
                    </p>
                    {isApprovalRequired && (
                      <p className="text-xs text-yellow-400 mb-2">운영진 확인 후 확정됩니다. 알림으로 결과를 안내드립니다.</p>
                    )}
                    <StatusBadge status={isApprovalRequired ? "pending" : "confirmed"} size="md" />
                    <div className="bg-dark/30 border border-ui-border rounded-sm p-4 mt-4 text-left space-y-2 text-sm max-w-xs mx-auto">
                      <div className="flex justify-between"><span className="text-text-muted">장소</span><span className="font-bold">{c.name}</span></div>
                      <div className="flex justify-between"><span className="text-text-muted">날짜</span><span className="font-mono">{bookingResult?.startAt?.split("T")[0]}</span></div>
                      <div className="flex justify-between"><span className="text-text-muted">시간</span><span className="font-mono">{bookingResult?.startAt?.slice(11, 16)} ~ {bookingResult?.endAt?.slice(11, 16)}</span></div>
                      <div className="flex justify-between"><span className="text-text-muted">결제</span><span className="text-brand-cyan font-mono">₩{(bookingResult?.totalAmount || 0).toLocaleString()}</span></div>
                    </div>
                    <div className="flex flex-col gap-2 mt-5 max-w-xs mx-auto">
                      <button type="button" onClick={() => { setBookingStep("idle"); setSelectedSlot(null); }} className="w-full py-3 text-sm font-bold bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-sm hover:bg-brand-cyan/20 transition-all min-h-[44px]">추가 예약하기</button>
                      <Link href="/mypage" className="w-full py-3 text-sm text-text-muted hover:text-white transition-colors text-center min-h-[44px] block">마이페이지에서 확인</Link>
                    </div>
                  </motion.div>
                ) : null}
              </>
            )}
          </div>
        </motion.div>

        {/* ── 리뷰 ── */}
        {(c.reviews || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-5 mb-5">
              <TechCorners />
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-yellow-400" />
                <h3 className="font-bold text-sm">리뷰 ({(c.reviews || []).length})</h3>
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-lg font-black text-yellow-400 font-mono">{c.rating}</span>
                  <span className="text-xs text-text-muted">/ 5</span>
                </div>
              </div>
              <div className="space-y-3">
                {(c.reviews || []).map((r, i) => (
                  <div key={i} className="bg-dark/30 border border-ui-border rounded-sm p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center">
                          <span className="text-brand-cyan text-[9px] font-bold">{r.author[0]}</span>
                        </div>
                        <span className="text-xs font-bold">{r.author}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`w-2.5 h-2.5 ${j < r.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono">{r.date}</span>
                    </div>
                    <p className="text-xs text-text-muted">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 모바일 하단 고정 CTA */}
        {bookingStep === "idle" && (
          <div className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-md border-t border-ui-border p-3 flex items-center gap-3 md:hidden z-40">
            <div className="flex-1">
              <div className="text-xs text-text-muted">선택: <span className="text-brand-cyan font-mono font-bold">{selectedSlot || "—"}</span></div>
              <div className="text-sm font-mono">₩{c.pricePerHour.toLocaleString()}/h</div>
            </div>
            <ClipButton variant="cyan" onClick={handleBook} className={`min-h-[48px] ${!selectedSlot ? "opacity-50" : ""}`}>
              예약하기
            </ClipButton>
          </div>
        )}
        <div className="h-20 md:hidden" />
      </div>
    </div>
  );
}
