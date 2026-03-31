"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Phone, Clock, ArrowLeft, ArrowRight, CreditCard, ExternalLink } from "lucide-react";
import OrganizerCTA from "@/components/ui/OrganizerCTA";
import RegistrationFormModal from "./RegistrationFormModal";
import { useAuth } from "@/components/auth/AuthProvider";

function daysUntil(d: string) { if (!d) return 999; const ms = new Date(d).getTime(); return isNaN(ms) ? 999 : Math.ceil((ms - Date.now()) / 86400000); }

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return value ? (
    <div className="flex items-start gap-3 py-2.5 border-b border-ui-border last:border-0">
      <div className="w-5 h-5 mt-0.5 text-brand-cyan shrink-0 flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  ) : null;
}

export default function TournamentDetailPage({ tournament: t, similarTournaments, matchingVenue }: {
  tournament: any; similarTournaments: any[]; matchingVenue?: any;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [showRegForm, setShowRegForm] = useState(false);
  const dl = daysUntil(t.registrationDeadline || t.startDate || "");

  function handleRegister() {
    if (!user) {
      router.push(`/login?from=/tournaments/${t.id}`);
      return;
    }
    setShowRegForm(true);
  }
  const isOpen = (t.status === "open" || t.status === "draft") && dl > 0;
  const isClosing = isOpen && dl <= 7;
  const maxP = Number(t.maxParticipants) || 0;
  const curP = Number(t.currentParticipants) || 0;
  const pct = maxP > 0 ? Math.round((curP / maxP) * 100) : 0;
  const fee = Number(t.entryFee) || 0;

  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Back + breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link href="/tournaments" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-cyan transition-colors">
          <ArrowLeft className="w-4 h-4" /> 대회 목록
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── 좌측: 메인 정보 ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {isClosing ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 animate-pulse">D-{dl} 마감임박</span>
                ) : isOpen ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-400/10 text-green-400">접수중</span>
                ) : t.status === "closed" || t.status === "completed" ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-text-muted">마감</span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-text-muted">{t.status}</span>
                )}
                <span className="text-xs text-text-muted">{t.region}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.title}</h1>
              <p className="text-sm text-text-muted">{t.organizerName} 주최</p>
            </div>

            {/* 핵심 정보 카드 */}
            <div className="bg-surface border border-ui-border rounded-lg p-5">
              <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">대회 정보</h2>
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="일정" value={`${t.startDate || "미정"}${t.endDate && t.endDate !== t.startDate ? ` ~ ${t.endDate}` : ""}`} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="접수 마감" value={t.registrationDeadline ? `${t.registrationDeadline}${dl > 0 ? ` (D-${dl})` : " (마감)"}` : "확인중"} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="장소" value={t.venueName || "확인중"} />
              <InfoRow icon={<Users className="w-4 h-4" />} label="종별" value={t.eventTypes} />
              <InfoRow icon={<CreditCard className="w-4 h-4" />} label="참가비" value={t.entryFee ? `₩${t.entryFee.toLocaleString()}` : "무료"} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="주최자 연락처" value={t.organizerContact} />
              {maxP > 0 && (
                <div className="pt-3 mt-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">모집 현황</span>
                    <span className="text-white font-bold">{t.currentParticipants} / {t.maxParticipants}명 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-yellow-400" : "bg-brand-cyan"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* 설명 */}
            {t.description && (
              <div className="bg-surface border border-ui-border rounded-lg p-5">
                <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">상세 안내</h2>
                <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{t.description}</div>
              </div>
            )}

            {/* 관련 장소 */}
            {matchingVenue && (
              <Link href={`/venues/${matchingVenue.id}`} className="block">
                <div className="bg-surface border border-ui-border rounded-lg p-5 hover:border-brand-cyan/30 transition-all group">
                  <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">대회 장소</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white group-hover:text-brand-cyan transition-colors">{matchingVenue.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{matchingVenue.address || matchingVenue.roadAddress} · 코트 {matchingVenue.courtCount}면</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-cyan transition-colors" />
                  </div>
                </div>
              </Link>
            )}

            {/* 비슷한 대회 */}
            {similarTournaments.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">비슷한 대회</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {similarTournaments.map(st => (
                    <Link key={st.id} href={`/tournaments/${st.id}`} className="block">
                      <div className="bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/30 transition-all group">
                        <p className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors mb-1 truncate">{st.title}</p>
                        <p className="text-xs text-text-muted">{st.startDate} · {st.region} · ₩{(st.entryFee || 0).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── 우측: Sticky 사이드바 ─── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* CTA 카드 */}
              <div className="bg-surface border border-ui-border rounded-lg p-5">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-white">₩{fee.toLocaleString()}</p>
                  <p className="text-xs text-text-muted">참가비</p>
                </div>
                {isOpen ? (
                  <button
                    onClick={handleRegister}
                    className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors"
                  >
                    {isClosing ? `마감임박! 지금 신청 (D-${dl})` : "대회 신청하기"}
                  </button>
                ) : (
                  <button disabled className="w-full py-3 bg-white/5 text-text-muted font-bold text-sm rounded cursor-not-allowed">
                    접수 마감
                  </button>
                )}
                {t.sourceUrl && (
                  <a href={t.sourceUrl} target="_blank" rel="noopener"
                    className="flex items-center justify-center gap-1.5 mt-2 py-2 text-xs text-text-muted hover:text-brand-cyan transition-colors">
                    <ExternalLink className="w-3 h-3" /> 외부 상세 페이지
                  </a>
                )}
              </div>

              {/* Quick Info */}
              <div className="bg-surface border border-ui-border rounded-lg p-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-text-muted">주최</span><span className="text-white">{t.organizerName || "-"}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">지역</span><span className="text-white">{t.region || "-"}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">종별</span><span className="text-white">{t.eventTypes || "-"}</span></div>
                {maxP > 0 && (
                  <div className="flex justify-between"><span className="text-text-muted">정원</span><span className="text-white">{curP}/{maxP}명</span></div>
                )}
              </div>

              {/* 주최자 CTA */}
              <OrganizerCTA variant="sidebar" context="tournament" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {isOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-ui-border p-3 z-40">
          <button onClick={handleRegister} className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded">
            대회 신청하기 · ₩{fee.toLocaleString()}
          </button>
        </div>
      )}

      {/* Registration Modal */}
      {showRegForm && <RegistrationFormModal tournament={t} onClose={() => setShowRegForm(false)} />}
    </div>
  );
}
