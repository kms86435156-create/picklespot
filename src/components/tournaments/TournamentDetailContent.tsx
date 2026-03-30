"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, DollarSign, Users, Clock,
  Building2, Shield, ChevronDown, ChevronUp, AlertTriangle,
  Share2, MessageSquare, UserPlus,
} from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import ClipButton from "@/components/ui/ClipButton";
import RegistrationModal from "./RegistrationModal";
import { useToast } from "@/components/ui/Toast";

export default function TournamentDetailContent({ tournament: t }: { tournament: any }) {
  const [showFaq, setShowFaq] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  if (!t) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-text-muted">대회를 찾을 수 없습니다.</p>
        <Link href="/tournaments" className="text-brand-cyan text-sm mt-2 inline-block">← 목록으로</Link>
      </div>
    );
  }

  const fillPct = t.maxSlots > 0 ? (t.currentSlots / t.maxSlots) * 100 : 0;
  const remaining = (t.maxSlots || 0) - (t.currentSlots || 0);
  const isClosed = t.status === "closed" && (t.waitlistCount || 0) === 0;
  const isWaitlistOnly = t.status === "closed" && (t.waitlistCount || 0) > 0;
  const daysUntilDeadline = t.registrationDeadline
    ? Math.ceil((new Date(t.registrationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : -1;

  return (
    <>
      <div className="relative py-6 md:py-10">
        <div className="absolute inset-0 card-grid-bg pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 뒤로가기 */}
          <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-cyan transition-colors mb-6 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" /> 대회 목록
          </Link>

          {/* ── 헤더 ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="relative bg-ui-bg/50 border border-ui-border rounded-sm p-5 md:p-8 card-grid-bg mb-6">
              <TechCorners color="rgba(0,212,255,0.2)" />

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={t.status} size="md" />
                    {t.status === "closing" && daysUntilDeadline >= 0 && (
                      <span className="text-xs font-mono text-brand-red animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 마감 D-{daysUntilDeadline}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black leading-tight mb-2">{t.title}</h1>
                  <p className="text-text-muted text-sm leading-relaxed">{t.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => toast("링크가 복사되었습니다.", "success")} className="p-2.5 bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" title="공유">
                    <Share2 className="w-4 h-4 text-text-muted" />
                  </button>
                  {t.organizerContact ? (
                    <a href={`tel:${t.organizerContact}`} className="p-2.5 bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center" title="주최자 연락">
                      <MessageSquare className="w-4 h-4 text-text-muted" />
                    </a>
                  ) : (
                    <span className="p-2.5 bg-white/5 border border-ui-border rounded-sm min-w-[44px] min-h-[44px] flex items-center justify-center opacity-30" title="연락처 없음">
                      <MessageSquare className="w-4 h-4 text-text-muted" />
                    </span>
                  )}
                </div>
              </div>

              {/* 핵심 정보 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { icon: <Calendar className="w-4 h-4" />, label: "일정", value: `${t.date}${t.endDate ? ` ~ ${t.endDate.slice(5)}` : ""}` },
                  { icon: <MapPin className="w-4 h-4" />, label: "장소", value: t.location },
                  { icon: <DollarSign className="w-4 h-4" />, label: "참가비", value: `₩${t.entryFee.toLocaleString()}` },
                  { icon: <Users className="w-4 h-4" />, label: "종목", value: `${t.typeLabel} · ${t.level}` },
                ].map((item, i) => (
                  <div key={i} className="bg-dark/30 border border-ui-border rounded-sm p-3">
                    <div className="flex items-center gap-1.5 text-brand-cyan/50 mb-1">
                      {item.icon}
                      <span className="text-[10px] font-mono text-text-muted uppercase">{item.label}</span>
                    </div>
                    <div className="text-sm font-bold">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* 모집 현황 */}
              <div className="bg-dark/30 border border-ui-border rounded-sm p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">모집 현황</span>
                  <span className="font-mono text-sm">
                    <span className={fillPct >= 90 ? "text-brand-red font-bold" : "text-brand-cyan font-bold"}>
                      {t.currentSlots}
                    </span>
                    <span className="text-text-muted"> / {t.maxSlots}명</span>
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      fillPct >= 90 ? "bg-brand-red" : fillPct >= 70 ? "bg-yellow-400" : "bg-brand-cyan"
                    }`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>
                    {remaining > 0
                      ? <>잔여 <span className={remaining <= 5 ? "text-brand-red font-bold" : "text-brand-cyan font-bold"}>{remaining}자리</span></>
                      : <span className="text-brand-red font-bold">마감</span>}
                  </span>
                  <span>신청 마감: {t.registrationDeadline}</span>
                </div>
                {t.waitlistCount > 0 && (
                  <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 현재 대기자 {t.waitlistCount}명
                  </div>
                )}
              </div>

              {/* CTA 버튼 영역 */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isClosed ? (
                  <button className="flex-1 py-3 text-base font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm cursor-not-allowed min-h-[48px]" disabled>
                    접수 마감
                  </button>
                ) : isWaitlistOnly ? (
                  <ClipButton variant="red" size="lg" className="flex-1 justify-center" onClick={() => setShowModal(true)}>
                    대기자 등록하기
                  </ClipButton>
                ) : (
                  <ClipButton variant="cyan" size="lg" arrow className="flex-1 justify-center" onClick={() => setShowModal(true)}>
                    신청하기
                  </ClipButton>
                )}
                <Link href="/play-together" className="flex-1 sm:flex-none">
                  <button className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 hover:text-white transition-all min-h-[48px] flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" /> 파트너 찾기
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── 상세 정보 탭 ── */}
          <div className="space-y-4">

            {/* 주최 측 공지 */}
            {t.notice && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="relative bg-brand-red/5 border border-brand-red/20 rounded-sm p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-brand-red block mb-1">주최 측 공지</span>
                      <p className="text-sm text-text-muted">{t.notice}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 대회 일정 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <DetailCard title="대회 일정" icon={<Clock className="w-4 h-4 text-brand-cyan" />}>
                <div className="space-y-0">
                  {(t.schedule || []).map((s, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-ui-border last:border-0">
                      <span className="text-xs font-mono text-brand-cyan shrink-0 w-20 pt-0.5">{s.time}</span>
                      <span className="text-sm">{s.content}</span>
                    </div>
                  ))}
                </div>
              </DetailCard>
            </motion.div>

            {/* 대회 규정 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <DetailCard title="대회 규정" icon={<Shield className="w-4 h-4 text-brand-cyan" />}>
                <ul className="space-y-1.5">
                  {(t.rules || []).map((r, i) => (
                    <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                      <span className="text-brand-cyan mt-1.5 w-1 h-1 bg-brand-cyan rounded-full shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </DetailCard>
            </motion.div>

            {/* 장소 정보 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <DetailCard title="장소 정보" icon={<MapPin className="w-4 h-4 text-brand-cyan" />}>
                <div className="space-y-2 text-sm text-text-muted">
                  <div><span className="text-white font-bold">{t.location}</span></div>
                  <div>{t.address}</div>
                  {(t.amenities || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(t.amenities || []).map((a) => (
                        <span key={a} className="text-[10px] px-2 py-0.5 bg-white/5 border border-ui-border rounded-sm">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </DetailCard>
            </motion.div>

            {/* 환불 규정 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <DetailCard title="환불 규정" icon={<DollarSign className="w-4 h-4 text-brand-cyan" />}>
                <p className="text-sm text-text-muted">{t.refundPolicy}</p>
              </DetailCard>
            </motion.div>

            {/* 주최자 정보 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <DetailCard title="주최자" icon={<Building2 className="w-4 h-4 text-brand-cyan" />}>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold text-white">{t.organizer}</span>
                    <span className="text-text-muted ml-2">{t.organizerContact}</span>
                  </div>
                  {t.organizerContact && (
                    <a href={`tel:${t.organizerContact}`} className="text-xs text-brand-cyan hover:underline">전화 문의</a>
                  )}
                </div>
              </DetailCard>
            </motion.div>

            {/* 참가자 현황 */}
            {(t.participants || []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <DetailCard title={`참가자 현황 (${(t.participants || []).length}명)`} icon={<Users className="w-4 h-4 text-brand-cyan" />}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(t.participants || []).map((p, i) => (
                      <div key={i} className="bg-dark/30 border border-ui-border rounded-sm p-2.5 flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center shrink-0">
                          <span className="text-brand-cyan text-[10px] font-bold">{p.name[0]}</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold">{p.name}</div>
                          <div className="text-[10px] text-text-muted">{p.level} · {p.region}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailCard>
              </motion.div>
            )}

            {/* FAQ */}
            {(t.faq || []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <DetailCard title="자주 묻는 질문" icon={<MessageSquare className="w-4 h-4 text-brand-cyan" />}>
                  <div className="space-y-0">
                    {(t.faq || []).map((f, i) => (
                      <div key={i} className="border-b border-ui-border last:border-0">
                        <button
                          onClick={() => setShowFaq(showFaq === i ? null : i)}
                          className="w-full flex items-center justify-between py-3 text-left min-h-[44px]"
                        >
                          <span className="text-sm font-bold pr-4">Q. {f.q}</span>
                          {showFaq === i ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
                        </button>
                        {showFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="pb-3"
                          >
                            <p className="text-sm text-text-muted pl-4 border-l-2 border-brand-cyan/30">A. {f.a}</p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailCard>
              </motion.div>
            )}

            {/* 상금 */}
            {t.prizeInfo && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <DetailCard title="시상 내역" icon={<span className="text-brand-cyan">🏆</span>}>
                  <p className="text-sm text-brand-cyan font-bold">{t.prizeInfo}</p>
                </DetailCard>
              </motion.div>
            )}
          </div>

          {/* ── 하단 고정 CTA (모바일) ── */}
          <div className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-md border-t border-ui-border p-3 flex gap-2 md:hidden z-40">
            <Link href="/tournaments" className="shrink-0">
              <button className="px-4 py-3 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm min-h-[48px]">
                목록
              </button>
            </Link>
            <div className="flex-1">
              {isClosed ? (
                <button className="w-full py-3 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm cursor-not-allowed min-h-[48px]" disabled>
                  접수 마감
                </button>
              ) : (
                <ClipButton
                  variant={isWaitlistOnly ? "red" : "cyan"}
                  className="w-full justify-center min-h-[48px]"
                  onClick={() => setShowModal(true)}
                >
                  {isWaitlistOnly ? "대기자 등록" : "신청하기"}
                </ClipButton>
              )}
            </div>
          </div>
          {/* 모바일 하단 CTA 공간 확보 */}
          <div className="h-20 md:hidden" />
        </div>
      </div>

      {/* 신청 모달 */}
      {showModal && <RegistrationModal tournament={t} onClose={() => setShowModal(false)} />}
    </>
  );
}

function DetailCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 md:p-5">
      <TechCorners />
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
