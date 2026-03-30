import { getVenues } from "@/lib/db";
import VenuesPage from "@/components/venues/VenuesPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전국 피클볼장 찾기 - 실내/실외 코트 정보 - PBL.SYS",
  description: "전국 피클볼장을 지역별로 검색하세요. 실내/실외, 코트 수, 운영시간, 주차 여부까지 한눈에 비교.",
  openGraph: {
    title: "전국 피클볼장 찾기 - PBL.SYS",
    description: "전국 피클볼장을 지역별로 검색하세요. 코트 수, 운영시간, 편의시설 정보 제공.",
  },
};
export const dynamic = "force-dynamic";

export default async function Page() {
  const venues = await getVenues();
  return <VenuesPage venues={venues} />;
}
