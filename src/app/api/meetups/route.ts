export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetups, createMeetup } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const filters = {
    region: s.get("region") || undefined,
    skillLevel: s.get("skillLevel") || undefined,
    date: s.get("date") || undefined,
    status: s.get("status") || undefined,
    isBeginnerFriendly: s.get("beginnerOnly") === "1" ? true : undefined,
  };
  const meetups = await getMeetups(filters);
  return NextResponse.json({ meetups });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const body = await req.json();
    const { title, date, startTime, endTime, region, venueName, venueAddress, maxPlayers, skillLevel, fee, description, isBeginnerFriendly } = body;

    if (!title || !date || !startTime || !region) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요 (제목, 날짜, 시작 시간, 지역)" }, { status: 400 });
    }

    const meetup = await createMeetup({
      title,
      date,
      startTime,
      endTime: endTime || "",
      region,
      venueName: venueName || "",
      venueAddress: venueAddress || "",
      maxPlayers: Number(maxPlayers) || 4,
      skillLevel: skillLevel || "무관",
      fee: Number(fee) || 0,
      description: description || "",
      isBeginnerFriendly: !!isBeginnerFriendly,
      hostId: session.id,
      hostName: session.name,
    });

    return NextResponse.json({ success: true, meetup });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "생성 실패" }, { status: 500 });
  }
}
