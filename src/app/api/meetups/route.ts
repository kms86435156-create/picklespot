export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetups, createEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || undefined;
  const status = searchParams.get("status") || undefined;
  const meetups = await getMeetups({ region, status });
  return NextResponse.json({ meetups });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.meetupDate || !body.meetupTime) {
      return NextResponse.json({ error: "제목, 날짜, 시간은 필수입니다." }, { status: 400 });
    }

    const id = `mt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const meetup = {
      id,
      title: body.title,
      region: body.region || "",
      venueId: body.venueId || null,
      venueName: body.venueName || "",
      meetupDate: body.meetupDate,
      meetupTime: body.meetupTime,
      playType: body.playType || "자유",
      hostId: session.id,
      hostName: body.hostName || session.name,
      hostPhone: body.hostPhone || "",
      maxPlayers: Math.min(Math.max(body.maxPlayers || 4, 2), 20),
      currentPlayers: 1, // host counts as participant
      skillLevel: body.skillLevel || "무관",
      fee: body.fee || 0,
      description: body.description || "",
      status: "open",
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createEntity("meetups.json", meetup);

    // Auto-add host as first participant
    const hostParticipant = {
      id: `mp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      meetupId: id,
      userId: session.id,
      participantName: session.name,
      participantPhone: body.hostPhone || "",
      note: "",
      status: "joined",
      isHost: true,
      createdAt: new Date().toISOString(),
    };
    createEntity("meetup-participants.json", hostParticipant);

    return NextResponse.json({ success: true, meetup });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "생성 실패" }, { status: 500 });
  }
}
