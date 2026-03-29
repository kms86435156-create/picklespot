"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Zap, UserPlus, TrendingUp } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import TabBar from "@/components/ui/TabBar";
import ClipButton from "@/components/ui/ClipButton";
import TechCorners from "@/components/ui/TechCorners";
import { useToast } from "@/components/ui/Toast";
import FlashGamesTab from "./FlashGamesTab";
import PartnerFindingTab from "./PartnerFindingTab";

export default function PlayTogetherContent({ flashGames = [], partnerPosts = [] }: { flashGames?: any[]; partnerPosts?: any[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const { toast } = useToast();

  const openCount = flashGames.filter((g) => g.status === "open").length;
  const todayCount = flashGames.filter((g) => {
    const d = new Date(g.dateTime);
    const today = new Date();
    return d.toDateString() === today.toDateString() || (d.getTime() - today.getTime()) < 86400000 * 2;
  }).length;

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 + CTA */}
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            sysLabel="SYS.PLAY"
            title="같이"
            highlight="치기"
            subtitle="번개 모임에 참가하거나, 정기 파트너를 찾아보세요"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 mt-6"
          >
            <ClipButton variant="cyan" arrow onClick={() => toast(activeTab === 0 ? "번개 만들기 기능은 준비중입니다." : "파트너 구하기 기능은 준비중입니다.", "info")}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{activeTab === 0 ? "번개 만들기" : "파트너 구하기"}</span>
              <span className="sm:hidden">만들기</span>
            </ClipButton>
          </motion.div>
        </div>

        {/* 요약 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-2 mb-5"
        >
          <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-3">
            <TechCorners />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-cyan" />
              <div>
                <div className="text-xs text-text-muted">모집중 번개</div>
                <div className="text-lg font-black text-brand-cyan font-mono">{openCount}</div>
              </div>
            </div>
          </div>
          <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-3">
            <TechCorners />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-cyan" />
              <div>
                <div className="text-xs text-text-muted">이번 주</div>
                <div className="text-lg font-black text-brand-cyan font-mono">{todayCount}건</div>
              </div>
            </div>
          </div>
          <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-3">
            <TechCorners />
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-cyan" />
              <div>
                <div className="text-xs text-text-muted">파트너 글</div>
                <div className="text-lg font-black text-brand-cyan font-mono">{partnerPosts.length}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 추천 카드 — "나와 맞는 모임" */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <RecommendBanner flashGames={flashGames} />
          </motion.div>
        )}

        <TabBar tabs={["번개 모임", "파트너 찾기"]} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 0 ? <FlashGamesTab flashGames={flashGames} /> : <PartnerFindingTab partnerPosts={partnerPosts} />}
      </div>
    </div>
  );
}

function RecommendBanner({ flashGames }: { flashGames: any[] }) {
  const { toast } = useToast();
  const recommended = flashGames.find((g: any) => g.status === "open" && g.beginnerWelcome && g.vibe === "casual");
  if (!recommended) return null;

  return (
    <div className="relative bg-gradient-to-r from-brand-cyan/10 to-brand-cyan/5 border border-brand-cyan/20 rounded-sm p-4">
      <TechCorners color="rgba(0,212,255,0.2)" />
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-sm border border-brand-cyan/20">추천</span>
        <span className="text-xs text-text-muted">나와 맞는 모임</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm mb-0.5">{recommended.title}</h4>
          <p className="text-xs text-text-muted">
            {recommended.location} · {new Date(recommended.dateTime).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })} · {recommended.level}
          </p>
        </div>
        <ClipButton variant="cyan" onClick={() => toast("참가 신청이 완료되었습니다!", "success")}>참가하기</ClipButton>
      </div>
    </div>
  );
}
