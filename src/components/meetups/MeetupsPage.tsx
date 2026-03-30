"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, Users, Clock, ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import CreateMeetupModal from "./CreateMeetupModal";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "모집중", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  full: { label: "정원마감", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  closed: { label: "마감", color: "text-text-muted bg-white/5 border-ui-border" },
  completed: { label: "종료", color: "text-text-muted bg-white/5 border-ui-border" },
  cancelled: { label: "취소", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export default function MeetupsPage({ meetups }: { meetups: any[] }) {
  const [showCreate, setShowCreate] = useState(false);

  const openMeetups = meetups.filter(m => m.status === "open" || m.status === "full");
  const pastMeetups = meetups.filter(m => m.status === "completed" || m.status === "closed");

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-start justify-between gap-4">
          <PageHeader sysLabel="SYS.PLAY" title="같이" highlight="치기" subtitle="번개 모임에 참가하거나, 직접 만들어보세요" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="shrink-0 mt-6">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">번개 만들기</span>
              <span className="sm:hidden">만들기</span>
            </button>
          </motion.div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-surface border border-ui-border rounded-lg p-4">
            <div className="text-xs text-text-muted mb-1">모집중 번개</div>
            <div className="text-2xl font-black text-brand-cyan font-mono">{openMeetups.length}</div>
          </div>
          <div className="bg-surface border border-ui-border rounded-lg p-4">
            <div className="text-xs text-text-muted mb-1">전체 번개</div>
            <div className="text-2xl font-black font-mono">{meetups.length}</div>
          </div>
        </div>

        {/* 모집중 목록 */}
        {openMeetups.length > 0 ? (
          <div className="space-y-3 mb-8">
            {openMeetups.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <MeetupCard meetup={m} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center mb-8">
            <Users className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
            <p className="text-text-muted font-medium mb-1">현재 모집중인 번개 모임이 없습니다</p>
            <p className="text-xs text-text-muted/70 mb-4">직접 번개를 만들어 함께 칠 사람을 모아보세요!</p>
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
              번개 만들기 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 종료된 번개 */}
        {pastMeetups.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-text-muted mb-3">지난 번개</h3>
            <div className="space-y-2 opacity-60">
              {pastMeetups.slice(0, 5).map(m => <MeetupCard key={m.id} meetup={m} />)}
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateMeetupModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function MeetupCard({ meetup: m }: { meetup: any }) {
  const s = STATUS_LABELS[m.status] || STATUS_LABELS.open;
  const remaining = (m.maxPlayers || 0) - (m.currentPlayers || 0);

  return (
    <Link href={`/play-together/${m.id}`} className="block">
      <div className="bg-surface border border-ui-border rounded-lg p-4 md:p-5 hover:border-brand-cyan/30 transition-all group">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${s.color}`}>{s.label}</span>
          {m.skillLevel && <span className="text-[10px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded-sm border border-ui-border">{m.skillLevel}</span>}
        </div>
        <h3 className="font-bold text-base mb-2 group-hover:text-brand-cyan transition-colors">{m.title}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-text-muted">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-cyan/50" />{m.meetupDate}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-cyan/50" />{m.meetupTime}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-cyan/50" />{m.venueName || m.region || "미정"}</span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-cyan/50" />
            {m.currentPlayers || 0}/{m.maxPlayers || "?"}명
            {remaining > 0 && m.status === "open" && <span className="text-brand-cyan text-xs">({remaining}자리)</span>}
          </span>
        </div>
        {m.fee > 0 && <div className="mt-2 text-xs text-text-muted">참가비: ₩{m.fee.toLocaleString()}</div>}
      </div>
    </Link>
  );
}
