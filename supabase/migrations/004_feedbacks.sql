-- 피드백 테이블 생성
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks(category);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);

-- RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_feedbacks" ON feedbacks
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "users_insert_own_feedbacks" ON feedbacks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "service_all_feedbacks" ON feedbacks
  FOR ALL USING (auth.role() = 'service_role');
