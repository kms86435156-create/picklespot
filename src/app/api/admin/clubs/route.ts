import { NextRequest, NextResponse } from "next/server";
import { getClubs, createEntity } from "@/lib/db";
import { genId, genSlug } from "@/lib/csv-parser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clubs = await getClubs({
    region: searchParams.get("region") || undefined,
    keyword: searchParams.get("keyword") || undefined,
  });
  return NextResponse.json(clubs);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const c = {
    id: genId(),
    name: b.name || "",
    slug: genSlug(b.name || "club"),
    region: b.region || "",
    homeVenue: b.homeVenue || "",
    contactName: b.contactName || "",
    contactPhoneOrKakao: b.contactPhoneOrKakao || "",
    description: b.description || "",
    memberCount: Number(b.memberCount) || 0,
    joinMethod: b.joinMethod || "",
    externalLink: b.externalLink || "",
    isFeatured: !!b.isFeatured,
    createdAt: now,
    updatedAt: now,
  };
  createEntity("clubs.json", c);
  return NextResponse.json(c, { status: 201 });
}
