export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON, createEntity } from "@/lib/db";
import { genId, genSlug } from "@/lib/csv-parser";

const FILE = "content-requests.json";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json(); // 관리자가 편집한 데이터
    const items = readJSON(FILE);
    const idx = items.findIndex((r: any) => r.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const request = { ...items[idx], ...body };
    const now = new Date().toISOString();

    // 유형별 엔티티 생성
    if (request.type === "tournament") {
      createEntity("tournaments.json", {
        id: genId(),
        title: request.name || "",
        startDate: request.startDate || "",
        endDate: request.endDate || "",
        registrationCloseAt: request.startDate || "",
        registrationDeadline: request.startDate || "",
        venueName: request.venueName || "",
        region: request.region || "",
        organizer: request.organizer || "",
        organizerName: request.organizer || "",
        description: request.description || "",
        status: "open",
        divisions: "",
        eventTypes: "",
        fee: 0,
        entryFee: 0,
        maxParticipants: 0,
        currentParticipants: 0,
        isFeatured: false,
        sourcePrimary: "user_request",
        createdAt: now,
        updatedAt: now,
      });
    } else if (request.type === "court") {
      createEntity("venues.json", {
        id: genId(),
        name: request.name || "",
        slug: genSlug(request.name || "court"),
        address: request.address || "",
        addressRoad: request.address || "",
        roadAddress: request.address || "",
        region: request.region || "",
        regionDepth1: request.region || "",
        courtCount: request.courtCount || 0,
        courtType: request.courtType || "",
        indoorOutdoor: request.courtType || "",
        phone: request.phone || "",
        description: request.description || "",
        isPublished: true,
        isFeatured: false,
        sourcePrimary: "user_request",
        createdAt: now,
        updatedAt: now,
      });
    } else if (request.type === "club") {
      createEntity("clubs.json", {
        id: genId(),
        name: request.name || "",
        slug: genSlug(request.name || "club"),
        region: request.region || "",
        city: request.region || "",
        contactName: request.contactName || "",
        memberCount: request.memberCount || 0,
        meetingSchedule: request.meetingSchedule || "",
        description: request.description || "",
        isRecruiting: true,
        recruitStatus: "모집중",
        isPublished: true,
        isFeatured: false,
        sourcePrimary: "user_request",
        createdAt: now,
        updatedAt: now,
      });
    }

    // 요청 상태 업데이트
    items[idx] = { ...items[idx], status: "approved", updatedAt: now };
    writeJSON(FILE, items);

    return NextResponse.json({ ok: true, status: "approved" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "승인 처리 실패" }, { status: 500 });
  }
}
