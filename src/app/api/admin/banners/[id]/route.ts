export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";

const FILE = "banners.json";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (body.order !== undefined) body.order = Number(body.order);
  const data = readJSON(FILE);
  const idx = data.findIndex((b: any) => b.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body, updatedAt: new Date().toISOString() };
  writeJSON(FILE, data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = readJSON(FILE);
  const idx = data.findIndex((b: any) => b.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data.splice(idx, 1);
  writeJSON(FILE, data);
  return NextResponse.json({ success: true });
}
