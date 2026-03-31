export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetup, getMeetupParticipants, updateEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const meetup = await getMeetup(params.id);
  if (!meetup) return NextResponse.json({ error: "모임을 찾을 수 없습니다." }, { status: 404 });
  const participants = await getMeetupParticipants(params.id);
  return NextResponse.json({ ...meetup, participants });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const meetup = await getMeetup(params.id);
  if (!meetup) return NextResponse.json({ error: "모임을 찾을 수 없습니다." }, { status: 404 });
  if (meetup.hostId !== session.id) return NextResponse.json({ error: "주최자만 수정할 수 있습니다." }, { status: 403 });

  const body = await req.json();
  const allowed = ["title", "meetupDate", "meetupTime", "venueName", "region", "playType", "maxPlayers", "skillLevel", "fee", "description", "status"];
  const updates: Record<string, any> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) updates[k] = body[k];
  }

  updateEntity("meetups.json", params.id, updates);
  return NextResponse.json({ success: true });
}
