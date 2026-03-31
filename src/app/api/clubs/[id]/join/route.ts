export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getClub, readJSON, writeJSON, createEntity, createNotification } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** POST — 가입 신청 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const club = await getClub(params.id);
  if (!club) return NextResponse.json({ error: "동호회를 찾을 수 없습니다." }, { status: 404 });

  const members = readJSON("club-members.json");
  const existing = members.find((m: any) => m.clubId === params.id && m.userId === session.id && m.status !== "left");
  if (existing) {
    if (existing.status === "active") return NextResponse.json({ error: "이미 회원입니다." }, { status: 409 });
    if (existing.status === "pending") return NextResponse.json({ error: "이미 가입 신청 중입니다." }, { status: 409 });
  }

  const member = {
    id: `cm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clubId: params.id,
    userId: session.id,
    userName: session.name,
    role: "member",
    status: "pending",
    joinedAt: new Date().toISOString(),
  };
  createEntity("club-members.json", member);

  // Notify club owner
  if (club.ownerId) {
    createNotification({
      userId: club.ownerId,
      type: "club_apply",
      title: "동호회 가입 신청",
      message: `${session.name}님이 "${club.name}" 가입을 신청했습니다.`,
      link: `/clubs/${params.id}`,
    });
  }

  return NextResponse.json({ success: true, status: "pending" });
}

/** DELETE — 탈퇴 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const members = readJSON("club-members.json");
  const idx = members.findIndex((m: any) => m.clubId === params.id && m.userId === session.id && m.status === "active" && m.role !== "owner");
  if (idx === -1) return NextResponse.json({ error: "탈퇴할 수 없습니다." }, { status: 404 });

  members[idx].status = "left";
  writeJSON("club-members.json", members);

  // Decrement member count
  const clubs = readJSON("clubs.json");
  const clubIdx = clubs.findIndex((c: any) => c.id === params.id);
  if (clubIdx !== -1) { clubs[clubIdx].memberCount = Math.max(0, (clubs[clubIdx].memberCount || 1) - 1); writeJSON("clubs.json", clubs); }

  return NextResponse.json({ success: true });
}
