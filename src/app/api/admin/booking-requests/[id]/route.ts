import { NextRequest, NextResponse } from "next/server";
import { updateEntity } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = updateEntity("booking-requests.json", params.id, { ...body, updatedAt: new Date().toISOString() });
  if (!result) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ success: true, bookingRequest: result });
}
