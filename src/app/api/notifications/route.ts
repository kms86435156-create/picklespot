export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getUserNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from "@/lib/db";

/** GET /api/notifications — get user notifications */
export async function GET(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ notifications: [], unreadCount: 0 });

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get("countOnly") === "true";

  if (countOnly) {
    const count = await getUnreadNotificationCount(session.id);
    return NextResponse.json({ unreadCount: count });
  }

  const notifications = await getUserNotifications(session.id);
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  return NextResponse.json({ notifications, unreadCount });
}

/** PATCH /api/notifications — mark as read */
export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id, markAll } = await req.json();

  if (markAll) {
    await markAllNotificationsRead(session.id);
    return NextResponse.json({ success: true });
  }

  if (id) {
    markNotificationRead(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "id 또는 markAll 필요" }, { status: 400 });
}
