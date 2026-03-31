export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { findOrCreateConversation, getBlockedUsers } from "@/lib/db";

/** POST /api/chat/start — Find or create a 1:1 conversation */
export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { targetUserId, context } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "대상 사용자를 지정해주세요." }, { status: 400 });
  if (targetUserId === session.id) return NextResponse.json({ error: "자신에게는 메시지를 보낼 수 없습니다." }, { status: 400 });

  // Check block
  const blocked = await getBlockedUsers(session.id);
  if (blocked.includes(targetUserId)) return NextResponse.json({ error: "차단한 사용자입니다." }, { status: 403 });

  const blockedBy = await getBlockedUsers(targetUserId);
  if (blockedBy.includes(session.id)) return NextResponse.json({ error: "메시지를 보낼 수 없는 사용자입니다." }, { status: 403 });

  try {
    const conversation = await findOrCreateConversation(session.id, targetUserId, context || "");
    return NextResponse.json({ conversation });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "채팅방 생성 실패" }, { status: 500 });
  }
}
