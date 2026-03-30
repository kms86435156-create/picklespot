import { NextResponse } from "next/server";
import { isSupabaseEnabled, isDemoMode, supabaseAdmin, supabasePublic, getSupabaseStatus } from "@/lib/supabase";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export async function GET() {
  const sb = getSupabaseStatus();

  const checks: Record<string, any> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    storage: isSupabaseEnabled ? "supabase" : "json_fallback",
    isDemoMode,
    isProductionFallback: sb.isProductionFallback,
    supabase: {
      enabled: sb.isEnabled,
      admin: sb.adminEnabled,
      public: sb.publicEnabled,
    },
    auth: {
      adminBasicAuth: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
    },
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: sb.hasUrl,
      SUPABASE_SERVICE_ROLE_KEY: sb.hasServiceRoleKey,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: sb.hasAnonKey,
      ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    },
    issues: [] as string[],
  };

  // Production 필수 체크
  if (IS_PRODUCTION) {
    if (!sb.isEnabled) checks.issues.push("CRITICAL: Supabase 미연결 — 데이터가 영속되지 않습니다");
    if (!sb.adminEnabled) checks.issues.push("WARNING: Supabase admin client 없음 — write 불가");
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      checks.issues.push("CRITICAL: ADMIN 인증 미설정 — 관리자 페이지 무방비");
    }
  }

  // Supabase 연결 테스트
  const testClient = supabaseAdmin || supabasePublic;
  if (testClient) {
    try {
      const { count, error } = await testClient.from("tournaments").select("*", { count: "exact", head: true });
      checks.supabase.connected = !error;
      checks.supabase.tournamentCount = count ?? 0;
      if (error) checks.supabase.error = error.message;
    } catch (e: any) {
      checks.supabase.connected = false;
      checks.supabase.error = e.message;
    }
  } else {
    checks.supabase.connected = false;
  }

  // 최종 상태 판정
  if (checks.issues.some((i: string) => i.startsWith("CRITICAL"))) {
    checks.status = IS_PRODUCTION ? "error" : "warning";
  } else if (checks.issues.length > 0) {
    checks.status = "warning";
  }

  const httpStatus = checks.status === "error" ? 503 : 200;
  return NextResponse.json(checks, { status: httpStatus });
}
