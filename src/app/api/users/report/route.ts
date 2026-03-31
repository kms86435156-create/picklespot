export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { createEntity } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { targetUserId, reason, context } = await req.json();
  if (!targetUserId || !reason) return NextResponse.json({ error: "신고 대상과 사유를 입력해주세요." }, { status: 400 });

  const report = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    reporterId: session.id,
    reporterName: session.name,
    targetUserId,
    reason,
    context: context || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  createEntity("reports.json", report);
  return NextResponse.json({ success: true });
}
