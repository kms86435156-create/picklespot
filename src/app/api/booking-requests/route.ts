import { NextRequest, NextResponse } from "next/server";
import { createBookingRequest } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.venueId || !body.requesterName || !body.requesterPhone || !body.bookingDate) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }
    const id = `br_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const request = {
      id,
      venueId: body.venueId,
      venueName: body.venueName || "",
      requesterName: body.requesterName,
      requesterPhone: body.requesterPhone,
      requesterEmail: body.requesterEmail || "",
      bookingDate: body.bookingDate,
      bookingTime: body.bookingTime || "",
      playerCount: body.playerCount || 1,
      memo: body.memo || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const result = await createBookingRequest(request);
    return NextResponse.json({ success: true, bookingRequest: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "예약 요청 실패" }, { status: 500 });
  }
}
