"use client";

import { motion } from "framer-motion";
import { useTilt } from "@/hooks/useTilt";
import SystemLabel from "@/components/ui/SystemLabel";
import TechCorners from "@/components/ui/TechCorners";

interface ProblemCardProps {
  code: string;
  tag: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
  index: number;
}

function ProblemCard({ code, tag, title, description, stats, index }: ProblemCardProps) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-ui-bg backdrop-blur-md border border-ui-border rounded-sm p-6 card-grid-bg group transition-all duration-300 hover:border-brand-red/50 h-full"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
      >
        <TechCorners />
        {/* Scanline on hover */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 w-full h-12 bg-gradient-to-b from-brand-red/10 to-transparent animate-scanline" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] text-brand-red tracking-widest">{code}</span>
          <span className="text-text-muted text-[10px] font-mono">/</span>
          <span className="font-mono text-[10px] text-text-muted tracking-widest">{tag}</span>
        </div>
        <h3 className="text-base font-bold mb-3 leading-snug">{title}</h3>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">{description}</p>

        <div className={`${stats.length === 1 ? "flex justify-center" : "grid grid-cols-2 gap-4"}`}>
          {stats.map((s, i) => (
            <div key={i} className={`border-l-2 border-brand-red/40 pl-3 ${stats.length === 1 ? "text-center border-l-0 border-t-2 border-brand-red/40 pt-3 pl-0" : ""}`}>
              <div className={`font-black font-mono text-brand-red ${stats.length === 1 ? "text-4xl" : "text-2xl"}`}>
                {s.value}
              </div>
              <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const problems: ProblemCardProps[] = [
  {
    code: "ERR_01",
    tag: "CHANNELS.SCATTERED",
    title: "대회 정보, 아직도 카페 3~4개를 돌아다니며 찾고 계신가요?",
    description:
      "전국에서 열리는 피클볼 대회 정보는 네이버 카페, 블로그, 단톡방에 흩어져 있습니다.",
    stats: [
      { value: "67%", label: "접수 마감 놓침" },
      { value: "4.2개", label: "평균 확인 채널 수" },
    ],
    index: 0,
  },
  {
    code: "ERR_02",
    tag: "PROCESS.MANUAL",
    title: "접수는 전화, 결제는 계좌이체 — 2026년에도요?",
    description:
      "전화로 이름을 불러주고, 참가비를 계좌이체한 뒤, 입금 확인 문자를 기다리는 과정. 복식 파트너나 팀 접수라면 한 명씩 따로 연락해야 하죠.",
    stats: [
      { value: "25분", label: "접수 소요 시간" },
      { value: "1시간+", label: "팀 접수 시간" },
    ],
    index: 1,
  },
  {
    code: "ERR_03",
    tag: "DATA.NOT_FOUND",
    title: "내 전적과 부수, 어디에도 정리된 곳이 없다",
    description:
      "기억에 의존하거나 수첩에 적고 계신가요? 체계적인 기록 관리 없이는 실력 향상의 방향을 잡기 어렵습니다.",
    stats: [{ value: "78%", label: "정확한 전적 모름" }],
    index: 2,
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24 md:py-32 bg-dark overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 card-grid-bg" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-red/8 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <SystemLabel text="SYS_FAIL.DIAGNOSIS" color="red" />
          <h2 className="text-3xl md:text-4xl font-black mt-4">
            혹시 이런 경험, <span className="text-brand-red">있으신가요?</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <ProblemCard key={p.code} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
