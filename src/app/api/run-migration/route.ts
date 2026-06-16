export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase 환경변수 없음" }, { status: 500 });

  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const results: string[] = [];

  // 1. meetups 테이블 확인
  const { data: meetups, error: me } = await db.from("meetups").select("id,title").limit(3);
  results.push(`meetups: ${meetups?.length || 0}개, error: ${me?.message || "none"}`);

  // 2. meetup_messages 테이블 확인
  const { data: msgs, error: mme } = await db.from("meetup_messages").select("id").limit(1);
  results.push(`meetup_messages: ${msgs !== null ? "접근 가능" : "접근 불가"}, error: ${mme?.message || "none"}`);

  // 3. 실제 meetup이 있으면 INSERT 테스트
  if (meetups && meetups.length > 0) {
    const testId = `mm_test_${Date.now()}`;
    const { error: ie } = await db.from("meetup_messages").insert({
      id: testId, meetup_id: meetups[0].id,
      user_id: "system", user_name: "시스템", content: "테스트",
      created_at: new Date().toISOString(),
    });
    if (ie) {
      results.push(`INSERT 실패: ${ie.message}`);
    } else {
      await db.from("meetup_messages").delete().eq("id", testId);
      results.push("INSERT/DELETE 성공!");
    }
  } else {
    // meetup 없으면 하나 임시 생성해서 테스트
    const tmpMeetup = { id: "meetup_tmp_test", title: "tmp", status: "open", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { error: mie } = await db.from("meetups").insert(tmpMeetup);
    if (mie) {
      results.push(`meetup INSERT 실패: ${mie.message}`);
    } else {
      const testId = `mm_test_${Date.now()}`;
      const { error: ie } = await db.from("meetup_messages").insert({
        id: testId, meetup_id: "meetup_tmp_test",
        user_id: "system", user_name: "시스템", content: "테스트",
        created_at: new Date().toISOString(),
      });
      results.push(ie ? `msg INSERT 실패: ${ie.message}` : "msg INSERT 성공!");
      await db.from("meetup_messages").delete().eq("meetup_id", "meetup_tmp_test");
      await db.from("meetups").delete().eq("id", "meetup_tmp_test");
      results.push("정리 완료");
    }
  }

  return NextResponse.json({ ok: true, results });
}
