import { MetadataRoute } from "next";
import { getTournaments, getVenues, getClubs } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pickleball-platform.vercel.app";

  const [tournaments, venues, clubs] = await Promise.all([
    getTournaments(),
    getVenues(),
    getClubs(),
  ]);

  const staticPages = [
    { url: base, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${base}/tournaments`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/courts`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/clubs`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/for-clubs`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/guides/tournament-guide`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${base}/guides/venue-guide`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${base}/guides/organizer-guide`, changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const tournamentPages = tournaments.map((t: any) => ({
    url: `${base}/tournaments/${t.id}`,
    lastModified: t.updatedAt || t.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const venuePages = venues.map((v: any) => ({
    url: `${base}/courts/${v.id}`,
    lastModified: v.updatedAt || v.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const clubPages = clubs.map((c: any) => ({
    url: `${base}/clubs/${c.id}`,
    lastModified: c.updatedAt || c.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...tournamentPages, ...venuePages, ...clubPages];
}
