export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import pg from "pg";

// 임시 마이그레이션 엔드포인트 — 실행 후 삭제할 것
export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ref = "ucxxvnrwdccgqhkigdxh";
  const dbPass = process.env.DB_PASSWORD || "minsung1030!";
  const results: string[] = [];

  // 여러 연결 방식 시도
  const configs = [
    { host: `db.${ref}.supabase.co`, port: 5432, user: "postgres" },
    { host: `aws-0-ap-northeast-2.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
    { host: `aws-0-ap-northeast-1.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
    { host: `aws-0-us-east-1.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
    { host: `aws-0-ap-southeast-1.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
  ];

  let client: pg.Client | null = null;

  for (const cfg of configs) {
    const c = new pg.Client({
      host: cfg.host,
      port: cfg.port,
      database: "postgres",
      user: cfg.user,
      password: dbPass,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });
    try {
      await c.connect();
      results.push(`연결 성공: ${cfg.host}:${cfg.port}`);
      client = c;
      break;
    } catch (e: any) {
      results.push(`${cfg.host}:${cfg.port} 실패: ${e.message.substring(0, 60)}`);
      try { await c.end(); } catch {}
    }
  }

  if (!client) {
    return NextResponse.json({ error: "DB 연결 실패", results }, { status: 500 });
  }

  try {
    // 1. feedbacks 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        user_name TEXT NOT NULL DEFAULT '',
        user_email TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'general',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        admin_note TEXT,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    results.push("feedbacks 테이블 생성 완료");

    await client.query("CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks(category)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC)");
    results.push("feedbacks 인덱스 완료");

    await client.query("ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY");
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feedbacks' AND policyname='service_all_feedbacks') THEN
          EXECUTE 'CREATE POLICY service_all_feedbacks ON feedbacks FOR ALL USING (true)';
        END IF;
      END $$;
    `);
    results.push("feedbacks RLS 완료");

    // 2. meetup_messages 테이블
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
    await client.query("CREATE INDEX IF NOT EXISTS idx_meetup_messages_meetup ON meetup_messages(meetup_id, created_at)");
    await client.query("ALTER TABLE meetup_messages ENABLE ROW LEVEL SECURITY");
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
    results.push("meetup_messages 테이블 완료");

    // Realtime 활성화
    try {
      await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE meetup_messages");
      results.push("meetup_messages Realtime 활성화");
    } catch (e: any) {
      results.push("meetup_messages Realtime: " + (e.message.includes("already") ? "이미 활성화" : e.message));
    }
    try {
      await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE meetup_participants");
      results.push("meetup_participants Realtime 활성화");
    } catch (e: any) {
      results.push("meetup_participants Realtime: " + (e.message.includes("already") ? "이미 활성화" : e.message));
    }

    // 3. users status 컬럼
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ");
    await client.query("CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)");
    results.push("users status 컬럼 완료");

    await client.end();
    results.push("마이그레이션 완료!");

    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message, results }, { status: 500 });
  }
}
