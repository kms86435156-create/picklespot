/**
 * data/*.json 파일을 타임스탬프 폴더에 백업합니다.
 * 실행: npx tsx src/scripts/backup-json.ts
 * 복구: npx tsx src/scripts/backup-json.ts restore ./backups/2026-06-13T12-00-00
 */
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_ROOT = path.join(process.cwd(), "backups");

// 백업에서 제외할 파일 (빈 시드 파일)
const EXCLUDE = new Set([
  "coaches.json", "flash-games.json", "partner-posts.json",
  "user.json", "registrations.json", "sync-jobs.json",
  "booking-events.json", "payments.json", "cancellation-policies.json",
]);

function timestamp() {
  return new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "");
}

async function backup() {
  const dir = path.join(BACKUP_ROOT, timestamp());
  fs.mkdirSync(dir, { recursive: true });

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json") && !EXCLUDE.has(f));
  let count = 0;
  for (const file of files) {
    const src = path.join(DATA_DIR, file);
    const dst = path.join(dir, file);
    const content = fs.readFileSync(src, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length === 0) continue; // 빈 파일 스킵
    fs.copyFileSync(src, dst);
    console.log(`  ✅ ${file} (${parsed.length ?? "?"} records)`);
    count++;
  }
  console.log(`\n백업 완료: ${dir} (${count}개 파일)`);
}

async function restore(backupDir: string) {
  if (!fs.existsSync(backupDir)) {
    console.error(`❌ 백업 폴더 없음: ${backupDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".json"));
  for (const file of files) {
    const src = path.join(backupDir, file);
    const dst = path.join(DATA_DIR, file);
    fs.copyFileSync(src, dst);
    const content = JSON.parse(fs.readFileSync(src, "utf-8"));
    console.log(`  ✅ ${file} 복구 (${content.length ?? "?"} records)`);
  }
  console.log(`\n복구 완료: ${files.length}개 파일`);
  console.log("⚠️  dev 서버를 재시작해야 변경사항이 반영됩니다. (npm run dev)");
}

async function list() {
  if (!fs.existsSync(BACKUP_ROOT)) {
    console.log("백업 없음");
    return;
  }
  const dirs = fs.readdirSync(BACKUP_ROOT).filter(d =>
    fs.statSync(path.join(BACKUP_ROOT, d)).isDirectory()
  ).sort().reverse();

  if (dirs.length === 0) { console.log("백업 없음"); return; }
  console.log(`백업 목록 (${dirs.length}개):`);
  for (const d of dirs) {
    const files = fs.readdirSync(path.join(BACKUP_ROOT, d)).length;
    console.log(`  ${d}  (${files}개 파일)`);
  }
}

const [,, cmd, arg] = process.argv;
if (cmd === "restore" && arg) {
  console.log(`\n=== 복구: ${arg} ===`);
  restore(arg);
} else if (cmd === "list") {
  list();
} else {
  console.log("\n=== JSON 데이터 백업 ===");
  backup();
}
