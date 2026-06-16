import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);
const COOKIE_NAME = "admin_token";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin 경로만 보호
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // /admin/login과 /api/admin/auth/*는 통과
  if (
    PUBLIC_ADMIN_PATHS.some(p => pathname === p) ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  // JWT 쿠키 검증
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return redirectOrUnauth(req);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return redirectOrUnauth(req);
    }
    return NextResponse.next();
  } catch {
    // 만료 또는 변조된 토큰 → 쿠키 제거
    const res = redirectOrUnauth(req);
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
  }
}

function redirectOrUnauth(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API 요청은 JSON 401 응답
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "unauthorized", message: "관리자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 페이지 요청은 로그인으로 리다이렉트
  const loginUrl = new URL("/admin/login", req.url);
  if (pathname !== "/admin/login") {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
