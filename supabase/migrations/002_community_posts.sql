CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT '자유',
  region TEXT DEFAULT '',
  likes INTEGER DEFAULT 0,
  liked_by JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  views INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_community" ON community_posts FOR SELECT USING (true);
CREATE POLICY "service_all_community" ON community_posts FOR ALL USING (true);
