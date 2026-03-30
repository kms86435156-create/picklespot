/**
 * Admin authentication — Basic Auth via environment variables
 *
 * Set in .env:
 *   ADMIN_USERNAME=admin
 *   ADMIN_PASSWORD=your-secure-password
 *
 * If not set, admin access is open (dev mode).
 */
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USERNAME || "";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "";

export function isAdminAuthEnabled() {
  return !!(ADMIN_USER && ADMIN_PASS);
}

export function checkAdminAuth(req: NextRequest): NextResponse | null {
  if (!isAdminAuthEnabled()) return null; // No auth configured — allow

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="PBL.SYS Admin"' },
    });
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const [user, pass] = decoded.split(":");

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="PBL.SYS Admin"' },
    });
  }

  return null; // Auth passed
}
