import { NextRequest, NextResponse } from "next/server";
import { getMeetup, getMeetupParticipants } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const meetup = await getMeetup(params.id);
  if (!meetup) return NextResponse.json({ error: "모임을 찾을 수 없습니다." }, { status: 404 });
  const participants = await getMeetupParticipants(params.id);
  return NextResponse.json({ ...meetup, participants });
}
