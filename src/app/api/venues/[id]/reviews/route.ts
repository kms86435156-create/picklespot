export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readJSON, createEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** GET /api/venues/[id]/reviews */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const reviews = readJSON("venue-reviews.json")
    .filter((r: any) => r.venueId === params.id && !r.isDeleted)
    .sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const avgRating = reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length : 0;
  return NextResponse.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length });
}

/** POST /api/venues/[id]/reviews */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { rating, text } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "별점을 선택해주세요 (1~5)." }, { status: 400 });
  if (!text?.trim()) return NextResponse.json({ error: "후기를 작성해주세요." }, { status: 400 });

  // Check duplicate
  const existing = readJSON("venue-reviews.json").find((r: any) => r.venueId === params.id && r.authorId === session.id && !r.isDeleted);
  if (existing) return NextResponse.json({ error: "이미 후기를 작성하셨습니다." }, { status: 409 });

  const review = {
    id: `vr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    venueId: params.id,
    authorId: session.id,
    authorName: session.name,
    rating: Math.min(5, Math.max(1, rating)),
    text: text.trim(),
    isDeleted: false,
    createdAt: new Date().toISOString(),
  };
  createEntity("venue-reviews.json", review);
  return NextResponse.json({ success: true, review }, { status: 201 });
}
