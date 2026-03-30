import { NextRequest, NextResponse } from "next/server";
import { getVenues, createEntity } from "@/lib/db";
import { genId, genSlug } from "@/lib/csv-parser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venues = await getVenues({
    region: searchParams.get("region") || undefined,
    keyword: searchParams.get("keyword") || undefined,
  });
  return NextResponse.json(venues);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const v = {
    id: genId(),
    name: b.name || "",
    slug: genSlug(b.name || "venue"),
    address: b.address || "",
    roadAddress: b.roadAddress || "",
    region: b.region || "",
    phone: b.phone || "",
    operatingHours: b.operatingHours || "",
    courtCount: Number(b.courtCount) || 0,
    indoorOutdoor: b.indoorOutdoor || "",
    parkingAvailable: !!b.parkingAvailable,
    description: b.description || "",
    mapLink: b.mapLink || "",
    isFeatured: !!b.isFeatured,
    createdAt: now,
    updatedAt: now,
  };
  createEntity("venues.json", v);
  return NextResponse.json(v, { status: 201 });
}
