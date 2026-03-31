-- ═══════════════════════════════════════════════════════
-- PBL.SYS 전체 스키마 — Supabase SQL Editor에서 실행
-- ═══════════════════════════════════════════════════════

-- ═══ Admin Users ═══
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Users (일반 사용자) ═══
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Venues (피클볼장) ═══
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT DEFAULT '',
  address_road TEXT DEFAULT '',
  road_address TEXT DEFAULT '',
  region TEXT DEFAULT '',
  region_depth1 TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  court_count INTEGER DEFAULT 0,
  court_type TEXT DEFAULT '',
  indoor_outdoor TEXT DEFAULT '',
  floor_type TEXT DEFAULT '',
  operating_hours TEXT DEFAULT '',
  pricing TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  website TEXT DEFAULT '',
  amenities TEXT DEFAULT '',
  parking_available BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  source_primary TEXT DEFAULT 'manual',
  source_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Tournaments (대회) ═══
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  organizer TEXT DEFAULT '',
  organizer_name TEXT DEFAULT '',
  organizer_contact TEXT DEFAULT '',
  region TEXT DEFAULT '',
  venue_name TEXT DEFAULT '',
  venue_address TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  registration_open_at TEXT DEFAULT '',
  registration_close_at TEXT DEFAULT '',
  registration_deadline TEXT DEFAULT '',
  fee INTEGER DEFAULT 0,
  entry_fee INTEGER DEFAULT 0,
  fee_text TEXT DEFAULT '',
  divisions TEXT DEFAULT '',
  event_types TEXT DEFAULT '',
  level TEXT DEFAULT '',
  max_participants INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  description TEXT DEFAULT '',
  detail_url TEXT DEFAULT '',
  poster_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  source_primary TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Clubs (동호회) ═══
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  region TEXT DEFAULT '',
  city TEXT DEFAULT '',
  home_venue TEXT DEFAULT '',
  meeting_venue TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_kakao TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  founded_at TEXT DEFAULT '',
  member_count INTEGER DEFAULT 0,
  recruit_status TEXT DEFAULT '모집중',
  is_recruiting BOOLEAN DEFAULT true,
  meeting_schedule TEXT DEFAULT '',
  fee TEXT DEFAULT '',
  level TEXT DEFAULT '',
  description TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  sns_link TEXT DEFAULT '',
  website TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  source_primary TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Registrations (대회 참가 신청) ═══
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reg_number TEXT DEFAULT '',
  tournament_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  player_phone TEXT DEFAULT '',
  player_email TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  division TEXT DEFAULT '',
  partner_name TEXT DEFAULT '',
  partner_phone TEXT DEFAULT '',
  club_name TEXT DEFAULT '',
  level TEXT DEFAULT '',
  memo TEXT DEFAULT '',
  privacy_agreed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  admin_memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reg_tournament ON registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_reg_phone ON registrations(player_phone);

-- ═══ Leads (사전등록 신청) ═══
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

-- ═══ Notices (공지사항) ═══
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Banners (메인 배너) ═══
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Content Requests (등록 요청) ═══
CREATE TABLE IF NOT EXISTS content_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL, -- tournament | court | club
  status TEXT DEFAULT 'pending', -- pending | approved | rejected
  name TEXT DEFAULT '',
  region TEXT DEFAULT '',
  description TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  venue_name TEXT DEFAULT '',
  organizer TEXT DEFAULT '',
  address TEXT DEFAULT '',
  court_count INTEGER,
  court_type TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  member_count INTEGER,
  meeting_schedule TEXT DEFAULT '',
  submitter_name TEXT DEFAULT '',
  submitter_contact TEXT DEFAULT '',
  note TEXT DEFAULT '',
  admin_memo TEXT DEFAULT '',
  reject_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Meetups (번개모임) ═══
CREATE TABLE IF NOT EXISTS meetups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  region TEXT DEFAULT '',
  venue_name TEXT DEFAULT '',
  meetup_date TEXT DEFAULT '',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  max_players INTEGER DEFAULT 4,
  current_players INTEGER DEFAULT 0,
  level TEXT DEFAULT '',
  description TEXT DEFAULT '',
  organizer_name TEXT DEFAULT '',
  organizer_phone TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Meetup Participants ═══
CREATE TABLE IF NOT EXISTS meetup_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meetup_id TEXT NOT NULL,
  participant_name TEXT DEFAULT '',
  participant_phone TEXT DEFAULT '',
  status TEXT DEFAULT 'joined',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Booking Requests (예약 요청) ═══
CREATE TABLE IF NOT EXISTS booking_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT DEFAULT '',
  venue_name TEXT DEFAULT '',
  requester_name TEXT DEFAULT '',
  requester_phone TEXT DEFAULT '',
  requested_date TEXT DEFAULT '',
  requested_time TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  admin_memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Contents (가이드/콘텐츠) ═══
CREATE TABLE IF NOT EXISTS contents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Row Level Security ═══
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read" ON venues FOR SELECT USING (true);
CREATE POLICY "public_read" ON tournaments FOR SELECT USING (true);
CREATE POLICY "public_read" ON clubs FOR SELECT USING (true);
CREATE POLICY "public_read" ON notices FOR SELECT USING (true);
CREATE POLICY "public_read" ON banners FOR SELECT USING (true);
CREATE POLICY "public_read" ON contents FOR SELECT USING (true);
CREATE POLICY "public_read" ON meetups FOR SELECT USING (true);

-- Service role full access (all tables)
CREATE POLICY "service_all" ON admin_users FOR ALL USING (true);
CREATE POLICY "service_all" ON users FOR ALL USING (true);
CREATE POLICY "service_all" ON venues FOR ALL USING (true);
CREATE POLICY "service_all" ON tournaments FOR ALL USING (true);
CREATE POLICY "service_all" ON clubs FOR ALL USING (true);
CREATE POLICY "service_all" ON registrations FOR ALL USING (true);
CREATE POLICY "service_all" ON leads FOR ALL USING (true);
CREATE POLICY "service_all" ON notices FOR ALL USING (true);
CREATE POLICY "service_all" ON banners FOR ALL USING (true);
CREATE POLICY "service_all" ON content_requests FOR ALL USING (true);
CREATE POLICY "service_all" ON meetups FOR ALL USING (true);
CREATE POLICY "service_all" ON meetup_participants FOR ALL USING (true);
CREATE POLICY "service_all" ON booking_requests FOR ALL USING (true);
CREATE POLICY "service_all" ON contents FOR ALL USING (true);
