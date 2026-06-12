import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * DB 모드 결정 로직
 * 우선순위: SUPABASE_DISABLED=true → JSON 강제
 *          SUPABASE_DISABLED 미설정 + URL/KEY 존재 → Supabase 시도
 *          URL/KEY 없음 → JSON 강제
 *
 * 환경변수 가이드:
 *  SUPABASE_DISABLED=true   → JSON 파일 모드 (로컬 개발용)
 *  SUPABASE_DISABLED=false  → Supabase 모드 (기본값)
 *  (미설정)                 → Supabase 시도, KEY 없으면 JSON
 */
const FORCE_JSON_MODE = process.env.SUPABASE_DISABLED === "true";

if (IS_PRODUCTION && !supabaseUrl && !FORCE_JSON_MODE) {
  console.error("⚠️  CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set in production.");
}

if (FORCE_JSON_MODE) {
  console.log("[DB] SUPABASE_DISABLED=true → JSON 파일 모드");
} else if (supabaseUrl) {
  console.log(`[DB] Supabase 모드 → ${supabaseUrl}`);
} else {
  console.log("[DB] Supabase URL 없음 → JSON 파일 모드");
}

// Service Role — admin/write 전용
export const supabaseAdmin: SupabaseClient | null =
  !FORCE_JSON_MODE && supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

// Anon — public read 전용
export const supabasePublic: SupabaseClient | null =
  !FORCE_JSON_MODE && supabaseUrl && anonKey
    ? createClient(supabaseUrl, anonKey)
    : null;

export const supabase = supabaseAdmin || supabasePublic;
export const isSupabaseEnabled = !!supabase;
export const isDemoMode = !isSupabaseEnabled;
export const isProductionFallback = IS_PRODUCTION && !isSupabaseEnabled;

export function getSupabaseStatus() {
  return {
    mode: FORCE_JSON_MODE ? "json_forced" : isSupabaseEnabled ? "supabase" : "json_no_url",
    hasUrl: !!supabaseUrl,
    hasServiceRoleKey: !!serviceRoleKey,
    hasAnonKey: !!anonKey,
    adminEnabled: !!supabaseAdmin,
    publicEnabled: !!supabasePublic,
    isEnabled: isSupabaseEnabled,
    isDemoMode,
    isProduction: IS_PRODUCTION,
    isProductionFallback,
    forceJsonMode: FORCE_JSON_MODE,
  };
}
