-- PBL.SYS Supabase Migration
-- Run this in Supabase SQL Editor

-- ═══ Tournaments ═══
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  registration_deadline TEXT DEFAULT '',
  venue_name TEXT DEFAULT '',
  venue_id TEXT,
  organizer_name TEXT DEFAULT '',
  organizer_contact TEXT DEFAULT '',
  entry_fee INTEGER DEFAULT 0,
  event_types TEXT DEFAULT '',
  max_participants INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  source_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  region TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_region ON tournaments(region);
CREATE INDEX IF NOT EXISTS idx_tournaments_featured ON tournaments(is_featured) WHERE is_featured = true;

-- ═══ Venues ═══
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE,
  address TEXT DEFAULT '',
  road_address TEXT DEFAULT '',
  region TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  operating_hours TEXT DEFAULT '',
  court_count INTEGER DEFAULT 0,
  indoor_outdoor TEXT DEFAULT '',
  parking_available BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  map_link TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  -- Legacy compat fields
  type TEXT DEFAULT 'indoor',
  surface TEXT DEFAULT '',
  price_per_hour INTEGER DEFAULT 0,
  has_parking BOOLEAN DEFAULT false,
  has_shower BOOLEAN DEFAULT false,
  has_lighting BOOLEAN DEFAULT true,
  has_equipment_rental BOOLEAN DEFAULT false,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  source_primary TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venues_region ON venues(region);
CREATE INDEX IF NOT EXISTS idx_venues_featured ON venues(is_featured) WHERE is_featured = true;

-- ═══ Clubs ═══
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE,
  region TEXT DEFAULT '',
  home_venue TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_phone_or_kakao TEXT DEFAULT '',
  description TEXT DEFAULT '',
  member_count INTEGER DEFAULT 0,
  join_method TEXT DEFAULT '',
  external_link TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  -- Legacy compat
  city TEXT DEFAULT '',
  level TEXT DEFAULT '',
  meeting_schedule TEXT DEFAULT '',
  meeting_venue TEXT DEFAULT '',
  fee TEXT DEFAULT '',
  tags JSONB DEFAULT '[]',
  is_recruiting BOOLEAN DEFAULT true,
  source_primary TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clubs_region ON clubs(region);
CREATE INDEX IF NOT EXISTS idx_clubs_featured ON clubs(is_featured) WHERE is_featured = true;

-- ═══ Registrations ═══
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL DEFAULT '',
  player_phone TEXT NOT NULL DEFAULT '',
  gender TEXT DEFAULT '',
  division TEXT DEFAULT '',
  partner_name TEXT DEFAULT '',
  club_name TEXT DEFAULT '',
  level TEXT DEFAULT '',
  memo TEXT DEFAULT '',
  privacy_agreed BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending',
  admin_memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- 중복 방지: 같은 대회에 같은 전화번호로 신청 불가
  UNIQUE(tournament_id, player_phone)
);

CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- ═══ Leads ═══
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  contact_name TEXT DEFAULT '',
  club_name TEXT DEFAULT '',
  region TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  current_problem TEXT DEFAULT '',
  member_count TEXT DEFAULT '',
  runs_tournaments TEXT DEFAULT '',
  memo TEXT DEFAULT '',
  status TEXT DEFAULT 'new',
  admin_memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- ═══ Contents ═══
CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ RLS (Row Level Security) ═══
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public read published contents" ON contents FOR SELECT USING (is_published = true);

-- Service role (관리자) 전체 권한 — service_role key 사용 시 RLS 우회됨
-- 공개 사용자는 registrations INSERT만 가능
CREATE POLICY "Public insert registrations" ON registrations FOR INSERT WITH CHECK (true);
-- Leads INSERT만 공개
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tournaments_updated BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_venues_updated BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clubs_updated BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_registrations_updated BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contents_updated BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
