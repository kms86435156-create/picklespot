export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { readJSON, getClub } from "@/lib/db";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ clubs: [] });

  const members = readJSON("club-members.json")
    .filter((m: any) => m.userId === session.id && (m.status === "active" || m.status === "pending"));

  const clubs = await Promise.all(members.map(async (m: any) => {
    const club = await getClub(m.clubId);
    return club ? { ...club, myRole: m.role, myStatus: m.status } : null;
  }));

  return NextResponse.json({ clubs: clubs.filter(Boolean) });
}
