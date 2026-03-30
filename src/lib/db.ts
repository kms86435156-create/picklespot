/**
 * Data access layer — Supabase primary, JSON file fallback
 * Supabase 환경변수가 있으면 Postgres, 없으면 로컬 JSON 파일 사용
 */
import "server-only";
import { supabase, supabaseAdmin, isSupabaseEnabled, isDemoMode, isProductionFallback } from "./supabase";
export { isDemoMode };
import fs from "fs";
import path from "path";

// Production에서 JSON fallback write 시 경고 로그
function warnIfProductionFallback(operation: string) {
  if (isProductionFallback) {
    console.warn(`⚠️  PRODUCTION FALLBACK: ${operation} — data written to JSON file, NOT persisted in DB`);
  }
}

const DATA_DIR = path.join(process.cwd(), "data");

// ═══ JSON helpers ═══
export function readJSON(file: string): any[] {
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch { return []; }
}

export function writeJSON(file: string, data: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
  } catch (e) { console.error(`writeJSON(${file}):`, e); }
}

// ═══ Generic Supabase client (admin for writes) ═══
const db = supabaseAdmin || supabase;

// ═══ camelCase ↔ snake_case ═══
function toSnake(obj: any): any {
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const sk = k.replace(/[A-Z]/g, m => "_" + m.toLowerCase());
    result[sk] = v;
  }
  return result;
}

function toCamel(obj: any): any {
  if (!obj) return obj;
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const ck = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[ck] = v;
  }
  return result;
}

// ═══════════════════════════════
// Tournaments
// ═══════════════════════════════
export async function getTournaments(filters?: { region?: string; status?: string; keyword?: string }) {
  if (isSupabaseEnabled) {
    let q = db!.from("tournaments").select("*");
    if (filters?.region) q = q.eq("region", filters.region);
    if (filters?.status) q = q.eq("status", filters.status);
    if (filters?.keyword) q = q.ilike("title", `%${filters.keyword}%`);
    const { data } = await q.order("start_date", { ascending: true });
    return (data || []).map(toCamel);
  }
  let t = readJSON("tournaments.json");
  if (filters?.region) t = t.filter((x: any) => x.region === filters.region);
  if (filters?.status) t = t.filter((x: any) => x.status === filters.status);
  if (filters?.keyword) t = t.filter((x: any) => x.title?.includes(filters.keyword));
  return t;
}

export async function getTournament(id: string) {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("tournaments").select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  }
  return readJSON("tournaments.json").find((t: any) => t.id === id) || null;
}

// ═══════════════════════════════
// Venues
// ═══════════════════════════════
export async function getVenues(filters?: { region?: string; keyword?: string }) {
  if (isSupabaseEnabled) {
    let q = db!.from("venues").select("*");
    if (filters?.region) q = q.eq("region", filters.region);
    if (filters?.keyword) q = q.ilike("name", `%${filters.keyword}%`);
    const { data } = await q.order("name");
    return (data || []).map(toCamel);
  }
  let v = readJSON("venues.json");
  if (filters?.region) v = v.filter((x: any) => x.region === filters.region);
  if (filters?.keyword) v = v.filter((x: any) => x.name?.includes(filters.keyword));
  return v;
}

export async function getVenue(id: string) {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("venues").select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  }
  return readJSON("venues.json").find((v: any) => v.id === id) || null;
}

// ═══════════════════════════════
// Clubs
// ═══════════════════════════════
export async function getClubs(filters?: { region?: string; keyword?: string; recruiting?: boolean }) {
  if (isSupabaseEnabled) {
    let q = db!.from("clubs").select("*");
    if (filters?.region) q = q.ilike("region", `%${filters.region}%`);
    if (filters?.keyword) q = q.or(`name.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
    if (filters?.recruiting !== undefined) q = q.eq("is_recruiting", filters.recruiting);
    const { data } = await q.order("name");
    return (data || []).map(toCamel);
  }
  let c = readJSON("clubs.json");
  if (filters?.region) c = c.filter((x: any) => x.region?.includes(filters!.region!));
  if (filters?.keyword) c = c.filter((x: any) => x.name?.includes(filters!.keyword!) || x.description?.includes(filters!.keyword!));
  if (filters?.recruiting !== undefined) c = c.filter((x: any) => x.isRecruiting === filters!.recruiting);
  return c;
}

export async function getClub(id: string) {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("clubs").select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  }
  return readJSON("clubs.json").find((c: any) => c.id === id) || null;
}

// ═══════════════════════════════
// Generic CRUD (JSON fallback + Supabase)
// ═══════════════════════════════
const TABLE_MAP: Record<string, string> = {
  "tournaments.json": "tournaments",
  "venues.json": "venues",
  "clubs.json": "clubs",
  "registrations.json": "registrations",
  "leads.json": "leads",
  "contents.json": "contents",
  "meetups.json": "meetups",
  "meetup-participants.json": "meetup_participants",
  "booking-requests.json": "booking_requests",
};

export function createEntity(file: string, entity: any) {
  warnIfProductionFallback(`createEntity(${file})`);
  if (isSupabaseEnabled && TABLE_MAP[file]) {
    const table = TABLE_MAP[file];
    const snaked = toSnake(entity);
    // Fire-and-forget for now; caller doesn't await
    db!.from(table).insert(snaked).then(({ error }) => {
      if (error) console.error(`Supabase insert ${table}:`, error.message);
    });
    return entity;
  }
  const data = readJSON(file);
  data.push(entity);
  writeJSON(file, data);
  return entity;
}

export function updateEntity(file: string, id: string, updates: any) {
  if (isSupabaseEnabled && TABLE_MAP[file]) {
    const table = TABLE_MAP[file];
    const snaked = toSnake(updates);
    delete snaked.id;
    delete snaked.created_at;
    db!.from(table).update(snaked).eq("id", id).then(({ error }) => {
      if (error) console.error(`Supabase update ${table}:`, error.message);
    });
    return { id, ...updates };
  }
  const data = readJSON(file);
  const idx = data.findIndex((e: any) => e.id === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJSON(file, data);
  return data[idx];
}

export function deleteEntity(file: string, id: string) {
  if (isSupabaseEnabled && TABLE_MAP[file]) {
    const table = TABLE_MAP[file];
    db!.from(table).delete().eq("id", id).then(({ error }) => {
      if (error) console.error(`Supabase delete ${table}:`, error.message);
    });
    return true;
  }
  const data = readJSON(file);
  const idx = data.findIndex((e: any) => e.id === id);
  if (idx === -1) return false;
  data.splice(idx, 1);
  writeJSON(file, data);
  return true;
}

export function bulkCreateEntities(file: string, entities: any[]) {
  if (isSupabaseEnabled && TABLE_MAP[file]) {
    const table = TABLE_MAP[file];
    const snaked = entities.map(toSnake);
    db!.from(table).insert(snaked).then(({ error }) => {
      if (error) console.error(`Supabase bulk insert ${table}:`, error.message);
    });
    return entities.length;
  }
  const data = readJSON(file);
  data.push(...entities);
  writeJSON(file, data);
  return entities.length;
}

// ═══════════════════════════════
// Registrations
// ═══════════════════════════════
export async function getRegistrations(tournamentId: string) {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("registrations").select("*").eq("tournament_id", tournamentId).order("created_at");
    return (data || []).map(toCamel);
  }
  return readJSON("registrations.json").filter((r: any) => r.tournamentId === tournamentId);
}

export async function createRegistrationAsync(reg: any) {
  if (isSupabaseEnabled) {
    const snaked = toSnake(reg);
    const { data, error } = await db!.from("registrations").insert(snaked).select().single();
    if (error) {
      if (error.code === "23505") throw new Error("이 연락처로 이미 신청되어 있습니다.");
      throw new Error(error.message);
    }
    // Update tournament participant count
    try {
      await db!.from("tournaments")
        .update({ current_participants: (await db!.from("registrations").select("id", { count: "exact" }).eq("tournament_id", reg.tournamentId).not("status", "in", '("cancelled","rejected")')).count || 0 })
        .eq("id", reg.tournamentId);
    } catch {}
    return data ? toCamel(data) : reg;
  }
  // JSON fallback
  const data = readJSON("registrations.json");
  data.push(reg);
  writeJSON("registrations.json", data);
  // Update tournament count
  const tournaments = readJSON("tournaments.json");
  const tIdx = tournaments.findIndex((t: any) => t.id === reg.tournamentId);
  if (tIdx !== -1) {
    tournaments[tIdx].currentParticipants = (tournaments[tIdx].currentParticipants || 0) + 1;
    writeJSON("tournaments.json", tournaments);
  }
  return reg;
}

// Legacy sync wrapper
export function createRegistration(reg: any) {
  if (isSupabaseEnabled) {
    createRegistrationAsync(reg).catch(e => console.error("createRegistration:", e));
    return reg;
  }
  const data = readJSON("registrations.json");
  data.push(reg);
  writeJSON("registrations.json", data);
  const tournaments = readJSON("tournaments.json");
  const tIdx = tournaments.findIndex((t: any) => t.id === reg.tournamentId);
  if (tIdx !== -1) {
    tournaments[tIdx].currentParticipants = (tournaments[tIdx].currentParticipants || 0) + 1;
    writeJSON("tournaments.json", tournaments);
  }
  return reg;
}

export function updateRegistration(id: string, updates: any) {
  return updateEntity("registrations.json", id, updates);
}

// ═══════════════════════════════
// Coaches / Flash Games / Partners (legacy)
// ═══════════════════════════════
export async function getCoaches(filters?: { region?: string; keyword?: string }) {
  if (isSupabaseEnabled) {
    let q = db!.from("coaches").select("*");
    if (filters?.region) q = q.ilike("region", `%${filters.region}%`);
    if (filters?.keyword) q = q.ilike("name", `%${filters.keyword}%`);
    const { data } = await q.order("name");
    return (data || []).map(toCamel);
  }
  let c = readJSON("coaches.json");
  if (filters?.region) c = c.filter((x: any) => x.region?.includes(filters!.region!));
  if (filters?.keyword) c = c.filter((x: any) => x.name?.includes(filters!.keyword!));
  return c;
}

export async function getFlashGames(filters?: { region?: string; status?: string }) {
  if (isSupabaseEnabled) {
    let q = db!.from("flash_games").select("*");
    if (filters?.region) q = q.eq("region", filters.region);
    if (filters?.status) q = q.eq("status", filters.status);
    const { data } = await q.order("date_time");
    return data || [];
  }
  let g = readJSON("flash-games.json");
  if (filters?.region) g = g.filter((x: any) => x.region === filters.region);
  if (filters?.status) g = g.filter((x: any) => x.status === filters.status);
  return g;
}

export async function getFlashGame(id: string) {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("flash_games").select("*").eq("id", id).single();
    return data;
  }
  return readJSON("flash-games.json").find((g: any) => g.id === id) || null;
}

export async function getPartnerPosts(filters?: { region?: string }) {
  if (isSupabaseEnabled) {
    let q = db!.from("partner_posts").select("*");
    if (filters?.region) q = q.ilike("region", `%${filters.region}%`);
    const { data } = await q.order("created_at", { ascending: false });
    return data || [];
  }
  let p = readJSON("partner-posts.json");
  if (filters?.region) p = p.filter((x: any) => x.region?.includes(filters!.region!));
  return p;
}

// ═══════════════════════════════
// User / Notifications
// ═══════════════════════════════
export function getCurrentUser() { return readJSON("user.json")[0] || null; }
export function getNotifications() { return readJSON("notifications.json"); }
export function getNotificationSettings() { return readJSON("notification-settings.json"); }
export function getSyncJobs() { return readJSON("sync-jobs.json"); }

// ═══════════════════════════════
// Home Stats
// ═══════════════════════════════
export async function getHomeStats() {
  const [venues, tournaments, flashGames, clubs] = await Promise.all([getVenues(), getTournaments(), getFlashGames(), getClubs()]);
  return {
    venueCount: venues.length,
    tournamentOpenCount: tournaments.filter((t: any) => t.status === "open").length,
    tournamentTotalCount: tournaments.length,
    flashGameOpenCount: flashGames.filter((g: any) => g.status === "open").length,
    clubCount: clubs.length,
    lastSyncAt: null,
    dataSource: isSupabaseEnabled ? "supabase" : "json_fallback",
  };
}

export async function getFeaturedTournaments(limit = 4) {
  return (await getTournaments()).filter((t: any) => t.status !== "closed").slice(0, limit);
}
export async function getFeaturedVenues(limit = 3) {
  return (await getVenues()).slice(0, limit);
}
export async function getFeaturedFlashGames(limit = 4) {
  return (await getFlashGames()).filter((g: any) => g.status === "open").slice(0, limit);
}

export function getDataMeta() {
  return {
    lastSyncAt: null, dataBaseline: "2026-03",
    sourceTypes: [isSupabaseEnabled ? "supabase" : "json_fallback"],
    isStale: !isSupabaseEnabled,
    storageBackend: isSupabaseEnabled ? "supabase" : "json_file",
  };
}

// ═══════════════════════════════
// Meetups (같이치기/번개모임)
// ═══════════════════════════════
export async function getMeetups(filters?: { region?: string; status?: string }) {
  if (isSupabaseEnabled) {
    let q = db!.from("meetups").select("*");
    if (filters?.region) q = q.eq("region", filters.region);
    if (filters?.status) q = q.eq("status", filters.status);
    const { data } = await q.order("meetup_date", { ascending: true });
    return (data || []).map(toCamel);
  }
  let m = readJSON("meetups.json");
  if (filters?.region) m = m.filter((x: any) => x.region === filters.region);
  if (filters?.status) m = m.filter((x: any) => x.status === filters.status);
  return m;
}

export async function getMeetup(id: string) {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("meetups").select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  }
  return readJSON("meetups.json").find((m: any) => m.id === id) || null;
}

export async function getMeetupParticipants(meetupId: string) {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("meetup_participants").select("*").eq("meetup_id", meetupId).order("created_at");
    return (data || []).map(toCamel);
  }
  return readJSON("meetup-participants.json").filter((p: any) => p.meetupId === meetupId);
}

export async function createMeetupParticipant(participant: any) {
  if (isSupabaseEnabled) {
    const snaked = toSnake(participant);
    const { data, error } = await db!.from("meetup_participants").insert(snaked).select().single();
    if (error) {
      if (error.code === "23505") throw new Error("이미 참가 신청되어 있습니다.");
      throw new Error(error.message);
    }
    // Update meetup current_players
    try {
      const { count } = await db!.from("meetup_participants").select("id", { count: "exact" }).eq("meetup_id", participant.meetupId).not("status", "eq", "cancelled");
      await db!.from("meetups").update({ current_players: count || 0 }).eq("id", participant.meetupId);
    } catch {}
    return data ? toCamel(data) : participant;
  }
  const data = readJSON("meetup-participants.json");
  // Check duplicate
  const exists = data.find((p: any) => p.meetupId === participant.meetupId && p.participantPhone === participant.participantPhone && p.status !== "cancelled");
  if (exists) throw new Error("이미 참가 신청되어 있습니다.");
  data.push(participant);
  writeJSON("meetup-participants.json", data);
  // Update meetup count
  const meetups = readJSON("meetups.json");
  const mIdx = meetups.findIndex((m: any) => m.id === participant.meetupId);
  if (mIdx !== -1) {
    meetups[mIdx].currentPlayers = (meetups[mIdx].currentPlayers || 0) + 1;
    writeJSON("meetups.json", meetups);
  }
  return participant;
}

// ═══════════════════════════════
// Booking Requests (예약 요청)
// ═══════════════════════════════
export async function getBookingRequests(filters?: { venueId?: string; status?: string }) {
  if (isSupabaseEnabled) {
    let q = db!.from("booking_requests").select("*");
    if (filters?.venueId) q = q.eq("venue_id", filters.venueId);
    if (filters?.status) q = q.eq("status", filters.status);
    const { data } = await q.order("created_at", { ascending: false });
    return (data || []).map(toCamel);
  }
  let r = readJSON("booking-requests.json");
  if (filters?.venueId) r = r.filter((x: any) => x.venueId === filters.venueId);
  if (filters?.status) r = r.filter((x: any) => x.status === filters.status);
  return r;
}

export async function createBookingRequest(request: any) {
  if (isSupabaseEnabled) {
    const snaked = toSnake(request);
    const { data, error } = await db!.from("booking_requests").insert(snaked).select().single();
    if (error) throw new Error(error.message);
    return data ? toCamel(data) : request;
  }
  const data = readJSON("booking-requests.json");
  data.push(request);
  writeJSON("booking-requests.json", data);
  return request;
}
