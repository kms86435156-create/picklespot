import { notFound } from "next/navigation";
import { getFlashGame } from "@/lib/db";
import FlashGameDetailContent from "@/components/play-together/FlashGameDetailContent";

export const metadata = { title: "번개 상세 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function FlashGameDetailPage({ params }: { params: { id: string } }) {
  const game = await getFlashGame(params.id);
  if (!game) notFound();
  return <FlashGameDetailContent game={game} />;
}
