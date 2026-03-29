import { getCoaches } from "@/lib/db";
import LessonsContent from "@/components/lessons/LessonsContent";

export const metadata = { title: "레슨 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const coaches = await getCoaches();
  return <LessonsContent coaches={coaches} />;
}
