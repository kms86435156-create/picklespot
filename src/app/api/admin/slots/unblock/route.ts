import { NextRequest, NextResponse } from "next/server";
import { unblockSlot } from "@/lib/booking-engine";
import { demoModeGuard, adminGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  const authBlock = adminGuard(req);
  if (authBlock) return authBlock;
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const { slotId } = await req.json();
  if (!slotId) return NextResponse.json({ error: "slotId required" }, { status: 400 });
  const result = unblockSlot(slotId);
  if (!result.success) return NextResponse.json({ error: "블록 해제 실패" }, { status: 400 });
  return NextResponse.json({ message: "슬롯 블록이 해제되었습니다." });
}
