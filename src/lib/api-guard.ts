import "server-only";
import { NextResponse } from "next/server";
import { isDemoMode } from "./supabase";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ═══ 데모 모드 가드 ═══
export function demoModeGuard() {
  if (isDemoMode) {
    return NextResponse.json(
      {
        error: "demo_mode",
        message: "데모 환경이라 저장되지 않습니다. Supabase를 연결하면 실제 저장이 가능합니다.",
        isDemoMode: true,
      },
      { status: 503 }
    );
  }
  return null;
}

// ═══ Admin 권한 가드 ═══
// - Authorization: Bearer <token> 헤더만 허용 (URL 쿼리 토큰 금지)
// - production에서 ADMIN_API_TOKEN 미설정 시 fail-closed (모든 요청 차단)
// - development에서 ADMIN_API_TOKEN 미설정 시 허용

export function adminGuard(request: Request) {
  const adminToken = process.env.ADMIN_API_TOKEN;

  // production에서 ADMIN_API_TOKEN 미설정 → fail-closed
  if (IS_PRODUCTION && !adminToken) {
    return NextResponse.json(
      { error: "misconfigured", message: "서버 설정 오류: ADMIN_API_TOKEN이 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  // development에서 ADMIN_API_TOKEN 미설정 → 허용 (개발 편의)
  if (!adminToken) return null;

  // Authorization: Bearer <token> 헤더에서만 토큰 추출
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token !== adminToken) {
    return NextResponse.json(
      { error: "unauthorized", message: "관리자 권한이 필요합니다." },
      { status: 401 }
    );
  }

  return null;
}
