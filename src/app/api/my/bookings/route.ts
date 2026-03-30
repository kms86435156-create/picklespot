export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUserBookings } from "@/lib/booking-engine";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id") || "anonymous";
  const bookings = getUserBookings(userId);
  return NextResponse.json({ bookings });
}
