"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Trophy, MapPin, Users, ArrowRight, Calendar, Star, Phone, Home, Sun, Clock, Zap } from "lucide-react";
import OrganizerCTA from "@/components/ui/OrganizerCTA";
import PromoBanners from "@/components/home/PromoBanners";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 25 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className}>{children}</motion.div>;
}

function daysUntil(d: string) { if (!d) return 999; const ms = new Date(d).getTime(); return isNaN(ms) ? 999 : Math.ceil((ms - Date.now()) / 86400000); }

interface Props {
  featuredTournaments: any[];
  thisMonthTournaments: any[];
  closingSoon: any[];
  featuredVenues: any[];
  topRegions: { region: string; count: number }[];
  featuredClubs: any[];
  totalTournaments: number;
  totalVenues: number;
  totalClubs: number;
  openCount: number;
  thisMonth: number;
}

export default function HomePage(p: Props) {
  return (
    <div className="relative -mt-14 pt-14">

      {/* ═══ Hero ═══ */}
      <section className="relative pt-8 pb-6 md:pt-14 md:pb-10 overflow-hidden">
        <div className="absolute inset-0 card-grid-bg" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[200px]" />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">
              피클볼의 모든 것,<br /><span className="text-brand-cyan">한 곳에서</span>
            </h1>
            <p className="text-text-muted text-sm md:text-base max-w-lg mx-auto">전국 대회 일정, 피클볼장 찾기, 동호회 탐색까지</p>
          </motion.div>

          {/* 3축 가치 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Trophy className="w-6 h-6 text-brand-cyan" />, title: "전국 대회 일정", sub: "접수중인 대회를 찾고 바로 신청", stat: p.totalTournaments > 0 ? `${p.totalTournaments}개` : "—", label: "등록된 대회", href: "/tournaments" },
              { icon: <MapPin className="w-6 h-6 text-brand-cyan" />, title: "내 근처 피클볼장", sub: "전국 코트 정보, 운영시간, 편의시설", stat: p.totalVenues > 0 ? `${p.totalVenues}곳` : "—", label: "등록된 장소", href: "/courts" },
              { icon: <Users className="w-6 h-6 text-brand-cyan" />, title: "동호회 찾기", sub: "전국 동호회 탐색, 모집 현황 확인", stat: p.totalClubs > 0 ? `${p.totalClubs}개` : "—", label: "등록된 동호회", href: "/clubs" },
            ].map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}>
                <Link href={c.href} className="block h-full">
                  <div className="bg-surface border border-ui-border rounded-lg p-6 hover:border-brand-cyan/30 transition-all group h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg flex items-center justify-center group-hover:bg-brand-cyan/20 transition-colors">{c.icon}</div>
                      <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-cyan transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors mb-1">{c.title}</h3>
                    <p className="text-sm text-text-muted mb-4">{c.sub}</p>
                    <div className="border-t border-ui-border pt-3">
                      <span className="text-2xl font-black text-brand-cyan font-mono">{c.stat}</span>
                      <span className="text-[10px] text-text-muted ml-2">{c.label}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 마감 임박 ═══ */}
      {p.closingSoon.length > 0 && (
        <section className="py-8 bg-red-500/[0.02] border-y border-red-500/10">
          <div className="max-w-7xl mx-auto px-4">
            <FadeIn>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  <h2 className="font-bold text-white">마감 임박 대회</h2>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{p.closingSoon.length}건</span>
                </div>
                <Link href="/tournaments" className="text-sm text-text-muted hover:text-brand-cyan flex items-center gap-1">전체보기 <ArrowRight className="w-3 h-3" /></Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {p.closingSoon.map(t => {
                  const dl = daysUntil(t.registrationDeadline || t.startDate);
                  return (
                    <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                      <div className="bg-surface border border-red-500/20 rounded-lg p-4 hover:border-red-500/40 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-red-400 bg-red-500/15 px-2 py-0.5 rounded animate-pulse">D-{dl}</span>
                          <span className="text-[10px] text-text-muted">{t.region}</span>
                        </div>
                        <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors mb-1 line-clamp-1">{t.title}</h3>
                        <p className="text-xs text-text-muted">{t.venueName || "장소 확인중"} · ₩{(t.entryFee || 0).toLocaleString()}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ═══ 프로모션 배너 ═══ */}
      <PromoBanners />

      {/* ═══ 추천 대회 ═══ */}
      {p.featuredTournaments.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4">
            <FadeIn>
              <SH icon={<Star className="w-4 h-4 text-yellow-400" />} title="추천 대회" link="/tournaments" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {p.featuredTournaments.map(t => {
                  const dl = daysUntil(t.registrationDeadline || t.startDate);
                  return (
                    <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                      <div className="bg-gradient-to-br from-brand-cyan/5 to-transparent border border-brand-cyan/20 rounded-lg p-5 hover:border-brand-cyan/40 transition-all group h-full">
                        <div className="flex items-center justify-between mb-3">
                          {dl > 0 && dl <= 7
                            ? <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400">D-{dl}</span>
                            : <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-green-400/10 text-green-400">접수중</span>
                          }
                          <span className="text-[10px] text-text-muted">{t.region}</span>
                        </div>
                        <h3 className="font-bold text-white group-hover:text-brand-cyan transition-colors mb-2">{t.title}</h3>
                        <div className="text-xs text-text-muted space-y-1">
                          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{t.startDate}</div>
                          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{t.venueName || "장소 확인중"}</div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-ui-border flex justify-between items-center">
                          <span className="text-sm font-bold text-brand-cyan">₩{(t.entryFee || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-text-muted">{t.eventTypes}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ═══ 이번 달 대회 일정 ═══ */}
      <section className="py-8 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <SH icon={<Calendar className="w-4 h-4 text-brand-cyan" />} title={`${p.thisMonth}월 대회 일정`} link="/tournaments" />
            {p.thisMonthTournaments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {p.thisMonthTournaments.map(t => (
                  <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                    <div className="bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/30 transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-brand-cyan">{t.startDate}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.status === "open" ? "bg-green-400/10 text-green-400" : "bg-white/5 text-text-muted"}`}>
                          {t.status === "open" ? "접수중" : "마감"}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors line-clamp-1">{t.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{t.region} · {t.venueName || "장소 확인중"} · ₩{(t.entryFee || 0).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyBlock icon={<Calendar className="w-10 h-10" />} title={`${p.thisMonth}월 대회가 아직 등록되지 않았습니다`} desc="대회 정보가 등록되면 이곳에 표시됩니다." ctaLabel="대회 등록 요청하기" ctaHref="/tournaments/register" />
            )}
          </FadeIn>
        </div>
      </section>

      {/* ═══ 지역별 피클볼장 ═══ */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <SH icon={<MapPin className="w-4 h-4 text-brand-cyan" />} title="지역별 피클볼장" link="/courts" />
            {p.topRegions.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
                {p.topRegions.map(r => (
                  <Link key={r.region} href={`/courts?region=${r.region}`} className="block">
                    <div className="bg-surface border border-ui-border rounded-lg p-3 text-center hover:border-brand-cyan/30 transition-all group">
                      <p className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors">{r.count}</p>
                      <p className="text-xs text-text-muted">{r.region}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
            {p.featuredVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {p.featuredVenues.map(v => (
                  <Link key={v.id} href={`/courts/${v.id}`} className="block">
                    <div className="bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/30 transition-all group h-full">
                      <h3 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors mb-2">{v.name}</h3>
                      <div className="text-xs text-text-muted space-y-1">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /><span className="truncate">{v.roadAddress || v.address || v.region}</span></div>
                        <div className="flex items-center gap-1.5">
                          {v.indoorOutdoor === "실내" || v.type === "indoor" ? <Home className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                          <span>코트 {v.courtCount}면 · {v.indoorOutdoor || (v.type === "indoor" ? "실내" : "실외")}</span>
                        </div>
                        {v.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /><span>{v.phone}</span></div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyBlock icon={<MapPin className="w-10 h-10" />} title="추천 피클볼장이 아직 없습니다" desc="전국 피클볼장 정보를 등록중입니다." ctaLabel="피클볼장 등록 요청" ctaHref="/courts/register" />
            )}
          </FadeIn>
        </div>
      </section>

      {/* ═══ 추천 동호회 ═══ */}
      <section className="py-10 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <SH icon={<Users className="w-4 h-4 text-brand-cyan" />} title="모집중인 동호회" link="/clubs" />
            {p.featuredClubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {p.featuredClubs.map(c => (
                  <Link key={c.id} href={`/clubs/${c.id}`} className="block">
                    <div className="bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/30 transition-all group h-full">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors">{c.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-green-400/10 text-green-400 rounded-full">모집중</span>
                      </div>
                      <p className="text-xs text-text-muted mb-1">{c.region} {c.city} · 회원 {c.memberCount}명</p>
                      <p className="text-xs text-text-muted line-clamp-2">{c.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyBlock icon={<Users className="w-10 h-10" />} title="등록된 동호회가 아직 없습니다" desc="동호회를 무료로 등록하고 회원을 모집하세요." ctaLabel="동호회 등록하기" ctaHref="/signup/organizer" />
            )}
          </FadeIn>
        </div>
      </section>

      {/* ═══ 운영자 CTA ═══ */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <OrganizerCTA variant="banner" context="general" />
          </FadeIn>
        </div>
      </section>

      {/* ═══ 정보형 블록 (SEO + 신뢰감) ═══ */}
      <section className="py-10 border-t border-ui-border">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoBlock
                icon={<Trophy className="w-5 h-5 text-brand-cyan" />}
                title="전국 피클볼 대회 일정 총정리"
                desc={p.totalTournaments > 0 ? `매주 업데이트되는 전국 피클볼 대회 정보. 현재 ${p.totalTournaments}개 대회가 등록되어 있으며, ${p.openCount}개 대회가 접수중입니다.` : "매주 업데이트되는 전국 피클볼 대회 정보. 대회가 등록되면 이곳에서 확인하세요."}
                href="/guides/tournament-guide"
              />
              <InfoBlock
                icon={<MapPin className="w-5 h-5 text-brand-cyan" />}
                title="내 근처 피클볼장 찾기"
                desc={p.totalVenues > 0 ? `전국 ${p.totalVenues}곳의 피클볼장 정보를 한눈에. 실내/실외, 코트 수, 운영시간, 주차 여부까지 비교하세요.` : "전국 피클볼장 정보를 한눈에. 피클볼장이 등록되면 이곳에서 확인하세요."}
                href="/guides/venue-guide"
              />
              <InfoBlock
                icon={<Zap className="w-5 h-5 text-brand-cyan" />}
                title="동호회 운영자를 위한 플랫폼"
                desc="대회 정보 등록, 참가 신청 접수, 동호회 홍보를 한 곳에서 관리할 수 있습니다."
                href="/guides/organizer-guide"
              />
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

/* ─── 하위 컴포넌트들 ─── */

function SH({ icon, title, link }: { icon: React.ReactNode; title: string; link: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">{icon}<h2 className="text-lg font-bold text-white">{title}</h2></div>
      <Link href={link} className="text-sm text-text-muted hover:text-brand-cyan flex items-center gap-1">전체보기 <ArrowRight className="w-3 h-3" /></Link>
    </div>
  );
}

function EmptyBlock({ icon, title, desc, ctaLabel, ctaHref }: { icon: React.ReactNode; title: string; desc: string; ctaLabel: string; ctaHref: string }) {
  return (
    <div className="bg-surface border border-ui-border border-dashed rounded-lg p-8 text-center">
      <div className="text-text-muted/20 mx-auto mb-3 w-fit">{icon}</div>
      <p className="text-text-muted font-medium mb-1">{title}</p>
      <p className="text-xs text-text-muted/70 mb-4">{desc}</p>
      <Link href={ctaHref} className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
        {ctaLabel} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function InfoBlock({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="block">
      <div className="bg-surface border border-ui-border rounded-lg p-5 hover:border-brand-cyan/20 transition-all group h-full">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors">{title}</h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}
