export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getClub, readJSON, writeJSON, createNotification } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** GET — 멤버 목록 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const members = readJSON("club-members.json")
    .filter((m: any) => m.clubId === params.id && m.status !== "left")
    .sort((a: any, b: any) => {
      const roleOrder: Record<string, number> = { owner: 0, admin: 1, member: 2, pending: 3 };
      return (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
    });
  return NextResponse.json({ members });
}

/** PATCH — 승인/거절/강퇴 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const club = await getClub(params.id);
  if (!club) return NextResponse.json({ error: "동호회를 찾을 수 없습니다." }, { status: 404 });
  if (club.ownerId !== session.id) return NextResponse.json({ error: "운영자만 가능합니다." }, { status: 403 });

  const { memberId, action } = await req.json();
  const members = readJSON("club-members.json");
  const idx = members.findIndex((m: any) => m.id === memberId && m.clubId === params.id);
  if (idx === -1) return NextResponse.json({ error: "멤버를 찾을 수 없습니다." }, { status: 404 });

  const member = members[idx];

  if (action === "approve" && member.status === "pending") {
    members[idx].status = "active";
    writeJSON("club-members.json", members);
    // Increment member count
    const clubs = readJSON("clubs.json");
    const ci = clubs.findIndex((c: any) => c.id === params.id);
    if (ci !== -1) { clubs[ci].memberCount = (clubs[ci].memberCount || 0) + 1; writeJSON("clubs.json", clubs); }
    // Notify
    if (member.userId) {
      createNotification({ userId: member.userId, type: "club_approved", title: "동호회 가입 승인", message: `"${club.name}" 동호회 가입이 승인되었습니다!`, link: `/clubs/${params.id}` });
    }
  } else if (action === "reject" && member.status === "pending") {
    members[idx].status = "rejected";
    writeJSON("club-members.json", members);
    if (member.userId) {
      createNotification({ userId: member.userId, type: "club_apply", title: "동호회 가입 거절", message: `"${club.name}" 동호회 가입이 거절되었습니다.`, link: `/clubs` });
    }
  } else if (action === "kick" && member.status === "active" && member.role !== "owner") {
    members[idx].status = "left";
    writeJSON("club-members.json", members);
    const clubs = readJSON("clubs.json");
    const ci = clubs.findIndex((c: any) => c.id === params.id);
    if (ci !== -1) { clubs[ci].memberCount = Math.max(0, (clubs[ci].memberCount || 1) - 1); writeJSON("clubs.json", clubs); }
  } else {
    return NextResponse.json({ error: "유효하지 않은 작업입니다." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
