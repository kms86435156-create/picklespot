import { getMeetups } from "@/lib/db";
import MeetupsPage from "@/components/meetups/MeetupsPage";

export const metadata = { title: "같이치기 - PBL.SYS", description: "피클볼 번개 모임을 찾고, 직접 만들어보세요." };
export const dynamic = "force-dynamic";

export default async function PlayTogetherPage() {
  const meetups = await getMeetups();
  return <MeetupsPage meetups={meetups} />;
}
