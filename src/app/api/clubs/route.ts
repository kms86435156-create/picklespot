import { NextRequest, NextResponse } from "next/server";
import { getClubs, createEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clubs = await getClubs({
    region: searchParams.get("region") || undefined,
    keyword: searchParams.get("keyword") || undefined,
  });
  return NextResponse.json(clubs);
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "동호회명을 입력해주세요." }, { status: 400 });
  if (!body.region) return NextResponse.json({ error: "지역을 선택해주세요." }, { status: 400 });

  const now = new Date().toISOString();
  const id = `club_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const club = {
    id,
    name: body.name.trim(),
    region: body.region,
    city: body.city || body.region,
    level: body.level || "전 급수",
    memberCount: 1,
    isRecruiting: body.isRecruiting !== false,
    meetingSchedule: body.meetingSchedule || "",
    fee: body.fee || "",
    contactPhone: body.contactPhone || "",
    contactKakao: body.contactKakao || "",
    description: body.description || "",
    tags: body.tags || [],
    isVerified: false,
    isPublished: true,
    ownerId: session.id,
    createdAt: now,
    updatedAt: now,
  };

  createEntity("clubs.json", club);

  // Auto-add creator as member (owner)
  createEntity("club-members.json", {
    id: `cm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clubId: id,
    userId: session.id,
    userName: session.name,
    role: "owner",
    status: "active",
    joinedAt: now,
  });

  return NextResponse.json({ success: true, club }, { status: 201 });
}
