"use client";

import { motion } from "framer-motion";
import { Search, BarChart3, ShoppingBag } from "lucide-react";
import SystemLabel from "@/components/ui/SystemLabel";
import TechCorners from "@/components/ui/TechCorners";
import MetricBox from "@/components/ui/MetricBox";

function MockTournamentFinder() {
  return (
    <div className="relative bg-ui-bg backdrop-blur-md border border-ui-border rounded-sm p-4 card-grid-bg">
      <TechCorners color="rgba(0,212,255,0.3)" />
      <div className="font-mono text-[10px] text-brand-cyan tracking-widest mb-3">
        TOURNAMENT.FINDER
      </div>
      {/* Search bar */}
      <div className="flex items-center gap-2 bg-dark/60 border border-ui-border rounded-sm px-3 py-2 mb-3">
        <Search className="w-3 h-3 text-text-muted" />
        <span className="text-xs text-text-muted font-mono">Search events...</span>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {["ALL EVENTS", "SINGLES", "DOUBLES"].map((tab, i) => (
          <span
            key={tab}
            className={`text-[10px] font-mono px-2 py-1 rounded-sm ${
              i === 0 ? "bg-brand-cyan/20 text-brand-cyan" : "text-text-muted"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      {/* Event list */}
      <div className="space-y-2">
        <div className="bg-dark/40 border border-ui-border rounded-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">National Open &apos;26</span>
            <button className="clip-angled-sm bg-brand-cyan text-dark text-[10px] font-bold px-2 py-0.5">
              JOIN
            </button>
          </div>
          <div className="text-[10px] font-mono text-text-muted">OCT 12-14 · Seoul · Singles/Doubles</div>
        </div>
        <div className="bg-dark/40 border border-ui-border rounded-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">Busan Cup</span>
            <span className="bg-brand-red/20 text-brand-red text-[10px] font-mono px-2 py-0.5 rounded-sm">
              FULL
            </span>
          </div>
          <div className="text-[10px] font-mono text-text-muted">NOV 02-03 · Busan · Doubles</div>
        </div>
      </div>
    </div>
  );
}

function MockPlayerMetrics() {
  return (
    <div className="relative bg-ui-bg backdrop-blur-md border border-ui-border rounded-sm p-4 card-grid-bg">
      <TechCorners color="rgba(0,212,255,0.3)" />
      <div className="font-mono text-[10px] text-brand-cyan tracking-widest mb-3">
        PLAYER.METRICS
      </div>
      {/* Profile */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-cyan/20 border border-brand-cyan/30 rounded-sm flex items-center justify-center clip-angled">
          <span className="text-brand-cyan font-bold text-sm">AK</span>
        </div>
        <div>
          <div className="text-sm font-bold">Alex Kim</div>
          <div className="text-[10px] font-mono text-text-muted">USR_8924 · DUPR 4.82</div>
        </div>
      </div>
      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-20 mb-3">
        {[45, 52, 48, 65, 72].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-sm transition-all ${
                i === 4 ? "bg-brand-cyan shadow-[0_0_10px_rgba(0,212,255,0.3)]" : "bg-white/15"
              }`}
              style={{ height: `${h}%` }}
            />
            <span className="text-[8px] font-mono text-text-muted">
              {["JUN", "JUL", "AUG", "SEP", "OCT"][i]}
            </span>
          </div>
        ))}
      </div>
      {/* Upcoming */}
      <div className="bg-dark/40 border border-ui-border rounded-sm p-2">
        <div className="text-[10px] font-mono text-text-muted mb-1">Upcoming Match</div>
        <div className="text-xs font-bold">
          Alex Kim <span className="text-text-muted font-normal">vs</span> TBD
        </div>
      </div>
    </div>
  );
}

function MockSysHub() {
  return (
    <div className="relative bg-ui-bg backdrop-blur-md border border-ui-border rounded-sm p-4 card-grid-bg">
      <TechCorners color="rgba(0,212,255,0.3)" />
      <div className="font-mono text-[10px] text-brand-cyan tracking-widest mb-3">SYS.HUB</div>
      {/* Court map */}
      <div className="bg-dark/40 border border-ui-border rounded-sm p-3 mb-3 relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-[10px] font-mono text-text-muted">Court Locations</span>
          <span className="ml-auto text-brand-cyan font-mono font-bold text-sm">2,800+</span>
        </div>
        {/* Dots representing courts */}
        <div className="relative h-16">
          {[
            { top: "10%", left: "20%" },
            { top: "30%", left: "45%" },
            { top: "60%", left: "30%" },
            { top: "20%", left: "70%" },
            { top: "50%", left: "80%" },
            { top: "70%", left: "55%" },
            { top: "40%", left: "15%" },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-brand-cyan/60"
              style={pos}
            />
          ))}
        </div>
      </div>
      {/* Pro Shop item */}
      <div className="bg-dark/40 border border-ui-border rounded-sm p-3">
        <div className="text-[10px] font-mono text-text-muted mb-1">Pro Shop</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold">Aero Pro Paddle X</div>
            <div className="text-brand-cyan font-mono font-bold text-sm">₩189,000</div>
          </div>
          <ShoppingBag className="w-4 h-4 text-text-muted" />
        </div>
      </div>
    </div>
  );
}

interface ServiceBlockProps {
  index: number;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  metrics: { value: string; label: string }[];
  mockup: React.ReactNode;
}

function ServiceBlock({ index, label, icon, title, description, metrics, mockup }: ServiceBlockProps) {
  const reversed = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
        reversed ? "lg:[direction:rtl]" : ""
      }`}
    >
      <div className={reversed ? "lg:[direction:ltr]" : ""}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-brand-cyan">{icon}</span>
          <span className="font-mono text-[10px] text-brand-cyan tracking-widest uppercase">{label}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black mb-4">{title}</h3>
        <p className="text-text-muted mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-6">
          {metrics.map((m, i) => (
            <MetricBox key={i} value={m.value} label={m.label} />
          ))}
        </div>
      </div>
      <div className={reversed ? "lg:[direction:ltr]" : ""}>{mockup}</div>
    </motion.div>
  );
}

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 md:py-32 bg-dark overflow-hidden">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines-overlay pointer-events-none" />
      {/* Cyan glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <SystemLabel text="SYS.OK_SOLUTIONS_ACTIVATED" color="cyan" />
          <h2 className="text-3xl md:text-4xl font-black mt-4">
            이렇게 <span className="text-brand-cyan">해결합니다</span>
          </h2>
        </motion.div>

        <div className="space-y-24">
          <ServiceBlock
            index={0}
            label="MODULE_01"
            icon={<Search className="w-5 h-5" />}
            title="전국 대회 통합 검색 & 원클릭 접수"
            description="월평균 150건 이상의 전국 대회를 한 곳에서 검색하세요. 10초 안에 원하는 대회를 찾고, 2분이면 접수 완료. 팀 접수도 링크 하나로 간편하게."
            metrics={[
              { value: "83%↓", label: "탐색 시간 단축" },
              { value: "94%", label: "접수 완료율 (+31%p)" },
            ]}
            mockup={<MockTournamentFinder />}
          />

          <ServiceBlock
            index={1}
            label="MODULE_02"
            icon={<BarChart3 className="w-5 h-5" />}
            title="실시간 대진표 & 개인 전적·부수 관리"
            description="대진표를 미리 확인하고, 결과는 자동 반영. 승률과 부수 변화를 그래프로 한눈에 확인하세요."
            metrics={[
              { value: "5초", label: "기록 조회 시간" },
              { value: "1.4단계", label: "연간 부수 상승" },
            ]}
            mockup={<MockPlayerMetrics />}
          />

          <ServiceBlock
            index={2}
            label="MODULE_03"
            icon={<ShoppingBag className="w-5 h-5" />}
            title="커뮤니티 + 피클볼 전문 쇼핑몰"
            description="동호회 대시보드로 멤버를 관리하고, 전국 2,800개 피클볼장 주소록에서 가까운 코트를 찾으세요. 쇼핑몰에서 검증된 장비를 합리적인 가격에."
            metrics={[
              { value: "+23%", label: "동호회 유입 증가" },
              { value: "41%", label: "쇼핑몰 재구매율" },
            ]}
            mockup={<MockSysHub />}
          />
        </div>
      </div>
    </section>
  );
}
