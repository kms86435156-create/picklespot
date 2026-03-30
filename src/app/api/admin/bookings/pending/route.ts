export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getPendingBookings } from "@/lib/booking-engine";

export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get("venue_id") || undefined;
  const bookings = getPendingBookings(venueId);
  return NextResponse.json({ bookings, total: bookings.length });
}
