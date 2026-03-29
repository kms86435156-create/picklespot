// Migrate JSON seed data to Supabase
// Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/scripts/migrate-to-supabase.ts

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);
const DATA_DIR = path.join(process.cwd(), "data");

function readJSON(file: string) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function upsert(table: string, rows: any[], mapFn?: (r: any) => any) {
  const mapped = mapFn ? rows.map(mapFn) : rows;
  if (mapped.length === 0) { console.log(`  ${table}: 0 rows (skip)`); return; }

  const { error, count } = await sb.from(table).upsert(mapped, { onConflict: "id", ignoreDuplicates: true });
  if (error) console.error(`  ${table} ERROR:`, error.message);
  else console.log(`  ${table}: ${mapped.length} rows upserted`);
}

async function main() {
  console.log("Migrating JSON data to Supabase...\n");

  // Venues
  await upsert("venues", readJSON("venues.json"), (v) => ({
    id: v.id, name: v.name, slug: v.slug, address: v.address, region: v.region,
    lat: v.lat, lng: v.lng, type: v.type, court_count: v.courtCount,
    surface: v.surface, price_per_hour: v.pricePerHour, price_weekend: v.priceWeekend,
    amenities: v.amenities, has_parking: v.hasParking, has_shower: v.hasShower,
    has_lighting: v.hasLighting, has_equipment_rental: v.hasEquipmentRental,
    operating_hours: v.operatingHours, rating: v.rating, review_count: v.reviewCount,
    peak_hours: v.peakHours, description: v.description, phone: v.phone,
    booking_mode: v.bookingMode, is_bookable: v.isBookable,
    booking_notice: v.bookingNotice, external_booking_url: v.externalBookingUrl,
    is_verified: v.isVerified, source_primary: v.sourcePrimary,
    source_type: v.sourceType || "manual_seed",
  }));

  // Tournaments
  await upsert("tournaments", readJSON("tournaments.json"), (t) => ({
    id: t.id, title: t.title, organizer: t.organizer, region: t.region,
    venue_name: t.venueName, start_date: t.startDate, end_date: t.endDate,
    registration_close_at: t.registrationCloseAt, fee: t.fee, fee_text: t.feeText,
    divisions: t.divisions, level: t.level, status: t.status,
    description: t.description, detail_url: t.detailUrl,
    source_primary: t.sourcePrimary, source_type: t.sourceType || "manual_seed",
  }));

  // Coaches
  await upsert("coaches", readJSON("coaches.json"), (c) => ({
    id: c.id, name: c.name, region: c.region, specialties: c.specialties,
    rating: c.rating, review_count: c.reviewCount,
    price_per_session: c.pricePerSession, session_duration: c.sessionDuration,
    lesson_type: c.lessonType, bio: c.bio, experience: c.experience,
    source_primary: c.sourcePrimary, source_type: c.sourceType || "manual_seed",
  }));

  // Court Resources
  await upsert("court_resources", readJSON("court-resources.json"), (r) => ({
    id: r.id, venue_id: r.venueId, name: r.name, sport_type: r.sportType,
    indoor_outdoor: r.indoorOutdoor, capacity: r.capacity,
    surface_type: r.surfaceType, is_active: r.isActive,
  }));

  // Flash Games
  await upsert("flash_games", readJSON("flash-games.json"), (g) => ({
    id: g.id, title: g.title, author_name: g.authorName, author_level: g.authorLevel,
    author_attend_rate: g.authorAttendRate, author_manner_score: g.authorMannerScore,
    author_games_hosted: g.authorGamesHosted, location: g.location, address: g.address,
    region: g.region, date_time: g.dateTime, duration: g.duration,
    current_players: g.currentPlayers, max_players: g.maxPlayers, players: g.players,
    level: g.level, vibe: g.vibe, beginner_welcome: g.beginnerWelcome,
    gender: g.gender, status: g.status, author_trust_score: g.authorTrustScore,
    author_no_show: g.authorNoShow, description: g.description,
    equipment: g.equipment, notice: g.notice, cost_per_person: g.costPerPerson,
    source_type: g.sourceType || "manual_seed",
  }));

  // Partner Posts
  await upsert("partner_posts", readJSON("partner-posts.json"), (p) => ({
    id: p.id, author_name: p.authorName, author_level: p.authorLevel,
    author_attend_rate: p.authorAttendRate, author_manner_score: p.authorMannerScore,
    author_total_games: p.authorTotalGames, region: p.region, level: p.level,
    preferred_time: p.preferredTime, preferred_days: p.preferredDays,
    vibe: p.vibe, looking_for: p.lookingFor, message: p.message,
    trust_score: p.trustScore, no_show_count: p.noShowCount, badges: p.badges,
    source_type: p.sourceType || "manual_seed",
  }));

  // Cancellation Policies
  await upsert("cancellation_policies", readJSON("cancellation-policies.json"), (c) => ({
    id: c.id, venue_id: c.venueId, free_hours_before: c.freeHoursBefore,
    partial_refund_hours_before: c.partialRefundHoursBefore,
    partial_refund_percent: c.partialRefundPercent, description: c.description,
  }));

  // Slot inventory (large — batch)
  const slots = readJSON("slot-inventory.json");
  console.log(`  slot_inventory: ${slots.length} slots to migrate...`);
  const batchSize = 500;
  for (let i = 0; i < slots.length; i += batchSize) {
    const batch = slots.slice(i, i + batchSize).map((s: any) => ({
      id: s.id, resource_id: s.resourceId, venue_id: s.venueId,
      start_at: s.startAt, end_at: s.endAt, status: s.status,
      price: s.price, currency: s.currency,
      held_until: s.heldUntil, booking_id: s.bookingId,
    }));
    const { error } = await sb.from("slot_inventory").upsert(batch, { onConflict: "id", ignoreDuplicates: true });
    if (error) console.error(`  slot_inventory batch ${i} ERROR:`, error.message);
    else console.log(`  slot_inventory: batch ${i}-${i + batch.length} done`);
  }

  console.log("\nMigration complete!");
}

main().catch(console.error);
