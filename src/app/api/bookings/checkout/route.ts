import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/booking-engine";
import { demoModeGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const { holdToken, userId, userName, userPhone, bookingMode } = await req.json();
  if (!holdToken) return NextResponse.json({ error: "holdToken is required" }, { status: 400 });

  const result = createBooking(holdToken, userId || "anonymous", userName || "게스트", userPhone || "", bookingMode);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 409 });

  return NextResponse.json({ booking: result.booking, message: "예약이 생성되었습니다." });
}
