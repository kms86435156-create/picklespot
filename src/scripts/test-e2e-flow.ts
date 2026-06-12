/**
 * E2E 플로우 테스트 스크립트
 * 실행: npx tsx src/scripts/test-e2e-flow.ts
 *
 * 테스트 항목:
 * 1. Supabase 연결 상태
 * 2. users 테이블
 * 3. meetups 테이블
 * 4. meetup_participants 테이블
 * 5. 회원가입 → 로그인 → 번개 생성 → 번개 신청 플로우
 */

import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// ──────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────
async function supabaseQuery(path: string, method = "GET", body?: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function apiCall(path: string, method = "GET", body?: any, cookie = "") {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: Object.fromEntries(res.headers.entries()) };
}

function pass(msg: string) { console.log(`  ✅ ${msg}`); }
function fail(msg: string) { console.log(`  ❌ ${msg}`); }
function info(msg: string) { console.log(`  ℹ️  ${msg}`); }
function section(title: string) { console.log(`\n━━━ ${title} ━━━`); }

// ──────────────────────────────────────────────
// 테스트 1: Supabase 연결
// ──────────────────────────────────────────────
async function testSupabaseConnection() {
  section("1. Supabase 연결 상태");

  if (!SUPABASE_URL) { fail("NEXT_PUBLIC_SUPABASE_URL 미설정"); return false; }
  info(`URL: ${SUPABASE_URL}`);

  try {
    const r = await supabaseQuery("/users?limit=0&select=id");
    if (r.status === 200 || r.status === 206) {
      pass(`users 테이블 연결 OK (${r.status})`);
    } else {
      fail(`users 테이블 오류: ${r.status} — ${r.body.slice(0, 200)}`);
    }
  } catch (e: any) {
    fail(`연결 실패: ${e.message}`);
    return false;
  }

  const tables = ["meetups", "meetup_participants"];
  for (const t of tables) {
    try {
      const r = await supabaseQuery(`/${t}?limit=0&select=id`);
      if (r.status === 200 || r.status === 206) {
        pass(`${t} 테이블 연결 OK`);
      } else {
        fail(`${t} 테이블 없음: ${r.status} — ${r.body.slice(0, 150)}`);
      }
    } catch (e: any) {
      fail(`${t} 테이블 오류: ${e.message}`);
    }
  }
  return true;
}

// ──────────────────────────────────────────────
// 테스트 2: 회원가입
// ──────────────────────────────────────────────
async function testSignup(): Promise<string> {
  section("2. 회원가입");
  const email = `test_${Date.now()}@pblsys.test`;
  const password = "test1234!";

  const r = await apiCall("/api/auth/signup", "POST", {
    name: "테스트유저",
    email,
    phone: "010-0000-0000",
    password,
  });

  if (r.status === 201) {
    pass(`회원가입 성공: ${email}`);
    // 쿠키 추출
    const setCookie = r.headers["set-cookie"] || "";
    info(`쿠키: ${setCookie.slice(0, 80)}...`);
    return setCookie;
  } else {
    fail(`회원가입 실패: ${r.status} — ${JSON.stringify(r.data)}`);
    return "";
  }
}

// ──────────────────────────────────────────────
// 테스트 3: 로그인
// ──────────────────────────────────────────────
async function testLogin(): Promise<string> {
  section("3. 로그인");
  // 로그인용 계정 생성
  const email = `login_${Date.now()}@pblsys.test`;
  await apiCall("/api/auth/signup", "POST", {
    name: "로그인테스트", email, phone: "", password: "login1234!",
  });

  const r = await apiCall("/api/auth/login", "POST", { email, password: "login1234!" });
  if (r.status === 200) {
    pass(`로그인 성공`);
    const cookie = r.headers["set-cookie"] || "";
    info(`JWT 쿠키 발급 OK`);
    return cookie;
  } else {
    fail(`로그인 실패: ${r.status} — ${JSON.stringify(r.data)}`);
    return "";
  }
}

// ──────────────────────────────────────────────
// 테스트 4: 번개 생성
// ──────────────────────────────────────────────
async function testCreateMeetup(cookie: string): Promise<string> {
  section("4. 번개 생성");
  if (!cookie) { fail("쿠키 없음 — 로그인 필요"); return ""; }

  const r = await apiCall("/api/meetups", "POST", {
    title: "E2E 테스트 번개",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "12:00",
    region: "서울",
    venueName: "테스트 코트",
    maxPlayers: 4,
    skillLevel: "초보",
    fee: 0,
    description: "자동 테스트용 번개입니다",
    isBeginnerFriendly: true,
  }, cookie);

  if (r.status === 200 || r.status === 201) {
    const meetupId = r.data?.meetup?.id;
    pass(`번개 생성 성공: ID=${meetupId}`);
    return meetupId || "";
  } else {
    fail(`번개 생성 실패: ${r.status} — ${JSON.stringify(r.data)}`);
    return "";
  }
}

// ──────────────────────────────────────────────
// 테스트 5: 번개 신청
// ──────────────────────────────────────────────
async function testApplyMeetup(meetupId: string, cookie: string) {
  section("5. 번개 신청 (즉시 확정)");
  if (!meetupId) { fail("번개 ID 없음"); return; }
  if (!cookie) { fail("쿠키 없음"); return; }

  // 다른 계정으로 신청 (신규 계정 생성)
  const email2 = `apply_${Date.now()}@pblsys.test`;
  await apiCall("/api/auth/signup", "POST", {
    name: "신청자", email: email2, phone: "", password: "apply1234!",
  });
  const loginR = await apiCall("/api/auth/login", "POST", { email: email2, password: "apply1234!" });
  const cookie2 = loginR.headers["set-cookie"] || "";

  const r = await apiCall(`/api/meetups/${meetupId}/apply`, "POST", {}, cookie2);
  if (r.status === 200) {
    pass(`번개 신청 성공: ${JSON.stringify(r.data)}`);
  } else if (r.status === 400 && r.data?.error?.includes("이미 신청")) {
    pass("중복 신청 차단 정상 동작");
  } else {
    fail(`번개 신청 실패: ${r.status} — ${JSON.stringify(r.data)}`);
  }

  // 번개 취소
  const cancelR = await apiCall(`/api/meetups/${meetupId}/apply`, "DELETE", undefined, cookie2);
  if (cancelR.status === 200) {
    pass(`번개 취소 성공`);
  } else {
    fail(`번개 취소 실패: ${cancelR.status} — ${JSON.stringify(cancelR.data)}`);
  }

  // 번개 재신청
  const reapplyR = await apiCall(`/api/meetups/${meetupId}/apply`, "POST", {}, cookie2);
  if (reapplyR.status === 200) {
    pass(`번개 재신청 성공`);
  } else {
    fail(`번개 재신청 실패: ${reapplyR.status} — ${JSON.stringify(reapplyR.data)}`);
  }

  // 번개 상세 확인
  const detail = await apiCall(`/api/meetups/${meetupId}`);
  if (detail.status === 200) {
    const p = detail.data?.participants?.length ?? 0;
    pass(`번개 상세 조회 OK, 참여자 ${p}명`);
  } else {
    fail(`번개 상세 조회 실패: ${detail.status}`);
  }
}

// ──────────────────────────────────────────────
// 테스트 6: /api/auth/me (인증 상태)
// ──────────────────────────────────────────────
async function testAuthMe(cookie: string) {
  section("6. Auth 세션 확인 (/api/auth/me)");
  if (!cookie) { fail("쿠키 없음"); return; }
  const r = await apiCall("/api/auth/me", "GET", undefined, cookie);
  if (r.status === 200 && r.data?.user) {
    pass(`세션 OK: ${r.data.user.name} (${r.data.user.email})`);
  } else {
    fail(`세션 확인 실패: ${r.status} — ${JSON.stringify(r.data)}`);
  }
}

// ──────────────────────────────────────────────
// 메인
// ──────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  PBL.SYS E2E 플로우 테스트");
  console.log(`  대상: ${BASE_URL}`);
  console.log("═══════════════════════════════════════");

  const supabaseOK = await testSupabaseConnection();
  if (!supabaseOK) {
    console.log("\n⛔ Supabase 미연결 — JSON 파일 폴더백으로 테스트 계속 진행\n");
  }

  const signupCookie = await testSignup();
  const loginCookie = await testLogin();
  const cookie = loginCookie || signupCookie;

  await testAuthMe(cookie);
  const meetupId = await testCreateMeetup(cookie);
  await testApplyMeetup(meetupId, cookie);

  console.log("\n═══════════════════════════════════════");
  console.log("  테스트 완료");
  console.log("═══════════════════════════════════════\n");
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
