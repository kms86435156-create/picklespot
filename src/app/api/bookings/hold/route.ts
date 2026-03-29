import { NextRequest, NextResponse } from "next/server";
import { holdSlot } from "@/lib/booking-engine";
import { demoModeGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const { slotId, userId } = await req.json();
  if (!slotId) return NextResponse.json({ error: "slotId is required" }, { status: 400 });

  const result = holdSlot(slotId, userId || "anonymous");
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 409 });

  return NextResponse.json({ holdToken: result.holdToken, heldUntil: result.heldUntil, message: "5분 안에 예약을 완료해주세요." });
}
