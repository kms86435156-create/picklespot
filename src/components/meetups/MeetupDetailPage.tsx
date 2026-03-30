"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Phone, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "모집중", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  full: { label: "정원마감", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  closed: { label: "마감", color: "text-text-muted bg-white/5 border-ui-border" },
  completed: { label: "종료", color: "text-text-muted bg-white/5 border-ui-border" },
  cancelled: { label: "취소", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export default function MeetupDetailPage({ meetup: m, participants }: { meetup: any; participants: any[] }) {
  const [showJoin, setShowJoin] = useState(false);
  const [joinStep, setJoinStep] = useState<"form" | "submitting" | "success" | "error">("form");
  const [joinError, setJoinError] = useState("");
  const [joinWaitlisted, setJoinWaitlisted] = useState(false);
  const [form, setForm] = useState({ participantName: "", participantPhone: "", note: "" });

  const s = STATUS_LABELS[m.status] || STATUS_LABELS.open;
  const remaining = (m.maxPlayers || 0) - (m.currentPlayers || 0);
  const canJoin = m.status === "open" || m.status === "full";
  const joinedList = participants.filter(p => p.status === "joined");
  const waitlist = participants.filter(p => p.status === "waitlist");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.participantName || !form.participantPhone) { setJoinError("이름과 연락처를 입력해주세요."); return; }
    setJoinStep("submitting");
    try {
      const res = await fetch(`/api/meetups/${m.id}/join`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJoinWaitlisted(!!data.waitlisted);
      setJoinStep("success");
    } catch (e: any) { setJoinError(e.message); setJoinStep("error"); }
  };

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/play-together" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-cyan transition-colors mb-6 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> 목록으로
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-surface border border-ui-border rounded-lg p-5 md:p-8 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm border ${s.color}`}>{s.label}</span>
              {m.skillLevel && <span className="text-[11px] text-text-muted bg-white/5 px-2 py-0.5 rounded-sm border border-ui-border">{m.skillLevel}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-3">{m.title}</h1>
            {m.description && <p className="text-text-muted text-sm mb-5">{m.description}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <InfoBox icon={<Calendar className="w-4 h-4" />} label="날짜" value={m.meetupDate} />
              <InfoBox icon={<Clock className="w-4 h-4" />} label="시간" value={m.meetupTime} />
              <InfoBox icon={<MapPin className="w-4 h-4" />} label="장소" value={m.venueName || m.region || "미정"} />
              <InfoBox icon={<Users className="w-4 h-4" />} label="인원" value={`${m.currentPlayers || 0}/${m.maxPlayers}명`} />
            </div>

            {m.fee > 0 && <div className="bg-dark/30 border border-ui-border rounded p-3 mb-5 text-sm">참가비: <span className="text-brand-cyan font-bold font-mono">₩{m.fee.toLocaleString()}</span></div>}

            <div className="bg-dark/30 border border-ui-border rounded p-3 mb-5">
              <div className="text-xs text-text-muted mb-1">주최자</div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{m.hostName}</span>
                {m.hostPhone && <a href={`tel:${m.hostPhone}`} className="flex items-center gap-1 text-xs text-brand-cyan hover:underline"><Phone className="w-3 h-3" />{m.hostPhone}</a>}
              </div>
            </div>

            {canJoin && !showJoin && (
              <button onClick={() => setShowJoin(true)} className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors">
                {remaining > 0 ? "참가 신청하기" : "대기자 등록하기"}
              </button>
            )}
          </div>
        </motion.div>

        {/* 참가 신청 폼 */}
        {showJoin && joinStep === "form" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-surface border border-brand-cyan/20 rounded-lg p-5 mb-5">
              <h3 className="font-bold mb-4">참가 신청</h3>
              <form onSubmit={handleJoin} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">이름 <span className="text-brand-red">*</span></label>
                    <input type="text" required value={form.participantName} onChange={e => setForm(p => ({ ...p, participantName: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">연락처 <span className="text-brand-red">*</span></label>
                    <input type="tel" required value={form.participantPhone} onChange={e => setForm(p => ({ ...p, participantPhone: e.target.value }))} placeholder="010-0000-0000"
                      className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-text-muted mb-1">메모</label>
                  <input type="text" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="추가 안내 사항"
                    className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
                </div>
                {joinError && <div className="text-sm text-red-400 bg-red-500/10 rounded p-2"><AlertTriangle className="w-3 h-3 inline mr-1" />{joinError}</div>}
                <button type="submit" className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors">
                  {remaining > 0 ? "참가 신청" : "대기자 등록"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
        {showJoin && joinStep === "submitting" && <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-brand-cyan animate-spin" /></div>}
        {showJoin && joinStep === "success" && (
          <div className="bg-surface border border-brand-cyan/20 rounded-lg p-5 mb-5 text-center">
            <CheckCircle className="w-10 h-10 text-brand-cyan mx-auto mb-2" />
            <h3 className="font-bold mb-1">{joinWaitlisted ? "대기자 등록 완료!" : "참가 신청 완료!"}</h3>
            <p className="text-sm text-text-muted">{joinWaitlisted ? "빈자리 발생 시 연락드리겠습니다." : "주최자가 확인 후 연락드리겠습니다."}</p>
          </div>
        )}
        {showJoin && joinStep === "error" && (
          <div className="bg-surface border border-red-500/20 rounded-lg p-5 mb-5 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <h3 className="font-bold mb-1">신청 실패</h3>
            <p className="text-sm text-text-muted mb-3">{joinError}</p>
            <button onClick={() => { setJoinStep("form"); setJoinError(""); }} className="text-sm text-brand-cyan hover:underline">다시 시도</button>
          </div>
        )}

        {/* 참가자 목록 */}
        {joinedList.length > 0 && (
          <div className="bg-surface border border-ui-border rounded-lg p-5 mb-5">
            <h3 className="font-bold text-sm mb-3">참가자 ({joinedList.length}명)</h3>
            <div className="space-y-2">
              {joinedList.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-dark/30 border border-ui-border rounded p-2 text-sm">
                  <span className="font-medium">{p.participantName}</span>
                  <span className="text-xs text-text-muted">{new Date(p.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {waitlist.length > 0 && (
          <div className="bg-surface border border-ui-border rounded-lg p-5">
            <h3 className="font-bold text-sm mb-3 text-yellow-400">대기자 ({waitlist.length}명)</h3>
            <div className="space-y-2">
              {waitlist.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-dark/30 border border-ui-border rounded p-2 text-sm">
                  <span className="font-medium">{p.participantName}</span>
                  <span className="text-xs text-yellow-400">대기중</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-dark/30 border border-ui-border rounded p-3">
      <div className="flex items-center gap-1.5 text-brand-cyan/50 mb-1">{icon}<span className="text-[10px] font-mono text-text-muted">{label}</span></div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
