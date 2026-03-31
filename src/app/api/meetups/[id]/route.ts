export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetup, getMeetupParticipants, updateEntity, createNotification } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const meetup = await getMeetup(params.id);
  if (!meetup) return NextResponse.json({ error: "모임을 찾을 수 없습니다." }, { status: 404 });
  const participants = await getMeetupParticipants(params.id);
  return NextResponse.json({ ...meetup, participants });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const meetup = await getMeetup(params.id);
  if (!meetup) return NextResponse.json({ error: "모임을 찾을 수 없습니다." }, { status: 404 });
  if (meetup.hostId !== session.id) return NextResponse.json({ error: "주최자만 수정할 수 있습니다." }, { status: 403 });

  const body = await req.json();
  const allowed = ["title", "meetupDate", "meetupTime", "venueName", "region", "playType", "maxPlayers", "skillLevel", "fee", "description", "status"];
  const updates: Record<string, any> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) updates[k] = body[k];
  }

  updateEntity("meetups.json", params.id, updates);

  // Notify participants on status change
  if (updates.status && updates.status !== meetup.status) {
    const participants = await getMeetupParticipants(params.id);
    const statusLabels: Record<string, string> = { closed: "마감", completed: "완료", cancelled: "취소" };
    const label = statusLabels[updates.status] || updates.status;
    for (const p of participants) {
      if (p.userId && p.userId !== session.id && p.status === "joined") {
        createNotification({
          userId: p.userId,
          type: updates.status === "cancelled" ? "match_canceled" : "match_reminder",
          title: `번개 ${label}`,
          message: `"${meetup.title}" 번개가 ${label}되었습니다.`,
          link: `/matches/${params.id}`,
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
