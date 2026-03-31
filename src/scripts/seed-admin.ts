/**
 * 초기 관리자 계정 시드
 * 실행: npx tsx src/scripts/seed-admin.ts
 */
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "admin-users.json");

// Web Crypto API 사용 (Node 20+)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const existing = fs.existsSync(FILE)
    ? JSON.parse(fs.readFileSync(FILE, "utf-8"))
    : [];

  if (existing.find((u: any) => u.email === "admin@pbl.sys")) {
    console.log("✅ admin@pbl.sys 계정이 이미 존재합니다.");
    return;
  }

  const now = new Date().toISOString();
  const admin = {
    id: crypto.randomUUID(),
    email: "admin@pbl.sys",
    name: "관리자",
    passwordHash: await hashPassword("admin1234!"),
    role: "admin",
    createdAt: now,
    updatedAt: now,
  };

  existing.push(admin);
  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2));
  console.log("✅ 관리자 계정 생성 완료");
  console.log("   이메일: admin@pbl.sys");
  console.log("   비밀번호: admin1234!");
  console.log("   ⚠️  프로덕션 배포 전 반드시 비밀번호를 변경하세요.");
}

main().catch(console.error);
