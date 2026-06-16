import { getTournament, getRegistrations, getTournamentMatches } from "@/lib/db";
import TournamentDashboard from "@/components/tournaments/TournamentDashboard";
import { notFound } from "next/navigation";

export default async function ManageTournamentPage({ params }: { params: { id: string } }) {
  const tournament = await getTournament(params.id);
  if (!tournament) notFound();

  const registrations = await getRegistrations(params.id);
  const matches = await getTournamentMatches(params.id);

  return <TournamentDashboard initialTournament={tournament} initialRegistrations={registrations} initialMatches={matches} />;
}
