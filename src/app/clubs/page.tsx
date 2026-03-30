import { getClubs } from "@/lib/db";
import ClubsContent from "@/components/clubs/ClubsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "피클볼 동호회 찾기 - 전국 동호회 모집 정보 - PBL.SYS",
  description: "전국 피클볼 동호회를 찾아보세요. 지역별 동호회 검색, 모집중인 동호회 확인, 가입 방법 안내.",
  openGraph: {
    title: "피클볼 동호회 찾기 - PBL.SYS",
    description: "전국 피클볼 동호회 모집 정보를 한눈에.",
  },
};
export const dynamic = "force-dynamic";

export default async function Page() {
  const clubs = await getClubs();
  return <ClubsContent clubs={clubs} />;
}
