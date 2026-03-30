export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getVenue } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const venue = await getVenue(params.id);
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(venue);
}
