"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Zap, MapPin, Users, ArrowRight, Star, Home, Sun,
  ChevronRight, Calendar, BookOpen, Trophy
} from "lucide-react";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "제주"];

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ title, subtitle, link, linkLabel = "전체보기" }: { title: string; subtitle?: string; link: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-black text-white">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <Link href={link} className="text-sm text-text-muted hover:text-brand-cyan flex items-center gap-1 shrink-0 ml-4">
        {linkLabel} <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function SkillBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    "처음이에요": "bg-emerald-400/15 text-emerald-400",
    "초보": "bg-green-400/15 text-green-400",
    "초중급": "bg-lime-400/15 text-lime-400",
    "중급": "bg-yellow-400/15 text-yellow-400",
    "중상급": "bg-orange-400/15 text-orange-400",
    "상급": "bg-red-400/15 text-red-400",
    "무관": "bg-white/10 text-text-muted",
  };
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors[level] || "bg-white/10 text-text-muted"}`}>
      {level}
    </span>
  );
}

interface Props {
  featuredVenues: any[];
  topRegions: { region: string; count: number }[];
  beginnerClubs: any[];
  totalVenues: number;
  totalClubs: number;
}

export default function HomePage(p: Props) {
  const [meetups, setMeetups] = useState<any[]>([]);
  const [meetupsLoading, setMeetupsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [beginnerOnly, setBeginnerOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedRegion !== "전체") params.set("region", selectedRegion);
    if (beginnerOnly) params.set("beginnerOnly", "1");
    params.set("status", "open");
    fetch(`/api/meetups?${params}`)
      .then(r => r.json())
      .then(d => setMeetups(d.meetups || []))
      .catch(() => {})
      .finally(() => setMeetupsLoading(false));
  }, [selectedRegion, beginnerOnly]);

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const wd = weekdays[d.getDay()];
    if (diff === 0) return `오늘 (${month}/${day} ${wd})`;
    if (diff === 1) return `내일 (${month}/${day} ${wd})`;
    if (diff === 2) return `모레 (${month}/${day} ${wd})`;
    return `${month}/${day} (${wd})`;
  }

  const todayMeetups = meetups.slice(0, 6);

  return (
    <div className="relative -mt-14 pt-14">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-10 pb-8 md:pt-16 md:pb-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 card-grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-cyan/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-5">
              <Zap className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="text-xs font-bold text-brand-cyan">오늘도 피클볼 하는 날</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.1] mb-4">
              오늘 같이 칠<br />
              <span className="text-brand-cyan">사람 찾기</span>
            </h1>
            <p className="text-text-muted text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
              번개 모집부터 코트 찾기까지.<br />
              <span className="text-white/80">초보자도 10초면 시작할 수 있어요.</span>
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Link
                href="/matches"
                id="hero-cta-find-player"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-cyan text-dark font-black rounded-xl text-base hover:bg-brand-cyan/90 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20"
              >
                <Zap className="w-5 h-5" />
                오늘 같이 칠 사람 찾기
              </Link>
              <Link
                href="/matches/create"
                id="hero-cta-create-meetup"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white/[0.06] border border-ui-border text-white font-bold rounded-xl text-base hover:bg-white/[0.1] active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 text-brand-cyan" />
                번개 만들기
              </Link>
            </div>

            {/* Secondary CTA */}
            <Link
              href="/courts"
              id="hero-cta-find-court"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-cyan transition-colors"
            >
              <MapPin className="w-4 h-4" />
              내 주변 코트 찾기 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ 퀵액션 4버튼 ═══ */}
      <section className="pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Zap className="w-5 h-5" />, label: "오늘 번개", href: "/matches", color: "text-brand-cyan", bg: "bg-brand-cyan/10 border-brand-cyan/20", glow: true },
              { icon: <MapPin className="w-5 h-5" />, label: "코트 찾기", href: "/courts", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
              { icon: <Users className="w-5 h-5" />, label: "초보 모임", href: "/clubs?beginner=1", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
              { icon: <BookOpen className="w-5 h-5" />, label: "레슨 찾기", href: "/lessons", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              >
                <Link href={item.href} className="block">
                  <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${item.bg} hover:opacity-80 active:scale-95 transition-all ${item.glow ? "shadow-sm shadow-brand-cyan/10" : ""}`}>
                    <div className={item.color}>{item.icon}</div>
                    <span className="text-[11px] font-bold text-white text-center leading-tight">{item.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 오늘의 번개 ═══ */}
      <section className="py-8 border-t border-ui-border">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="⚡ 지금 모집중인 번개"
              subtitle="클릭 한 번으로 즉시 참여 확정"
              link="/matches"
              linkLabel="전체 번개"
            />

            {/* 필터 */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
              <div className="flex gap-1.5 shrink-0">
                {REGIONS.slice(0, 8).map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedRegion === r ? "bg-brand-cyan text-dark" : "bg-white/[0.06] text-text-muted hover:text-white border border-ui-border"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setBeginnerOnly(!beginnerOnly)}
                className={`ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${beginnerOnly ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/30" : "bg-white/[0.06] text-text-muted border-ui-border hover:text-white"}`}
              >
                <Star className="w-3 h-3" />
                초보 환영
              </button>
            </div>

            {meetupsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-36 bg-surface border border-ui-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : todayMeetups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayMeetups.map((m, i) => {
                  const filled = m.currentPlayers || 0;
                  const max = m.maxPlayers || 4;
                  const pct = Math.min((filled / max) * 100, 100);
                  const isFull = filled >= max;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/matches/${m.id}`} className="block group">
                        <div className={`bg-surface border rounded-xl p-4 transition-all h-full ${isFull ? "border-ui-border opacity-60" : "border-ui-border hover:border-brand-cyan/40 hover:bg-brand-cyan/[0.02]"}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <SkillBadge level={m.skillLevel || "무관"} />
                              {m.isBeginnerFriendly && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">초보환영</span>
                              )}
                            </div>
                            {isFull
                              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-text-muted">마감</span>
                              : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 animate-pulse">모집중</span>
                            }
                          </div>

                          <h3 className={`font-bold text-sm mb-2 line-clamp-1 transition-colors ${isFull ? "text-text-muted" : "text-white group-hover:text-brand-cyan"}`}>
                            {m.title}
                          </h3>

                          <div className="text-xs text-text-muted space-y-1 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>{formatDate(m.date)} {m.startTime && `${m.startTime}~`}{m.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{m.region} {m.venueName && `· ${m.venueName}`}</span>
                            </div>
                          </div>

                          {/* 인원 progress bar */}
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-text-muted">{filled}/{max}명</span>
                              {m.fee > 0
                                ? <span className="text-brand-cyan font-bold">₩{m.fee.toLocaleString()}</span>
                                : <span className="text-emerald-400 font-bold">무료</span>
                              }
                            </div>
                            <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isFull ? "bg-white/20" : "bg-brand-cyan"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <MeetupEmptyState />
            )}
          </FadeIn>
        </div>
      </section>

      {/* ═══ 내 근처 코트 ═══ */}
      <section className="py-10 border-t border-ui-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <SectionHeader
              title="📍 피클볼 코트"
              subtitle={p.totalVenues > 0 ? `전국 ${p.totalVenues}곳 등록` : "전국 코트 정보"}
              link="/courts"
            />

            {p.topRegions.length > 0 && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                {p.topRegions.map(r => (
                  <Link
                    key={r.region}
                    href={`/courts?region=${r.region}`}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-surface border border-ui-border rounded-lg hover:border-brand-cyan/30 transition-all group"
                  >
                    <MapPin className="w-3 h-3 text-text-muted group-hover:text-brand-cyan transition-colors" />
                    <span className="text-sm font-bold text-white">{r.region}</span>
                    <span className="text-[11px] text-text-muted">{r.count}</span>
                  </Link>
                ))}
              </div>
            )}

            {p.featuredVenues.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {p.featuredVenues.map((v: any) => (
                    <Link key={v.id} href={`/courts/${v.id}`} className="block group">
                      <div className="bg-surface border border-ui-border rounded-xl p-4 hover:border-brand-cyan/30 transition-all h-full">
                        <h3 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors mb-2 line-clamp-1">{v.name}</h3>
                        <div className="text-xs text-text-muted space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{v.roadAddress || v.addressRoad || v.region}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {v.indoorOutdoor === "실내" ? <Home className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                            <span>코트 {v.courtCount || 0}면 · {v.indoorOutdoor || "실내"}</span>
                          </div>
                        </div>
                        {v.isBeginnerRecommended && (
                          <div className="mt-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">초보 추천</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<MapPin className="w-10 h-10" />}
                title="등록된 코트가 없습니다"
                desc="코트 정보를 등록해 많은 플레이어에게 알려보세요."
                ctaLabel="코트 등록 요청"
                ctaHref="/courts/register"
              />
            )}
          </FadeIn>
        </div>
      </section>

      {/* ═══ 초보 환영 모임 ═══ */}
      <section className="py-10 border-t border-ui-border">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn delay={0.1}>
            <SectionHeader
              title="👥 초보 환영 동호회"
              subtitle="부담 없이 함께 성장하는 모임"
              link="/clubs"
            />
            {p.beginnerClubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {p.beginnerClubs.map(c => (
                  <Link key={c.id} href={`/clubs/${c.id}`} className="block group">
                    <div className="bg-surface border border-ui-border rounded-xl p-4 hover:border-brand-cyan/30 transition-all h-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors line-clamp-1 flex-1">{c.name}</h3>
                        <div className="flex gap-1 ml-2 shrink-0">
                          {c.isBeginnerWelcome && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">초보환영</span>}
                          {c.isRecruiting && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan">모집중</span>}
                        </div>
                      </div>
                      <p className="text-xs text-text-muted mb-2">{c.region} {c.city} · 회원 {c.memberCount || 0}명</p>
                      <p className="text-xs text-text-muted line-clamp-2">{c.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Users className="w-10 h-10" />}
                title="아직 등록된 동호회가 없어요"
                desc="첫 번째 동호회를 등록하고 회원들을 모집해보세요!"
                ctaLabel="동호회 등록하기"
                ctaHref="/signup/organizer"
              />
            )}
          </FadeIn>
        </div>
      </section>

      {/* ═══ 대회 (축소) ═══ */}
      <section className="py-6 border-t border-ui-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-muted">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">피클볼 대회 정보도 있어요</span>
            </div>
            <Link href="/tournaments" className="text-sm text-brand-cyan hover:underline flex items-center gap-1">
              대회 일정 보기 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 피드백 (MVP 검증용) ═══ */}
      <section className="py-8 bg-surface border-t border-ui-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-lg font-bold text-white mb-2">서비스 개선에 참여해주세요</h3>
          <p className="text-sm text-text-muted mb-4">여러분의 솔직한 의견이 더 나은 서비스를 만듭니다.</p>
          <Link href="/feedback" className="inline-block px-6 py-2.5 border border-brand-cyan text-brand-cyan rounded-lg text-sm font-bold hover:bg-brand-cyan/10 transition-colors">
            사용 의견 남기기
          </Link>
        </div>
      </section>

    </div>
  );
}

/* ─── 번개 Empty State ─── */
function MeetupEmptyState() {
  return (
    <div className="text-center py-14 border border-dashed border-ui-border rounded-xl bg-surface/50">
      <div className="text-5xl mb-4">⚡</div>
      <h3 className="font-bold text-white text-lg mb-2">아직 진행 중인 번개가 없어요</h3>
      <p className="text-text-muted text-sm mb-6">첫 번개의 주인공이 되어보세요!</p>
      <Link
        href="/matches/create"
        className="inline-flex items-center gap-2 px-5 py-3 bg-brand-cyan text-dark font-black rounded-xl hover:bg-brand-cyan/90 transition-all"
      >
        <Zap className="w-4 h-4" />
        번개 만들기
      </Link>
    </div>
  );
}

/* ─── 범용 Empty State ─── */
function EmptyState({ icon, title, desc, ctaLabel, ctaHref }: { icon: React.ReactNode; title: string; desc: string; ctaLabel: string; ctaHref: string }) {
  return (
    <div className="bg-surface border border-ui-border border-dashed rounded-xl p-8 text-center">
      <div className="text-text-muted/20 mx-auto mb-3 w-fit">{icon}</div>
      <p className="text-text-muted font-medium mb-1">{title}</p>
      <p className="text-xs text-text-muted/70 mb-4">{desc}</p>
      <Link href={ctaHref} className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
        {ctaLabel} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
