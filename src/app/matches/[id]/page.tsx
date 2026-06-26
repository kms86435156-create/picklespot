"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, CheckCircle, AlertCircle, User, Share2,
  MessageCircle, Users, Calendar, Clock, MapPin, Zap,
  Navigation, Shield
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { logger } from "@/lib/logger";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { maskName } from "@/lib/mask-name";

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

function formatDateShort(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const MAX_MESSAGE = 300;

export default function MeetupDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const justCreated = searchParams.get("created") === "1";
  const { user, requireLogin } = useAuth();

  const [meetup, setMeetup] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(justCreated);
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");

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
          setParticipants(prev => {
            if (prev.some(p => p.id === row.id || p.userId === row.user_id)) return prev;
            return [...prev, { id: row.id, userId: row.user_id, userName: row.user_name, status: row.status }];
          });
          setMeetup((prev: any) => prev ? { ...prev, currentPlayers: (prev.currentPlayers || 0) + 1 } : prev);
          if (user && row.user_id !== user.id) {
            setRealtimeToast(`${maskName(row.user_name)}님이 참여했어요!`);
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
    if (!requireLogin(() => handleApply())) return;
    setApplying(true);
    setApplyResult(null);
    try {
      const res = await fetch(`/api/meetups/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: applyMessage.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyResult({ success: true });
        setAlreadyApplied(true);
        setMeetup((prev: any) => prev ? { ...prev, currentPlayers: (prev.currentPlayers || 0) + 1 } : prev);
        setParticipants(prev => [...prev, { userId: user!.id, userName: user!.name, status: "confirmed" }]);
        setApplyMessage("");
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

  // 길찾기 URL 생성 (네이버 지도)
  function getDirectionsUrl() {
    const addr = meetup?.venueAddress || meetup?.venueName || "";
    if (!addr) return null;
    return `https://map.naver.com/v5/search/${encodeURIComponent(addr)}`;
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
  const isFull = filled >= max;
  const isOpen = meetup.status === "open" && !isFull;
  const skillColor = SKILL_COLORS[meetup.skillLevel] || SKILL_COLORS["무관"];
  const directionsUrl = getDirectionsUrl();

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-8">

      {/* ===== 토스트 알림들 ===== */}
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
            <span className="text-sm font-bold text-white">번개가 열렸어요! 참여자를 기다리는 중...</span>
          </motion.div>
        )}
      </AnimatePresence>
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
            <span className="text-sm font-bold text-white">참여 확정! 같이 즐겁게 치세요!</span>
          </motion.div>
        )}
      </AnimatePresence>
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

      {/* ===== 1. 상단 헤더 ===== */}
      <div className="mb-6">
        {/* 목록으로 돌아가기 */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/matches" className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />
            목록으로
          </Link>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-text-muted hover:text-brand-cyan transition-colors text-sm">
            <Share2 className="w-4 h-4" />
            공유
          </button>
        </div>

        {/* 상태 뱃지 + 종목·유형 태그 */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {isOpen ? (
            <span className="flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-green-400/15 text-green-400 border border-green-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              모집중
            </span>
          ) : isFull ? (
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white/10 text-text-muted border border-ui-border">
              모집완료
            </span>
          ) : (
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white/10 text-text-muted border border-ui-border">
              {meetup.status === "cancelled" ? "취소됨" : "종료"}
            </span>
          )}
          <span className="text-xs text-text-muted">피클볼</span>
          <span className="text-text-muted/30">·</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${skillColor}`}>
            {meetup.skillLevel || "무관"}
          </span>
          {meetup.isBeginnerFriendly && (
            <>
              <span className="text-text-muted/30">·</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/20">
                초보환영
              </span>
            </>
          )}
        </div>

        {/* 큰 제목 */}
        <h1 className="text-2xl font-black text-white leading-tight mb-3">{meetup.title}</h1>

        {/* 호스트가 쓴 소개글 */}
        {meetup.description && (
          <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap mb-4">{meetup.description}</p>
        )}

        {/* 한눈 요약 박스 */}
        <div className="bg-white/[0.04] border border-ui-border rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">모집 인원</p>
              <p className="text-sm font-bold text-white">{filled} / {max}명</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">레벨</p>
              <p className="text-sm font-bold text-white">{meetup.skillLevel || "무관"}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">성별</p>
              <p className="text-sm font-bold text-white">{meetup.gender || "무관"}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">호스트</p>
              <p className="text-sm font-bold text-white">{maskName(meetup.hostName)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 2. 플레이 정보 섹션 ===== */}
      <div className="bg-surface border border-ui-border rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-cyan" />
          플레이 정보
        </h2>
        <div className="space-y-3.5">
          {/* 날짜 */}
          <div className="flex items-start gap-3">
            <span className="text-xs text-text-muted w-16 shrink-0 pt-0.5">날짜</span>
            <span className="text-sm font-bold text-white">{formatDate(meetup.date)}</span>
          </div>
          {/* 시간 */}
          <div className="flex items-start gap-3">
            <span className="text-xs text-text-muted w-16 shrink-0 pt-0.5">시간</span>
            <span className="text-sm font-bold text-white">
              {meetup.startTime || "미정"}
              {meetup.endTime && ` ~ ${meetup.endTime}`}
            </span>
          </div>
          {/* 장소 */}
          {(meetup.venueName || meetup.region) && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-text-muted w-16 shrink-0 pt-0.5">장소</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{meetup.venueName || meetup.region}</p>
                {meetup.venueAddress && (
                  <p className="text-xs text-text-muted mt-0.5">{meetup.venueAddress}</p>
                )}
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline mt-1"
                  >
                    <Navigation className="w-3 h-3" />
                    길찾기
                  </a>
                )}
              </div>
            </div>
          )}
          {/* 코트 예약 상태 */}
          <div className="flex items-start gap-3">
            <span className="text-xs text-text-muted w-16 shrink-0 pt-0.5">코트</span>
            <span className="text-sm text-white">
              {meetup.courtReserved
                ? <span className="text-emerald-400 font-bold">예약됨</span>
                : <span className="text-text-muted">미예약 (현장 확인)</span>
              }
            </span>
          </div>
          {/* 참가비 */}
          <div className="flex items-start gap-3">
            <span className="text-xs text-text-muted w-16 shrink-0 pt-0.5">참가비</span>
            <span className="text-sm font-bold text-white">
              {meetup.fee > 0 ? `${meetup.fee.toLocaleString()}원` : <span className="text-emerald-400">무료</span>}
            </span>
          </div>
        </div>
      </div>

      {/* ===== 3. 호스트 섹션 ===== */}
      <div className="bg-surface border border-ui-border rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-cyan" />
          호스트
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-brand-cyan" />
          </div>
          <div>
            <p className="text-base font-bold text-white">{maskName(meetup.hostName)}</p>
            {meetup.hostDuprSingles || meetup.hostDuprDoubles ? (
              <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                {meetup.hostDuprSingles && <span>DUPR 단식 {meetup.hostDuprSingles}</span>}
                {meetup.hostDuprSingles && meetup.hostDuprDoubles && <span className="text-text-muted/30">|</span>}
                {meetup.hostDuprDoubles && <span>DUPR 복식 {meetup.hostDuprDoubles}</span>}
              </div>
            ) : (
              <p className="text-xs text-text-muted mt-0.5">레벨 미등록</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== 참여자 목록 ===== */}
      {participants.length > 0 && (
        <div className="bg-surface border border-ui-border rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-cyan" />
            참여자 {participants.length}명
          </h2>
          <div className="flex flex-wrap gap-2">
            {participants.map((p: any, i) => (
              <div key={p.id || i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-ui-border rounded-full">
                <User className="w-3 h-3 text-text-muted" />
                <span className="text-xs text-white font-medium">{maskName(p.userName || p.user_name)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 4. 신청 박스 ===== */}
      {applyResult?.error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {applyResult.error}
        </div>
      )}

      {alreadyApplied || applyResult?.success ? (
        /* 이미 참여한 상태 */
        <div className="bg-surface border border-ui-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black text-emerald-400">참여 확정됨</span>
          </div>
          <div className="space-y-2">
            <Link
              href={`/matches/${id}/chat`}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-cyan text-dark font-black rounded-xl text-sm hover:bg-brand-cyan/90 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              참여자 채팅방 열기
            </Link>
            <button
              onClick={handleCancelApply}
              disabled={applying}
              className="w-full py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
            >
              참여 취소
            </button>
          </div>
        </div>
      ) : isOpen ? (
        /* 신청 가능 */
        <div className="bg-surface border border-brand-cyan/20 rounded-2xl p-5">
          <h2 className="text-base font-black text-white mb-1">함께 치고 싶다면</h2>
          <p className="text-xs text-text-muted mb-4">신청하면 즉시 참여가 확정됩니다</p>

          {/* 요약 정보 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted mb-4 p-3 bg-white/[0.03] rounded-lg border border-ui-border">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateShort(meetup.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meetup.startTime || "미정"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {meetup.venueName || meetup.region || "미정"}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {max - filled}자리 남음
            </span>
          </div>

          {/* 메시지 입력 */}
          <div className="mb-4">
            <label className="text-xs font-bold text-text-muted mb-1.5 block">
              신청 메시지 <span className="font-normal">(선택)</span>
            </label>
            <div className="relative">
              <textarea
                value={applyMessage}
                onChange={e => setApplyMessage(e.target.value.slice(0, MAX_MESSAGE))}
                placeholder="호스트에게 전할 메시지를 적어주세요 (예: 복식 경험 2년, 잘 부탁드립니다!)"
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.04] border border-ui-border rounded-xl text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50 transition-colors resize-none"
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] text-text-muted/50">
                {applyMessage.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          {/* 신청 버튼 */}
          {user ? (
            <button
              onClick={handleApply}
              disabled={applying}
              id="meetup-apply-btn"
              className="w-full py-4 bg-brand-cyan text-dark font-black rounded-xl text-base hover:bg-brand-cyan/90 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-2"
            >
              {applying ? (
                <>
                  <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  신청하기
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => requireLogin(() => {})}
              className="w-full py-4 bg-white/[0.08] border border-ui-border text-white font-black rounded-xl text-base hover:bg-white/[0.12] transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              로그인 후 신청
            </button>
          )}

          <p className="text-[11px] text-text-muted/50 text-center mt-3 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            개인 연락처는 참여 확정 후에만 공유됩니다
          </p>
        </div>
      ) : (
        /* 마감 */
        <div className="bg-surface border border-ui-border rounded-2xl p-5 text-center">
          <p className="text-base font-bold text-text-muted">
            {isFull ? "인원이 꽉 찼어요" : "이 번개는 마감되었어요"}
          </p>
          <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline mt-3">
            <Zap className="w-3.5 h-3.5" />
            다른 번개 찾아보기
          </Link>
        </div>
      )}
    </div>
  );
}
