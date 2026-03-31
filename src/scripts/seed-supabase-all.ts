/**
 * Supabase 전체 시드: 관리자 계정 + 피클볼장 데이터
 * 실행: npx tsx src/scripts/seed-supabase-all.ts
 *
 * 필요 환경변수 (.env):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ .env에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// PBKDF2 해싱 (auth.ts와 동일)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

function toSnake(obj: any): any {
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k.replace(/[A-Z]/g, m => "_" + m.toLowerCase())] = v;
  }
  return result;
}

async function main() {
  console.log("🔗 Supabase 연결:", url);

  // 1. 관리자 계정
  console.log("\n📌 관리자 계정 시드...");
  const { data: existingAdmin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", "admin@pbl.sys")
    .single();

  if (existingAdmin) {
    console.log("  ⏭ admin@pbl.sys 이미 존재");
  } else {
    const { error } = await supabase.from("admin_users").insert({
      id: crypto.randomUUID(),
      email: "admin@pbl.sys",
      name: "관리자",
      password_hash: await hashPassword("admin1234!"),
      role: "admin",
    });
    if (error) console.error("  ❌", error.message);
    else console.log("  ✅ admin@pbl.sys 생성 완료 (비밀번호: admin1234!)");
  }

  // 2. 피클볼장 데이터
  console.log("\n📌 피클볼장 데이터 시드...");
  const venuesFile = path.join(process.cwd(), "data", "venues.json");
  if (!fs.existsSync(venuesFile)) {
    console.log("  ⚠ data/venues.json이 없습니다. 먼저 seed-courts.ts를 실행하세요.");
  } else {
    const venues = JSON.parse(fs.readFileSync(venuesFile, "utf-8"));
    let added = 0, skipped = 0;

    for (const v of venues) {
      const { data: existing } = await supabase
        .from("venues")
        .select("id")
        .eq("name", v.name)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const row = toSnake(v);
      // JSON 배열 필드 처리
      if (typeof row.images === "object") row.images = JSON.stringify(row.images);
      delete row.created_at;
      delete row.updated_at;

      const { error } = await supabase.from("venues").insert(row);
      if (error) {
        console.error(`  ❌ ${v.name}: ${error.message}`);
      } else {
        added++;
      }
    }
    console.log(`  ✅ ${added}개 추가, ${skipped}개 건너뜀 (전체 ${venues.length}개)`);
  }

  console.log("\n✅ 시드 완료!");
  console.log("   관리자 로그인: admin@pbl.sys / admin1234!");
  console.log("   ⚠️ 프로덕션 배포 전 비밀번호를 반드시 변경하세요.");
}

main().catch(console.error);
