import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Production에서 Supabase 미설정 시 경고
if (IS_PRODUCTION && !supabaseUrl) {
  console.error("⚠️  CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set in production. Data will NOT persist.");
}

// Service Role — admin/write 전용
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

// Anon — public read 전용
export const supabasePublic: SupabaseClient | null =
  supabaseUrl && anonKey
    ? createClient(supabaseUrl, anonKey)
    : null;

// 기본 클라이언트
export const supabase = supabaseAdmin || supabasePublic;

export const isSupabaseEnabled = !!supabase;
export const isDemoMode = !isSupabaseEnabled;

// Production에서는 fallback 사용 시 명확히 표시
export const isProductionFallback = IS_PRODUCTION && !isSupabaseEnabled;

export function getSupabaseStatus() {
  return {
    hasUrl: !!supabaseUrl,
    hasServiceRoleKey: !!serviceRoleKey,
    hasAnonKey: !!anonKey,
    adminEnabled: !!supabaseAdmin,
    publicEnabled: !!supabasePublic,
    isEnabled: isSupabaseEnabled,
    isDemoMode,
    isProduction: IS_PRODUCTION,
    isProductionFallback,
  };
}
