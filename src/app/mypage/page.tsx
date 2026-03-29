import { getCurrentUser } from "@/lib/db";
import { getDataMeta } from "@/lib/db";
import MyPageContent from "@/components/mypage/MyPageContent";

export const metadata = { title: "마이페이지 - PBL.SYS" };
export const dynamic = "force-dynamic";

export default async function MyPage() {
  const user = getCurrentUser();
  const dataMeta = getDataMeta();
  return <MyPageContent user={user} dataMeta={dataMeta} />;
}
