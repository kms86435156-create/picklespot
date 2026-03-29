import { getFlashGames, getPartnerPosts } from "@/lib/db";
import PlayTogetherContent from "@/components/play-together/PlayTogetherContent";

export const metadata = { title: "같이치기 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function PlayTogetherPage() {
  const flashGames = await getFlashGames();
  const partnerPosts = await getPartnerPosts();
  return <PlayTogetherContent flashGames={flashGames} partnerPosts={partnerPosts} />;
}
