export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { getMeetups, getMeetupParticipants } from "@/lib/db";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const allMeetups = await getMeetups();

  // Matches I created (as host)
  const hosted = allMeetups.filter((m: any) => m.hostId === session.id);

  // Matches I joined (as participant)
  const joined: any[] = [];
  for (const m of allMeetups) {
    const participants = await getMeetupParticipants(m.id);
    const myParticipation = participants.find((p: any) => p.userId === session.id && p.status === "joined" && !p.isHost);
    if (myParticipation) {
      joined.push({ ...m, participantStatus: myParticipation.status });
    }
  }

  return NextResponse.json({ hosted, joined });
}
