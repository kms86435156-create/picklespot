export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";
import { genId } from "@/lib/csv-parser";

const FILE = "notices.json";

export async function GET() {
  const items = readJSON(FILE).sort((a: any, b: any) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const notice = {
    id: genId(),
    title: b.title || "",
    content: b.content || "",
    isPinned: !!b.isPinned,
    isPublished: b.isPublished !== false,
    createdAt: now,
    updatedAt: now,
  };
  const data = readJSON(FILE);
  data.push(notice);
  writeJSON(FILE, data);
  return NextResponse.json(notice, { status: 201 });
}
