import { NextRequest, NextResponse } from "next/server";
import { confirmBooking } from "@/lib/booking-engine";
import { demoModeGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const { bookingId, paymentData } = await req.json();
  if (!bookingId) return NextResponse.json({ error: "bookingId is required" }, { status: 400 });

  const result = confirmBooking(bookingId, paymentData || { provider: "demo", paymentKey: `demo-${Date.now()}` });
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ booking: result.booking, message: "예약이 확정되었습니다!" });
}
