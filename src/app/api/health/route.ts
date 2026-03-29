import { NextResponse } from "next/server";
import { isSupabaseEnabled, isDemoMode, supabaseAdmin, supabasePublic, getSupabaseStatus } from "@/lib/supabase";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export async function GET() {
  const sbStatus = getSupabaseStatus();

  const checks: Record<string, any> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    storage: isSupabaseEnabled ? "supabase" : "json_fallback",
    isDemoMode,
    writeEnabled: !isDemoMode,
    supabaseClients: {
      admin: sbStatus.adminEnabled,
      public: sbStatus.publicEnabled,
    },
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: sbStatus.hasUrl,
      SUPABASE_SERVICE_ROLE_KEY: sbStatus.hasServiceRoleKey,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: sbStatus.hasAnonKey,
      ADMIN_API_TOKEN: !!process.env.ADMIN_API_TOKEN,
    },
    misconfigured: [] as string[],
  };

  // Misconfiguration 체크
  if (IS_PRODUCTION && !process.env.ADMIN_API_TOKEN) {
    checks.misconfigured.push("ADMIN_API_TOKEN 미설정 — 관리자 API가 모든 요청을 차단합니다");
  }
  if (IS_PRODUCTION && isDemoMode) {
    checks.misconfigured.push("Supabase 미연결 — write API가 비활성화됩니다");
  }

  // Supabase 연결 테스트
  const testClient = supabaseAdmin || supabasePublic;
  if (testClient) {
    try {
      const { count, error } = await testClient.from("venues").select("*", { count: "exact", head: true });
      checks.supabase = { connected: !error, venueCount: count ?? 0, error: error?.message || null };
    } catch (e: any) {
      checks.supabase = { connected: false, error: e.message };
    }
  } else {
    checks.supabase = { connected: false, reason: "no client" };
  }

  if (checks.misconfigured.length > 0) checks.status = "misconfigured";
  if (IS_PRODUCTION && !checks.supabase?.connected) checks.status = "degraded";

  return NextResponse.json(checks, { status: checks.status === "ok" ? 200 : 503 });
}
