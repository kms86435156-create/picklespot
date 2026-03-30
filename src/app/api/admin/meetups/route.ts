import { NextRequest, NextResponse } from "next/server";
import { getMeetups, createEntity, updateEntity } from "@/lib/db";

export async function GET() {
  const meetups = await getMeetups();
  return NextResponse.json({ meetups });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `mt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const meetup = { id, ...body, currentPlayers: 0, status: body.status || "open", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  createEntity("meetups.json", meetup);
  return NextResponse.json({ success: true, meetup });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
  const result = updateEntity("meetups.json", body.id, { ...body, updatedAt: new Date().toISOString() });
  return NextResponse.json({ success: true, meetup: result });
}
