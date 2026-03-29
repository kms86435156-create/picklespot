"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import FilterBar from "@/components/ui/FilterBar";
import CoachCard from "./CoachCard";

const filters = [
  { key: "region", label: "지역", options: ["전체", "서울", "경기", "부산", "인천", "대전"] },
  { key: "specialty", label: "전문", options: ["전체", "기초", "서브", "복식 전략", "체력", "시니어"] },
  { key: "type", label: "방식", options: ["전체", "개인", "그룹"] },
];

export default function LessonsContent({ coaches }: { coaches: any[] }) {
  return (
    <div className="relative py-8 md:py-12">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          sysLabel="SYS.LESSON"
          title="코치 찾기 &"
          highlight="레슨 예약"
          subtitle="검증된 코치에게 체계적으로 배우세요"
        />

        <FilterBar filters={filters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <CoachCard coach={c} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
