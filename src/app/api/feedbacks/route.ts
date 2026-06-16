export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createFeedback } from "@/lib/feedbacks";
import { getUserSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, title, message, userName, userEmail } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "bad_request", message: "제목과 내용을 입력해주세요." },
      { status: 400 }
    );
  }

  // 로그인 사용자면 세션에서 정보 가져옴
  const session = await getUserSession();

  const feedback = await createFeedback({
    userId: session?.id || null,
    userName: session?.name || userName || "익명",
    userEmail: session?.email || userEmail || "",
    category: category || "general",
    title: title.trim(),
    message: message.trim(),
  });

  return NextResponse.json({ ok: true, feedback }, { status: 201 });
}
