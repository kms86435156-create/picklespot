export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { updateUser } from "@/lib/users";

const ALLOWED_FIELDS = new Set([
  "name", "phone", "region", "skillLevel", "preferredTimes",
  "playStyle", "onboardingCompleted", "clubName", "organizerNote",
]);

export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();

  // Filter to only allowed fields
  const updates: Record<string, any> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(k)) updates[k] = v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
  }

  try {
    const updated = await updateUser(session.id, updates);
    if (!updated) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        role: updated.role,
        region: updated.region,
        skillLevel: updated.skillLevel || "",
        preferredTimes: updated.preferredTimes || "",
        playStyle: updated.playStyle || "",
        onboardingCompleted: updated.onboardingCompleted ?? false,
        clubName: updated.clubName || "",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "프로필 수정에 실패했습니다." }, { status: 500 });
  }
}
