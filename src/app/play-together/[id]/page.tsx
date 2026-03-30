import { notFound } from "next/navigation";
import { getMeetup, getMeetupParticipants } from "@/lib/db";
import MeetupDetailPage from "@/components/meetups/MeetupDetailPage";

export const metadata = { title: "번개 상세 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const meetup = await getMeetup(params.id);
  if (!meetup) notFound();
  const participants = await getMeetupParticipants(params.id);
  return <MeetupDetailPage meetup={meetup} participants={participants} />;
}
