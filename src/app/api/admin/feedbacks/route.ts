export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { listFeedbacks } from "@/lib/feedbacks";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const result = await listFeedbacks({ category, status, keyword, page, limit });
  return NextResponse.json(result);
}
