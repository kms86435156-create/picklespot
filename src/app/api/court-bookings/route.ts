export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON, createNotification } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** GET /api/court-bookings?venueId=xxx&date=2026-04-10 — get slots for a venue+date */
/** GET /api/court-bookings?userId=me — get my bookings */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");
  const date = searchParams.get("date");
  const userMode = searchParams.get("userId");

  if (userMode === "me") {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ bookings: [] });
    const bookings = readJSON("bookings.json")
      .filter((b: any) => b.userId === session.id)
      .sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    // Enrich with venue name
    const venues = readJSON("venues.json");
    const venueMap: Record<string, string> = {};
    venues.forEach((v: any) => { venueMap[v.id] = v.name; });
    const enriched = bookings.map((b: any) => ({ ...b, venueName: venueMap[b.venueId] || "알 수 없음" }));
    return NextResponse.json({ bookings: enriched });
  }

  if (!venueId || !date) return NextResponse.json({ error: "venueId, date 필수" }, { status: 400 });

  const slots = readJSON("slot-inventory.json")
    .filter((s: any) => s.venueId === venueId && s.startAt.startsWith(date));
  const resources = readJSON("court-resources.json")
    .filter((r: any) => r.venueId === venueId && r.isActive);
  const hours = readJSON("business-hours.json")
    .filter((h: any) => h.venueId === venueId);

  return NextResponse.json({ slots, resources, businessHours: hours });
}

/** POST /api/court-bookings — create booking request */
export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { slotId, playerCount, memo } = await req.json();
  if (!slotId) return NextResponse.json({ error: "슬롯을 선택해주세요." }, { status: 400 });

  const slots = readJSON("slot-inventory.json");
  const slotIdx = slots.findIndex((s: any) => s.id === slotId);
  if (slotIdx === -1) return NextResponse.json({ error: "슬롯을 찾을 수 없습니다." }, { status: 404 });

  const slot = slots[slotIdx];
  if (slot.status !== "available") return NextResponse.json({ error: "이미 예약된 시간입니다." }, { status: 409 });

  // Create booking
  const bookingId = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const booking = {
    id: bookingId,
    venueId: slot.venueId,
    resourceId: slot.resourceId,
    userId: session.id,
    userName: session.name,
    userPhone: "",
    startAt: slot.startAt,
    endAt: slot.endAt,
    status: "pending_approval",
    totalAmount: slot.price,
    paymentStatus: "unpaid",
    bookingCode: `PBL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    participants: [{ name: session.name, phone: "", note: memo || "" }],
    playerCount: playerCount || 2,
    memo: memo || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Update slot status
  slots[slotIdx].status = "booked";
  slots[slotIdx].bookingId = bookingId;
  writeJSON("slot-inventory.json", slots);

  // Save booking
  const bookings = readJSON("bookings.json");
  bookings.push(booking);
  writeJSON("bookings.json", bookings);

  return NextResponse.json({ success: true, booking });
}

/** PATCH /api/court-bookings — cancel booking (user) or approve/reject (admin) */
export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { bookingId, action, reason } = await req.json();
  if (!bookingId || !action) return NextResponse.json({ error: "bookingId, action 필수" }, { status: 400 });

  const bookings = readJSON("bookings.json");
  const idx = bookings.findIndex((b: any) => b.id === bookingId);
  if (idx === -1) return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });

  const booking = bookings[idx];

  if (action === "cancel") {
    // User can only cancel their own pending bookings
    if (booking.userId !== session.id) return NextResponse.json({ error: "본인 예약만 취소 가능합니다." }, { status: 403 });
    if (booking.status !== "pending_approval") return NextResponse.json({ error: "승인 대기 상태에서만 취소 가능합니다." }, { status: 400 });

    bookings[idx].status = "cancelled";
    bookings[idx].updatedAt = new Date().toISOString();

    // Release slot
    const slots = readJSON("slot-inventory.json");
    const slotIdx = slots.findIndex((s: any) => s.bookingId === bookingId);
    if (slotIdx !== -1) { slots[slotIdx].status = "available"; slots[slotIdx].bookingId = null; writeJSON("slot-inventory.json", slots); }
  } else if (action === "approve") {
    bookings[idx].status = "confirmed";
    bookings[idx].updatedAt = new Date().toISOString();
    if (booking.userId) {
      createNotification({ userId: booking.userId, type: "match_approved", title: "예약 확정", message: `코트 예약이 확정되었습니다. (${booking.startAt?.split("T")[0]} ${booking.startAt?.split("T")[1]?.slice(0,5)})`, link: "/mypage" });
    }
  } else if (action === "reject") {
    bookings[idx].status = "rejected";
    bookings[idx].updatedAt = new Date().toISOString();
    // Release slot
    const slots = readJSON("slot-inventory.json");
    const slotIdx = slots.findIndex((s: any) => s.bookingId === bookingId);
    if (slotIdx !== -1) { slots[slotIdx].status = "available"; slots[slotIdx].bookingId = null; writeJSON("slot-inventory.json", slots); }
    if (booking.userId) {
      createNotification({ userId: booking.userId, type: "match_rejected", title: "예약 거절", message: `코트 예약이 거절되었습니다.${reason ? ` 사유: ${reason}` : ""}`, link: "/mypage" });
    }
  }

  writeJSON("bookings.json", bookings);
  return NextResponse.json({ success: true });
}
