"use client";

import { motion } from "framer-motion";
import ClipButton from "@/components/ui/ClipButton";
import TechCorners from "@/components/ui/TechCorners";

const marqueeItems = [
  { text: "THE HEAT IS ON", italic: false },
  { text: "SYS.01.ALL.IN.ONE", italic: true },
  { text: "UNLEASH YOUR GAME", italic: false },
  { text: "PLATFORM.READY", italic: true },
];

function MarqueeContent() {
  return (
    <>
      {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
        <span key={i} className="flex items-center gap-6 shrink-0">
          <span
            className={`text-sm md:text-base font-black tracking-widest whitespace-nowrap ${
              item.italic ? "italic text-stroke text-white" : "text-white"
            }`}
          >
            {item.text}
          </span>
          <span className="text-white/40 text-xs">◆</span>
        </span>
      ))}
    </>
  );
}

function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={`relative bg-ui-bg backdrop-blur-md border border-ui-border rounded-sm p-4 card-grid-bg ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <TechCorners />
      {/* Scanline */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm">
        <div className="absolute inset-0 w-full h-8 bg-gradient-to-b from-brand-cyan/5 to-transparent animate-scanline" />
      </div>
      {children}
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[700px] h-screen overflow-hidden bg-dark">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/8532467/pexels-photo-8532467.jpeg?auto=compress&cs=tinysrgb&w=1920)",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/90 to-transparent" />
      <div className="absolute inset-0 bg-dark/40" />

      {/* Marquee band */}
      <div className="absolute top-[55%] md:top-[60%] left-0 right-0 z-20 -rotate-2">
        <div className="bg-brand-red py-2.5 overflow-hidden">
          <div className="flex gap-6 animate-marquee">
            <MarqueeContent />
            <MarqueeContent />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <span className="font-mono text-xs text-brand-cyan tracking-widest mb-4">
              SYSTEM_INITIALIZED_
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">
              대회 검색부터 접수, 기록 관리, 용품 구매까지.
              <br />
              <span className="text-brand-cyan">피클볼의 모든 것, 한 곳에서.</span>
            </h1>
            <p className="text-text-muted text-base md:text-lg mb-8 max-w-lg">
              전국 1만 2천 명의 피클볼러가 선택한 올인원 플랫폼. 대회 일정 확인에 30분,
              접수에 30분 쓰던 시대는 끝났습니다.
            </p>
            <div className="mb-8">
              <ClipButton variant="cyan" size="lg">
                지금 무료로 시작하기
              </ClipButton>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-black text-brand-cyan font-mono">12K+</div>
                <div className="text-xs text-text-muted font-mono uppercase tracking-wider">
                  Active Players
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-brand-cyan font-mono">0</div>
                <div className="text-xs text-text-muted font-mono uppercase tracking-wider">
                  Setup Time
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right floating cards - desktop only */}
          <div className="hidden lg:flex items-center justify-center relative" style={{ perspective: "1000px" }}>
            {/* Tournament card */}
            <FloatingCard className="absolute -top-4 -left-4 w-64 z-30" delay={0.3}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
                  Next Major
                </span>
                <span className="bg-brand-red/20 text-brand-red text-[10px] font-mono px-2 py-0.5 rounded-sm">
                  LIVE_REG
                </span>
              </div>
              <div className="font-bold text-sm mb-1">National Open &apos;26</div>
              <div className="font-mono text-[10px] text-text-muted mb-2">OCT 12-14</div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-text-muted">
                  Slots <span className="text-brand-cyan">24</span>/128
                </div>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-cyan rounded-full" style={{ width: "19%" }} />
                </div>
              </div>
            </FloatingCard>

            {/* Stats card */}
            <FloatingCard className="absolute top-24 left-16 w-56 z-20" delay={0.5}>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2">
                Your Record
              </div>
              <div className="flex items-end gap-3 mb-2">
                <div>
                  <div className="text-xs text-text-muted font-mono">Win Rate</div>
                  <div className="text-2xl font-black text-brand-cyan">68%</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted font-mono">DUPR EST</div>
                  <div className="text-2xl font-black text-white">4.5</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[40, 55, 35, 70, 60, 80, 68].map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-sm ${i === 6 ? "bg-brand-cyan" : "bg-white/20"}`}
                    style={{ height: `${h * 0.4}px` }}
                  />
                ))}
              </div>
            </FloatingCard>

            {/* Gear card */}
            <FloatingCard className="absolute top-52 left-2 w-52 z-10" delay={0.7}>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2">
                Pro Shop
              </div>
              <div className="font-bold text-sm mb-1">Aero Pro Paddle X</div>
              <div className="text-brand-cyan font-mono font-bold">₩189,000</div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </section>
  );
}
