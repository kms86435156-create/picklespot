import { NextRequest, NextResponse } from "next/server";
import { blockSlot } from "@/lib/booking-engine";
import { demoModeGuard, adminGuard } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  const authBlock = adminGuard(req);
  if (authBlock) return authBlock;
  const demoBlock = demoModeGuard();
  if (demoBlock) return demoBlock;

  const { resourceId, startAt, endAt, reason } = await req.json();
  if (!resourceId || !startAt) return NextResponse.json({ error: "resourceId, startAt required" }, { status: 400 });
  const result = blockSlot(resourceId, startAt, endAt || startAt, reason || "관리자 블록");
  if (!result.success) return NextResponse.json({ error: "이미 예약된 슬롯입니다." }, { status: 409 });
  return NextResponse.json({ message: "슬롯이 블록되었습니다." });
}
