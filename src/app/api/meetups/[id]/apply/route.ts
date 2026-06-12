export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetup, applyMeetup, cancelMeetupApplication } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const meetup = await getMeetup(params.id);
  if (!meetup) {
    return NextResponse.json({ error: "번개를 찾을 수 없습니다" }, { status: 404 });
  }
  if (meetup.status !== "open") {
    return NextResponse.json({ error: "마감된 번개입니다" }, { status: 400 });
  }
  if ((meetup.currentPlayers || 0) >= (meetup.maxPlayers || 4)) {
    return NextResponse.json({ error: "인원이 꽉 찼습니다" }, { status: 400 });
  }

  const result = await applyMeetup(params.id, session.id, session.name);
  if (result.alreadyApplied) {
    return NextResponse.json({ error: "이미 신청하셨습니다" }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "번개 참여가 확정되었습니다! ⚡" });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  await cancelMeetupApplication(params.id, session.id);
  return NextResponse.json({ success: true });
}
