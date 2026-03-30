import { NextRequest, NextResponse } from "next/server";
import { getMeetup, createMeetupParticipant } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meetup = await getMeetup(params.id);
    if (!meetup) return NextResponse.json({ error: "모임을 찾을 수 없습니다." }, { status: 404 });
    if (meetup.status === "closed" || meetup.status === "cancelled" || meetup.status === "completed") {
      return NextResponse.json({ error: "이 모임은 참가할 수 없는 상태입니다." }, { status: 400 });
    }

    const body = await req.json();
    if (!body.participantName || !body.participantPhone) {
      return NextResponse.json({ error: "이름과 연락처를 입력해주세요." }, { status: 400 });
    }

    const isFull = (meetup.currentPlayers || 0) >= (meetup.maxPlayers || 999);
    const id = `mp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const participant = {
      id,
      meetupId: params.id,
      participantName: body.participantName,
      participantPhone: body.participantPhone,
      note: body.note || "",
      status: isFull ? "waitlist" : "joined",
      createdAt: new Date().toISOString(),
    };

    const result = await createMeetupParticipant(participant);
    return NextResponse.json({ success: true, participant: result, waitlisted: isFull });
  } catch (e: any) {
    if (e.message?.includes("이미 참가")) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    return NextResponse.json({ error: e.message || "참가 신청 실패" }, { status: 500 });
  }
}
