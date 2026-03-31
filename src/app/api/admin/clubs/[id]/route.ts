export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getClub, updateEntity, deleteEntity } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const c = await getClub(params.id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (body.memberCount !== undefined) body.memberCount = Number(body.memberCount);
  if (body.recruitStatus !== undefined) body.isRecruiting = body.recruitStatus !== "모집마감";
  if (body.homeVenue !== undefined) body.meetingVenue = body.homeVenue;
  if (body.contact !== undefined) body.contactPhone = body.contact;
  if (body.snsLink !== undefined) body.website = body.snsLink;
  if (body.region !== undefined) body.city = body.region;
  body.updatedAt = new Date().toISOString();

  const updated = updateEntity("clubs.json", params.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteEntity("clubs.json", params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
