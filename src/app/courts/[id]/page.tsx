import { notFound } from "next/navigation";
import { getVenue } from "@/lib/db";
import CourtDetailContent from "@/components/courts/CourtDetailContent";

export const metadata = { title: "코트 상세 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function CourtDetailPage({ params }: { params: { id: string } }) {
  const venue = await getVenue(params.id);
  if (!venue) notFound();
  return <CourtDetailContent venue={venue} />;
}
