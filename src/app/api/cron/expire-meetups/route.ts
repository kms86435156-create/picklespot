export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMeetups, updateEntity } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Vercel Cron 인증 (프로덕션)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const allMeetups = await getMeetups();
  let expiredCount = 0;

  for (const m of allMeetups) {
    // 날짜가 지났고 아직 open 상태인 번개만 만료 처리
    if (m.date < today && m.status === "open") {
      updateEntity("meetups.json", m.id, {
        status: "expired",
        updatedAt: new Date().toISOString(),
      });
      expiredCount++;
    }
  }

  console.log(`[cron] expire-meetups: ${expiredCount}개 만료 처리 (기준일: ${today})`);
  return NextResponse.json({ success: true, expiredCount, date: today });
}
