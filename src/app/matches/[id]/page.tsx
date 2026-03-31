"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  MapPin, Calendar, Clock, Users, Target, ArrowLeft, Navigation,
  UserPlus, UserMinus, Phone, CheckCircle, Lock, MessageCircle,
} from "lucide-react";

function statusStyle(s: string) {
  if (s === "open") return "bg-green-400/10 text-green-400 border-green-400/20";
  if (s === "closed") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  if (s === "completed") return "bg-white/5 text-text-muted border-ui-border";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}
function statusLabel(s: string) {
  if (s === "open") return "모집중";
  if (s === "closed") return "마감";
  if (s === "completed") return "완료";
  if (s === "cancelled") return "취소됨";
  return s;
}

export default function MatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const id = params.id as string;

  async function loadMatch() {
    try {
      const res = await fetch(`/api/meetups/${id}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setMatch(data);
      setParticipants((data.participants || []).filter((p: any) => p.status !== "cancelled"));
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadMatch(); }, [id]);

  const isHost = user && match?.hostId === user.id;
  const myParticipation = user ? participants.find(p => p.userId === user.id && !p.isHost) : null;
  const isFull = match && (match.currentPlayers || 0) >= (match.maxPlayers || 999);
  const joinedCount = participants.filter(p => p.status === "joined").length;

  async function handleJoin() {
    if (!user) { router.push(`/login?from=/matches/${id}`); return; }
    setJoining(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/meetups/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName: user.name, participantPhone: user.phone || "" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(data.waitlisted ? "대기자로 등록되었습니다." : "참가 신청 완료!");
      await loadMatch();
    } catch { setError("신청 중 오류가 발생했습니다."); }
    finally { setJoining(false); }
  }

  async function handleCancel() {
    setCancelling(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/meetups/${id}/join`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setSuccess("참가가 취소되었습니다.");
      await loadMatch();
    } catch { setError("취소 중 오류가 발생했습니다."); }
    finally { setCancelling(false); }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      await fetch(`/api/meetups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadMatch();
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark pt-14">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-surface rounded" />
            <div className="h-48 bg-surface rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-dark pt-14 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">번개를 찾을 수 없습니다.</p>
          <Link href="/matches" className="text-brand-cyan hover:underline">목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back */}
        <Link href="/matches" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-cyan transition-colors">
          <ArrowLeft className="w-4 h-4" /> 번개 목록
        </Link>

        {/* Main Card */}
        <div className="bg-surface border border-ui-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded border ${statusStyle(match.status)}`}>{statusLabel(match.status)}</span>
            <span className="text-xs text-text-muted font-mono">{match.region}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">{match.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-muted">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-cyan" /><span>{match.meetupDate}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-cyan" /><span>{match.meetupTime}</span></div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-cyan" />
              <span>{match.venueName || "장소 미정"}</span>
              {match.venueName && (
                <a href={`https://map.kakao.com/link/search/${encodeURIComponent(match.venueName)}`} target="_blank" rel="noopener"
                  className="text-[10px] text-brand-cyan hover:underline flex items-center gap-0.5 ml-1"><Navigation className="w-3 h-3" />길찾기</a>
              )}
            </div>
            <div className="flex items-center gap-2"><Target className="w-4 h-4 text-brand-cyan" /><span>{match.skillLevel || "무관"} · {match.playType || "자유"}</span></div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-cyan" />
              <span className="text-white font-bold">{match.currentPlayers}/{match.maxPlayers}명</span>
              {isFull && <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">정원 마감</span>}
            </div>
            {match.fee > 0 && (
              <div className="flex items-center gap-2"><span className="text-brand-cyan font-bold">₩{match.fee.toLocaleString()}</span></div>
            )}
          </div>

          {match.description && (
            <div className="mt-4 pt-4 border-t border-ui-border">
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{match.description}</p>
            </div>
          )}

          {/* Host info */}
          <div className="mt-4 pt-4 border-t border-ui-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-brand-cyan">{(match.hostName || "?")[0]}</span>
              </div>
              <div>
                <p className="text-sm text-white font-medium">{match.hostName} <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded ml-1">주최자</span></p>
                {match.hostPhone && <p className="text-xs text-text-muted flex items-center gap-1"><Phone className="w-3 h-3" />{match.hostPhone}</p>}
              </div>
            </div>
            {user && !isHost && match.hostId && (
              <button onClick={async () => {
                const res = await fetch("/api/chat/start", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ targetUserId: match.hostId, context: `번개: ${match.title}` }),
                });
                const data = await res.json();
                if (data.conversation) router.push(`/messages/${data.conversation.id}`);
              }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-cyan border border-brand-cyan/30 rounded-lg hover:bg-brand-cyan/10 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> 문의
              </button>
            )}
          </div>
        </div>

        {/* Action Messages */}
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}
        {success && <div className="bg-green-400/10 border border-green-400/30 rounded-lg px-4 py-3 text-sm text-green-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

        {/* Action Buttons */}
        {match.status === "open" && !isHost && !myParticipation && (
          <button onClick={handleJoin} disabled={joining}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            <UserPlus className="w-4 h-4" /> {joining ? "신청 중..." : isFull ? "대기자 등록" : "참가 신청"}
          </button>
        )}

        {myParticipation && match.status === "open" && (
          <button onClick={handleCancel} disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/5 disabled:opacity-50 transition-colors">
            <UserMinus className="w-4 h-4" /> {cancelling ? "취소 중..." : "참가 취소"}
          </button>
        )}

        {match.status !== "open" && !isHost && (
          <div className="flex items-center justify-center gap-2 py-3 text-text-muted border border-ui-border rounded-lg">
            <Lock className="w-4 h-4" /> {statusLabel(match.status)} — 참가 신청 불가
          </div>
        )}

        {/* Host Controls */}
        {isHost && (
          <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-4">
            <p className="text-xs text-brand-cyan font-medium mb-3">주최자 관리</p>
            <div className="flex flex-wrap gap-2">
              {match.status === "open" && (
                <button onClick={() => handleStatusChange("closed")}
                  className="px-4 py-2 text-xs font-bold text-yellow-400 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/5 transition-colors">
                  모집 마감
                </button>
              )}
              {(match.status === "open" || match.status === "closed") && (
                <button onClick={() => handleStatusChange("completed")}
                  className="px-4 py-2 text-xs font-bold text-green-400 border border-green-400/30 rounded-lg hover:bg-green-400/5 transition-colors">
                  완료 처리
                </button>
              )}
              {match.status === "open" && (
                <button onClick={() => handleStatusChange("cancelled")}
                  className="px-4 py-2 text-xs font-bold text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/5 transition-colors">
                  번개 취소
                </button>
              )}
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="bg-surface border border-ui-border rounded-lg p-5">
          <h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-ui-border flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-cyan" /> 참가자 ({joinedCount}명)
          </h2>
          {participants.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">아직 참가자가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                  <div className="w-8 h-8 bg-white/5 border border-ui-border rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-text-muted">{(p.participantName || "?")[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      {p.participantName}
                      {p.isHost && <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded ml-1">주최</span>}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${p.status === "joined" ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                    {p.status === "joined" ? "참가" : "대기"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
