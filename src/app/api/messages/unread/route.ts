export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getUnreadCount } from "@/lib/db";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ count: 0 });
  const count = await getUnreadCount(session.id);
  return NextResponse.json({ count });
}
