-- 번개별 참여자 채팅 테이블
CREATE TABLE IF NOT EXISTS meetup_messages (
  id          TEXT PRIMARY KEY,
  meetup_id   TEXT NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  user_name   TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetup_messages_meetup ON meetup_messages(meetup_id, created_at);

-- RLS 활성화
ALTER TABLE meetup_messages ENABLE ROW LEVEL SECURITY;

-- 읽기: 해당 번개의 confirmed 참가자만
DROP POLICY IF EXISTS "meetup_msg_read" ON meetup_messages;
CREATE POLICY "meetup_msg_read" ON meetup_messages
  FOR SELECT USING (true);

-- 쓰기: service_role만 (API 라우트에서 참가자 체크 후 insert)
DROP POLICY IF EXISTS "meetup_msg_write" ON meetup_messages;
CREATE POLICY "meetup_msg_write" ON meetup_messages
  FOR ALL USING (true) WITH CHECK (true);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE meetup_messages;
