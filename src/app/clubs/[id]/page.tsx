import { notFound } from "next/navigation";
import { getClub } from "@/lib/db";
import ClubDetailPage from "@/components/clubs/ClubDetailPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await getClub(params.id);
  if (!c) return { title: "동호회 - PBL.SYS" };
  const title = `${c.name} - 피클볼 동호회 - PBL.SYS`;
  const description = `${c.region} ${c.city || ""} · 회원 ${c.memberCount || "?"}명 · ${c.description?.slice(0, 80) || ""}`;
  return { title, description, openGraph: { title, description } };
}

export default async function Page({ params }: { params: { id: string } }) {
  const club = await getClub(params.id);
  if (!club) notFound();
  return <ClubDetailPage club={club} />;
}
