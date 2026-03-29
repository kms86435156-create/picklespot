import { NextRequest, NextResponse } from "next/server";
import { getAdminDashboardStats } from "@/lib/booking-engine";

export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get("venue_id") || undefined;
  const stats = getAdminDashboardStats(venueId);
  return NextResponse.json(stats);
}
