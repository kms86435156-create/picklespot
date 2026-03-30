"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  MapPin,
  Trophy,
  Users,
  ArrowRight,
  Calendar,
  Zap,
  Star,
  Shield,
  CheckCircle,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Clock,
  TrendingUp,
} from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import { useTilt } from "@/hooks/useTilt";

/* ─── 애니메이션 래퍼 ─── */
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── 섹션 헤더 ─── */
function SectionHeader({ icon, title, linkText, linkHref }: { icon: React.ReactNode; title: string; linkText?: string; linkHref?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg md:text-xl font-bold">{title}</h2>
      </div>
      {linkText && linkHref && (
        <Link href={linkHref} className="text-sm text-text-muted hover:text-brand-cyan transition-colors flex items-center gap-1">
          {linkText} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/* ─── 메인 CTA 카드 ─── */
function HeroActionCard({
  icon,
  title,
  subtitle,
  stat,
  statLabel,
  href,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  stat: string;
  statLabel: string;
  href: string;
  delay: number;
}) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} className="block h-full">
        <div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative bg-ui-bg/60 backdrop-blur-md border border-ui-border rounded-sm p-5 md:p-7 card-grid-bg group transition-all duration-300 hover:border-brand-cyan/40 cursor-pointer h-full"
          style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
        >
          <TechCorners />
          {/* Scanline */}
          <div className="absolute inset-0 overflow-hidden rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 w-full h-10 bg-gradient-to-b from-brand-cyan/5 to-transparent animate-scanline" />
          </div>

          {/* Icon + Arrow */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center group-hover:bg-brand-cyan/20 transition-colors">
              {icon}
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-cyan transition-colors" />
          </div>

          {/* Text */}
          <h3 className="text-xl md:text-2xl font-black mb-1.5 group-hover:text-brand-cyan transition-colors leading-tight">{title}</h3>
          <p className="text-sm text-text-muted mb-5">{subtitle}</p>

          {/* Mini stat */}
          <div className="border-t border-ui-border pt-3 flex items-end justify-between">
            <div>
              <div className="text-2xl font-black text-brand-cyan font-mono leading-none">{stat}</div>
              <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider mt-1">{statLabel}</div>
            </div>
            <span aria-hidden="true" className="clip-angled bg-brand-cyan/10 text-brand-cyan text-[10px] font-bold px-2.5 py-1 border border-brand-cyan/20">
              바로가기
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── 퀵 액션 카드 ─── */
function QuickActionCard({
  icon,
  label,
  value,
  sub,
  href,
  accent = "cyan",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  href: string;
  accent?: "cyan" | "red";
}) {
  const borderColor = accent === "cyan" ? "hover:border-brand-cyan/30" : "hover:border-brand-red/30";
  const accentColor = accent === "cyan" ? "text-brand-cyan" : "text-brand-red";

  return (
    <Link href={href} className="block">
      <div className={`relative bg-ui-bg/30 border border-ui-border rounded-sm p-4 transition-all group cursor-pointer ${borderColor}`}>
        <TechCorners />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/5 border border-ui-border rounded-sm flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-text-muted mb-0.5">{label}</div>
            <div className={`text-lg font-black font-mono leading-none ${accentColor}`}>{value}</div>
          </div>
          <div className="text-[10px] text-text-muted text-right shrink-0">{sub}</div>
        </div>
      </div>
    </Link>
  );
}

/* ─── 메인 컴포넌트 ─── */
interface HomeProps {
  stats?: { venueCount: number; tournamentOpenCount: number; flashGameOpenCount: number; clubCount?: number; lastSyncAt: string | null };
  venues?: any[];
  tournaments?: any[];
  flashGames?: any[];
  clubs?: any[];
  dataMeta?: { lastSyncAt: string | null; dataBaseline: string; isStale: boolean };
}

export default function HomeContent({ stats, venues = [], tournaments = [], flashGames = [], clubs = [], dataMeta }: HomeProps) {
  const upcomingTournaments = tournaments.slice(0, 4);
  const nearbyCourts = venues.slice(0, 3);
  const s = stats || { venueCount: venues.length, tournamentOpenCount: tournaments.length, flashGameOpenCount: flashGames.length, clubCount: clubs.length, lastSyncAt: null };

  return (
    <div className="relative">

      {/* ════════════════════════════════════════════════════════
         섹션 1: 핵심 가치 + CTA 3개
         ════════════════════════════════════════════════════════ */}
      <section className="relative pt-6 pb-4 md:pt-12 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 card-grid-bg" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-red/5 rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero copy — 행동 유도 중심 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mb-3">
              오늘 피클볼,<br className="sm:hidden" /> <span className="text-brand-cyan">어디서 치세요?</span>
            </h1>
            <p className="text-text-muted text-sm md:text-base max-w-md mx-auto">
              코트 예약, 대회 신청, 같이 칠 사람 찾기 — 3초면 시작합니다.
            </p>
          </motion.div>

          {/* 3 Main CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
            <HeroActionCard
              icon={<MapPin className="w-5 h-5 text-brand-cyan" />}
              title="코트 찾기"
              subtitle="내 주변 피클볼장을 찾고 바로 예약하세요"
              stat={`${s.venueCount}곳`}
              statLabel="등록된 피클볼장"
              href="/courts"
              delay={0.1}
            />
            <HeroActionCard
              icon={<Trophy className="w-5 h-5 text-brand-cyan" />}
              title="대회 신청"
              subtitle="전국 대회 검색, 원클릭 신청"
              stat={`${s.tournamentOpenCount}개`}
              statLabel="모집중인 대회"
              href="/tournaments"
              delay={0.2}
            />
            <HeroActionCard
              icon={<Users className="w-5 h-5 text-brand-cyan" />}
              title="같이 치기"
              subtitle="번개 모임·파트너를 찾아보세요"
              stat={`${s.flashGameOpenCount}건`}
              statLabel="모집중인 번개"
              href="/play-together"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         섹션 2: 오늘 할 수 있는 행동 — 퀵 통계 바
         ════════════════════════════════════════════════════════ */}
      <section className="relative py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              <QuickActionCard
                icon={<Calendar className="w-4 h-4 text-brand-cyan" />}
                label="신청 가능한 대회"
                value={`${s.tournamentOpenCount}개`}
                sub={dataMeta?.dataBaseline || ""}
                href="/tournaments"
              />
              <QuickActionCard
                icon={<Zap className="w-4 h-4 text-brand-cyan" />}
                label="모집중인 번개"
                value={`${s.flashGameOpenCount}건`}
                sub=""
                href="/play-together"
              />
              <QuickActionCard
                icon={<Clock className="w-4 h-4 text-brand-cyan" />}
                label="피클볼장"
                value={`${s.venueCount}곳`}
                sub="운영시간 내 예약"
                href="/courts"
              />
              <QuickActionCard
                icon={<TrendingUp className="w-4 h-4 text-brand-red" />}
                label="마감 임박 대회"
                value={`${tournaments.filter((t: any) => t.status === "closing").length}개`}
                sub="서두르세요"
                href="/tournaments"
                accent="red"
              />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         섹션 3: 인기 대회 / 가까운 코트 / 오늘의 번개
         ════════════════════════════════════════════════════════ */}
      <section className="relative py-8 md:py-14">
        <div className="absolute inset-0 card-grid-bg pointer-events-none opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cyan/3 rounded-full blur-[250px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16">

          {/* 인기 대회 */}
          <FadeInSection>
            <SectionHeader
              icon={<Trophy className="w-4 h-4 text-brand-cyan" />}
              title="다가오는 대회"
              linkText="전체 대회 보기"
              linkHref="/tournaments"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {upcomingTournaments.map((t) => (
                <Link key={t.id} href="/tournaments" className="block">
                  <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/30 transition-all group h-full">
                    <TechCorners />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-text-muted">{t.date}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <h3 className="font-bold text-sm mb-1 group-hover:text-brand-cyan transition-colors leading-snug">{t.title}</h3>
                    <p className="text-xs text-text-muted mb-3">{t.location} · {t.typeLabel}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-text-muted">{t.currentSlots}/{t.maxSlots}명</span>
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.status === "closing" ? "bg-brand-red" : "bg-brand-cyan"}`}
                          style={{ width: `${(t.currentSlots / t.maxSlots) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </FadeInSection>

          {/* 가까운 코트 */}
          <FadeInSection delay={0.1}>
            <SectionHeader
              icon={<MapPin className="w-4 h-4 text-brand-cyan" />}
              title="인기 피클볼장"
              linkText="전체 코트 보기"
              linkHref="/courts"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {nearbyCourts.map((c) => {
                const availCount = (c.availableSlots || []).filter((s: any) => s.status === "available").length;
                return (
                  <Link key={c.id} href="/courts" className="block">
                    <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/30 transition-all group h-full">
                      <TechCorners />
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-sm group-hover:text-brand-cyan transition-colors">{c.name}</h3>
                          <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{c.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-bold">{c.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="text-[10px] px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm">
                          {c.type === "indoor" ? "실내" : c.type === "outdoor" ? "실외" : "실내/실외"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted border border-ui-border rounded-sm">
                          코트 {c.courtCount}면
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted border border-ui-border rounded-sm">
                          ₩{c.pricePerHour.toLocaleString()}/h
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-ui-border pt-2.5">
                        <span className="text-xs text-text-muted">
                          오늘 예약 가능: <span className="text-brand-cyan font-bold">{availCount}슬롯</span>
                        </span>
                        <span className="text-[10px] text-brand-cyan font-mono">예약 →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </FadeInSection>

          {/* 모집중인 동호회 */}
          <FadeInSection delay={0.15}>
            <SectionHeader
              icon={<Users className="w-4 h-4 text-brand-cyan" />}
              title="회원 모집중인 동호회"
              linkText="전체 동호회 보기"
              linkHref="/clubs"
            />
            {clubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {clubs.map((c: any) => (
                  <Link key={c.id} href="/clubs" className="block">
                    <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/30 transition-all group h-full">
                      <TechCorners />
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm group-hover:text-brand-cyan transition-colors">{c.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-green-400/10 text-green-400 rounded-full">모집중</span>
                      </div>
                      <p className="text-xs text-text-muted mb-2">{c.region} {c.city} · {c.level || "전 급수"}</p>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>회원 {c.memberCount}명</span>
                        <span>{c.meetingSchedule || "일정 문의"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="relative bg-ui-bg/20 border border-ui-border rounded-sm p-6 text-center">
                <p className="text-text-muted text-sm mb-2">등록된 동호회가 없습니다</p>
                <Link href="/clubs" className="text-xs text-brand-cyan hover:underline">동호회 페이지 보기 →</Link>
              </div>
            )}
          </FadeInSection>

          {/* 동호회 대표 CTA */}
          <FadeInSection delay={0.2}>
            <div className="relative bg-gradient-to-r from-brand-cyan/10 via-brand-cyan/5 to-brand-red/5 border border-brand-cyan/20 rounded-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-brand-cyan tracking-widest block mb-2">FOR CLUB LEADERS</span>
                  <h3 className="text-lg md:text-xl font-black mb-2">동호회를 운영하고 계신가요?</h3>
                  <p className="text-sm text-text-muted">회원 모집, 대회 접수, 일정 관리까지 — 무료로 동호회 운영 도구를 사용하세요.</p>
                </div>
                <Link
                  href="/for-clubs"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors"
                >
                  무료로 시작하기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         섹션 4: 서비스 신뢰 요소
         ════════════════════════════════════════════════════════ */}
      <section className="relative py-10 md:py-16">
        <div className="absolute inset-0 bg-surface/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-black">
                왜 <span className="text-brand-cyan">PBL.SYS</span>인가요?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  icon: <CheckCircle className="w-5 h-5 text-brand-cyan" />,
                  title: "원클릭 대회 신청",
                  desc: "프로필 기반 자동입력. 복식 파트너 초대도 링크 하나로.",
                },
                {
                  icon: <MapPin className="w-5 h-5 text-brand-cyan" />,
                  title: "전국 피클볼장 검색",
                  desc: "실내/실외, 가격, 편의시설까지 한눈에 비교하고 예약.",
                },
                {
                  icon: <Shield className="w-5 h-5 text-brand-cyan" />,
                  title: "신뢰 기반 매칭",
                  desc: "활동점수, 노쇼 여부, 매너 점수로 안심하고 함께 플레이.",
                },
                {
                  icon: <TrendingUp className="w-5 h-5 text-brand-cyan" />,
                  title: "기록이 쌓이는 플랫폼",
                  desc: "전적, 부수, 승률이 자동 기록. 성장 과정을 눈으로 확인.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-ui-bg/30 border border-ui-border rounded-sm p-5 text-center"
                >
                  <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{item.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            {/* 집계 기준 표시 */}
            <div className="text-center mt-4">
              <span className="text-[10px] font-mono text-text-muted/40">
                데이터 기준: {dataMeta?.dataBaseline || "수동 등록"}{dataMeta?.isStale ? " · 확인 전" : ""}
              </span>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         섹션 5: 초보자용 진입 CTA
         ════════════════════════════════════════════════════════ */}
      <section className="relative py-10 md:py-16">
        <div className="absolute inset-0 card-grid-bg pointer-events-none opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-8">
              <span className="text-[10px] font-mono text-brand-cyan tracking-widest block mb-2">FOR BEGINNERS</span>
              <h2 className="text-xl md:text-2xl font-black">
                피클볼이 처음이신가요?
              </h2>
              <p className="text-sm text-text-muted mt-2">기초부터 차근차근, 바로 시작할 수 있어요.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/learn" className="block">
                <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-5 hover:border-brand-cyan/30 transition-all group text-center h-full">
                  <TechCorners />
                  <BookOpen className="w-8 h-8 text-brand-cyan mx-auto mb-3" />
                  <h3 className="font-bold mb-1 group-hover:text-brand-cyan transition-colors">피클볼 규정 배우기</h3>
                  <p className="text-xs text-text-muted">5분이면 기본 규칙을 마스터할 수 있어요</p>
                </div>
              </Link>
              <Link href="/lessons" className="block">
                <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-5 hover:border-brand-cyan/30 transition-all group text-center h-full">
                  <TechCorners />
                  <GraduationCap className="w-8 h-8 text-brand-cyan mx-auto mb-3" />
                  <h3 className="font-bold mb-1 group-hover:text-brand-cyan transition-colors">코치에게 레슨받기</h3>
                  <p className="text-xs text-text-muted">초보 전문 코치가 1:1로 가르쳐드려요</p>
                </div>
              </Link>
              <Link href="/play-together" className="block">
                <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-5 hover:border-brand-cyan/30 transition-all group text-center h-full">
                  <TechCorners />
                  <Users className="w-8 h-8 text-brand-cyan mx-auto mb-3" />
                  <h3 className="font-bold mb-1 group-hover:text-brand-cyan transition-colors">초보 번개 참여하기</h3>
                  <p className="text-xs text-text-muted">같은 실력끼리 매칭, 부담 없이 시작</p>
                </div>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         섹션 6: 후순위 콘텐츠 (커뮤니티, 배우기 링크)
         ════════════════════════════════════════════════════════ */}
      <section className="relative py-8 md:py-12">
        <div className="absolute inset-0 bg-surface/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/community" className="block">
                <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-5 hover:border-brand-cyan/20 transition-all group">
                  <TechCorners />
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-brand-cyan shrink-0" />
                    <div>
                      <h3 className="font-bold group-hover:text-brand-cyan transition-colors">커뮤니티</h3>
                      <p className="text-xs text-text-muted">장비 리뷰, 팁 공유, 동호회 소식까지</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-cyan transition-colors ml-auto shrink-0" />
                  </div>
                </div>
              </Link>
              <Link href="/learn" className="block">
                <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-5 hover:border-brand-cyan/20 transition-all group">
                  <TechCorners />
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-brand-cyan shrink-0" />
                    <div>
                      <h3 className="font-bold group-hover:text-brand-cyan transition-colors">배우기</h3>
                      <p className="text-xs text-text-muted">기초 규정부터 고급 전략까지 단계별 학습</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-cyan transition-colors ml-auto shrink-0" />
                  </div>
                </div>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
