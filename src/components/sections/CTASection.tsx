"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 bg-dark overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 card-grid-bg" />
      <div className="absolute inset-0 scanlines-overlay pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-brand-red/5 rounded-full blur-[200px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-ui-bg/50 backdrop-blur-xl border border-ui-border rounded-2xl p-8 md:p-16 text-center"
        >
          <TechCorners size={12} color="rgba(0,212,255,0.3)" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-cyan/10 border border-brand-cyan/20 px-4 py-1.5 rounded-full mb-8">
            <span className="font-mono text-[10px] text-brand-cyan tracking-widest">
              SYS.CALL // ACTION_REQUIRED
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
            피클볼을 더 자주,{" "}
            <span className="bg-gradient-to-r from-brand-cyan to-brand-cyan/70 bg-clip-text text-transparent">
              더 편하게, 더 잘
            </span>{" "}
            치고 싶다면 —
          </h2>

          {/* Subcopy */}
          <p className="text-text-muted text-lg mb-4">
            <span className="underline underline-offset-4 decoration-brand-cyan/50">
              30일 무료 체험
            </span>
            으로 모든 기능을 직접 경험해 보세요.
          </p>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-text-muted text-sm mb-10">
            <Shield className="w-4 h-4 text-brand-cyan/60" />
            <span>카드 등록 없이 가입 즉시 이용 가능합니다.</span>
          </div>

          {/* CTA Button */}
          <div className="relative inline-block mb-10">
            {/* Glow behind */}
            <div className="absolute inset-0 bg-brand-cyan/20 blur-2xl rounded-xl animate-glow-pulse" />
            <button
              className="relative clip-angled bg-brand-cyan text-dark font-black text-xl md:text-2xl px-10 py-5 inline-flex items-center gap-3 transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_#E3000F] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
              style={{ boxShadow: "6px 6px 0px #E3000F" }}
            >
              {/* Shimmer */}
              <span className="absolute inset-0 overflow-hidden clip-angled">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </span>
              <span className="relative">30일 무료 체험 시작하기</span>
              <ArrowRight className="w-6 h-6 relative" />
            </button>
          </div>

          {/* Bottom metrics */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-mono text-text-muted">
            <span>
              가입 소요 시간: <span className="text-brand-cyan">평균 40초</span>
            </span>
            <span className="hidden sm:inline text-ui-border">·</span>
            <span>
              현재 전국 <span className="text-brand-cyan">12,000명 이상</span> 이용 중
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
