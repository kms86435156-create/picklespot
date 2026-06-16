"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MapPin, Calendar, Users, Clock, ChevronLeft,
  CheckCircle, AlertCircle, User, Share2, Info
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { logger } from "@/lib/logger";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const SKILL_COLORS: Record<string, string> = {
  "처음이에요": "bg-emerald-400/15 text-emerald-400 border-emerald-400/20",
  "초보": "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/20",
  "초중급": "bg-blue-400/15 text-blue-400 border-blue-400/20",
  "중급": "bg-indigo-400/15 text-indigo-400 border-indigo-400/20",
  "중상급": "bg-purple-400/15 text-purple-400 border-purple-400/20",
  "상급": "bg-rose-400/15 text-rose-400 border-rose-400/20",
  "무관": "bg-white/10 text-white border-white/10"
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const wd = weekdays[d.getDay()];
  const diff = Math.floor((d.getTime() - new Date().getTime()) / 86400000);
  const prefix = diff === 0 ? "오늘" : diff === 1 ? "내일" : diff === 2 ? "모레" : "";
  return `${y}.${m}.${day} ${wd}${prefix ? ` (${prefix})` : ""}`;
}

export default function MeetupDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const justCreated = searchParams.get("created") === "1";
  const { user } = useAuth();

  const [meetup, setMeetup] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(justCreated);
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/meetups/${id}`)
      .then(r => r.json())
      .then(d => {
        setMeetup(d.meetup);
        setParticipants(d.participants || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Supabase Realtime: 참가자 변경 구독
  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;

    const channel = sb.channel(`meetup-${id}`)
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "meetup_participants", filter: `meetup_id=eq.${id}` },
        (payload: any) => {
          const row = payload.new;
          // 중복 방지
          setParticipants(prev => {
            if (prev.some(p => p.id === row.id || p.userId === row.user_id)) return prev;
            return [...prev, { id: row.id, userId: row.user_id, userName: row.user_name, status: row.status }];
          });
          setMeetup((prev: any) => prev ? { ...prev, currentPlayers: (prev.currentPlayers || 0) + 1 } : prev);
          // 본인이 아닌 경우 토스트 표시
          if (user && row.user_id !== user.id) {
            setRealtimeToast(`${row.user_name || "누군가"}님이 참여했어요! ⚡`);
            setTimeout(() => setRealtimeToast(null), 4000);
          }
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "DELETE", schema: "public", table: "meetup_participants", filter: `meetup_id=eq.${id}` },
        (payload: any) => {
          const row = payload.old;
          setParticipants(prev => prev.filter(p => p.id !== row.id));
          setMeetup((prev: any) => prev ? { ...prev, currentPlayers: Math.max(0, (prev.currentPlayers || 1) - 1) } : prev);
        }
      )
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [id, user]);

  useEffect(() => {
    if (user && participants.length > 0) {
      setAlreadyApplied(participants.some((p: any) => p.userId === user.id && p.status === "confirmed"));
    }
  }, [user, participants]);

  async function handleApply() {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    setApplying(true);
    setApplyResult(null);
    try {
      const res = await fetch(`/api/meetups/${id}/apply`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApplyResult({ success: true });
        setAlreadyApplied(true);
        // 참여자 목록 갱신
        setMeetup((prev: any) => prev ? { ...prev, currentPlayers: (prev.currentPlayers || 0) + 1 } : prev);
        setParticipants(prev => [...prev, { userId: user.id, userName: user.name, status: "confirmed" }]);
        logger.event("MEETUP_APPLIED", { meetupId: id, action: "apply" });
      } else {
        if (data.error?.includes("이미 신청")) setAlreadyApplied(true);
        setApplyResult({ error: data.error || "신청에 실패했습니다." });
      }
    } catch (err) {
      logger.error(err, "MeetupDetail.handleApply");
      setApplyResult({ error: "네트워크 오류가 발생했습니다." });
    } finally {
      setApplying(false);
    }
  }

  async function handleCancelApply() {
    if (!confirm("정말 번개 참여를 취소하시겠습니까?")) return;
    
    setApplying(true);
    setApplyResult(null);
    try {
      const res = await fetch(`/api/meetups/${id}/apply`, { method: "DELETE" });
      if (res.ok) {
        setAlreadyApplied(false);
        setMeetup((prev: any) => prev ? { ...prev, currentPlayers: Math.max(0, (prev.currentPlayers || 1) - 1) } : prev);
        setParticipants(prev => prev.filter(p => p.userId !== user?.id));
        logger.event("MEETUP_APPLIED", { meetupId: id, action: "cancel" });
      } else {
        const data = await res.json();
        setApplyResult({ error: data.error || "취소에 실패했습니다." });
      }
    } catch (err) {
      logger.error(err, "MeetupDetail.handleCancelApply");
      setApplyResult({ error: "네트워크 오류가 발생했습니다." });
    } finally {
      setApplying(false);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: meetup?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다!");
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-4">
          <div className="h-8 bg-surface border border-ui-border rounded-xl animate-pulse w-1/3" />
          <div className="h-48 bg-surface border border-ui-border rounded-xl animate-pulse" />
          <div className="h-24 bg-surface border border-ui-border rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😅</div>
        <h2 className="text-xl font-bold text-white mb-2">번개를 찾을 수 없어요</h2>
        <p className="text-text-muted text-sm mb-6">이미 취소되었거나 삭제된 번개입니다.</p>
        <Link href="/matches" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-cyan text-dark font-black rounded-xl hover:bg-brand-cyan/90 transition-all">
          <Zap className="w-4 h-4" />
          다른 번개 찾기
        </Link>
      </div>
    );
  }

  const filled = meetup.currentPlayers || 0;
  const max = meetup.maxPlayers || 4;
  const pct = Math.min((filled / max) * 100, 100);
  const isFull = filled >= max;
  const isOpen = meetup.status === "open" && !isFull;
  const skillColor = SKILL_COLORS[meetup.skillLevel] || SKILL_COLORS["무관"];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-32 lg:pb-6">

      {/* 생성 성공 토스트 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-emerald-400/20 border border-emerald-400/30 rounded-2xl shadow-xl backdrop-blur-sm"
            onAnimationComplete={() => setTimeout(() => setShowSuccess(false), 3000)}
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-white">번개가 열렸어요! ⚡ 참여자를 기다리는 중...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 신청 성공 토스트 */}
      <AnimatePresence>
        {applyResult?.success && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-brand-cyan/20 border border-brand-cyan/30 rounded-2xl shadow-xl backdrop-blur-sm"
            onAnimationComplete={() => setTimeout(() => setApplyResult(null), 3000)}
          >
            <CheckCircle className="w-5 h-5 text-brand-cyan shrink-0" />
            <span className="text-sm font-bold text-white">참여 확정! ⚡ 같이 즐겁게 치세요!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 실시간 참여 알림 토스트 */}
      <AnimatePresence>
        {realtimeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-emerald-400/20 border border-emerald-400/30 rounded-2xl shadow-xl backdrop-blur-sm"
          >
            <Users className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-white">{realtimeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 뒤로 가기 */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/matches" className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" />
          번개 목록
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 text-text-muted hover:text-brand-cyan transition-colors text-sm">
          <Share2 className="w-4 h-4" />
          공유
        </button>
      </div>

      {/* 메인 카드 */}
      <div className="bg-surface border border-ui-border rounded-2xl overflow-hidden mb-4">
        {/* 상태 바 */}
        <div className={`px-5 py-2.5 flex items-center justify-between ${isOpen ? "bg-brand-cyan/5 border-b border-brand-cyan/15" : "bg-white/[0.02] border-b border-ui-border"}`}>
          <div className="flex items-center gap-2">
            {isOpen
              ? <><Zap className="w-4 h-4 text-brand-cyan" /><span className="text-xs font-black text-brand-cyan">모집중</span></>
              : isFull
                ? <><span className="text-xs font-black text-text-muted">마감 (인원 꽉참)</span></>
                : <><span className="text-xs font-black text-text-muted">{meetup.status === "cancelled" ? "취소됨" : "종료"}</span></>
            }
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${skillColor}`}>
              {meetup.skillLevel || "무관"}
            </span>
            {meetup.isBeginnerFriendly && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/20">
                초보환영
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <h1 className="text-xl font-black text-white mb-4 leading-tight">{meetup.title}</h1>

          {/* 정보 목록 */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-brand-cyan" />
              </div>
              <div>
                <p className="text-xs text-text-muted">날짜</p>
                <p className="text-sm font-bold text-white">{formatDate(meetup.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-brand-cyan" />
              </div>
              <div>
                <p className="text-xs text-text-muted">시간</p>
                <p className="text-sm font-bold text-white">
                  {meetup.startTime || "미정"}
                  {meetup.endTime && ` ~ ${meetup.endTime}`}
                </p>
              </div>
            </div>
            {(meetup.venueName || meetup.region) && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">장소</p>
                  <p className="text-sm font-bold text-white">{meetup.venueName || meetup.region}</p>
                  {meetup.venueAddress && <p className="text-xs text-text-muted">{meetup.venueAddress}</p>}
                </div>
              </div>
            )}
            {meetup.fee > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center shrink-0">
                  <span className="text-brand-cyan text-sm font-bold">₩</span>
                </div>
                <div>
                  <p className="text-xs text-text-muted">참가비</p>
                  <p className="text-sm font-bold text-white">₩{meetup.fee.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* 인원 현황 */}
          <div className="bg-white/[0.04] border border-ui-border rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-cyan" />
                <span className="text-sm font-bold text-white">참여 현황</span>
              </div>
              <span className="text-sm font-black text-white">{filled}<span className="text-text-muted font-normal">/{max}명</span></span>
            </div>
            <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden mb-2">
              <motion.div
                className={`h-full rounded-full ${isFull ? "bg-white/20" : "bg-brand-cyan"}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-text-muted">
              {isFull ? "🔴 인원이 꽉 찼어요" : `${max - filled}명 더 모집 중이에요`}
            </p>
          </div>

          {/* 소개 */}
          {meetup.description && (
            <div className="bg-white/[0.04] border border-ui-border rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-white mb-2">번개 소개</p>
              <p className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed">{meetup.description}</p>
            </div>
          )}

          {/* 호스트 */}
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <p className="text-xs text-text-muted">호스트</p>
              <p className="font-bold text-white">{meetup.hostName || "익명"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 참여자 목록 */}
      {participants.length > 0 && (
        <div className="bg-surface border border-ui-border rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-white mb-3">참여자 {participants.length}명</p>
          <div className="flex flex-wrap gap-2">
            {participants.map((p: any, i) => (
              <div key={p.id || i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-ui-border rounded-full">
                <User className="w-3 h-3 text-text-muted" />
                <span className="text-xs text-white font-medium">{p.userName || p.user_name || "익명"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 신청 에러 */}
      {applyResult?.error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {applyResult.error}
        </div>
      )}

      {/* 안내 */}
      <div className="flex items-start gap-2 p-3 bg-brand-cyan/5 border border-brand-cyan/15 rounded-xl mb-5 text-xs text-text-muted">
        <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
        <p>신청하면 즉시 참여가 확정됩니다. 참여 후 호스트와 연락해 세부 사항을 확인하세요.</p>
      </div>

      {/* 신청 버튼 — 모바일: fixed bottom, 데스크탑: 인라인 */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-dark/90 backdrop-blur-sm border-t border-ui-border lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:backdrop-blur-none z-40">
        {alreadyApplied || applyResult?.success ? (
          <div className="flex gap-2 w-full">
            <div className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-400/10 border border-emerald-400/30 rounded-2xl text-emerald-400 font-black text-base">
              <CheckCircle className="w-5 h-5" />
              참여 확정! 같이 즐겁게 치세요 🎾
            </div>
            <button
              onClick={handleCancelApply}
              disabled={applying}
              className="px-4 py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-2xl hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              취소
            </button>
          </div>
        ) : isOpen ? (
          <button
            onClick={handleApply}
            disabled={applying}
            id="meetup-apply-btn"
            className="w-full py-4 bg-brand-cyan text-dark font-black rounded-2xl text-base hover:bg-brand-cyan/90 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-2"
          >
            {applying ? (
              <>
                <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                바로 참여하기 — {max - filled}자리 남음
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-4 bg-white/[0.06] border border-ui-border rounded-2xl text-text-muted font-bold text-base text-center">
            {isFull ? "😅 인원이 꽉 찼어요" : "이 번개는 마감되었어요"}
          </div>
        )}
      </div>
    </div>
  );
}
