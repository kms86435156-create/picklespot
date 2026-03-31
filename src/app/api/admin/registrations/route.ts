export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { updateRegistration, getRegistrations, getTournament } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");
  if (!tournamentId) return NextResponse.json([]);
  const regs = await getRegistrations(tournamentId);
  return NextResponse.json(regs);
}

export async function PUT(req: NextRequest) {
  const { id, tournamentId, status, adminMemo } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: any = {};
  if (status) {
    const valid = ["pending", "paid", "approved", "rejected", "cancelled", "waitlisted"];
    if (!valid.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    updates.status = status;
  }
  if (adminMemo !== undefined) updates.adminMemo = adminMemo;

  const updated = updateRegistration(id, updates);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 취소 시 대기자 자동 승격
  if (status === "cancelled" || status === "rejected") {
    try {
      const tid = tournamentId || updated.tournamentId;
      if (tid) {
        const tournament = await getTournament(tid);
        const regs = await getRegistrations(tid);
        const maxP = Number(tournament?.maxParticipants) || 0;
        if (maxP > 0) {
          const activeCount = regs.filter((r: any) => ["pending", "paid", "approved"].includes(r.status)).length;
          if (activeCount < maxP) {
            // 가장 오래된 대기자를 pending으로 전환
            const nextWaitlisted = regs
              .filter((r: any) => r.status === "waitlisted")
              .sort((a: any, b: any) => (a.createdAt || "").localeCompare(b.createdAt || ""))[0];
            if (nextWaitlisted) {
              updateRegistration(nextWaitlisted.id, { status: "pending" });
            }
          }
        }
      }
    } catch (e) {
      console.error("Waitlist promotion error:", e);
    }
  }

  return NextResponse.json(updated);
}
