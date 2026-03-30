export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getVenues } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const region = url.searchParams.get("region") || undefined;
  const keyword = url.searchParams.get("keyword") || undefined;
  const venues = await getVenues({ region, keyword });
  return NextResponse.json({ venues, total: venues.length });
}
