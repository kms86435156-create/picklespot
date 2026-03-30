export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetups, createEntity } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || undefined;
  const status = searchParams.get("status") || undefined;
  const meetups = await getMeetups({ region, status });
  return NextResponse.json({ meetups });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.hostName || !body.hostPhone || !body.meetupDate || !body.meetupTime) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
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
      hostName: body.hostName,
      hostPhone: body.hostPhone,
      maxPlayers: body.maxPlayers || 4,
      currentPlayers: 0,
      skillLevel: body.skillLevel || "전체",
      fee: body.fee || 0,
      description: body.description || "",
      status: "open",
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createEntity("meetups.json", meetup);
    return NextResponse.json({ success: true, meetup });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "생성 실패" }, { status: 500 });
  }
}
