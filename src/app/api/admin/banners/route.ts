export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";
import { genId } from "@/lib/csv-parser";

const FILE = "banners.json";

export async function GET() {
  const now = new Date().toISOString();
  const items = readJSON(FILE).sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));
  // 기간 만료 배너 자동 비활성화
  let changed = false;
  items.forEach((b: any) => {
    if (b.isActive && b.endDate && b.endDate < now) {
      b.isActive = false;
      changed = true;
    }
  });
  if (changed) writeJSON(FILE, items);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const banner = {
    id: genId(),
    title: b.title || "",
    imageUrl: b.imageUrl || "",
    linkUrl: b.linkUrl || "",
    startDate: b.startDate || "",
    endDate: b.endDate || "",
    isActive: b.isActive !== false,
    order: Number(b.order) || 0,
    createdAt: now,
    updatedAt: now,
  };
  const data = readJSON(FILE);
  data.push(banner);
  writeJSON(FILE, data);
  return NextResponse.json(banner, { status: 201 });
}
