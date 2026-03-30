import { NextRequest, NextResponse } from "next/server";
import { getClubs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clubs = await getClubs({
    region: searchParams.get("region") || undefined,
    keyword: searchParams.get("keyword") || undefined,
  });
  return NextResponse.json(clubs);
}
