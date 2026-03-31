export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readJSON, createEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** GET /api/manner-ratings?userId=xxx — get user's manner stats */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId 필요" }, { status: 400 });

  const ratings = readJSON("manner-ratings.json").filter((r: any) => r.targetUserId === userId);
  const mannerRatings = ratings.filter((r: any) => r.type === "manner");
  const noshows = ratings.filter((r: any) => r.type === "noshow");

  const avgManner = mannerRatings.length > 0
    ? Math.round(mannerRatings.reduce((s: number, r: any) => s + (r.score || 0), 0) / mannerRatings.length * 10) / 10
    : 0;

  return NextResponse.json({
    mannerScore: avgManner,
    mannerCount: mannerRatings.length,
    noshowCount: noshows.length,
    hasWarning: noshows.length >= 3,
  });
}

/** POST /api/manner-ratings — submit manner rating or noshow report */
export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { targetUserId, type, score, meetupId, reason } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "대상 사용자를 지정해주세요." }, { status: 400 });
  if (targetUserId === session.id) return NextResponse.json({ error: "자신에게는 평가할 수 없습니다." }, { status: 400 });

  if (type === "manner") {
    if (!score || score < 1 || score > 5) return NextResponse.json({ error: "매너 점수를 선택해주세요 (1~5)." }, { status: 400 });

    // Check duplicate for same meetup
    const existing = readJSON("manner-ratings.json").find((r: any) =>
      r.fromUserId === session.id && r.targetUserId === targetUserId && r.meetupId === meetupId && r.type === "manner"
    );
    if (existing) return NextResponse.json({ error: "이미 평가하셨습니다." }, { status: 409 });

    createEntity("manner-ratings.json", {
      id: `mr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromUserId: session.id,
      fromUserName: session.name,
      targetUserId,
      type: "manner",
      score: Math.min(5, Math.max(1, score)),
      meetupId: meetupId || "",
      reason: "",
      createdAt: new Date().toISOString(),
    });
  } else if (type === "noshow") {
    createEntity("manner-ratings.json", {
      id: `mr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromUserId: session.id,
      fromUserName: session.name,
      targetUserId,
      type: "noshow",
      score: 0,
      meetupId: meetupId || "",
      reason: reason || "노쇼",
      createdAt: new Date().toISOString(),
    });
  } else {
    return NextResponse.json({ error: "type은 manner 또는 noshow여야 합니다." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
