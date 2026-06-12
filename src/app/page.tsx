import { getClubs, getVenues } from "@/lib/db";
import HomePage from "@/components/home/HomePage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [allVenues, clubs] = await Promise.all([
    getVenues(),
    getClubs(),
  ]);

  // 지역별 장소 카운트
  const regionVenueCounts: Record<string, number> = {};
  allVenues.forEach((v: any) => {
    if (v.region) regionVenueCounts[v.region] = (regionVenueCounts[v.region] || 0) + 1;
  });
  const topRegions = Object.entries(regionVenueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([region, count]) => ({ region, count }));

  // 추천 장소 (코트 많은 순)
  const featuredVenues = [...allVenues]
    .sort((a: any, b: any) => (b.courtCount || 0) - (a.courtCount || 0))
    .slice(0, 4);

  // 초보 환영 동호회 우선
  const beginnerClubs = clubs
    .filter((c: any) => c.isBeginnerWelcome || c.isRecruiting)
    .sort((a: any, b: any) => (b.memberCount || 0) - (a.memberCount || 0))
    .slice(0, 6);

  return (
    <HomePage
      featuredVenues={featuredVenues}
      topRegions={topRegions}
      beginnerClubs={beginnerClubs}
      totalVenues={allVenues.length}
      totalClubs={clubs.length}
    />
  );
}
