export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetup, getMeetupParticipants, updateEntity, deleteEntity } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const meetup = await getMeetup(params.id);
  if (!meetup) return NextResponse.json({ error: "not found" }, { status: 404 });
  const participants = await getMeetupParticipants(params.id);
  return NextResponse.json({ meetup, participants });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = updateEntity("meetups.json", params.id, { ...body, updatedAt: new Date().toISOString() });
  return NextResponse.json({ success: true, meetup: result });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  deleteEntity("meetups.json", params.id);
  return NextResponse.json({ success: true });
}
