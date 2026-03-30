export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/booking-engine";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const status = url.searchParams.get("status") || undefined;
  const venueId = url.searchParams.get("venue_id") || undefined;
  const date = url.searchParams.get("date") || undefined;
  const bookings = getAllBookings({ status, venueId, date });
  return NextResponse.json({ bookings, total: bookings.length });
}
