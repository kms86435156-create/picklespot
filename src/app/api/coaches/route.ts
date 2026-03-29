import { NextRequest, NextResponse } from "next/server";
import { getCoaches } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const region = url.searchParams.get("region") || undefined;
  const keyword = url.searchParams.get("keyword") || undefined;
  const coaches = await getCoaches({ region, keyword });
  return NextResponse.json({ coaches, total: coaches.length });
}
