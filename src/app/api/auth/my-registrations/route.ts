export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { readJSON } from "@/lib/db";
import { findUserById } from "@/lib/users";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json([]);

  const user = await findUserById(session.id);
  if (!user) return NextResponse.json([]);

  // 사용자 이메일 또는 연락처로 매칭
  const allRegs = readJSON("registrations.json");
  const tournaments = readJSON("tournaments.json");

  const myRegs = allRegs
    .filter((r: any) => r.playerPhone === user.phone || r.playerEmail === user.email)
    .sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .map((r: any) => {
      const t = tournaments.find((t: any) => t.id === r.tournamentId);
      return {
        ...r,
        tournamentTitle: t?.title || r.tournamentId,
      };
    });

  return NextResponse.json(myRegs);
}
