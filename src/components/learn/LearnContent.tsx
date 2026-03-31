"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Video, GraduationCap, MapPin, Users, ArrowRight, Clock, Star, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import TabBar from "@/components/ui/TabBar";
import TechCorners from "@/components/ui/TechCorners";
import { useTilt } from "@/hooks/useTilt";

/* ── 데이터 ── */
interface LearnItem {
  id: string;
  title: string;
  category: string;
  difficulty: "입문" | "초급" | "중급" | "고급";
  type: "article" | "video";
  duration: string;
  description: string;
  sections?: { title: string; content: string }[];
  relatedCta?: { label: string; href: string };
}

const items: LearnItem[] = [
  {
    id: "l1", title: "피클볼이란? — 5분 완벽 입문 가이드", category: "규칙", difficulty: "입문", type: "article", duration: "5분",
    description: "피클볼의 기본 규칙, 코트 크기, 점수 계산법을 알아봅니다.",
    sections: [
      { title: "피클볼이란?", content: "피클볼은 배드민턴 크기의 코트에서 패들과 플라스틱 공을 사용하는 라켓 스포츠입니다. 테니스, 탁구, 배드민턴의 요소가 결합되어 있어 배우기 쉽고 모든 연령대가 즐길 수 있습니다." },
      { title: "기본 규칙", content: "서브는 대각선으로, 언더핸드로만 가능. 11점 선승제(2점 차). 비발리 존(Kitchen)에서는 발리 금지. 서브 후 양팀 모두 바운스 후 리턴해야 하는 '더블바운스 규칙' 적용." },
      { title: "코트 크기", content: "가로 6.1m × 세로 13.4m. 네트 높이는 양쪽 91.4cm, 중앙 86.4cm. 네트 앞 2.13m는 비발리 존(NVZ)." },
    ],
    relatedCta: { label: "내 주변 코트 찾기", href: "/courts" },
  },
  {
    id: "l2", title: "서브의 기본 — 언더핸드 서브 마스터하기", category: "기술", difficulty: "초급", type: "video", duration: "8분",
    description: "정확한 서브 자세와 손목 각도, 토스 타이밍을 배웁니다.",
    relatedCta: { label: "내 주변 코트 찾기", href: "/courts" },
  },
  {
    id: "l3", title: "주방(Kitchen) 규칙 완벽 정리", category: "규칙", difficulty: "초급", type: "article", duration: "4분",
    description: "비발리 존(NVZ) 진입 조건과 흔히 하는 실수를 정리합니다.",
    sections: [
      { title: "NVZ 기본 규칙", content: "네트 앞 2.13m 영역(Kitchen)에서는 발리(공이 바운스되기 전 타격)가 금지됩니다. 발이 NVZ 라인을 밟거나 안에 들어간 상태에서 발리하면 폴트." },
      { title: "흔한 실수", content: "발리 후 관성으로 NVZ에 들어가는 것도 폴트입니다. 발리 후 파트너가 잡아주거나, 스스로 밸런스를 유지해야 합니다." },
    ],
    relatedCta: { label: "내 주변 코트 찾기", href: "/courts" },
  },
  {
    id: "l4", title: "딩크샷 — 네트 앞 소프트 게임", category: "기술", difficulty: "중급", type: "video", duration: "12분",
    description: "딩크의 원리, 타점, 다양한 딩크 변형을 연습합니다.",
    relatedCta: { label: "내 주변 코트 찾기", href: "/courts" },
  },
  {
    id: "l5", title: "복식 포지셔닝 전략", category: "전략", difficulty: "중급", type: "article", duration: "7분",
    description: "스태킹, 스위칭, 포치 등 복식 포지셔닝의 핵심 전략을 배웁니다.",
    relatedCta: { label: "동호회 찾기", href: "/clubs" },
  },
  {
    id: "l6", title: "어니(Erne) — 고급 공격 기술", category: "기술", difficulty: "고급", type: "video", duration: "10분",
    description: "어니의 타이밍, 진입 루트, 실전 활용법을 익힙니다.",
  },
  {
    id: "l7", title: "대회 준비 체크리스트", category: "전략", difficulty: "중급", type: "article", duration: "6분",
    description: "첫 대회 출전 전 준비해야 할 것들을 정리합니다.",
    sections: [
      { title: "대회 전 준비", content: "패들 2개 이상(예비용), 운동화, 수건, 물, 간식, 여벌 옷. 대회 규정 미리 확인. 파트너와 전략 논의." },
      { title: "당일 체크리스트", content: "1시간 전 도착, 워밍업 20분, 대진표 확인, 심판 규칙 확인. 긴장 풀기 루틴." },
    ],
    relatedCta: { label: "대회 찾기", href: "/tournaments" },
  },
  {
    id: "l8", title: "부수 체계와 DUPR 이해하기", category: "규칙", difficulty: "입문", type: "article", duration: "5분",
    description: "한국과 글로벌 부수 체계, DUPR 레이팅 산정 방식을 설명합니다.",
    sections: [
      { title: "한국 부수 체계", content: "D(입문) → C(초중급) → B(중상급) → A(상급) → Pro. 각 단계 안에서 -, +로 세분화." },
      { title: "DUPR이란?", content: "Dynamic Universal Pickleball Rating. 경기 결과를 기반으로 0.000~8.000 범위로 산정. 승패뿐 아니라 점수 차이, 상대 레이팅도 반영." },
    ],
  },
  {
    id: "l9", title: "서드샷 드롭 — 공격에서 수비로의 전환", category: "기술", difficulty: "중급", type: "video", duration: "9분",
    description: "서브 후 세 번째 샷을 네트 앞에 부드럽게 떨어뜨리는 기술. C→B 레벨업의 핵심.",
    relatedCta: { label: "내 주변 코트 찾기", href: "/courts" },
  },
  {
    id: "l10", title: "피클볼 에티켓 — 매너 있는 플레이어 되기", category: "규칙", difficulty: "입문", type: "article", duration: "3분",
    description: "코트 위에서의 기본 에티켓, 셀프 심판 매너, 좋은 파트너가 되는 법.",
    relatedCta: { label: "동호회 찾기", href: "/clubs" },
  },
];

const tabs = ["전체", "규칙", "기술", "전략"];
const difficultyColors: Record<string, string> = {
  "입문": "text-green-400 bg-green-400/10 border-green-400/20",
  "초급": "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20",
  "중급": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "고급": "text-brand-red bg-brand-red/10 border-brand-red/20",
};

function LearnCard({ item }: { item: LearnItem }) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(3);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-5 card-grid-bg group hover:border-brand-cyan/30 transition-all h-full flex flex-col"
      style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
    >
      <TechCorners />
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded-sm ${difficultyColors[item.difficulty]}`}>{item.difficulty}</span>
        <span className="text-[10px] font-mono text-text-muted">{item.category}</span>
        {item.type === "video" ? <Video className="w-3 h-3 text-text-muted ml-auto" /> : <BookOpen className="w-3 h-3 text-text-muted ml-auto" />}
        <span className="text-[10px] text-text-muted flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{item.duration}</span>
      </div>
      <h3 className="font-bold text-sm mb-2 group-hover:text-brand-cyan transition-colors leading-snug">{item.title}</h3>
      <p className="text-xs text-text-muted leading-relaxed mb-3">{item.description}</p>

      {/* 펼치기 가능한 콘텐츠 */}
      {item.sections ? (
        <>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[10px] text-brand-cyan hover:underline mb-2 min-h-[32px]">
            {expanded ? "접기" : "내용 보기"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-3 mb-3">
              {item.sections.map((s, i) => (
                <div key={i} className="bg-dark/30 border border-ui-border rounded-sm p-3">
                  <h4 className="text-xs font-bold text-brand-cyan mb-1">{s.title}</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed">{s.content}</p>
                </div>
              ))}
            </motion.div>
          )}
        </>
      ) : (
        <p className="text-[10px] text-text-muted/50 mb-2">콘텐츠 준비중입니다</p>
      )}

      {/* 하단 CTA */}
      {item.relatedCta && (
        <div className="mt-auto pt-3 border-t border-ui-border">
          <Link href={item.relatedCta.href} className="flex items-center gap-1 text-xs text-brand-cyan hover:underline">
            {item.relatedCta.label} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function LearnContent() {
  const [activeTab, setActiveTab] = useState(0);

  const filtered = activeTab === 0 ? items : items.filter((item) => {
    const tabMap: Record<number, string> = { 1: "규칙", 2: "기술", 3: "전략" };
    return item.category === tabMap[activeTab];
  });

  // 난이도별 그루핑 (입문 먼저)
  const beginnerItems = filtered.filter((i) => i.difficulty === "입문");
  const otherItems = filtered.filter((i) => i.difficulty !== "입문");

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader sysLabel="SYS.LEARN" title="배우기" subtitle="피클볼 규정부터 고급 기술까지, 단계별로 배워보세요" />

        {/* 초보자 환영 배너 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-sm p-4 mb-6">
            <TechCorners color="rgba(34,197,94,0.15)" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-sm flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-green-400">처음이세요?</div>
                <div className="text-sm">피클볼 입문 가이드부터 시작하면 5분이면 기본 규칙을 마스터할 수 있어요!</div>
              </div>
            </div>
          </div>
        </motion.div>

        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 입문 콘텐츠 (있을 때만) */}
        {beginnerItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-sm border border-green-400/20">입문</span>
              <span className="text-xs text-text-muted">처음 시작하는 분을 위한 콘텐츠</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {beginnerItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
                  <LearnCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 나머지 콘텐츠 */}
        {otherItems.length > 0 && (
          <div className="mb-12">
            {beginnerItems.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted">초급 ~ 고급</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {otherItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: (beginnerItems.length + i) * 0.04 }}>
                  <LearnCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 전환 CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-6 md:p-8">
            <TechCorners color="rgba(0,212,255,0.2)" />
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-5 h-5 text-brand-cyan" />
              <span className="font-bold text-lg">배운 내용을 바로 실전에 적용해 보세요</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/tournaments" className="block">
                <div className="bg-dark/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all text-center group">
                  <GraduationCap className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
                  <div className="font-bold text-sm group-hover:text-brand-cyan transition-colors">대회 찾기</div>
                  <div className="text-xs text-text-muted">실력을 시험해 보세요</div>
                </div>
              </Link>
              <Link href="/clubs" className="block">
                <div className="bg-dark/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all text-center group">
                  <Users className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
                  <div className="font-bold text-sm group-hover:text-brand-cyan transition-colors">동호회 찾기</div>
                  <div className="text-xs text-text-muted">함께 칠 동호회 탐색</div>
                </div>
              </Link>
              <Link href="/courts" className="block">
                <div className="bg-dark/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all text-center group">
                  <MapPin className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
                  <div className="font-bold text-sm group-hover:text-brand-cyan transition-colors">내 주변 코트 찾기</div>
                  <div className="text-xs text-text-muted">가까운 피클볼장 검색</div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
