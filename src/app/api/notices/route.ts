export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readJSON } from "@/lib/db";

export async function GET() {
  const notices = readJSON("notices.json")
    .filter((n: any) => n.isPublished)
    .sort((a: any, b: any) => {
      // 고정 공지 우선, 그 다음 최신순
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  return NextResponse.json(notices);
}
