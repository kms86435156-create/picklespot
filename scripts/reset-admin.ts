/**
 * 관리자 계정 초기화 스크립트
 *
 * 사용법:
 *   npx tsx scripts/reset-admin.ts
 *
 * 대화형으로 이메일, 이름, 비밀번호를 입력받아
 * data/admin-users.json + Supabase admin_users 테이블을 동시에 업데이트합니다.
 * 계정이 없으면 새로 생성합니다.
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "admin-users.json");

function question(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, "sha256", (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n🔐 PBL.SYS 관리자 계정 설정\n");

  // 기존 계정 확인
  let admins: any[] = [];
  if (fs.existsSync(FILE)) {
    try {
      admins = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    } catch { admins = []; }
  }

  if (admins.length > 0) {
    console.log(`  현재 관리자: ${admins[0].email} (${admins[0].name})`);
    console.log("");
  }

  const email = (await question(rl, "  이메일: ")).trim().toLowerCase();
  if (!email || !email.includes("@")) {
    console.log("\n❌ 올바른 이메일을 입력해주세요.\n");
    rl.close();
    process.exit(1);
  }

  const name = (await question(rl, "  이름: ")).trim() || "관리자";

  const password = (await question(rl, "  비밀번호: ")).trim();
  if (password.length < 6) {
    console.log("\n❌ 비밀번호는 6자 이상이어야 합니다.\n");
    rl.close();
    process.exit(1);
  }

  const confirm = (await question(rl, "  비밀번호 확인: ")).trim();
  if (password !== confirm) {
    console.log("\n❌ 비밀번호가 일치하지 않습니다.\n");
    rl.close();
    process.exit(1);
  }

  rl.close();

  console.log("\n  해싱 중...");
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  if (admins.length > 0) {
    // 기존 계정 업데이트
    admins[0] = {
      ...admins[0],
      email,
      name,
      passwordHash,
      updatedAt: now,
    };
  } else {
    // 새 계정 생성
    admins.push({
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });
  }

  // 1. JSON 파일 저장
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(admins, null, 2));
  console.log("  ✅ JSON 파일 저장 완료");

  // 2. Supabase 저장
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    console.log("  Supabase 동기화 중...");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const admin = admins[0];
    const row = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      password_hash: admin.passwordHash,
      role: admin.role || "admin",
      created_at: admin.createdAt,
      updated_at: admin.updatedAt,
    };

    // 기존 admin_users 전부 삭제 후 1개만 삽입 (관리자는 본인만)
    await supabase.from("admin_users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase.from("admin_users").upsert(row, { onConflict: "id" });

    if (error) {
      console.log(`  ⚠️  Supabase 저장 실패: ${error.message}`);
    } else {
      console.log("  ✅ Supabase 동기화 완료");
    }
  } else {
    console.log("  ⚠️  Supabase 환경변수 없음 — JSON만 저장됨");
  }

  console.log(`\n✅ 관리자 계정 설정 완료`);
  console.log(`   이메일: ${email}`);
  console.log(`   이름: ${name}`);
  console.log(`\n   로그인: /admin/login\n`);
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
