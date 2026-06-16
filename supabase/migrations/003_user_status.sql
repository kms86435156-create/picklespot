-- 회원 상태 관리 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
-- 'active' | 'suspended' | 'withdrawn'

ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- RLS 정책: 일반 사용자는 본인만, 서비스 역할은 전체
-- (기존 service_all 정책이 있으면 skip)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_read_own'
  ) THEN
    EXECUTE 'CREATE POLICY users_read_own ON users FOR SELECT USING (auth.uid()::text = id::text)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid()::text = id::text)';
  END IF;
END $$;
