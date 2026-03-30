import { NextRequest, NextResponse } from "next/server";
import { getVenue, updateEntity, deleteEntity } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const v = await getVenue(params.id);
  if (!v) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(v);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (body.courtCount !== undefined) body.courtCount = Number(body.courtCount);
  const updated = updateEntity("venues.json", params.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteEntity("venues.json", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
