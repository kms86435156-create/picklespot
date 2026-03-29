import { getHomeStats, getFeaturedTournaments, getFeaturedVenues, getFeaturedFlashGames, getDataMeta } from "@/lib/db";
import HomeContent from "@/components/home/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const stats = await getHomeStats();
  const tournaments = await getFeaturedTournaments(4);
  const venues = await getFeaturedVenues(3);
  const flashGames = await getFeaturedFlashGames(4);
  const dataMeta = getDataMeta();

  return <HomeContent stats={stats} tournaments={tournaments} venues={venues} flashGames={flashGames} dataMeta={dataMeta} />;
}
