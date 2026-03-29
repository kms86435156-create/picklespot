"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy, Calendar, MapPin, Shield, Award, TrendingUp,
  ChevronRight, Star, Users, Zap, Clock, Target,
  BarChart3,
} from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import StatusBadge from "@/components/ui/StatusBadge";
import ClipButton from "@/components/ui/ClipButton";
import TabBar from "@/components/ui/TabBar";
import { useToast } from "@/components/ui/Toast";

const activityScoreRules = [
  { action: "예약 후 실제 참석", points: 10, icon: "✅" },
  { action: "번개 주최", points: 15, icon: "⚡" },
  { action: "후기 작성", points: 3, icon: "✍️" },
  { action: "경기 결과 입력", points: 2, icon: "📊" },
  { action: "노쇼 없음 (월간)", points: 5, icon: "🏅" },
  { action: "대회 참가", points: 20, icon: "🏆" },
  { action: "신규 회원 초대", points: 10, icon: "👥" },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-ui-bg/40 border border-ui-border rounded-sm p-4 md:p-5 card-grid-bg ${className}`}>
      <TechCorners />
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-bold">{title}</h3>
      {count !== undefined && <span className="text-[10px] font-mono text-text-muted ml-auto">{count}건</span>}
    </div>
  );
}

/* ── 탭 내용 ── */
function ScheduleTab({ u }: { u: any }) {
  const { toast } = useToast();
  const typeIcons: Record<string, React.ReactNode> = {
    tournament: <Trophy className="w-3.5 h-3.5 text-brand-cyan" />,
    flash: <Zap className="w-3.5 h-3.5 text-brand-cyan" />,
    court: <MapPin className="w-3.5 h-3.5 text-brand-cyan" />,
    lesson: <span className="text-brand-cyan text-xs">📚</span>,
  };
  const typeLabels: Record<string, string> = { tournament: "대회", flash: "번개", court: "코트", lesson: "레슨" };
  return (
    <div className="space-y-2">
      {(u.upcomingEvents || []).map((e) => (
        <button type="button" key={e.id} onClick={() => toast("일정 상세 보기는 준비중입니다.", "info")} className="flex items-center gap-3 bg-dark/30 border border-ui-border rounded-sm p-3 hover:border-brand-cyan/20 transition-all cursor-pointer w-full text-left">
          <div className="w-9 h-9 bg-brand-cyan/10 rounded-sm flex items-center justify-center shrink-0">{typeIcons[e.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{e.title}</div>
            <div className="text-xs text-text-muted">{e.location}{e.time ? ` · ${e.time}` : ""}</div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-xs font-mono font-bold ${e.dDay <= 3 ? "text-brand-red" : "text-brand-cyan"}`}>D-{e.dDay}</div>
            <div className="text-[10px] text-text-muted">{typeLabels[e.type]}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
        </button>
      ))}
      {(u.upcomingEvents || []).length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p className="mb-2">예정된 일정이 없습니다</p>
          <Link href="/tournaments"><ClipButton variant="cyan">대회 찾기</ClipButton></Link>
        </div>
      )}
    </div>
  );
}

function RecordTab({ u }: { u: any }) {
  return (
    <div className="space-y-2">
      {(u.recentResults || []).map((r) => (
        <div key={r.id} className="flex items-center gap-3 bg-dark/30 border border-ui-border rounded-sm p-3">
          <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-xs font-black ${r.result === "win" ? "bg-green-500/15 text-green-400" : "bg-brand-red/15 text-brand-red"}`}>
            {r.result === "win" ? "W" : "L"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">vs {r.opponent}</div>
            <div className="text-xs text-text-muted">{r.tournament || "일반 경기"}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-mono">{r.score}</div>
            <div className="text-[10px] text-text-muted">{r.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReservationsTab({ u }: { u: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-mono text-text-muted mb-2">대회 신청</h4>
        {(u.registeredTournaments || []).map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-dark/30 border border-ui-border rounded-sm p-3 mb-1.5">
            <div><div className="text-sm font-bold">{t.title}</div><div className="text-xs text-text-muted font-mono">{t.date}</div></div>
            <StatusBadge status={t.status} />
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-xs font-mono text-text-muted mb-2">코트 예약</h4>
        {(u.courtReservations || []).map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-dark/30 border border-ui-border rounded-sm p-3 mb-1.5">
            <div><div className="text-sm font-bold">{c.courtName}</div><div className="text-xs text-text-muted font-mono">{c.date} {c.time}</div></div>
            <StatusBadge status={c.status} />
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-xs font-mono text-text-muted mb-2">내 모임</h4>
        {(u.myFlashGames || []).map((g) => (
          <div key={g.id} className="flex items-center justify-between bg-dark/30 border border-ui-border rounded-sm p-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${g.role === "host" ? "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20" : "text-text-muted bg-white/5 border-ui-border"}`}>
                {g.role === "host" ? "주최" : "참여"}
              </span>
              <div><div className="text-sm font-bold">{g.title}</div><div className="text-xs text-text-muted">{g.date} · {g.location}</div></div>
            </div>
            <StatusBadge status={g.status === "upcoming" ? "confirmed" : "completed"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsTab({ u }: { u: any }) {
  const { toast } = useToast();
  return (
    <div className="space-y-1">
      {(u.notifications || []).map((n) => (
        <div key={n.id} className="flex items-center justify-between py-3 border-b border-ui-border last:border-0">
          <div>
            <div className="text-sm font-bold">{n.label}</div>
            <div className="text-xs text-text-muted">{n.description}</div>
          </div>
          <button
            type="button"
            onClick={() => toast(`${n.label} 알림이 ${n.enabled ? "해제" : "설정"}되었습니다.`, "success")}
            className={`w-10 h-6 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${n.enabled ? "bg-brand-cyan/30 justify-end" : "bg-white/10 justify-start"}`}
            aria-label={`${n.label} 알림 ${n.enabled ? "끄기" : "켜기"}`}
          >
            <div className={`w-5 h-5 rounded-full transition-colors ${n.enabled ? "bg-brand-cyan" : "bg-text-muted/50"}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── 메인 ── */
export default function MyPageContent({ user: u, dataMeta: _dataMeta }: { user: any; dataMeta?: any }) {
  const [activeTab, setActiveTab] = useState(0);
  if (!u) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-text-muted mb-2">로그인이 필요합니다</p>
        <p className="text-xs text-text-muted/60">아직 사용자 인증 시스템이 준비중입니다</p>
      </div>
    );
  }
  const scorePct = u.nextRankScore > 0 ? Math.min((u.activityScore / u.nextRankScore) * 100, 100) : 0;
  const daysSinceJoin = u.joinedDate ? Math.ceil((Date.now() - new Date(u.joinedDate).getTime()) / 86400000) : 0;

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══ 프로필 헤더 ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="mb-5">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              {/* 아바타 + 이름 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-cyan/15 border-2 border-brand-cyan/30 rounded-sm flex items-center justify-center clip-angled shrink-0">
                  <span className="text-brand-cyan font-black text-2xl">{(u.name || "?")[0]}</span>
                </div>
                <div>
                  <h1 className="text-xl font-black">{u.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="text-brand-cyan font-mono font-bold">Lv.{u.level}</span>
                    <span>DUPR {u.dupr}</span>
                    <span className="text-text-muted/40">·</span>
                    <span className="text-[11px]">{daysSinceJoin}일째 피클볼러</span>
                  </div>
                </div>
              </div>

              {/* 핵심 지표 4개 */}
              <div className="grid grid-cols-4 gap-2 flex-1">
                <div className="bg-dark/40 border border-ui-border rounded-sm p-2.5 text-center">
                  <div className="text-lg font-black text-brand-cyan font-mono">{u.winRate}%</div>
                  <div className="text-[10px] text-text-muted">승률</div>
                </div>
                <div className="bg-dark/40 border border-ui-border rounded-sm p-2.5 text-center">
                  <div className="text-lg font-black font-mono">{u.totalMatches}</div>
                  <div className="text-[10px] text-text-muted">총 경기</div>
                </div>
                <div className="bg-dark/40 border border-ui-border rounded-sm p-2.5 text-center">
                  <div className="text-lg font-black text-yellow-400 font-mono flex items-center justify-center gap-0.5"><Star className="w-3.5 h-3.5" />{u.mannerScore}</div>
                  <div className="text-[10px] text-text-muted">매너</div>
                </div>
                <div className="bg-dark/40 border border-ui-border rounded-sm p-2.5 text-center">
                  <div className="text-lg font-black text-brand-cyan font-mono">{u.trustScore}</div>
                  <div className="text-[10px] text-text-muted">신뢰</div>
                </div>
              </div>
            </div>

            {/* 부가 지표 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-ui-border text-xs text-text-muted">
              <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-green-400" />승 <span className="text-green-400 font-bold">{u.wins}</span> / 패 <span className="text-brand-red font-bold">{u.losses}</span></span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />참석률 <span className="text-brand-cyan font-bold">{u.attendRate}%</span></span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" />노쇼 <span className={u.noShowCount === 0 ? "text-brand-cyan font-bold" : "text-brand-red font-bold"}>{u.noShowCount}회</span></span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{u.preferredRegion} · {u.preferredTime}</span>
            </div>
          </Card>
        </motion.div>

        {/* ═══ 다음 행동 CTA ═══ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {(u.upcomingEvents || []).length > 0 ? (
            <div className="relative bg-gradient-to-r from-brand-cyan/10 to-brand-cyan/5 border border-brand-cyan/20 rounded-sm p-4 mb-5">
              <TechCorners color="rgba(0,212,255,0.2)" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <div className="text-xs text-brand-cyan font-mono">다음 일정</div>
                    <div className="font-bold">{u.upcomingEvents[0].title}</div>
                    <div className="text-xs text-text-muted">{u.upcomingEvents[0].date} · {u.upcomingEvents[0].location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black font-mono ${u.upcomingEvents[0].dDay <= 3 ? "text-brand-red" : "text-brand-cyan"}`}>D-{u.upcomingEvents[0].dDay}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-5 mb-5 text-center">
              <TechCorners />
              <p className="text-text-muted mb-3">예정된 일정이 없습니다. 다음 활동을 시작해 보세요!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/tournaments"><ClipButton variant="cyan"><Trophy className="w-3.5 h-3.5" />대회 찾기</ClipButton></Link>
                <Link href="/play-together"><ClipButton variant="cyan"><Users className="w-3.5 h-3.5" />같이 치기</ClipButton></Link>
                <Link href="/courts"><ClipButton variant="cyan"><MapPin className="w-3.5 h-3.5" />코트 예약</ClipButton></Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* ═══ 2열 그리드: 활동 점수 + 월별 기록 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {/* 활동점수 */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="h-full">
              <SectionTitle icon={<TrendingUp className="w-4 h-4 text-brand-cyan" />} title="활동점수" />
              {/* 랭크 프로그레스 */}
              <div className="bg-dark/40 border border-ui-border rounded-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-brand-cyan font-mono">{u.activityScore}</span>
                    <span className="text-xs text-text-muted">점</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-sm border border-brand-cyan/20">{u.activityRank}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-cyan/60 rounded-full transition-all" style={{ width: `${scorePct}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>다음 등급까지 <span className="text-brand-cyan font-bold">{u.nextRankScore - u.activityScore}점</span></span>
                  <span>골드 {u.nextRankScore}점</span>
                </div>
              </div>
              {/* 점수 기준 */}
              <div className="space-y-0">
                {activityScoreRules.map((rule) => (
                  <div key={rule.action} className="flex items-center justify-between text-xs py-2 border-b border-ui-border last:border-0">
                    <span className="flex items-center gap-2 text-text-muted"><span>{rule.icon}</span>{rule.action}</span>
                    <span className="font-mono text-brand-cyan font-bold">+{rule.points}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* 월별 기록 그래프 */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <SectionTitle icon={<BarChart3 className="w-4 h-4 text-brand-cyan" />} title="월별 기록" />
              <div className="flex items-end gap-2 h-36 mb-3">
                {(u.monthlyStats || []).map((s, i) => {
                  const stats = u.monthlyStats || [];
                  const maxMatches = stats.length > 0 ? Math.max(...stats.map((s) => s.matches)) : 1;
                  const barH = maxMatches > 0 ? (s.matches / maxMatches) * 100 : 0;
                  const winH = maxMatches > 0 ? (s.wins / maxMatches) * 100 : 0;
                  const isLast = i === stats.length - 1;
                  return (
                    <div key={s.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: "100%" }}>
                        <div className="relative w-full">
                          <div className="w-full bg-white/5 rounded-sm" style={{ height: `${barH}%`, minHeight: "4px" }}>
                            <div
                              className={`w-full rounded-sm ${isLast ? "bg-brand-cyan shadow-[0_0_8px_rgba(0,212,255,0.3)]" : "bg-brand-cyan/40"}`}
                              style={{ height: `${(winH / barH) * 100}%`, minHeight: "2px" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-mono text-text-muted">{s.month.slice(0, 2)}</div>
                        <div className={`text-[10px] font-mono font-bold ${isLast ? "text-brand-cyan" : "text-text-muted"}`}>{s.wins}W</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-[10px] text-text-muted">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-brand-cyan/40 rounded-sm" /> 총 경기</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-brand-cyan rounded-sm" /> 승리</span>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ═══ 배지 ═══ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="mb-5">
            <SectionTitle icon={<Award className="w-4 h-4 text-brand-cyan" />} title="배지" count={(u.badges || []).length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(u.badges || []).map((b) => (
                <div key={b.id} title={b.description} className="bg-dark/40 border border-ui-border rounded-sm p-3 text-center hover:border-brand-cyan/20 transition-all group">
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <div className="text-[11px] font-bold mb-0.5 group-hover:text-brand-cyan transition-colors">{b.name}</div>
                  <div className="text-[9px] text-text-muted leading-tight mb-1">{b.condition}</div>
                  {b.progress !== undefined && b.maxProgress !== undefined && (
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-brand-cyan rounded-full" style={{ width: `${Math.min((b.progress / b.maxProgress) * 100, 100)}%` }} />
                    </div>
                  )}
                  <div className="text-[9px] text-text-muted/50 mt-1">{b.earnedAt}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ═══ 탭: 일정 / 기록 / 예약·모임 / 알림 ═══ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <TabBar tabs={["내 일정", "경기 기록", "예약 · 모임", "알림 설정"]} activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === 0 && <ScheduleTab u={u} />}
            {activeTab === 1 && <RecordTab u={u} />}
            {activeTab === 2 && <ReservationsTab u={u} />}
            {activeTab === 3 && <NotificationsTab u={u} />}
          </Card>
        </motion.div>

        {/* ═══ 하단 행동 CTA ═══ */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <Link href="/tournaments" className="block">
              <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all group cursor-pointer text-center">
                <TechCorners />
                <Target className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
                <div className="font-bold text-sm group-hover:text-brand-cyan transition-colors">다음 대회 찾기</div>
                <div className="text-xs text-text-muted">실력을 시험해 보세요</div>
              </div>
            </Link>
            <Link href="/play-together" className="block">
              <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all group cursor-pointer text-center">
                <TechCorners />
                <Users className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
                <div className="font-bold text-sm group-hover:text-brand-cyan transition-colors">같이 칠 사람 찾기</div>
                <div className="text-xs text-text-muted">번개 모임에 참가하세요</div>
              </div>
            </Link>
            <Link href="/lessons" className="block">
              <div className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all group cursor-pointer text-center">
                <TechCorners />
                <TrendingUp className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
                <div className="font-bold text-sm group-hover:text-brand-cyan transition-colors">레슨 예약하기</div>
                <div className="text-xs text-text-muted">코치에게 배워보세요</div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
