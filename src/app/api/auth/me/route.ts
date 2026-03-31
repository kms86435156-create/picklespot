export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: session.id, email: session.email, name: session.name, role: session.role },
  });
}
