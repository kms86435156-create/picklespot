export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextResponse } from "next/server";
import pg from "pg";

// 1회성 마이그레이션 — 실행 후 이 파일 삭제할 것
export async function GET() {
  const ref = "ucxxvnrwdccgqhkigdxh";
  const dbPass = process.env.DB_PASSWORD || "minsung1030!";
  const results: string[] = [];

  const configs = [
    { host: `db.${ref}.supabase.co`, port: 5432, user: "postgres" },
    { host: `aws-0-ap-northeast-2.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
    { host: `aws-0-ap-northeast-2.pooler.supabase.com`, port: 6543, user: `postgres.${ref}` },
    { host: `aws-0-ap-northeast-1.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
    { host: `aws-0-us-east-1.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
  ];

  let client: pg.Client | null = null;
  for (const cfg of configs) {
    const c = new pg.Client({
      host: cfg.host, port: cfg.port, database: "postgres",
      user: cfg.user, password: dbPass,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    try {
      await c.connect();
      results.push(`연결 성공: ${cfg.host}:${cfg.port}`);
      client = c;
      break;
    } catch (e: any) {
      results.push(`${cfg.host}:${cfg.port} 실패: ${e.message.substring(0, 80)}`);
      try { await c.end(); } catch {}
    }
  }

  if (!client) return NextResponse.json({ error: "DB 연결 실패", results }, { status: 500 });

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetup_messages (
        id          TEXT PRIMARY KEY,
        meetup_id   TEXT NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
        user_id     TEXT NOT NULL,
        user_name   TEXT NOT NULL DEFAULT '',
        content     TEXT NOT NULL DEFAULT '',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    results.push("meetup_messages 테이블 생성");

    await client.query("CREATE INDEX IF NOT EXISTS idx_meetup_messages_meetup ON meetup_messages(meetup_id, created_at)");
    results.push("인덱스 생성");

    await client.query("ALTER TABLE meetup_messages ENABLE ROW LEVEL SECURITY");
    results.push("RLS 활성화");

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='meetup_messages' AND policyname='meetup_msg_read') THEN
          EXECUTE 'CREATE POLICY meetup_msg_read ON meetup_messages FOR SELECT USING (true)';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='meetup_messages' AND policyname='meetup_msg_write') THEN
          EXECUTE 'CREATE POLICY meetup_msg_write ON meetup_messages FOR ALL USING (true) WITH CHECK (true)';
        END IF;
      END $$;
    `);
    results.push("RLS 정책 생성");

    try {
      await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE meetup_messages");
      results.push("meetup_messages Realtime 활성화");
    } catch (e: any) {
      results.push("Realtime: " + (e.message.includes("already") ? "이미 활성화" : e.message));
    }

    try {
      await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE meetup_participants");
      results.push("meetup_participants Realtime 활성화");
    } catch (e: any) {
      results.push("participants Realtime: " + (e.message.includes("already") ? "이미 활성화" : e.message));
    }

    await client.end();
    results.push("완료!");
    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message, results }, { status: 500 });
  }
}
