export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// 임시 마이그레이션 엔드포인트 — 배포 후 삭제할 것
export async function POST(_req: NextRequest) {
  // 관리자만 실행 가능
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 500 });
  }

  const results: string[] = [];

  try {
    // 1. feedbacks 테이블 — Supabase service role로 SQL은 실행 불가하므로
    //    PostgREST로 테이블 존재 여부 확인 후, 없으면 에러 메시지 반환
    const { error: checkErr } = await supabaseAdmin.from("feedbacks").select("id").limit(1);

    if (checkErr && checkErr.code === "PGRST205") {
      results.push("feedbacks 테이블이 없습니다. SQL Editor에서 생성이 필요합니다.");
    } else {
      results.push("feedbacks 테이블 존재 확인됨");
    }

    // 2. users status 컬럼 확인
    const { data: testUser } = await supabaseAdmin.from("users").select("status").limit(1);
    if (testUser === null) {
      results.push("users.status 컬럼 확인 불가");
    } else {
      results.push("users.status 컬럼 확인됨");
    }

    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results }, { status: 500 });
  }
}
