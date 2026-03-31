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

// ═══ Seed data files that must always return empty in production ═══
// These files had seed/mock data in previous builds. To ensure zero mock data
// reaches users regardless of Vercel build cache, we explicitly list files
// that should only contain user-entered data.
// Files that should return empty in production to prevent stale seed data.
// venues.json, tournaments.json, clubs.json are excluded because they now contain curated seed data.
const USER_DATA_FILES = new Set([
  "coaches.json",
  "flash-games.json", "partner-posts.json", "user.json",
  "registrations.json", "leads.json",
  "booking-events.json", "payments.json",
  "cancellation-policies.json",
  "sync-jobs.json",
  "booking-requests.json",
  "inquiries.json",
]);

// ═══ JSON helpers ═══
export function readJSON(file: string): any[] {
  // In production (Vercel): user-data files return empty to prevent stale seed data.
  // Vercel bundles data/ files from build time, which may contain old seed data.
  // In development: read normally so admin can manage data locally.
  if (USER_DATA_FILES.has(file) && process.env.NODE_ENV === "production") {
    return [];
  }
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
  "conversations.json": "conversations",
  "messages.json": "messages",
  "reports.json": "reports",
  "notifications.json": "notifications",
  "blocks.json": "blocks",
  "club-members.json": "club_members",
  "club-posts.json": "club_posts",
  "community-posts.json": "community_posts",
  "venue-reviews.json": "venue_reviews",
  "manner-ratings.json": "manner_ratings",
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
export function getNotificationSettings() { return readJSON("notification-settings.json"); }

/** Create a notification for a user */
export function createNotification(notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  const notif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link || "",
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  createEntity("notifications.json", notif);
  return notif;
}

/** Get notifications for a user */
export async function getUserNotifications(userId: string, limit = 50): Promise<any[]> {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data || []).map(toCamel);
  }
  return readJSON("notifications.json")
    .filter((n: any) => n.userId === userId)
    .sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, limit);
}

/** Get unread notification count for a user */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (isSupabaseEnabled) {
    const { count } = await db!.from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    return count || 0;
  }
  return readJSON("notifications.json")
    .filter((n: any) => n.userId === userId && !n.isRead).length;
}

/** Mark a notification as read */
export function markNotificationRead(id: string) {
  return updateEntity("notifications.json", id, { isRead: true });
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsRead(userId: string) {
  if (isSupabaseEnabled) {
    await db!.from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    return;
  }
  const all = readJSON("notifications.json");
  let changed = false;
  for (const n of all) {
    if (n.userId === userId && !n.isRead) { n.isRead = true; changed = true; }
  }
  if (changed) writeJSON("notifications.json", all);
}
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

// ═══════════════════════════════
// Chat: Conversations & Messages
// ═══════════════════════════════

/** Find or create a 1:1 conversation between two users */
export async function findOrCreateConversation(userA: string, userB: string, context?: string): Promise<any> {
  const sorted = [userA, userB].sort();

  if (isSupabaseEnabled) {
    // Check existing
    const { data: existing } = await db!.from("conversations")
      .select("*")
      .contains("participant_ids", sorted)
      .single();
    if (existing) return toCamel(existing);

    // Create new
    const conv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      participant_ids: sorted,
      context: context || "",
      last_message: "",
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    const { data, error } = await db!.from("conversations").insert(conv).select().single();
    if (error) throw new Error(error.message);
    return data ? toCamel(data) : conv;
  }

  // JSON fallback
  const convs = readJSON("conversations.json");
  const existing = convs.find((c: any) => {
    const ids = (c.participantIds || []).sort();
    return ids[0] === sorted[0] && ids[1] === sorted[1];
  });
  if (existing) return existing;

  const conv = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    participantIds: sorted,
    context: context || "",
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  convs.push(conv);
  writeJSON("conversations.json", convs);
  return conv;
}

/** Get conversations for a user */
export async function getUserConversations(userId: string): Promise<any[]> {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("conversations")
      .select("*")
      .contains("participant_ids", [userId])
      .order("last_message_at", { ascending: false });
    return (data || []).map(toCamel);
  }
  return readJSON("conversations.json")
    .filter((c: any) => (c.participantIds || []).includes(userId))
    .sort((a: any, b: any) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));
}

/** Get messages for a conversation */
export async function getMessages(conversationId: string, limit = 100): Promise<any[]> {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);
    return (data || []).map(toCamel);
  }
  return readJSON("messages.json")
    .filter((m: any) => m.conversationId === conversationId)
    .sort((a: any, b: any) => (a.createdAt || "").localeCompare(b.createdAt || ""))
    .slice(-limit);
}

/** Send a message */
export async function sendMessage(msg: { conversationId: string; senderId: string; senderName: string; text: string }): Promise<any> {
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    text: msg.text,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseEnabled) {
    const snaked = toSnake(message);
    const { data, error } = await db!.from("messages").insert(snaked).select().single();
    if (error) throw new Error(error.message);
    // Update conversation lastMessage
    await db!.from("conversations").update({
      last_message: msg.text.slice(0, 100),
      last_message_at: message.createdAt,
    }).eq("id", msg.conversationId);
    return data ? toCamel(data) : message;
  }

  const messages = readJSON("messages.json");
  messages.push(message);
  writeJSON("messages.json", messages);

  // Update conversation
  const convs = readJSON("conversations.json");
  const idx = convs.findIndex((c: any) => c.id === msg.conversationId);
  if (idx !== -1) {
    convs[idx].lastMessage = msg.text.slice(0, 100);
    convs[idx].lastMessageAt = message.createdAt;
    writeJSON("conversations.json", convs);
  }

  return message;
}

/** Mark messages as read */
export async function markMessagesRead(conversationId: string, userId: string): Promise<void> {
  if (isSupabaseEnabled) {
    await db!.from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);
    return;
  }
  const messages = readJSON("messages.json");
  let changed = false;
  for (const m of messages) {
    if (m.conversationId === conversationId && m.senderId !== userId && !m.isRead) {
      m.isRead = true;
      changed = true;
    }
  }
  if (changed) writeJSON("messages.json", messages);
}

/** Count unread messages for a user */
export async function getUnreadCount(userId: string): Promise<number> {
  const convs = await getUserConversations(userId);
  if (convs.length === 0) return 0;

  if (isSupabaseEnabled) {
    let total = 0;
    for (const c of convs) {
      const { count } = await db!.from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .neq("sender_id", userId)
        .eq("is_read", false);
      total += count || 0;
    }
    return total;
  }

  const allMessages = readJSON("messages.json");
  const convIds = new Set(convs.map((c: any) => c.id));
  return allMessages.filter((m: any) =>
    convIds.has(m.conversationId) && m.senderId !== userId && !m.isRead
  ).length;
}

/** Get blocked user IDs for a user */
export async function getBlockedUsers(userId: string): Promise<string[]> {
  if (isSupabaseEnabled) {
    const { data } = await db!.from("blocks").select("blocked_id").eq("blocker_id", userId);
    return (data || []).map((b: any) => b.blocked_id);
  }
  return readJSON("blocks.json")
    .filter((b: any) => b.blockerId === userId)
    .map((b: any) => b.blockedId);
}
