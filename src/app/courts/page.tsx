import { getVenues } from "@/lib/db";
import CourtsContent from "@/components/courts/CourtsContent";

export const metadata = { title: "코트 예약 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function CourtsPage() {
  const venues = await getVenues();
  return <CourtsContent venues={venues} />;
}
