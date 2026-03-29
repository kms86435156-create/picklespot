"use client";

import { motion } from "framer-motion";
import { useTilt } from "@/hooks/useTilt";
import SystemLabel from "@/components/ui/SystemLabel";
import TechCorners from "@/components/ui/TechCorners";

interface TestimonialData {
  logId: string;
  quote: string;
  body: string;
  name: string;
  initial: string;
  org: string;
  exp: string;
}

const testimonials: TestimonialData[] = [
  {
    logId: "USR_01",
    quote: "접수하다 전화 끊기고, 입금 확인 안 돼서 새벽에 문자 보내던 시절이 있었죠.",
    body: "3년째 복식조를 꾸려 전국 대회를 다니는데, 예전엔 팀원 4명 접수하는 데만 하루가 걸렸어요. 지금은 링크 하나 보내면 10분 안에 접수 끝. 지난달에는 플랫폼에서 처음 본 대회를 발견해서 신청했는데, 우리 팀이 3위까지 했습니다. 전적 그래프 보면서 '우리 진짜 늘었네' 하고 웃은 게 제일 뿌듯해요.",
    name: "이정호",
    initial: "이",
    org: "ORG: 인천 청라 피클볼 동호회 '스매시' 팀장",
    exp: "EXP: 경력 4년",
  },
  {
    logId: "USR_02",
    quote: "50대 후반에 피클볼 시작했는데, 이 앱 아니었으면 진작 포기했을 거예요.",
    body: "처음엔 어디서 쳐야 하는지도 몰랐는데, 피클볼장 주소록으로 집에서 15분 거리에 코트가 3곳이나 있다는 걸 알았어요. 동호회 검색해서 가입하고, 초보 친선전에도 나가봤는데 같은 부수끼리 매칭돼서 부담이 없더라고요. 요즘은 매주 세 번은 치러 나갑니다. 부수가 D에서 C+로 올라간 게 눈에 보이니까 운동이 더 재밌어요.",
    name: "박미영",
    initial: "박",
    org: "LOC: 수원시 거주",
    exp: "EXP: 경력 1년 6개월",
  },
];

function TestimonialCard({ data, index }: { data: TestimonialData; index: number }) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(5);

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
        className="relative bg-ui-bg backdrop-blur-md border border-ui-border rounded-sm p-6 md:p-8 card-grid-bg group transition-all duration-300 hover:border-brand-cyan/50 h-full"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
      >
        <TechCorners />
        {/* Scanline on hover */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 w-full h-12 bg-gradient-to-b from-brand-cyan/5 to-transparent animate-scanline" />
        </div>

        {/* Big quote watermark */}
        <span className="absolute top-4 right-6 text-6xl md:text-8xl font-black text-white/[0.03] leading-none select-none pointer-events-none">
          &ldquo;
        </span>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] text-text-muted tracking-widest">
            LOG_ID: {data.logId}
          </span>
          <span className="font-mono text-[10px] text-brand-cyan/60 tracking-widest">
            VERIFIED_DATA
          </span>
        </div>

        {/* Quote */}
        <blockquote className="text-lg md:text-xl font-bold mb-4 leading-snug border-l-2 border-brand-cyan/40 pl-4">
          &ldquo;{data.quote}&rdquo;
        </blockquote>

        {/* Body */}
        <p className="text-sm text-text-muted leading-relaxed mb-6">{data.body}</p>

        {/* Profile */}
        <div className="flex items-center gap-3 pt-4 border-t border-ui-border">
          <div className="w-10 h-10 bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center clip-angled shrink-0">
            <span className="text-brand-cyan font-bold">{data.initial}</span>
          </div>
          <div>
            <div className="font-bold text-sm">{data.name}</div>
            <div className="text-[10px] font-mono text-text-muted">{data.org}</div>
            <div className="text-[10px] font-mono text-text-muted">{data.exp}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="relative py-24 md:py-32 bg-dark overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 card-grid-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SystemLabel text="SYS_USER.FIELD_REPORTS" color="cyan" />
            <h2 className="text-3xl md:text-4xl font-black mt-4">
              실제 사용자 <span className="text-brand-cyan">이야기</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 md:mt-0 flex items-center gap-2"
          >
            <span className="bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full font-mono text-[10px] text-brand-cyan tracking-widest">
              SYNCED_DB
            </span>
            <span className="font-mono text-xs text-text-muted">
              ENTRIES: <span className="text-brand-cyan">12,042</span>
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.logId} data={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
