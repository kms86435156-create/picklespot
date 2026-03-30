export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTournament } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const tournament = await getTournament(params.id);
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tournament);
}
