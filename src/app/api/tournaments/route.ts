import { NextRequest, NextResponse } from "next/server";
import { getTournaments } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const region = url.searchParams.get("region") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const keyword = url.searchParams.get("keyword") || undefined;
  const tournaments = await getTournaments({ region, status, keyword });
  return NextResponse.json({ tournaments, total: tournaments.length });
}
