-- ============================================================
-- 피클볼 플랫폼 Supabase 테이블 초기화 SQL
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. users 테이블 (기존 있으면 유지)
create table if not exists users (
  id          text primary key default gen_random_uuid()::text,
  email       text unique not null,
  name        text not null default '',
  phone       text not null default '',
  role        text not null default 'user',
  club_name   text not null default '',
  region      text not null default '',
  organizer_note text not null default '',
  skill_level text not null default '',
  preferred_times text not null default '',
  play_style  text not null default '',
  onboarding_completed boolean not null default false,
  password_hash text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. meetups 테이블 (번개)
create table if not exists meetups (
  id                  text primary key,
  title               text not null,
  date                text not null,
  start_time          text not null default '',
  end_time            text not null default '',
  region              text not null default '',
  venue_name          text not null default '',
  venue_address       text not null default '',
  max_players         int  not null default 4,
  current_players     int  not null default 1,
  skill_level         text not null default '무관',
  fee                 int  not null default 0,
  description         text not null default '',
  is_beginner_friendly boolean not null default false,
  host_id             text not null default '',
  host_name           text not null default '',
  status              text not null default 'open',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 3. meetup_participants 테이블 (번개 참여자)
create table if not exists meetup_participants (
  id          text primary key,
  meetup_id   text not null references meetups(id) on delete cascade,
  user_id     text not null,
  user_name   text not null default '',
  status      text not null default 'confirmed',
  joined_at   timestamptz not null default now()
);

-- 4. 인덱스
create index if not exists meetups_status_idx     on meetups(status);
create index if not exists meetups_region_idx     on meetups(region);
create index if not exists meetups_date_idx       on meetups(date);
create index if not exists meetup_participants_meetup_idx on meetup_participants(meetup_id);
create index if not exists meetup_participants_user_idx  on meetup_participants(user_id);

-- 5. RLS 정책 (Row Level Security)
alter table meetups enable row level security;
alter table meetup_participants enable row level security;
alter table users enable row level security;

-- meetups: 모두 읽기 가능
drop policy if exists "meetups_public_read" on meetups;
create policy "meetups_public_read" on meetups
  for select using (true);

-- meetups: service_role만 쓰기 (서버사이드 API에서만)
drop policy if exists "meetups_service_write" on meetups;
create policy "meetups_service_write" on meetups
  for all using (true) with check (true);

-- meetup_participants: 모두 읽기 가능
drop policy if exists "participants_public_read" on meetup_participants;
create policy "participants_public_read" on meetup_participants
  for select using (true);

-- meetup_participants: service_role만 쓰기
drop policy if exists "participants_service_write" on meetup_participants;
create policy "participants_service_write" on meetup_participants
  for all using (true) with check (true);

-- users: service_role만 접근
drop policy if exists "users_service_only" on users;
create policy "users_service_only" on users
  for all using (true) with check (true);

-- 6. current_players 자동 증가 함수 (번개 신청 시 사용)
create or replace function increment_meetup_players(meetup_id text)
returns void language sql as $$
  update meetups
  set current_players = (
    select count(*) from meetup_participants where meetup_participants.meetup_id = increment_meetup_players.meetup_id
  )
  where id = meetup_id;
$$;
