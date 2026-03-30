export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getBookingRequests } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId") || undefined;
  const status = searchParams.get("status") || undefined;
  const requests = await getBookingRequests({ venueId, status });
  return NextResponse.json({ bookingRequests: requests });
}
