import { NextRequest, NextResponse } from "next/server";
import { getMeetup, getMeetupParticipants, createMeetupParticipant, updateEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const meetup = await getMeetup(params.id);
    if (!meetup) return NextResponse.json({ error: "모임을 찾을 수 없습니다." }, { status: 404 });
    if (meetup.status !== "open") {
      return NextResponse.json({ error: "이 모임은 참가할 수 없는 상태입니다." }, { status: 400 });
    }

    // Check if user already joined
    const existing = await getMeetupParticipants(params.id);
    const alreadyJoined = existing.find((p: any) => p.userId === session.id && p.status !== "cancelled");
    if (alreadyJoined) {
      return NextResponse.json({ error: "이미 참가 신청되어 있습니다." }, { status: 409 });
    }

    const body = await req.json();
    const isFull = (meetup.currentPlayers || 0) >= (meetup.maxPlayers || 999);
    const id = `mp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const participant = {
      id,
      meetupId: params.id,
      userId: session.id,
      participantName: body.participantName || session.name,
      participantPhone: body.participantPhone || "",
      note: body.note || "",
      status: isFull ? "waitlist" : "joined",
      isHost: false,
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

// Cancel participation
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const participants = await getMeetupParticipants(params.id);
    const mine = participants.find((p: any) => p.userId === session.id && p.status === "joined" && !p.isHost);
    if (!mine) {
      return NextResponse.json({ error: "참가 내역을 찾을 수 없습니다." }, { status: 404 });
    }

    updateEntity("meetup-participants.json", mine.id, { status: "cancelled" });

    // Decrement currentPlayers
    const meetup = await getMeetup(params.id);
    if (meetup) {
      updateEntity("meetups.json", params.id, { currentPlayers: Math.max(0, (meetup.currentPlayers || 1) - 1) });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "취소 실패" }, { status: 500 });
  }
}
