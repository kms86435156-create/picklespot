// Data layer — Supabase primary, JSON file fallback
// When NEXT_PUBLIC_SUPABASE_URL is set: reads/writes go to Postgres
// When not set: falls back to local JSON files (dev/demo)

import "server-only";
import { supabase, isSupabaseEnabled, isDemoMode } from "./supabase";
export { isDemoMode };
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function readJSON(file: string): any[] {
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

// ═══ Venues ═══
export async function getVenues(filters?: { region?: string; keyword?: string }) {
  if (isSupabaseEnabled) {
    let q = supabase!.from("venues").select("*");
    if (filters?.region) q = q.eq("region", filters.region);
    if (filters?.keyword) q = q.ilike("name", `%${filters.keyword}%`);
    const { data } = await q.order("name");
    return (data || []).map(mapVenue);
  }
  let v = readJSON("venues.json").map(mapVenue);
  if (filters?.region) v = v.filter((x: any) => x.region === filters.region);
  if (filters?.keyword) v = v.filter((x: any) => x.name.includes(filters.keyword));
  return v;
}

export async function getVenue(id: string) {
  if (isSupabaseEnabled) {
    const { data } = await supabase!.from("venues").select("*").eq("id", id).single();
    return data ? mapVenue(data) : null;
  }
  const raw = readJSON("venues.json").find((v: any) => v.id === id);
  return raw ? mapVenue(raw) : null;
}

// ═══ Tournaments ═══
export async function getTournaments(filters?: { region?: string; status?: string; keyword?: string }) {
  if (isSupabaseEnabled) {
    let q = supabase!.from("tournaments").select("*");
    if (filters?.region) q = q.eq("region", filters.region);
    if (filters?.status) q = q.eq("status", filters.status);
    if (filters?.keyword) q = q.ilike("title", `%${filters.keyword}%`);
    const { data } = await q.order("start_date");
    return (data || []).map(mapTournament);
  }
  let t = readJSON("tournaments.json").map(mapTournament);
  if (filters?.region) t = t.filter((x: any) => x.region === filters.region);
  if (filters?.status) t = t.filter((x: any) => x.status === filters.status);
  if (filters?.keyword) t = t.filter((x: any) => x.title.includes(filters.keyword));
  return t;
}

export async function getTournament(id: string) {
  if (isSupabaseEnabled) {
    const { data } = await supabase!.from("tournaments").select("*").eq("id", id).single();
    return data ? mapTournament(data) : null;
  }
  const raw = readJSON("tournaments.json").find((t: any) => t.id === id);
  return raw ? mapTournament(raw) : null;
}

// ═══ Coaches ═══
export async function getCoaches(filters?: { region?: string; keyword?: string }) {
  if (isSupabaseEnabled) {
    let q = supabase!.from("coaches").select("*");
    if (filters?.region) q = q.ilike("region", `%${filters.region}%`);
    if (filters?.keyword) q = q.ilike("name", `%${filters.keyword}%`);
    const { data } = await q.order("name");
    return (data || []).map(mapCoach);
  }
  let c = readJSON("coaches.json").map(mapCoach);
  if (filters?.region) c = c.filter((x: any) => x.region?.includes(filters!.region!));
  if (filters?.keyword) c = c.filter((x: any) => x.name?.includes(filters!.keyword!));
  return c;
}

// ═══ Flash Games ═══
export async function getFlashGames(filters?: { region?: string; status?: string }) {
  if (isSupabaseEnabled) {
    let q = supabase!.from("flash_games").select("*");
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
    const { data } = await supabase!.from("flash_games").select("*").eq("id", id).single();
    return data;
  }
  return readJSON("flash-games.json").find((g: any) => g.id === id) || null;
}

export async function getPartnerPosts(filters?: { region?: string }) {
  if (isSupabaseEnabled) {
    let q = supabase!.from("partner_posts").select("*");
    if (filters?.region) q = q.ilike("region", `%${filters.region}%`);
    const { data } = await q.order("created_at", { ascending: false });
    return data || [];
  }
  let p = readJSON("partner-posts.json");
  if (filters?.region) p = p.filter((x: any) => x.region?.includes(filters!.region!));
  return p;
}

// ═══ User / Notifications ═══
export function getCurrentUser() { return readJSON("user.json")[0] || null; }
export function getNotifications() { return readJSON("notifications.json"); }
export function getNotificationSettings() { return readJSON("notification-settings.json"); }
export function getSyncJobs() { return readJSON("sync-jobs.json"); }

// ═══ Home Stats ═══
export async function getHomeStats() {
  const [venues, tournaments, flashGames] = await Promise.all([getVenues(), getTournaments(), getFlashGames()]);
  return {
    venueCount: venues.length,
    tournamentOpenCount: tournaments.filter((t: any) => t.status === "open").length,
    tournamentTotalCount: tournaments.length,
    flashGameOpenCount: flashGames.filter((g: any) => g.status === "open").length,
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

// ═══ Field mappers (snake_case DB → camelCase frontend) ═══
function mapVenue(r: any) {
  if (!r) return r;
  return {
    id: r.id, name: r.name, slug: r.slug, address: r.address || "",
    region: r.region || "", lat: r.lat, lng: r.lng, type: r.type || "indoor",
    courtCount: r.court_count ?? r.courtCount ?? 0, surface: r.surface || "",
    pricePerHour: r.price_per_hour ?? r.pricePerHour ?? 0,
    priceWeekend: r.price_weekend ?? r.priceWeekend ?? null,
    amenities: r.amenities || [], hasParking: r.has_parking ?? r.hasParking ?? false,
    hasShower: r.has_shower ?? r.hasShower ?? false,
    hasLighting: r.has_lighting ?? r.hasLighting ?? false,
    hasEquipmentRental: r.has_equipment_rental ?? r.hasEquipmentRental ?? false,
    operatingHours: r.operating_hours ?? r.operatingHours ?? "",
    rating: r.rating || 0,
    reviewCount: r.review_count ?? r.reviewCount ?? 0,
    reviews: r.reviews || [],
    peakHours: r.peak_hours ?? r.peakHours ?? "",
    description: r.description || "", phone: r.phone || "",
    bookingMode: r.booking_mode ?? r.bookingMode ?? "outbound_link",
    isBookable: r.is_bookable ?? r.isBookable ?? false,
    bookingNotice: r.booking_notice ?? r.bookingNotice ?? null,
    externalBookingUrl: r.external_booking_url ?? r.externalBookingUrl ?? null,
    isVerified: r.is_verified ?? r.isVerified ?? false,
    lastVerifiedAt: r.last_verified_at ?? r.lastVerifiedAt ?? null,
    sourcePrimary: r.source_primary ?? r.sourcePrimary ?? "manual",
    availableSlots: r.availableSlots || [],
  };
}

function mapTournament(r: any) {
  if (!r) return r;
  // Support both snake_case (Supabase) and camelCase (JSON fallback)
  const startDate = r.start_date || r.startDate || "";
  const endDate = r.end_date || r.endDate || "";
  const regClose = r.registration_close_at || r.registrationCloseAt || null;
  const venueName = r.venue_name || r.venueName || "";
  const feeText = r.fee_text || r.feeText || "";
  const detailUrl = r.detail_url || r.detailUrl || "";
  const sourcePrimary = r.source_primary || r.sourcePrimary || "manual";
  const lastVerified = r.last_verified_at || r.lastVerifiedAt;
  const maxSlots = r.max_slots || r.maxSlots || 0;
  const currentSlots = r.current_slots || r.currentSlots || 0;
  const waitlistCount = r.waitlist_count || r.waitlistCount || 0;
  const orgContact = r.organizer_contact || r.organizerContact || "";
  const refundPolicy = r.refund_policy || r.refundPolicy || "주최 측 문의";
  const prizeInfo = r.prize_info || r.prizeInfo || "";
  const address = r.address || "";

  return {
    id: r.id, title: r.title, organizer: r.organizer || "", region: r.region || "",
    venueName, startDate, endDate, registrationCloseAt: regClose,
    fee: r.fee || 0, feeText, divisions: r.divisions || "",
    level: r.level || "", status: r.status || "open", description: r.description || "",
    detailUrl, sourcePrimary, lastVerifiedAt: lastVerified,
    // Frontend compat fields
    date: startDate, location: venueName, type: r.type || "doubles",
    typeLabel: r.divisions || "",
    registrationDeadline: regClose,
    address, currentSlots, maxSlots, waitlistCount,
    entryFee: r.fee || 0, organizerContact: orgContact,
    refundPolicy, rules: r.rules || [], schedule: r.schedule || [], faq: r.faq || [],
    notice: r.notice || "", amenities: r.amenities || [], participants: r.participants || [],
    prizeInfo,
  };
}

function mapCoach(r: any) {
  if (!r) return r;
  return {
    id: r.id, name: r.name, region: r.region || "",
    specialties: r.specialties || [], rating: r.rating || 0,
    reviewCount: r.review_count ?? r.reviewCount ?? 0,
    pricePerSession: r.price_per_session ?? r.pricePerSession ?? 0,
    sessionDuration: r.session_duration ?? r.sessionDuration ?? "60분",
    lessonType: r.lesson_type ?? r.lessonType ?? [],
    bio: r.bio || "", experience: r.experience || "",
    sourcePrimary: r.source_primary ?? r.sourcePrimary ?? "manual",
    lastVerifiedAt: r.last_verified_at ?? r.lastVerifiedAt ?? null,
  };
}
