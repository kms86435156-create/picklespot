import { NextRequest, NextResponse } from "next/server";
import { getTournament, isDemoMode } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tournament = await getTournament(params.id);
    if (!tournament) {
      return NextResponse.json({ error: "대회를 찾을 수 없습니다." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, phone, level, region, isWaitlist } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
    }

    // Check registration deadline
    if (tournament.registrationDeadline) {
      const deadline = new Date(tournament.registrationDeadline);
      if (deadline.getTime() < Date.now()) {
        return NextResponse.json({ error: "신청 마감일이 지났습니다." }, { status: 400 });
      }
    }

    // Check capacity
    const isFull = tournament.maxSlots > 0 && tournament.currentSlots >= tournament.maxSlots;
    const registrationType = isWaitlist || isFull ? "waitlist" : "registration";

    if (isDemoMode) {
      // Demo mode: simulate success without persisting
      return NextResponse.json({
        success: true,
        isDemoMode: true,
        registration: {
          id: `reg-${Date.now()}`,
          tournamentId: tournament.id,
          tournamentTitle: tournament.title,
          type: registrationType,
          name,
          phone,
          level: level || "",
          region: region || "",
          status: registrationType === "waitlist" ? "waitlisted" : "registered",
          createdAt: new Date().toISOString(),
        },
        message: registrationType === "waitlist"
          ? "대기자 등록이 완료되었습니다. 취소자 발생 시 자동으로 신청이 확정됩니다."
          : "대회 신청이 완료되었습니다.",
      });
    }

    // Production: write to Supabase (future implementation)
    return NextResponse.json({
      success: true,
      registration: {
        id: `reg-${Date.now()}`,
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        type: registrationType,
        name,
        phone,
        level: level || "",
        region: region || "",
        status: registrationType === "waitlist" ? "waitlisted" : "registered",
        createdAt: new Date().toISOString(),
      },
      message: registrationType === "waitlist"
        ? "대기자 등록이 완료되었습니다."
        : "대회 신청이 완료되었습니다.",
    });
  } catch (e: any) {
    console.error("Tournament registration error:", e);
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
