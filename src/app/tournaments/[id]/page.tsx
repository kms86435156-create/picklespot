import { notFound } from "next/navigation";
import { getTournament, getTournaments, getVenues } from "@/lib/db";
import TournamentDetailPage from "@/components/tournaments/TournamentDetailPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const t = await getTournament(params.id);
  if (!t) return { title: "대회 - PBL.SYS" };
  const title = `${t.title} - PBL.SYS`;
  const description = `${t.startDate || "일정 미정"} · ${t.venueName || "장소 확인중"} · 참가비 ₩${(t.entryFee || 0).toLocaleString()} · ${t.eventTypes || "종별 확인중"}`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const tournament = await getTournament(params.id);
  if (!tournament) notFound();

  const [allTournaments, venues] = await Promise.all([getTournaments(), getVenues()]);
  const similar = allTournaments
    .filter(t => t.id !== tournament.id && (t.region === tournament.region || t.eventTypes === tournament.eventTypes) && t.status !== "completed" && t.status !== "cancelled")
    .slice(0, 3);
  const matchingVenue = venues.find((v: any) => tournament.venueName && v.name?.includes(tournament.venueName?.split(" ")[0]));

  return <TournamentDetailPage tournament={tournament} similarTournaments={similar} matchingVenue={matchingVenue} />;
}
