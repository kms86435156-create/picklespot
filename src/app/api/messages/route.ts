export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getUserConversations, getMessages, sendMessage, markMessagesRead, getBlockedUsers } from "@/lib/db";
import { findUserById } from "@/lib/users";

/** GET /api/messages?conversationId=xxx — Get messages for a conversation */
export async function GET(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    // Return conversation list with partner info
    const conversations = await getUserConversations(session.id);
    const blocked = await getBlockedUsers(session.id);

    const enriched = await Promise.all(conversations.map(async (c: any) => {
      const partnerId = (c.participantIds || []).find((id: string) => id !== session.id);
      const partner = partnerId ? await findUserById(partnerId) : null;
      const isBlocked = partnerId ? blocked.includes(partnerId) : false;

      // Count unread for this conversation
      const msgs = await getMessages(c.id);
      const unread = msgs.filter((m: any) => m.senderId !== session.id && !m.isRead).length;

      return {
        ...c,
        partnerId,
        partnerName: partner?.name || "알 수 없음",
        unreadCount: unread,
        isBlocked,
      };
    }));

    return NextResponse.json({ conversations: enriched });
  }

  // Get messages for specific conversation
  const messages = await getMessages(conversationId);
  await markMessagesRead(conversationId, session.id);
  return NextResponse.json({ messages });
}

/** POST /api/messages — Send a message */
export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { conversationId, text } = await req.json();
  if (!conversationId || !text?.trim()) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  try {
    const message = await sendMessage({
      conversationId,
      senderId: session.id,
      senderName: session.name,
      text: text.trim(),
    });
    return NextResponse.json({ message });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "전송 실패" }, { status: 500 });
  }
}
