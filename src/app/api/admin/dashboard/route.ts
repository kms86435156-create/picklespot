export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTournaments, getVenues, getClubs, getMeetups, getBookingRequests, readJSON } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const [tournaments, venues, clubs, meetups, bookingRequests, leads, registrations] = await Promise.all([
    getTournaments(),
    getVenues(),
    getClubs(),
    getMeetups(),
    getBookingRequests(),
    Promise.resolve(readJSON("leads.json")),
    Promise.resolve(readJSON("registrations.json")),
  ]);

  // 최근 활동: 각 엔티티에서 createdAt/updatedAt 기준 최근 항목 수집
  const recentActivity: { type: string; label: string; name: string; date: string; id: string }[] = [];

  for (const t of tournaments) {
    recentActivity.push({
      type: "tournament",
      label: "대회",
      name: t.title || "(제목 없음)",
      date: t.updatedAt || t.createdAt || "",
      id: t.id,
    });
  }
  for (const v of venues) {
    recentActivity.push({
      type: "venue",
      label: "피클볼장",
      name: v.name || "(이름 없음)",
      date: v.updatedAt || v.createdAt || "",
      id: v.id,
    });
  }
  for (const c of clubs) {
    recentActivity.push({
      type: "club",
      label: "동호회",
      name: c.name || "(이름 없음)",
      date: c.updatedAt || c.createdAt || "",
      id: c.id,
    });
  }
  for (const r of registrations) {
    recentActivity.push({
      type: "registration",
      label: "등록 요청",
      name: r.playerName || r.teamName || "(이름 없음)",
      date: r.updatedAt || r.createdAt || "",
      id: r.id,
    });
  }

  // 최신순 정렬 후 5개
  recentActivity.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const recent = recentActivity.slice(0, 5);

  return NextResponse.json({
    stats: {
      tournaments: {
        total: tournaments.length,
        open: tournaments.filter((t: any) => t.status === "open").length,
        closed: tournaments.filter((t: any) => t.status === "closed").length,
      },
      venues: { total: venues.length },
      clubs: { total: clubs.length },
      registrations: {
        total: registrations.length,
        pending: registrations.filter((r: any) => r.status === "pending").length,
      },
      meetups: { total: meetups.length, open: meetups.filter((m: any) => m.status === "open").length },
      bookingRequests: { total: bookingRequests.length, pending: bookingRequests.filter((r: any) => r.status === "pending").length },
      leads: { total: leads.length, new: leads.filter((l: any) => l.status === "new").length },
    },
    recentActivity: recent,
  });
}
