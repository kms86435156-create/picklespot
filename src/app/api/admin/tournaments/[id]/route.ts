import { NextRequest, NextResponse } from "next/server";
import { getTournament, updateEntity, deleteEntity } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = await getTournament(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (body.entryFee !== undefined) body.entryFee = Number(body.entryFee);
  if (body.maxParticipants !== undefined) body.maxParticipants = Number(body.maxParticipants);
  if (body.currentParticipants !== undefined) body.currentParticipants = Number(body.currentParticipants);
  const updated = updateEntity("tournaments.json", params.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteEntity("tournaments.json", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
