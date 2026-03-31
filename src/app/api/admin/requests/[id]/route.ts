export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";

const FILE = "content-requests.json";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const items = readJSON(FILE);
  const item = items.find((r: any) => r.id === params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const items = readJSON(FILE);
  const idx = items.findIndex((r: any) => r.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() };
  writeJSON(FILE, items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const items = readJSON(FILE);
  const idx = items.findIndex((r: any) => r.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  items.splice(idx, 1);
  writeJSON(FILE, items);
  return NextResponse.json({ success: true });
}
