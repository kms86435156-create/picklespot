import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USERNAME || "";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "";

export function middleware(req: NextRequest) {
  // Only protect admin routes
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // If no credentials configured, allow access (dev mode)
  if (!ADMIN_USER || !ADMIN_PASS) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="PBL.SYS Admin"' },
    });
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const [user, pass] = decoded.split(":");

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="PBL.SYS Admin"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
