export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase 환경변수 없음" }, { status: 500 });

  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const results: string[] = [];

  const { error } = await db.from("meetup_messages").select("id").limit(1);
  if (error && error.message.includes("does not exist")) {
    results.push("meetup_messages 테이블 없음 — Supabase Dashboard SQL Editor에서 실행 필요");
    return NextResponse.json({ ok: false, tableExists: false, results, sql: `CREATE TABLE IF NOT EXISTS meetup_messages (id TEXT PRIMARY KEY, meetup_id TEXT NOT NULL REFERENCES meetups(id) ON DELETE CASCADE, user_id TEXT NOT NULL, user_name TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()); CREATE INDEX IF NOT EXISTS idx_meetup_messages_meetup ON meetup_messages(meetup_id, created_at); ALTER TABLE meetup_messages ENABLE ROW LEVEL SECURITY; CREATE POLICY meetup_msg_read ON meetup_messages FOR SELECT USING (true); CREATE POLICY meetup_msg_write ON meetup_messages FOR ALL USING (true) WITH CHECK (true); ALTER PUBLICATION supabase_realtime ADD TABLE meetup_messages; ALTER PUBLICATION supabase_realtime ADD TABLE meetup_participants;` });
  }

  results.push("meetup_messages 테이블 존재 확인됨");

  const testId = `mm_test_${Date.now()}`;
  const { error: ie } = await db.from("meetup_messages").insert({ id: testId, meetup_id: "test", user_id: "test", user_name: "시스템", content: "테스트", created_at: new Date().toISOString() });
  if (ie) {
    results.push("INSERT 실패: " + ie.message);
  } else {
    await db.from("meetup_messages").delete().eq("id", testId);
    results.push("INSERT/DELETE 테스트 성공");
  }

  return NextResponse.json({ ok: true, tableExists: true, results });
}
