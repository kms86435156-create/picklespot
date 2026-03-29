import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const HOLD_DURATION_MS = 5 * 60 * 1000; // 5분

function readJSON(file: string): any[] {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJSON(file: string, data: any[]) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ═══ Hold 만료 정리 ═══
function releaseExpiredHolds() {
  const slots = readJSON("slot-inventory.json");
  const now = new Date().toISOString();
  let released = 0;

  for (const slot of slots) {
    if (slot.status === "held" && slot.heldUntil && slot.heldUntil < now) {
      slot.status = "available";
      slot.heldUntil = null;
      slot.bookingId = null;
      released++;
    }
  }

  if (released > 0) writeJSON("slot-inventory.json", slots);
  return released;
}

// ═══ Availability 조회 ═══
export function getAvailability(venueId: string, date: string, resourceId?: string) {
  releaseExpiredHolds();

  const slots = readJSON("slot-inventory.json");
  const resources = readJSON("court-resources.json");

  const venueResources = resources.filter((r: any) => r.venueId === venueId && r.isActive);
  const datePrefix = date; // "YYYY-MM-DD"

  const result: any[] = [];

  for (const resource of venueResources) {
    if (resourceId && resource.id !== resourceId) continue;

    const resourceSlots = slots
      .filter((s: any) => s.resourceId === resource.id && s.startAt.startsWith(datePrefix))
      .map((s: any) => ({
        id: s.id,
        startAt: s.startAt,
        endAt: s.endAt,
        status: s.status,
        price: s.price,
      }))
      .sort((a: any, b: any) => a.startAt.localeCompare(b.startAt));

    result.push({
      resource: {
        id: resource.id,
        name: resource.name,
        indoorOutdoor: resource.indoorOutdoor,
        capacity: resource.capacity,
      },
      slots: resourceSlots,
    });
  }

  return result;
}

// ═══ 슬롯 Hold ═══
export function holdSlot(slotId: string, userId: string): { success: boolean; holdToken?: string; error?: string; heldUntil?: string } {
  releaseExpiredHolds();

  // 파일 기반이므로 read → check → write를 atomic하게 (JSON 파일 한계)
  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.id === slotId);

  if (!slot) return { success: false, error: "슬롯을 찾을 수 없습니다." };
  if (slot.status !== "available") return { success: false, error: "이미 예약된 시간입니다. 다른 시간을 선택해주세요." };

  // Hold 처리
  const holdToken = genId("hold");
  const heldUntil = new Date(Date.now() + HOLD_DURATION_MS).toISOString();

  slot.status = "held";
  slot.heldUntil = heldUntil;
  slot.bookingId = holdToken;

  writeJSON("slot-inventory.json", slots);

  // Booking event 기록
  const events = readJSON("booking-events.json");
  events.push({
    id: genId("evt"),
    bookingId: holdToken,
    eventType: "slot_held",
    payload: { slotId, userId, heldUntil },
    createdAt: new Date().toISOString(),
  });
  writeJSON("booking-events.json", events);

  return { success: true, holdToken, heldUntil };
}

// ═══ 예약 생성 (hold → booking) ═══
export function createBooking(holdToken: string, userId: string, userName: string, userPhone: string, bookingMode?: string): { success: boolean; booking?: any; error?: string } {
  releaseExpiredHolds();

  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.bookingId === holdToken && s.status === "held");

  if (!slot) return { success: false, error: "예약 시간이 만료되었습니다. 다시 시도해주세요." };

  // Hold 유효 확인
  if (slot.heldUntil && new Date(slot.heldUntil) < new Date()) {
    slot.status = "available";
    slot.heldUntil = null;
    slot.bookingId = null;
    writeJSON("slot-inventory.json", slots);
    return { success: false, error: "예약 시간이 만료되었습니다." };
  }

  // Booking 생성
  const bookingId = genId("bk");
  const bookingCode = `PBL-${Date.now().toString(36).toUpperCase()}`;

  const booking = {
    id: bookingId,
    venueId: slot.venueId,
    resourceId: slot.resourceId,
    userId,
    startAt: slot.startAt,
    endAt: slot.endAt,
    status: bookingMode === "native_approval_required" ? "pending_approval" : "pending_payment",
    bookingMode: bookingMode || "native_auto_confirm",
    totalAmount: slot.price,
    paymentStatus: "unpaid",
    bookingCode,
    providerReference: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [{ name: userName, phone: userPhone, note: null }],
  };

  // 슬롯 업데이트
  slot.bookingId = bookingId;

  const bookings = readJSON("bookings.json");
  bookings.push(booking);
  writeJSON("bookings.json", bookings);
  writeJSON("slot-inventory.json", slots);

  // Event
  const events = readJSON("booking-events.json");
  events.push({
    id: genId("evt"),
    bookingId,
    eventType: "booking_created",
    payload: { holdToken, userId, totalAmount: slot.price },
    createdAt: new Date().toISOString(),
  });
  writeJSON("booking-events.json", events);

  return { success: true, booking };
}

// ═══ 결제 완료 → 예약 확정 ═══
export function confirmBooking(bookingId: string, paymentData?: any): { success: boolean; booking?: any; error?: string } {
  const bookings = readJSON("bookings.json");
  const booking = bookings.find((b: any) => b.id === bookingId);

  if (!booking) return { success: false, error: "예약을 찾을 수 없습니다." };
  if (booking.status === "confirmed") return { success: true, booking };
  if (booking.status !== "pending_payment" && booking.status !== "pending_approval") {
    return { success: false, error: `예약 상태가 ${booking.status}이어서 확정할 수 없습니다.` };
  }

  booking.status = "confirmed";
  booking.paymentStatus = "paid";
  booking.updatedAt = new Date().toISOString();

  // 슬롯 확정
  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.bookingId === bookingId);
  if (slot) {
    slot.status = "booked";
    slot.heldUntil = null;
  }

  // Payment 기록
  if (paymentData) {
    const payments = readJSON("payments.json");
    payments.push({
      id: genId("pay"),
      bookingId,
      provider: paymentData.provider || "manual",
      paymentKey: paymentData.paymentKey || null,
      orderId: paymentData.orderId || booking.bookingCode,
      amount: booking.totalAmount,
      status: "approved",
      rawPayload: paymentData,
      approvedAt: new Date().toISOString(),
    });
    writeJSON("payments.json", payments);
  }

  writeJSON("bookings.json", bookings);
  writeJSON("slot-inventory.json", slots);

  // Event
  const events = readJSON("booking-events.json");
  events.push({
    id: genId("evt"),
    bookingId,
    eventType: "booking_confirmed",
    payload: { paymentData },
    createdAt: new Date().toISOString(),
  });
  writeJSON("booking-events.json", events);

  return { success: true, booking };
}

// ═══ 예약 취소 ═══
export function cancelBooking(bookingId: string, reason?: string): { success: boolean; refundAmount?: number; error?: string } {
  const bookings = readJSON("bookings.json");
  const booking = bookings.find((b: any) => b.id === bookingId);

  if (!booking) return { success: false, error: "예약을 찾을 수 없습니다." };
  if (booking.status === "cancelled") return { success: false, error: "이미 취소된 예약입니다." };

  // 환불 금액 계산
  const policies = readJSON("cancellation-policies.json");
  const policy = policies.find((p: any) => p.venueId === booking.venueId);
  const hoursUntilStart = (new Date(booking.startAt).getTime() - Date.now()) / 3600000;

  let refundAmount = 0;
  if (policy) {
    if (hoursUntilStart >= policy.freeHoursBefore) {
      refundAmount = booking.totalAmount;
    } else if (hoursUntilStart >= policy.partialRefundHoursBefore) {
      refundAmount = Math.floor(booking.totalAmount * policy.partialRefundPercent / 100);
    }
  }

  // 예약 취소
  booking.status = "cancelled";
  booking.paymentStatus = refundAmount > 0 ? "refund_pending" : booking.paymentStatus;
  booking.updatedAt = new Date().toISOString();

  // 슬롯 복원
  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.bookingId === bookingId);
  if (slot) {
    slot.status = "available";
    slot.bookingId = null;
    slot.heldUntil = null;
  }

  writeJSON("bookings.json", bookings);
  writeJSON("slot-inventory.json", slots);

  // Event
  const events = readJSON("booking-events.json");
  events.push({
    id: genId("evt"),
    bookingId,
    eventType: "booking_cancelled",
    payload: { reason, refundAmount, hoursUntilStart: Math.round(hoursUntilStart) },
    createdAt: new Date().toISOString(),
  });
  writeJSON("booking-events.json", events);

  return { success: true, refundAmount };
}

// ═══ 예약 조회 ═══
export function getBooking(bookingId: string) {
  const bookings = readJSON("bookings.json");
  return bookings.find((b: any) => b.id === bookingId) || null;
}

export function getUserBookings(userId: string) {
  const bookings = readJSON("bookings.json");
  return bookings
    .filter((b: any) => b.userId === userId)
    .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
}

// ═══ Native 예약 가능 슬롯 수 ═══
export function getNativeAvailableSlotCount() {
  releaseExpiredHolds();
  const slots = readJSON("slot-inventory.json");
  return slots.filter((s: any) => s.status === "available").length;
}

// ═══════════════════════════════════════════════════
// 관리자 함수
// ═══════════════════════════════════════════════════

// 전체 예약 조회 (관리자)
export function getAllBookings(filters?: { status?: string; venueId?: string; date?: string }) {
  releaseExpiredHolds();
  let bookings = readJSON("bookings.json");
  if (filters?.status) bookings = bookings.filter((b: any) => b.status === filters.status);
  if (filters?.venueId) bookings = bookings.filter((b: any) => b.venueId === filters.venueId);
  if (filters?.date) bookings = bookings.filter((b: any) => b.startAt?.startsWith(filters.date));
  return bookings.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
}

// 승인 대기 예약
export function getPendingBookings(venueId?: string) {
  return getAllBookings({ status: "pending_approval", venueId });
}

// 운영진 승인
export function approveBooking(bookingId: string): { success: boolean; booking?: any; error?: string } {
  const bookings = readJSON("bookings.json");
  const booking = bookings.find((b: any) => b.id === bookingId);
  if (!booking) return { success: false, error: "예약을 찾을 수 없습니다." };
  if (booking.status !== "pending_approval") return { success: false, error: `현재 상태(${booking.status})에서 승인할 수 없습니다.` };

  booking.status = "confirmed";
  booking.paymentStatus = "paid";
  booking.updatedAt = new Date().toISOString();

  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.bookingId === bookingId);
  if (slot) { slot.status = "booked"; slot.heldUntil = null; }

  writeJSON("bookings.json", bookings);
  writeJSON("slot-inventory.json", slots);

  const events = readJSON("booking-events.json");
  events.push({ id: genId("evt"), bookingId, eventType: "admin_approved", payload: {}, createdAt: new Date().toISOString() });
  writeJSON("booking-events.json", events);

  return { success: true, booking };
}

// 운영진 거절
export function rejectBooking(bookingId: string, reason?: string): { success: boolean; error?: string } {
  const bookings = readJSON("bookings.json");
  const booking = bookings.find((b: any) => b.id === bookingId);
  if (!booking) return { success: false, error: "예약을 찾을 수 없습니다." };
  if (booking.status !== "pending_approval") return { success: false, error: `현재 상태(${booking.status})에서 거절할 수 없습니다.` };

  booking.status = "rejected";
  booking.rejectReason = reason || "";
  booking.updatedAt = new Date().toISOString();

  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.bookingId === bookingId);
  if (slot) { slot.status = "available"; slot.bookingId = null; slot.heldUntil = null; }

  writeJSON("bookings.json", bookings);
  writeJSON("slot-inventory.json", slots);

  const events = readJSON("booking-events.json");
  events.push({ id: genId("evt"), bookingId, eventType: "admin_rejected", payload: { reason }, createdAt: new Date().toISOString() });
  writeJSON("booking-events.json", events);

  return { success: true };
}

// 슬롯 블록
export function blockSlot(resourceId: string, startAt: string, endAt: string, reason: string): { success: boolean; slotId?: string } {
  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.resourceId === resourceId && s.startAt === startAt);
  if (slot) {
    if (slot.status !== "available") return { success: false };
    slot.status = "blocked";
    slot.bookingId = `block-${reason}`;
  } else {
    slots.push({ id: genId("slot"), resourceId, venueId: "", startAt, endAt, status: "blocked", price: 0, currency: "KRW", heldUntil: null, bookingId: `block-${reason}` });
  }
  writeJSON("slot-inventory.json", slots);
  return { success: true, slotId: slot?.id };
}

// 슬롯 언블록
export function unblockSlot(slotId: string): { success: boolean } {
  const slots = readJSON("slot-inventory.json");
  const slot = slots.find((s: any) => s.id === slotId);
  if (!slot || slot.status !== "blocked") return { success: false };
  slot.status = "available";
  slot.bookingId = null;
  writeJSON("slot-inventory.json", slots);
  return { success: true };
}

// 관리자 대시보드 통계
export function getAdminDashboardStats(venueId?: string) {
  releaseExpiredHolds();
  const bookings = readJSON("bookings.json");
  const slots = readJSON("slot-inventory.json");
  const today = new Date().toISOString().split("T")[0];

  const vBookings = venueId ? bookings.filter((b: any) => b.venueId === venueId) : bookings;
  const vSlots = venueId ? slots.filter((s: any) => s.venueId === venueId) : slots;

  const todayBookings = vBookings.filter((b: any) => b.startAt?.startsWith(today) && b.status === "confirmed");
  const pendingCount = vBookings.filter((b: any) => b.status === "pending_approval").length;
  const cancelledCount = vBookings.filter((b: any) => b.status === "cancelled").length;

  const todaySlots = vSlots.filter((s: any) => s.startAt?.startsWith(today));
  const bookedTodaySlots = todaySlots.filter((s: any) => s.status === "booked").length;
  const totalTodaySlots = todaySlots.length;
  const occupancyRate = totalTodaySlots > 0 ? Math.round((bookedTodaySlots / totalTodaySlots) * 100) : 0;

  return {
    todayBookingCount: todayBookings.length,
    pendingCount,
    cancelledCount,
    totalBookingCount: vBookings.length,
    occupancyRate,
    recentBookings: vBookings.slice(0, 5),
  };
}
