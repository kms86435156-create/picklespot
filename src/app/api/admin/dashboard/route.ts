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

  return NextResponse.json({
    tournaments: { total: tournaments.length, open: tournaments.filter((t: any) => t.status === "open").length, featured: tournaments.filter((t: any) => t.isFeatured).length },
    venues: { total: venues.length, featured: venues.filter((v: any) => v.isFeatured).length },
    clubs: { total: clubs.length, recruiting: clubs.filter((c: any) => c.isRecruiting).length },
    meetups: { total: meetups.length, open: meetups.filter((m: any) => m.status === "open").length },
    bookingRequests: { total: bookingRequests.length, pending: bookingRequests.filter((r: any) => r.status === "pending").length },
    leads: { total: leads.length, new: leads.filter((l: any) => l.status === "new").length },
    registrations: { total: registrations.length, pending: registrations.filter((r: any) => r.status === "pending").length },
  });
}
