export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking-engine";
import { getVenue } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const venue = await getVenue(params.id);
  if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

  if (venue.bookingMode !== "native_auto_confirm" && venue.bookingMode !== "native_approval_required") {
    return NextResponse.json({
      bookingMode: venue.bookingMode,
      message: "이 시설은 외부 예약만 지원합니다.",
      externalBookingUrl: venue.externalBookingUrl,
      availability: [],
    });
  }

  const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
  const resourceId = req.nextUrl.searchParams.get("resource_id") || undefined;
  const availability = getAvailability(params.id, date, resourceId);

  return NextResponse.json({ bookingMode: venue.bookingMode, venueId: params.id, date, availability });
}
