import { NextRequest, NextResponse } from "next/server";
import { updateRegistration, getRegistrations } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");
  if (!tournamentId) return NextResponse.json([]);
  const regs = await getRegistrations(tournamentId);
  return NextResponse.json(regs);
}

export async function PUT(req: NextRequest) {
  const { id, status, adminMemo } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: any = {};
  if (status) {
    const valid = ["pending", "approved", "rejected", "cancelled", "waitlisted"];
    if (!valid.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    updates.status = status;
  }
  if (adminMemo !== undefined) updates.adminMemo = adminMemo;

  const updated = updateRegistration(id, updates);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
