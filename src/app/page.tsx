import { getClubs, getTournaments, getVenues } from "@/lib/db";
import HomePage from "@/components/home/HomePage";

export const dynamic = "force-dynamic";

function daysUntil(d: string) { return d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : 999; }

export default async function Page() {
  const [allTournaments, allVenues, clubs] = await Promise.all([
    getTournaments(),
    getVenues(),
    getClubs(),
  ]);

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  // Featured (fallback: featured가 없으면 접수중인 최신 대회)
  let featuredTournaments = allTournaments
    .filter((t: any) => t.isFeatured && t.status !== "completed" && t.status !== "cancelled")
    .slice(0, 3);
  if (featuredTournaments.length === 0) {
    featuredTournaments = allTournaments
      .filter((t: any) => t.status === "open")
      .sort((a: any, b: any) => (b.startDate || "").localeCompare(a.startDate || ""))
      .slice(0, 3);
  }

  // 이번 달 대회
  const thisMonthTournaments = allTournaments
    .filter((t: any) => {
      if (!t.startDate) return false;
      const d = new Date(t.startDate);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear && t.status !== "cancelled";
    })
    .sort((a: any, b: any) => (a.startDate || "").localeCompare(b.startDate || ""))
    .slice(0, 6);

  // 마감 임박 (7일 이내)
  const closingSoon = allTournaments
    .filter((t: any) => {
      const dl = daysUntil(t.registrationDeadline || t.startDate);
      return dl > 0 && dl <= 7 && t.status !== "closed" && t.status !== "completed" && t.status !== "cancelled";
    })
    .sort((a: any, b: any) => daysUntil(a.registrationDeadline || a.startDate) - daysUntil(b.registrationDeadline || b.startDate))
    .slice(0, 4);

  // 지역별 장소 카운트
  const regionVenueCounts: Record<string, number> = {};
  allVenues.forEach((v: any) => { if (v.region) regionVenueCounts[v.region] = (regionVenueCounts[v.region] || 0) + 1; });
  const topRegions = Object.entries(regionVenueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([region, count]) => ({ region, count }));

  // 추천 장소 (fallback: 코트 많은 순)
  let featuredVenues = allVenues.filter((v: any) => v.isFeatured).slice(0, 4);
  if (featuredVenues.length === 0) {
    featuredVenues = [...allVenues].sort((a: any, b: any) => (b.courtCount || 0) - (a.courtCount || 0)).slice(0, 4);
  }

  // 추천 동호회 (fallback: 회원 많은 순)
  let featuredClubs = clubs.filter((c: any) => c.isFeatured).slice(0, 6);
  if (featuredClubs.length === 0) {
    featuredClubs = clubs.filter((c: any) => c.isRecruiting).sort((a: any, b: any) => (b.memberCount || 0) - (a.memberCount || 0)).slice(0, 6);
  }

  // 접수중 대회 수
  const openCount = allTournaments.filter((t: any) => t.status === "open" || (t.status === "draft" && daysUntil(t.registrationDeadline || t.startDate) > 0)).length;

  return (
    <HomePage
      featuredTournaments={featuredTournaments}
      thisMonthTournaments={thisMonthTournaments}
      closingSoon={closingSoon}
      featuredVenues={featuredVenues}
      topRegions={topRegions}
      featuredClubs={featuredClubs}
      totalTournaments={allTournaments.length}
      totalVenues={allVenues.length}
      totalClubs={clubs.length}
      openCount={openCount}
      thisMonth={thisMonth}
    />
  );
}
