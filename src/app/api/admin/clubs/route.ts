export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getClubs, createEntity } from "@/lib/db";
import { genId, genSlug } from "@/lib/csv-parser";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || undefined;
  const region = searchParams.get("region") || undefined;
  const recruitStatus = searchParams.get("recruitStatus") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  let clubs = await getClubs({ region, keyword });

  if (recruitStatus) {
    clubs = clubs.filter((c: any) => c.recruitStatus === recruitStatus);
  }

  clubs.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const total = clubs.length;
  const totalPages = Math.ceil(total / limit);
  const items = clubs.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ items, pagination: { page, limit, total, totalPages } });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const c = {
    id: genId(),
    name: b.name || "",
    slug: genSlug(b.name || "club"),
    region: b.region || "",
    city: b.region || "",
    homeVenue: b.homeVenue || "",
    meetingVenue: b.homeVenue || b.meetingVenue || "",
    contactName: b.contactName || "",
    contactPhone: b.contact || b.contactPhone || "",
    contactKakao: b.contactKakao || "",
    contact: b.contact || "",
    foundedAt: b.foundedAt || "",
    memberCount: Number(b.memberCount) || 0,
    recruitStatus: b.recruitStatus || "모집중",
    isRecruiting: b.recruitStatus !== "모집마감",
    meetingSchedule: b.meetingSchedule || "",
    fee: b.fee || "",
    level: b.level || "",
    description: b.description || "",
    logoUrl: b.logoUrl || "",
    snsLink: b.snsLink || "",
    website: b.snsLink || b.website || "",
    isPublished: b.isPublished !== false,
    isFeatured: !!b.isFeatured,
    sourcePrimary: "manual",
    createdAt: now,
    updatedAt: now,
  };
  createEntity("clubs.json", c);
  return NextResponse.json(c, { status: 201 });
}
