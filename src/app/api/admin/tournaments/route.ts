import { NextRequest, NextResponse } from "next/server";
import { getTournaments, createEntity } from "@/lib/db";
import { genId } from "@/lib/csv-parser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournaments = await getTournaments({
    region: searchParams.get("region") || undefined,
    status: searchParams.get("status") || undefined,
    keyword: searchParams.get("keyword") || undefined,
  });
  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const t = {
    id: genId(),
    title: b.title || "",
    startDate: b.startDate || "",
    endDate: b.endDate || "",
    registrationDeadline: b.registrationDeadline || "",
    venueName: b.venueName || "",
    venueId: b.venueId || null,
    organizerName: b.organizerName || "",
    organizerContact: b.organizerContact || "",
    entryFee: Number(b.entryFee) || 0,
    eventTypes: b.eventTypes || "",
    maxParticipants: Number(b.maxParticipants) || 0,
    currentParticipants: Number(b.currentParticipants) || 0,
    description: b.description || "",
    status: b.status || "draft",
    sourceUrl: b.sourceUrl || "",
    isFeatured: !!b.isFeatured,
    region: b.region || "",
    createdAt: now,
    updatedAt: now,
  };
  createEntity("tournaments.json", t);
  return NextResponse.json(t, { status: 201 });
}
