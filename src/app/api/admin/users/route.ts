export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { listUsers } from "@/lib/users";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || undefined;
  const role = searchParams.get("role") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const result = await listUsers({ keyword, role, status, page, limit });
  return NextResponse.json(result);
}
