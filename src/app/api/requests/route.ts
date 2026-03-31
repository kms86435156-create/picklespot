export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";
import { genId } from "@/lib/csv-parser";

const FILE = "content-requests.json";

// 비로그인 사용자도 제출 가능
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    if (!b.type || !b.name) {
      return NextResponse.json({ error: "유형과 이름은 필수입니다." }, { status: 400 });
    }
    if (!b.submitterName || !b.submitterContact) {
      return NextResponse.json({ error: "제출자 이름과 연락처는 필수입니다." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const request = {
      id: genId(),
      type: b.type, // tournament | court | club
      status: "pending", // pending | approved | rejected
      // 공통 필드
      name: b.name || "",
      region: b.region || "",
      description: b.description || "",
      // 대회 전용
      startDate: b.startDate || "",
      endDate: b.endDate || "",
      venueName: b.venueName || "",
      organizer: b.organizer || "",
      // 피클볼장 전용
      address: b.address || "",
      courtCount: b.courtCount ? Number(b.courtCount) : null,
      courtType: b.courtType || "",
      phone: b.phone || "",
      // 동호회 전용
      contactName: b.contactName || "",
      memberCount: b.memberCount ? Number(b.memberCount) : null,
      meetingSchedule: b.meetingSchedule || "",
      // 제출자 정보
      submitterName: b.submitterName || "",
      submitterContact: b.submitterContact || "",
      note: b.note || "",
      // 관리자용
      adminMemo: "",
      rejectReason: "",
      createdAt: now,
      updatedAt: now,
    };

    const data = readJSON(FILE);
    data.push(request);
    writeJSON(FILE, data);

    return NextResponse.json({ ok: true, id: request.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "서버 오류" }, { status: 500 });
  }
}
