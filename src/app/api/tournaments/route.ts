import { NextRequest, NextResponse } from "next/server";
import { getTournaments, createTournament } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const region = url.searchParams.get("region") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const keyword = url.searchParams.get("keyword") || undefined;
  const tournaments = await getTournaments({ region, status, keyword });
  return NextResponse.json({ tournaments, total: tournaments.length });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const tournament = await createTournament(data);
    return NextResponse.json(tournament);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
