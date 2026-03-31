export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getTournament, updateEntity, deleteEntity } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = await getTournament(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  // 숫자 필드 정규화
  if (body.fee !== undefined) body.fee = Number(body.fee);
  if (body.entryFee !== undefined) body.entryFee = Number(body.entryFee);
  if (body.maxParticipants !== undefined) body.maxParticipants = Number(body.maxParticipants);
  if (body.currentParticipants !== undefined) body.currentParticipants = Number(body.currentParticipants);
  // 호환성: fee ↔ entryFee, divisions ↔ eventTypes 동기화
  if (body.fee !== undefined) body.entryFee = body.fee;
  if (body.divisions !== undefined) body.eventTypes = body.divisions;
  if (body.registrationCloseAt !== undefined) body.registrationDeadline = body.registrationCloseAt;
  if (body.organizer !== undefined) body.organizerName = body.organizer;

  body.updatedAt = new Date().toISOString();

  const updated = updateEntity("tournaments.json", params.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteEntity("tournaments.json", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
