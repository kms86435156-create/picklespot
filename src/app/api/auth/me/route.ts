export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { findUserById } from "@/lib/users";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Fetch full user profile for enriched data
  const fullUser = await findUserById(session.id);
  if (!fullUser) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      phone: fullUser.phone,
      role: fullUser.role,
      region: fullUser.region,
      skillLevel: fullUser.skillLevel || "",
      preferredTimes: fullUser.preferredTimes || "",
      playStyle: fullUser.playStyle || "",
      onboardingCompleted: fullUser.onboardingCompleted ?? false,
      clubName: fullUser.clubName || "",
      createdAt: fullUser.createdAt,
    },
  });
}
