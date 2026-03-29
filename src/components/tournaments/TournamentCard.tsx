"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, DollarSign, Users, Building2 } from "lucide-react";
import { useTilt } from "@/hooks/useTilt";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import ClipButton from "@/components/ui/ClipButton";
// Tournament type is passed as `any` from server component

export default function TournamentCard({ tournament: t }: { tournament: any }) {
  const router = useRouter();
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(4);
  const isClosed = t.status === "closed";
  const isWaitlist = t.status === "waitlist" || (t.status === "closed" && (t.waitlistCount || 0) > 0);
  const fillPct = t.maxSlots > 0 ? ((t.currentSlots || 0) / t.maxSlots) * 100 : 0;
  const remaining = (t.maxSlots || 0) - (t.currentSlots || 0);

  const daysUntilDeadline = t.registrationDeadline
    ? Math.ceil((new Date(t.registrationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : -1;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-ui-bg/50 backdrop-blur-md border border-ui-border rounded-sm card-grid-bg group transition-all duration-300 hover:border-brand-cyan/30 h-full flex flex-col"
      style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
    >
      <TechCorners />
      {/* Scanline */}
      <div className="absolute inset-0 overflow-hidden rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 w-full h-10 bg-gradient-to-b from-brand-cyan/5 to-transparent animate-scanline" />
      </div>

      {/* ─ 상단: 상태 + 마감 경고 ─ */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <StatusBadge status={t.status} />
        {t.status === "closing" && daysUntilDeadline >= 0 && (
          <span className="text-[10px] font-mono text-brand-red animate-pulse">
            D-{daysUntilDeadline}
          </span>
        )}
        {t.status === "open" && daysUntilDeadline <= 7 && daysUntilDeadline >= 0 && (
          <span className="text-[10px] font-mono text-text-muted">
            마감 D-{daysUntilDeadline}
          </span>
        )}
      </div>

      {/* ─ 본문 ─ */}
      <div className="px-5 pb-3 flex-1">
        {/* 타이틀 */}
        <h3 className="font-bold text-base mb-2.5 leading-snug group-hover:text-brand-cyan transition-colors">
          {t.title}
        </h3>

        {/* 메타 정보 — 2열 그리드 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-text-muted mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-brand-cyan/50" />
            <span>{t.date}{t.endDate ? ` ~ ${t.endDate.slice(5)}` : ""}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-cyan/50" />
            <span className="truncate">{t.region}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 shrink-0 text-brand-cyan/50" />
            <span className="font-mono">₩{t.entryFee.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 shrink-0 text-brand-cyan/50" />
            <span>{t.typeLabel}</span>
          </div>
        </div>

        {/* 종목/레벨 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm font-mono">
            {t.level}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-white/5 text-text-muted border border-ui-border rounded-sm">
            {t.typeLabel}
          </span>
        </div>

        {/* 주최자 */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted/60 mb-3">
          <Building2 className="w-3 h-3" />
          <span>주최: {t.organizer}</span>
        </div>

        {/* 모집 현황 바 */}
        <div className="bg-dark/30 border border-ui-border rounded-sm p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-muted">모집 현황</span>
            <span className="text-xs font-mono">
              <span className={fillPct >= 90 ? "text-brand-red font-bold" : "text-brand-cyan font-bold"}>
                {t.currentSlots}
              </span>
              <span className="text-text-muted">/{t.maxSlots}명</span>
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPct >= 90 ? "bg-brand-red" : fillPct >= 70 ? "bg-yellow-400" : "bg-brand-cyan"
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            {remaining > 0 ? (
              <span>잔여 <span className={remaining <= 5 ? "text-brand-red font-bold" : "text-brand-cyan font-bold"}>{remaining}자리</span></span>
            ) : (
              <span className="text-brand-red font-bold">마감</span>
            )}
            {t.waitlistCount > 0 && (
              <span>대기 {t.waitlistCount}명</span>
            )}
          </div>
        </div>
      </div>

      {/* ─ 하단 CTA ─ */}
      <div className="px-5 pb-4 pt-2 flex gap-2 border-t border-ui-border mt-auto">
        <Link href={`/tournaments/${t.id}`} className="flex-1 block py-2.5 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 hover:text-white transition-all min-h-[44px] text-center flex items-center justify-center">
          자세히 보기
        </Link>
        <div className="flex-1">
          {isClosed && !isWaitlist ? (
            <button className="w-full py-2.5 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm cursor-not-allowed min-h-[44px]" disabled>
              접수 마감
            </button>
          ) : isWaitlist || (t.status === "closed" && t.waitlistCount > 0) ? (
            <ClipButton variant="red" className="w-full justify-center min-h-[44px]" onClick={() => router.push(`/tournaments/${t.id}`)}>
              대기자 등록
            </ClipButton>
          ) : (
            <ClipButton variant="cyan" className="w-full justify-center min-h-[44px]" onClick={() => router.push(`/tournaments/${t.id}`)}>
              신청하기
            </ClipButton>
          )}
        </div>
      </div>
    </div>
  );
}
