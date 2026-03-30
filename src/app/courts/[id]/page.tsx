import { notFound } from "next/navigation";
import { getVenue, getTournaments } from "@/lib/db";
import VenueDetailPage from "@/components/venues/VenueDetailPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const v = await getVenue(params.id);
  if (!v) return { title: "피클볼장 - PBL.SYS" };
  const title = `${v.name} - 피클볼장 정보 - PBL.SYS`;
  const description = `${v.roadAddress || v.address || v.region} · ${v.indoorOutdoor || "실내"} · 코트 ${v.courtCount || "?"}면 · ${v.operatingHours || "운영시간 확인필요"}`;
  return { title, description, openGraph: { title, description } };
}

export default async function Page({ params }: { params: { id: string } }) {
  const venue = await getVenue(params.id);
  if (!venue) notFound();
  const allTournaments = await getTournaments();
  const nearbyTournaments = allTournaments
    .filter(t => t.region === venue.region && t.status !== "completed" && t.status !== "cancelled")
    .slice(0, 3);
  return <VenueDetailPage venue={venue} nearbyTournaments={nearbyTournaments} />;
}
