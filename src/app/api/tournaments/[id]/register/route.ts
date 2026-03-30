import { NextRequest, NextResponse } from "next/server";
import { getTournament, getRegistrations, createRegistrationAsync } from "@/lib/db";
import { genId } from "@/lib/csv-parser";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tournament = await getTournament(params.id);
    if (!tournament) return NextResponse.json({ error: "대회를 찾을 수 없습니다." }, { status: 404 });

    const b = await req.json().catch(() => ({}));
    if (!b.playerName || !b.playerPhone) return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
    if (!b.privacyAgreed) return NextResponse.json({ error: "개인정보 수집에 동의해주세요." }, { status: 400 });

    // Deadline check
    const deadline = tournament.registrationDeadline || tournament.registrationCloseAt;
    if (deadline && new Date(deadline).getTime() < Date.now()) {
      return NextResponse.json({ error: "접수 마감일이 지났습니다." }, { status: 400 });
    }
    if (["closed", "cancelled", "completed"].includes(tournament.status)) {
      return NextResponse.json({ error: "접수가 마감된 대회입니다." }, { status: 400 });
    }

    // Capacity check
    const existing = await getRegistrations(params.id);
    const activeCount = existing.filter((r: any) => r.status !== "cancelled" && r.status !== "rejected").length;
    const maxP = Number(tournament.maxParticipants) || 0;
    const isFull = maxP > 0 && activeCount >= maxP;

    // Duplicate check (JSON fallback — DB has UNIQUE constraint)
    const dup = existing.find((r: any) => r.playerPhone === b.playerPhone && r.status !== "cancelled" && r.status !== "rejected");
    if (dup) return NextResponse.json({ error: "이 연락처로 이미 신청되어 있습니다." }, { status: 400 });

    const reg = {
      id: genId(),
      tournamentId: params.id,
      playerName: b.playerName,
      playerPhone: b.playerPhone,
      gender: b.gender || "",
      division: b.division || "",
      partnerName: b.partnerName || "",
      clubName: b.clubName || "",
      level: b.level || "",
      memo: b.memo || "",
      privacyAgreed: true,
      status: isFull ? "waitlisted" : "pending",
      adminMemo: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createRegistrationAsync(reg);
    } catch (e: any) {
      if (e.message?.includes("이미 신청")) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }

    return NextResponse.json({
      success: true,
      registration: reg,
      waitlisted: isFull,
      message: isFull
        ? "정원이 마감되어 대기자로 등록되었습니다."
        : "대회 신청이 완료되었습니다. 관리자 확인 후 참가가 확정됩니다.",
    });
  } catch (e: any) {
    console.error("Registration error:", e);
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const registrations = await getRegistrations(params.id);
  const summary = {
    total: registrations.length,
    pending: registrations.filter((r: any) => r.status === "pending").length,
    approved: registrations.filter((r: any) => r.status === "approved").length,
    waitlisted: registrations.filter((r: any) => r.status === "waitlisted").length,
    byDivision: {} as Record<string, number>,
  };
  registrations.forEach((r: any) => {
    if (r.division && r.status !== "cancelled" && r.status !== "rejected") {
      summary.byDivision[r.division] = (summary.byDivision[r.division] || 0) + 1;
    }
  });
  return NextResponse.json(summary);
}
