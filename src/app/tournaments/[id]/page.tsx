import { notFound } from "next/navigation";
import { getTournament } from "@/lib/db";
import TournamentDetailContent from "@/components/tournaments/TournamentDetailContent";

export const metadata = { title: "대회 상세 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const tournament = await getTournament(params.id);
  if (!tournament) notFound();
  return <TournamentDetailContent tournament={tournament} />;
}
