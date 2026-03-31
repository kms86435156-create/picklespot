export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readJSON } from "@/lib/db";

export async function GET() {
  const now = new Date().toISOString();
  const banners = readJSON("banners.json")
    .filter((b: any) => {
      if (!b.isActive) return false;
      if (b.startDate && b.startDate > now) return false;
      if (b.endDate && b.endDate < now) return false;
      return true;
    })
    .sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));
  return NextResponse.json(banners);
}
