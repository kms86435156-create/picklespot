import { NextRequest, NextResponse } from "next/server";
import { approveBooking } from "@/lib/booking-engine";
import { demoModeGuard, adminGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authBlock = adminGuard(req);
  if (authBlock) return authBlock;
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const result = approveBooking(params.id);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ booking: result.booking, message: "예약이 승인되었습니다." });
}
