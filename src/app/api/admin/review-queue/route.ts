export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  // Manual review queue — placeholder until DB is connected
  return NextResponse.json({ items: [] });
}
