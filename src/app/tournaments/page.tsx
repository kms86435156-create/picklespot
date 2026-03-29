import { getTournaments } from "@/lib/db";
import TournamentsContent from "@/components/tournaments/TournamentsContent";

export const metadata = { title: "대회 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  return <TournamentsContent tournaments={tournaments} />;
}
