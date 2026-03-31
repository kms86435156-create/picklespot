export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/db";

const FILE = "content-requests.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const type = searchParams.get("type") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  let items = readJSON(FILE);

  if (status) items = items.filter((r: any) => r.status === status);
  if (type) items = items.filter((r: any) => r.type === type);

  items.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const paged = items.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ items: paged, pagination: { page, limit, total, totalPages } });
}
