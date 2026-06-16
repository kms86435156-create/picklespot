/**
 * Upload venues.json data to Supabase
 * Usage: node scripts/upload-venues.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function toSupabaseRow(v) {
  return {
    id: v.id,
    name: v.name,
    slug: v.id,
    address: v.address,
    road_address: v.roadAddress || v.address,
    region: v.region,
    region_depth1: v.regionDepth1 || v.region,
    lat: v.lat || null,
    lng: v.lng || null,
    court_count: v.courtCount || null,
    indoor_outdoor: v.indoorOutdoor || null,
    operating_hours: v.operatingHours || null,
    pricing: v.priceInfo || null,
    phone: v.phone || null,
    parking_available: v.parkingAvailable || false,
    description: v.description || null,
    is_published: true,
    is_featured: v.isFeatured || false,
    is_verified: true,
    source_primary: v.source || "web-search",
    created_at: v.createdAt || new Date().toISOString(),
    updated_at: v.updatedAt || new Date().toISOString(),
  };
}

async function main() {
  const venuesPath = join(__dirname, "..", "data", "venues.json");
  const venues = JSON.parse(readFileSync(venuesPath, "utf-8"));

  console.log(`Uploading ${venues.length} venues to Supabase...`);

  const rows = venues.map(toSupabaseRow);

  // Upsert in batches of 20
  const batchSize = 20;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("venues")
      .upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      for (const row of batch) {
        const { error: singleError } = await supabase
          .from("venues")
          .upsert(row, { onConflict: "id" });
        if (singleError) {
          console.error(`  Failed: ${row.name} - ${singleError.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      }
    } else {
      successCount += batch.length;
      console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} venues uploaded`);
    }
  }

  console.log(`\nDone! Success: ${successCount}, Errors: ${errorCount}`);

  // Verify
  const { data, error: verifyError } = await supabase
    .from("venues")
    .select("id, name, region")
    .eq("is_verified", true)
    .order("name");

  if (verifyError) {
    console.error("Verify error:", verifyError.message);
  } else {
    console.log(`\nVerified: ${data.length} venues in Supabase (is_verified=true)`);
  }
}

main().catch(console.error);
