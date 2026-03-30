/**
 * Supabase에 시드 데이터 투입
 * 사용법: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx src/scripts/seed-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 환경변수를 설정하세요.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const DATA_DIR = path.join(process.cwd(), "data");

function readJSON(file: string): any[] {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

// camelCase → snake_case
function toSnake(obj: any): any {
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const sk = k.replace(/[A-Z]/g, m => "_" + m.toLowerCase());
    // skip legacy compat fields not in DB
    if (["type", "surface", "pricePerHour", "hasParking", "hasShower", "hasLighting",
         "hasEquipmentRental", "rating", "reviewCount", "sourcePrimary",
         "city", "level", "meetingSchedule", "meetingVenue", "fee", "tags",
         "isRecruiting", "slug"].includes(k) && !["tournaments", "venues", "clubs"].includes("")) {
      // Keep these for venues/clubs that have them in DB
    }
    result[sk] = v;
  }
  return result;
}

async function seedTable(file: string, table: string) {
  const data = readJSON(file);
  if (data.length === 0) { console.log(`  ⚠ ${file} — 데이터 없음`); return; }

  const snaked = data.map(toSnake);

  // Batch upsert in chunks of 100
  for (let i = 0; i < snaked.length; i += 100) {
    const chunk = snaked.slice(i, i + 100);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ ${table} (${i}~${i + chunk.length}): ${error.message}`);
    }
  }
  console.log(`  ✓ ${table}: ${data.length}건`);
}

async function main() {
  console.log("Supabase 시드 데이터 투입 시작...\n");

  await seedTable("tournaments.json", "tournaments");
  await seedTable("venues.json", "venues");
  await seedTable("clubs.json", "clubs");
  await seedTable("registrations.json", "registrations");
  await seedTable("leads.json", "leads");
  await seedTable("contents.json", "contents");

  console.log("\n✅ 완료!");
}

main().catch(e => { console.error(e); process.exit(1); });
