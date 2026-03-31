export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getTournaments, createEntity } from "@/lib/db";
import { genId } from "@/lib/csv-parser";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const region = searchParams.get("region") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  let tournaments = await getTournaments({ region, status, keyword });

  // 추가 상태 필터 (마감임박: 7일 이내)
  if (status === "closing") {
    const now = Date.now();
    tournaments = (await getTournaments({ region, keyword })).filter((t: any) => {
      if (t.status === "closed" || t.status === "completed" || t.status === "cancelled") return false;
      const deadline = t.registrationCloseAt || t.registrationDeadline || t.startDate;
      if (!deadline) return false;
      const diff = new Date(deadline).getTime() - now;
      return diff > 0 && diff <= 7 * 86400000;
    });
  }

  // 최신순 정렬
  tournaments.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const total = tournaments.length;
  const totalPages = Math.ceil(total / limit);
  const items = tournaments.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, totalPages },
  });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const t = {
    id: genId(),
    title: b.title || "",
    startDate: b.startDate || "",
    endDate: b.endDate || "",
    registrationOpenAt: b.registrationOpenAt || "",
    registrationCloseAt: b.registrationCloseAt || "",
    registrationDeadline: b.registrationCloseAt || b.registrationDeadline || "",
    venueName: b.venueName || "",
    venueAddress: b.venueAddress || "",
    venueId: b.venueId || null,
    region: b.region || "",
    divisions: b.divisions || "",
    eventTypes: b.divisions || b.eventTypes || "",
    fee: Number(b.fee) || 0,
    entryFee: Number(b.fee) || Number(b.entryFee) || 0,
    feeText: b.feeText || "",
    maxParticipants: Number(b.maxParticipants) || 0,
    currentParticipants: 0,
    organizer: b.organizer || "",
    organizerName: b.organizer || b.organizerName || "",
    organizerContact: b.organizerContact || "",
    description: b.description || "",
    status: b.status || "open",
    posterUrl: b.posterUrl || "",
    detailUrl: b.detailUrl || "",
    isFeatured: !!b.isFeatured,
    sourcePrimary: "manual",
    createdAt: now,
    updatedAt: now,
  };
  createEntity("tournaments.json", t);
  return NextResponse.json(t, { status: 201 });
}
