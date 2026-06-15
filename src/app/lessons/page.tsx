import LessonsPage from "@/components/lessons/LessonsPage";
import { readJSON } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "피클볼 레슨 찾기 - PBL.SYS",
  description: "입문자도 쉽게 시작할 수 있는 피클볼 레슨을 찾아보세요.",
};

export default function Page() {
  const lessons = readJSON("lessons.json");
  return <LessonsPage lessons={lessons} />;
}
