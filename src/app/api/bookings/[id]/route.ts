import { NextRequest, NextResponse } from "next/server";
import { getBooking } from "@/lib/booking-engine";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const booking = getBooking(params.id);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json(booking);
}
