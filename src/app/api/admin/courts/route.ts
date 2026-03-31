export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getVenues, createEntity } from "@/lib/db";
import { genId, genSlug } from "@/lib/csv-parser";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || undefined;
  const region = searchParams.get("region") || undefined;
  const courtType = searchParams.get("courtType") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  let venues = await getVenues({ region, keyword });

  // 공개 여부 필터 (기본: 전체)
  const visibility = searchParams.get("visibility");
  if (visibility === "public") venues = venues.filter((v: any) => v.isPublished !== false);
  if (visibility === "private") venues = venues.filter((v: any) => v.isPublished === false);

  // 코트 타입 필터
  if (courtType) venues = venues.filter((v: any) => v.indoorOutdoor === courtType || v.courtType === courtType);

  // 최신순 정렬
  venues.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const total = venues.length;
  const totalPages = Math.ceil(total / limit);
  const items = venues.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, totalPages },
  });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const v = {
    id: genId(),
    name: b.name || "",
    slug: genSlug(b.name || "court"),
    address: b.address || "",
    addressRoad: b.address || b.addressRoad || "",
    roadAddress: b.address || b.roadAddress || "",
    region: b.region || "",
    regionDepth1: b.region || "",
    lat: b.lat ? Number(b.lat) : null,
    lng: b.lng ? Number(b.lng) : null,
    courtCount: Number(b.courtCount) || 0,
    courtType: b.courtType || "",
    indoorOutdoor: b.courtType || b.indoorOutdoor || "",
    floorType: b.floorType || "",
    operatingHours: b.operatingHours || "",
    pricing: b.pricing || "",
    amenities: b.amenities || "",
    phone: b.phone || "",
    website: b.website || "",
    images: b.images || [],
    description: b.description || "",
    isPublished: b.isPublished !== false,
    isFeatured: !!b.isFeatured,
    parkingAvailable: (b.amenities || "").includes("주차장"),
    sourcePrimary: "manual",
    createdAt: now,
    updatedAt: now,
  };
  createEntity("venues.json", v);
  return NextResponse.json(v, { status: 201 });
}
