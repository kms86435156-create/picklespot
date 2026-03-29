import { NextRequest, NextResponse } from "next/server";
import { cancelBooking } from "@/lib/booking-engine";
import { demoModeGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const { reason } = await req.json().catch(() => ({ reason: undefined }));
  const result = cancelBooking(params.id, reason);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ message: "예약이 취소되었습니다.", refundAmount: result.refundAmount });
}
