import { NextRequest, NextResponse } from "next/server";
import { rejectBooking } from "@/lib/booking-engine";
import { demoModeGuard, adminGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authBlock = adminGuard(req);
  if (authBlock) return authBlock;
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const { reason } = await req.json().catch(() => ({ reason: "" }));
  const result = rejectBooking(params.id, reason);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ message: "예약이 거절되었습니다." });
}
