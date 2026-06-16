export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getFeedback, updateFeedback } from "@/lib/feedbacks";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const feedback = await getFeedback(params.id);
  if (!feedback) {
    return NextResponse.json({ error: "not_found", message: "피드백을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(feedback);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status, adminNote } = body;

  const updates: any = {};
  if (status) updates.status = status;
  if (adminNote !== undefined) updates.adminNote = adminNote;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "bad_request", message: "업데이트할 내용이 없습니다." }, { status: 400 });
  }

  const feedback = await updateFeedback(params.id, updates);
  if (!feedback) {
    return NextResponse.json({ error: "not_found", message: "피드백을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, feedback });
}
