export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getUserDetail, suspendUser, activateUser, updateUser } from "@/lib/users";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserDetail(params.id);
  if (!user) {
    return NextResponse.json({ error: "not_found", message: "회원을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { action, reason, ...updates } = body;

  if (action === "suspend") {
    if (!reason) {
      return NextResponse.json({ error: "bad_request", message: "정지 사유를 입력해주세요." }, { status: 400 });
    }
    const user = await suspendUser(params.id, reason);
    if (!user) {
      return NextResponse.json({ error: "not_found", message: "회원을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user });
  }

  if (action === "activate") {
    const user = await activateUser(params.id);
    if (!user) {
      return NextResponse.json({ error: "not_found", message: "회원을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user });
  }

  // 일반 프로필 업데이트
  if (Object.keys(updates).length > 0) {
    const user = await updateUser(params.id, updates);
    if (!user) {
      return NextResponse.json({ error: "not_found", message: "회원을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user });
  }

  return NextResponse.json({ error: "bad_request", message: "업데이트할 내용이 없습니다." }, { status: 400 });
}
