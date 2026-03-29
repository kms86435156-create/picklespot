-- PBL.SYS Supabase Schema
-- Run this in Supabase SQL Editor to create all tables

-- ═══ Venues ═══
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT DEFAULT '',
  region TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  type TEXT DEFAULT 'indoor',
  court_count INTEGER DEFAULT 0,
  surface TEXT DEFAULT '',
  price_per_hour INTEGER DEFAULT 0,
  price_weekend INTEGER,
  amenities JSONB DEFAULT '[]',
  has_parking BOOLEAN DEFAULT false,
  has_shower BOOLEAN DEFAULT false,
  has_lighting BOOLEAN DEFAULT false,
  has_equipment_rental BOOLEAN DEFAULT false,
  operating_hours TEXT DEFAULT '',
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  peak_hours TEXT DEFAULT '',
  description TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  website TEXT DEFAULT '',
  booking_mode TEXT DEFAULT 'outbound_link',
  is_bookable BOOLEAN DEFAULT false,
  booking_notice TEXT,
  external_booking_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  source_primary TEXT DEFAULT 'manual',
  source_type TEXT DEFAULT 'manual_seed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Tournaments ═══
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  organizer TEXT DEFAULT '',
  region TEXT DEFAULT '',
  venue_name TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  registration_close_at DATE,
  fee INTEGER DEFAULT 0,
  fee_text TEXT DEFAULT '',
  divisions TEXT DEFAULT '',
  level TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  description TEXT DEFAULT '',
  detail_url TEXT DEFAULT '',
  source_primary TEXT DEFAULT 'manual',
  source_type TEXT DEFAULT 'manual_seed',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Coaches ═══
CREATE TABLE IF NOT EXISTS coaches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  region TEXT DEFAULT '',
  specialties JSONB DEFAULT '[]',
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  price_per_session INTEGER DEFAULT 0,
  session_duration TEXT DEFAULT '60분',
  lesson_type JSONB DEFAULT '[]',
  bio TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  source_primary TEXT DEFAULT 'manual',
  source_type TEXT DEFAULT 'manual_seed',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Court Resources ═══
CREATE TABLE IF NOT EXISTS court_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  name TEXT NOT NULL,
  sport_type TEXT DEFAULT 'pickleball',
  indoor_outdoor TEXT DEFAULT 'indoor',
  capacity INTEGER DEFAULT 4,
  surface_type TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true
);

-- ═══ Slot Inventory ═══
CREATE TABLE IF NOT EXISTS slot_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  resource_id TEXT NOT NULL,
  venue_id TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'available',
  price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'KRW',
  held_until TIMESTAMPTZ,
  booking_id TEXT,
  UNIQUE(resource_id, start_at)
);

CREATE INDEX IF NOT EXISTS idx_slot_venue_date ON slot_inventory(venue_id, start_at);
CREATE INDEX IF NOT EXISTS idx_slot_status ON slot_inventory(status);

-- ═══ Bookings ═══
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  user_id TEXT DEFAULT 'anonymous',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending_payment',
  booking_mode TEXT DEFAULT 'native_auto_confirm',
  total_amount INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  booking_code TEXT UNIQUE,
  reject_reason TEXT,
  provider_reference TEXT,
  participants JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_venue ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_booking_user ON bookings(user_id);

-- ═══ Booking Events (audit log) ═══
CREATE TABLE IF NOT EXISTS booking_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Payments ═══
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  provider TEXT DEFAULT 'manual',
  payment_key TEXT,
  order_id TEXT,
  amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  raw_payload JSONB DEFAULT '{}',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Sync Jobs ═══
CREATE TABLE IF NOT EXISTS sync_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running',
  created_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  logs JSONB DEFAULT '[]'
);

-- ═══ Cancellation Policies ═══
CREATE TABLE IF NOT EXISTS cancellation_policies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  free_hours_before INTEGER DEFAULT 24,
  partial_refund_hours_before INTEGER DEFAULT 6,
  partial_refund_percent INTEGER DEFAULT 50,
  description TEXT DEFAULT ''
);

-- ═══ Flash Games ═══
CREATE TABLE IF NOT EXISTS flash_games (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  author_name TEXT DEFAULT '',
  author_level TEXT DEFAULT '',
  author_attend_rate INTEGER DEFAULT 0,
  author_manner_score REAL DEFAULT 0,
  author_games_hosted INTEGER DEFAULT 0,
  location TEXT DEFAULT '',
  address TEXT DEFAULT '',
  region TEXT DEFAULT '',
  date_time TIMESTAMPTZ,
  duration TEXT DEFAULT '',
  current_players INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 4,
  players JSONB DEFAULT '[]',
  level TEXT DEFAULT '',
  vibe TEXT DEFAULT 'casual',
  beginner_welcome BOOLEAN DEFAULT true,
  gender TEXT,
  status TEXT DEFAULT 'open',
  author_trust_score INTEGER DEFAULT 0,
  author_no_show INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  equipment JSONB DEFAULT '[]',
  notice TEXT DEFAULT '',
  cost_per_person INTEGER,
  source_type TEXT DEFAULT 'manual_seed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Partner Posts ═══
CREATE TABLE IF NOT EXISTS partner_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  author_name TEXT DEFAULT '',
  author_level TEXT DEFAULT '',
  author_attend_rate INTEGER DEFAULT 0,
  author_manner_score REAL DEFAULT 0,
  author_total_games INTEGER DEFAULT 0,
  region TEXT DEFAULT '',
  level TEXT DEFAULT '',
  preferred_time TEXT DEFAULT '',
  preferred_days JSONB DEFAULT '[]',
  vibe TEXT DEFAULT 'casual',
  looking_for TEXT DEFAULT '',
  message TEXT DEFAULT '',
  trust_score INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  source_type TEXT DEFAULT 'manual_seed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Row Level Security (public read, authenticated write) ═══
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_inventory ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_venues" ON venues FOR SELECT USING (true);
CREATE POLICY "public_read_tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "public_read_coaches" ON coaches FOR SELECT USING (true);
CREATE POLICY "public_read_slots" ON slot_inventory FOR SELECT USING (true);
CREATE POLICY "public_read_bookings" ON bookings FOR SELECT USING (true);

-- Service role full access (for API routes)
CREATE POLICY "service_all_venues" ON venues FOR ALL USING (true);
CREATE POLICY "service_all_tournaments" ON tournaments FOR ALL USING (true);
CREATE POLICY "service_all_coaches" ON coaches FOR ALL USING (true);
CREATE POLICY "service_all_slots" ON slot_inventory FOR ALL USING (true);
CREATE POLICY "service_all_bookings" ON bookings FOR ALL USING (true);
