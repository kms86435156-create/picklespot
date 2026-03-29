"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, Users, Shield, Star,
  MessageSquare, Share2, CheckCircle, AlertTriangle, Loader2, Calendar,
} from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import ClipButton from "@/components/ui/ClipButton";
import { useToast } from "@/components/ui/Toast";

type JoinStep = "idle" | "confirming" | "processing" | "done";

export default function FlashGameDetailContent({ game: g }: { game: any }) {
  const [joinStep, setJoinStep] = useState<JoinStep>("idle");
  const { toast } = useToast();

  if (!g) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-text-muted">번개를 찾을 수 없습니다.</p>
        <Link href="/play-together" className="text-brand-cyan text-sm mt-2 inline-block">← 목록으로</Link>
      </div>
    );
  }

  const remaining = g.maxPlayers - g.currentPlayers;
  const fillPct = (g.currentPlayers / g.maxPlayers) * 100;
  const isFull = g.status === "full";

  const handleJoin = () => {
    setJoinStep("confirming");
  };
  const handleConfirmJoin = () => {
    setJoinStep("processing");
    setTimeout(() => setJoinStep("done"), 1200);
  };

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/play-together" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-cyan transition-colors mb-6 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> 같이치기 목록
        </Link>

        {/* ── 메인 카드 ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="relative bg-ui-bg/50 border border-ui-border rounded-sm p-5 md:p-8 card-grid-bg mb-5">
            <TechCorners color="rgba(0,212,255,0.2)" />

            {/* 상태 + 태그 */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <StatusBadge status={g.status === "full" ? "full" : "open"} size="md" />
              {g.beginnerWelcome && (
                <span className="text-[11px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-sm border border-brand-cyan/20">초보환영</span>
              )}
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm border ${
                g.vibe === "casual" ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-brand-red bg-brand-red/10 border-brand-red/20"
              }`}>
                {g.vibe === "casual" ? "가볍게" : "빡겜"}
              </span>
              {g.gender && <span className="text-[11px] text-text-muted bg-white/5 px-2 py-0.5 rounded-sm border border-ui-border">{g.gender}</span>}
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => toast("링크가 복사되었습니다.", "success")} className="p-2 bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center" title="공유">
                  <Share2 className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>

            {/* 제목 */}
            <h1 className="text-xl md:text-2xl font-black mb-3 leading-tight">{g.title}</h1>

            {/* 설명 */}
            <p className="text-text-muted text-sm leading-relaxed mb-5">{g.description}</p>

            {/* 핵심 정보 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { icon: <Calendar className="w-4 h-4" />, label: "일시", value: `${new Date(g.dateTime).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} ${new Date(g.dateTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}` },
                { icon: <Clock className="w-4 h-4" />, label: "소요시간", value: g.duration },
                { icon: <MapPin className="w-4 h-4" />, label: "장소", value: g.location },
                { icon: <Users className="w-4 h-4" />, label: "실력", value: `${g.level} · ${g.vibe === "casual" ? "가볍게" : "빡겜"}` },
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

            {/* 장소 상세 */}
            <div className="bg-dark/30 border border-ui-border rounded-sm p-3 mb-5">
              <div className="text-xs text-text-muted mb-1">상세 주소</div>
              <div className="text-sm">{g.address}</div>
              {g.costPerPerson && (
                <div className="text-xs text-text-muted mt-1">
                  참가비: <span className="text-brand-cyan font-mono font-bold">₩{g.costPerPerson.toLocaleString()}</span>/인 (코트비 분담)
                </div>
              )}
            </div>

            {/* 모집 현황 */}
            <div className="bg-dark/30 border border-ui-border rounded-sm p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">모집 현황</span>
                <span className="font-mono text-sm">
                  <span className={isFull ? "text-text-muted" : "text-brand-cyan font-bold"}>{g.currentPlayers}</span>
                  <span className="text-text-muted"> / {g.maxPlayers}명</span>
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${isFull ? "bg-text-muted" : "bg-brand-cyan"}`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <span className="text-xs text-text-muted">
                {remaining > 0 ? <>잔여 <span className="text-brand-cyan font-bold">{remaining}자리</span></> : "마감"}
              </span>
            </div>

            {/* CTA */}
            {joinStep === "idle" && (
              <div className="flex flex-col sm:flex-row gap-3">
                {isFull ? (
                  <button className="flex-1 py-3 text-base font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm cursor-not-allowed min-h-[48px]" disabled>
                    마감되었습니다
                  </button>
                ) : (
                  <ClipButton variant="cyan" size="lg" arrow className="flex-1 justify-center" onClick={handleJoin}>
                    참가 신청하기
                  </ClipButton>
                )}
                <button type="button" onClick={() => toast("문의 기능은 준비중입니다.", "info")} className="px-6 py-3 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm hover:border-brand-cyan/30 hover:text-white transition-all min-h-[48px] flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> 주최자에게 문의
                </button>
              </div>
            )}

            {joinStep === "confirming" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark/30 border border-brand-cyan/20 rounded-sm p-5">
                <h3 className="font-bold mb-3">참가 신청 확인</h3>
                <div className="space-y-2 text-sm text-text-muted mb-4">
                  <div className="flex justify-between"><span>모임</span><span className="text-white font-bold">{g.title}</span></div>
                  <div className="flex justify-between"><span>일시</span><span className="font-mono">{new Date(g.dateTime).toLocaleDateString("ko-KR")} {new Date(g.dateTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span></div>
                  <div className="flex justify-between"><span>장소</span><span>{g.location}</span></div>
                  {g.costPerPerson && <div className="flex justify-between"><span>참가비</span><span className="text-brand-cyan font-mono">₩{g.costPerPerson.toLocaleString()}</span></div>}
                </div>
                {g.notice && (
                  <div className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-sm p-3 mb-4">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-text-muted">{g.notice}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <ClipButton variant="cyan" className="flex-1 justify-center" onClick={handleConfirmJoin}>참가 확정</ClipButton>
                  <button onClick={() => setJoinStep("idle")} className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors">취소</button>
                </div>
              </motion.div>
            )}

            {joinStep === "processing" && (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-3" />
                <p className="font-bold">참가 처리 중...</p>
              </div>
            )}

            {joinStep === "done" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-14 h-14 bg-brand-cyan/15 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-brand-cyan" />
                </div>
                <h3 className="text-lg font-black mb-1">참가 완료!</h3>
                <p className="text-sm text-text-muted mb-1">마이페이지 일정에 자동 반영되었습니다.</p>
                <StatusBadge status="confirmed" size="md" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── 참여자 목록 ── */}
        {g.players && g.players.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <DetailSection title={`참여자 (${g.players.length}/${g.maxPlayers})`} icon={<Users className="w-4 h-4 text-brand-cyan" />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {g.players.map((p, i) => (
                  <div key={i} className="bg-dark/30 border border-ui-border rounded-sm p-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center shrink-0">
                      <span className="text-brand-cyan text-[10px] font-bold">{(p.name || "?")[0]}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold">{p.name}</div>
                      <div className="text-[10px] text-text-muted flex items-center gap-1">
                        Lv.{p.level} · <Shield className="w-2.5 h-2.5" />{p.trustScore}
                      </div>
                    </div>
                    {i === 0 && <span className="ml-auto text-[9px] text-brand-cyan font-mono">주최</span>}
                  </div>
                ))}
                {/* 빈 자리 */}
                {Array.from({ length: g.maxPlayers - g.currentPlayers }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-dark/10 border border-dashed border-ui-border rounded-sm p-3 flex items-center justify-center min-h-[56px]">
                    <span className="text-xs text-text-muted/40">빈 자리</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </motion.div>
        )}

        {/* ── 준비물 ── */}
        {(g.equipment || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <DetailSection title="준비물" icon={<span className="text-brand-cyan">🎒</span>}>
              <ul className="space-y-1.5">
                {(g.equipment || []).map((e, i) => (
                  <li key={i} className="text-sm text-text-muted flex items-center gap-2">
                    <span className="w-1 h-1 bg-brand-cyan rounded-full shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </DetailSection>
          </motion.div>
        )}

        {/* ── 유의사항 ── */}
        {g.notice && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <DetailSection title="유의사항" icon={<AlertTriangle className="w-4 h-4 text-yellow-400" />}>
              <p className="text-sm text-text-muted">{g.notice}</p>
            </DetailSection>
          </motion.div>
        )}

        {/* ── 주최자 정보 ── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DetailSection title="주최자" icon={<span className="text-brand-cyan">👤</span>}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center clip-angled shrink-0">
                <span className="text-brand-cyan font-bold text-lg">{(g.authorName || "?")[0]}</span>
              </div>
              <div className="flex-1">
                <div className="font-bold">{g.authorName}</div>
                <div className="text-xs text-text-muted">Lv.{g.authorLevel} · 번개 {g.authorGamesHosted}회 주최</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-0.5"><Shield className="w-3 h-3" />신뢰 {g.authorTrustScore}</span>
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-400" />매너 {g.authorMannerScore}</span>
                  <span>참석률 {g.authorAttendRate}%</span>
                  {g.authorNoShow === 0 ? <span className="text-brand-cyan">노쇼 0</span> : <span className="text-brand-red">노쇼 {g.authorNoShow}</span>}
                </div>
              </div>
            </div>
          </DetailSection>
        </motion.div>

        {/* 모바일 하단 고정 CTA */}
        {joinStep === "idle" && !isFull && (
          <div className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-md border-t border-ui-border p-3 flex gap-2 md:hidden z-40">
            <Link href="/play-together" className="shrink-0">
              <button className="px-4 py-3 text-sm font-bold text-text-muted bg-white/5 border border-ui-border rounded-sm min-h-[48px]">목록</button>
            </Link>
            <ClipButton variant="cyan" className="flex-1 justify-center min-h-[48px]" onClick={handleJoin}>
              참가 신청하기
            </ClipButton>
          </div>
        )}
        <div className="h-20 md:hidden" />
      </div>
    </div>
  );
}

function DetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 md:p-5 mb-4">
      <TechCorners />
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}
