import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ═══ Supabase 클라이언트 분리 ═══
//
// 1. supabaseAdmin (service role)
//    - admin write API, migration, privileged server action 전용
//    - RLS bypass, 모든 테이블 full access
//    - 절대 클라이언트에 노출 금지 ("server-only" import)
//
// 2. supabasePublic (anon key)
//    - public read, user-scoped read/write
//    - RLS 적용됨
//    - 향후 사용자 인증 + RLS 도입 시 이 클라이언트 사용
//
// 3. supabase (호환용 alias)
//    - 기존 db.ts에서 사용하는 기본 클라이언트
//    - admin이면 admin, 없으면 public, 둘 다 없으면 null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Service Role 클라이언트 — admin/migration/privileged 전용
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

// Anon 클라이언트 — public read, user-scoped 전용
export const supabasePublic: SupabaseClient | null =
  supabaseUrl && anonKey
    ? createClient(supabaseUrl, anonKey)
    : null;

// 호환용 기본 클라이언트: admin > public > null
export const supabase = supabaseAdmin || supabasePublic;

export const isSupabaseEnabled = !!supabase;
export const isDemoMode = !isSupabaseEnabled;

// 연결 진단
export function getSupabaseStatus() {
  return {
    hasUrl: !!supabaseUrl,
    hasServiceRoleKey: !!serviceRoleKey,
    hasAnonKey: !!anonKey,
    adminEnabled: !!supabaseAdmin,
    publicEnabled: !!supabasePublic,
    isEnabled: isSupabaseEnabled,
    isDemoMode,
  };
}
