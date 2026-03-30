import { getTournaments } from "@/lib/db";
import TournamentsPage from "@/components/tournaments/TournamentsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전국 피클볼 대회 일정 2026 - PBL.SYS",
  description: "전국 피클볼 대회 일정을 한눈에. 접수중인 대회를 찾고 바로 신청하세요. 지역별, 종별, 월별 검색 가능.",
  openGraph: {
    title: "전국 피클볼 대회 일정 2026 - PBL.SYS",
    description: "전국 피클볼 대회 일정을 한눈에. 접수중인 대회를 찾고 바로 신청하세요.",
  },
};
export const dynamic = "force-dynamic";

export default async function Page() {
  const tournaments = await getTournaments();
  return <TournamentsPage tournaments={tournaments} />;
}
