export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { createEntity, readJSON } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { targetUserId } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "대상을 지정해주세요." }, { status: 400 });

  const block = {
    id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    blockerId: session.id,
    blockedId: targetUserId,
    createdAt: new Date().toISOString(),
  };
  createEntity("blocks.json", block);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { targetUserId } = await req.json();
  // Simple: rewrite blocks without this entry (JSON fallback)
  const blocks = readJSON("blocks.json");
  const filtered = blocks.filter((b: any) => !(b.blockerId === session.id && b.blockedId === targetUserId));
  const { writeJSON } = await import("@/lib/db");
  writeJSON("blocks.json", filtered);
  return NextResponse.json({ success: true });
}
