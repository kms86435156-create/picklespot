"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  MapPin, Target, Clock, Users, Trophy, Zap, Heart, Bell,
  Edit3, Save, X, LogOut, ChevronRight, Bookmark, Shield, Calendar, MessageCircle,
} from "lucide-react";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];
const SKILL_LEVELS = ["입문", "초급", "중급", "상급"];
const TIME_OPTIONS = [
  { value: "weekday_morning", label: "평일 오전" },
  { value: "weekday_afternoon", label: "평일 오후" },
  { value: "weekday_evening", label: "평일 저녁" },
  { value: "weekend_morning", label: "주말 오전" },
  { value: "weekend_afternoon", label: "주말 오후" },
];
const PLAY_STYLES = ["복식", "단식", "둘다"];

function timeLabel(v: string) {
  return TIME_OPTIONS.find(t => t.value === v)?.label || v;
}

export default function MyPage() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [myMatches, setMyMatches] = useState<{ hosted: any[]; joined: any[] }>({ hosted: [], joined: [] });
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?from=/mypage");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setMatchesLoading(true);
      fetch("/api/auth/my-matches").then(r => r.json())
        .then(d => setMyMatches({ hosted: d.hosted || [], joined: d.joined || [] }))
        .catch(() => {})
        .finally(() => setMatchesLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        phone: user.phone || "",
        region: user.region || "",
        skillLevel: user.skillLevel || "",
        preferredTimes: user.preferredTimes || "",
        playStyle: user.playStyle || "",
      });
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      await refresh();
      setEditing(false);
    } catch {}
    setSaving(false);
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-text-muted text-sm animate-pulse">로딩 중...</div>
      </div>
    );
  }

  const daysSinceJoin = user.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / 86400000)) : 1;
  const timesArr = (user.preferredTimes || "").split(",").filter(Boolean);

  const tabs = [
    { icon: <Zap className="w-4 h-4" />, label: "번개" },
    { icon: <Trophy className="w-4 h-4" />, label: "대회" },
    { icon: <Users className="w-4 h-4" />, label: "동호회" },
    { icon: <MessageCircle className="w-4 h-4" />, label: "메시지" },
    { icon: <Bookmark className="w-4 h-4" />, label: "찜" },
    { icon: <Bell className="w-4 h-4" />, label: "알림" },
  ];

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ═══ 프로필 카드 ═══ */}
        <div className="bg-surface border border-ui-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-black text-brand-cyan">{user.name[0]}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">{user.name}</h1>
                  {user.role === "organizer" && (
                    <span className="text-[10px] px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded">운영자</span>
                  )}
                </div>
                <p className="text-sm text-text-muted">{user.email}</p>
                <p className="text-xs text-text-muted/60 mt-0.5">{daysSinceJoin}일째 피클볼러</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-brand-cyan border border-ui-border rounded-lg hover:border-brand-cyan/30 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> 수정
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-dark bg-brand-cyan font-bold rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
                    <Save className="w-3.5 h-3.5" /> {saving ? "저장..." : "저장"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-muted border border-ui-border rounded-lg hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" /> 취소
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 프로필 상세 (읽기 모드) */}
          {!editing ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <ProfileBadge icon={<MapPin className="w-3.5 h-3.5" />} label="지역" value={user.region || "미설정"} />
              <ProfileBadge icon={<Target className="w-3.5 h-3.5" />} label="실력" value={user.skillLevel || "미설정"} />
              <ProfileBadge icon={<Users className="w-3.5 h-3.5" />} label="플레이" value={user.playStyle || "미설정"} />
              <ProfileBadge icon={<Clock className="w-3.5 h-3.5" />} label="선호시간" value={timesArr.length > 0 ? `${timesArr.length}개` : "미설정"} />
            </div>
          ) : (
            /* 프로필 수정 폼 */
            <div className="space-y-4 mt-4 pt-4 border-t border-ui-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">이름</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:border-brand-cyan/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">연락처</label>
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:border-brand-cyan/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">지역</label>
                  <select value={editForm.region} onChange={e => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:border-brand-cyan/50 focus:outline-none">
                    <option value="">선택</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">실력</label>
                  <select value={editForm.skillLevel} onChange={e => setEditForm({ ...editForm, skillLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:border-brand-cyan/50 focus:outline-none">
                    <option value="">선택</option>
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">플레이 스타일</label>
                <div className="flex gap-2">
                  {PLAY_STYLES.map(s => (
                    <button key={s} type="button" onClick={() => setEditForm({ ...editForm, playStyle: s })}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${editForm.playStyle === s ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan" : "bg-dark border-ui-border text-text-muted hover:text-white"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">선호 시간대 (복수 선택)</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map(t => {
                    const selected = (editForm.preferredTimes || "").split(",").includes(t.value);
                    return (
                      <button key={t.value} type="button"
                        onClick={() => {
                          const current = (editForm.preferredTimes || "").split(",").filter(Boolean);
                          const next = selected ? current.filter((x: string) => x !== t.value) : [...current, t.value];
                          setEditForm({ ...editForm, preferredTimes: next.join(",") });
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${selected ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan" : "bg-dark border-ui-border text-text-muted hover:text-white"}`}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 선호 시간대 태그 (읽기 모드) */}
          {!editing && timesArr.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {timesArr.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 bg-white/5 text-text-muted rounded">{timeLabel(t)}</span>
              ))}
            </div>
          )}
        </div>

        {/* ═══ 활동 탭 ═══ */}
        <div className="bg-surface border border-ui-border rounded-lg overflow-hidden">
          <div className="flex border-b border-ui-border overflow-x-auto">
            {tabs.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === i ? "text-brand-cyan border-b-2 border-brand-cyan bg-brand-cyan/5" : "text-text-muted hover:text-white"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 0 && (
              matchesLoading ? (
                <div className="py-8 text-center text-text-muted text-sm animate-pulse">불러오는 중...</div>
              ) : (myMatches.hosted.length === 0 && myMatches.joined.length === 0) ? (
                <EmptySection
                  icon={<Zap className="w-10 h-10" />}
                  title="아직 참가한 번개가 없습니다"
                  desc="같은 실력의 피클볼러를 찾아 함께 플레이해보세요!"
                  ctaLabel="번개 찾기"
                  ctaHref="/matches"
                />
              ) : (
                <div className="space-y-4">
                  {myMatches.hosted.length > 0 && (
                    <div>
                      <p className="text-xs text-brand-cyan font-medium mb-2">내가 만든 번개</p>
                      {myMatches.hosted.map((m: any) => (
                        <Link key={m.id} href={`/matches/${m.id}`} className="block mb-2">
                          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-ui-border hover:border-brand-cyan/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <Zap className="w-4 h-4 text-brand-cyan shrink-0" />
                              <div>
                                <p className="text-sm text-white font-medium line-clamp-1">{m.title}</p>
                                <p className="text-[10px] text-text-muted">{m.meetupDate} {m.meetupTime} · {m.region}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${m.status === "open" ? "bg-green-400/10 text-green-400" : "bg-white/5 text-text-muted"}`}>
                              {m.status === "open" ? "모집중" : m.status === "closed" ? "마감" : "완료"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {myMatches.joined.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted font-medium mb-2">참가 신청한 번개</p>
                      {myMatches.joined.map((m: any) => (
                        <Link key={m.id} href={`/matches/${m.id}`} className="block mb-2">
                          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-ui-border hover:border-brand-cyan/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                              <div>
                                <p className="text-sm text-white font-medium line-clamp-1">{m.title}</p>
                                <p className="text-[10px] text-text-muted">{m.meetupDate} {m.meetupTime} · {m.venueName}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${m.status === "open" ? "bg-green-400/10 text-green-400" : "bg-white/5 text-text-muted"}`}>
                              {m.status === "open" ? "모집중" : m.status === "completed" ? "완료" : "마감"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link href="/matches" className="block text-center text-sm text-brand-cyan hover:underline mt-2">
                    번개 더보기 <ChevronRight className="w-3 h-3 inline" />
                  </Link>
                </div>
              )
            )}
            {activeTab === 1 && (
              <EmptySection
                icon={<Trophy className="w-10 h-10" />}
                title="아직 신청한 대회가 없습니다"
                desc="전국 피클볼 대회에 도전해보세요!"
                ctaLabel="대회 둘러보기"
                ctaHref="/tournaments"
              />
            )}
            {activeTab === 2 && (
              <EmptySection
                icon={<Users className="w-10 h-10" />}
                title="아직 가입한 동호회가 없습니다"
                desc="내 근처 동호회를 찾아 함께 운동해요!"
                ctaLabel="동호회 찾기"
                ctaHref="/clubs"
              />
            )}
            {activeTab === 3 && (
              <div className="text-center py-6">
                <MessageCircle className="w-10 h-10 text-text-muted/15 mx-auto mb-3" />
                <p className="text-text-muted font-medium mb-1">채팅 메시지</p>
                <p className="text-xs text-text-muted/60 mb-4">번개 주최자, 동호회 운영자와 1:1 대화</p>
                <Link href="/messages"
                  className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
                  메시지함 열기 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
            {activeTab === 4 && (
              <EmptySection
                icon={<Heart className="w-10 h-10" />}
                title="찜한 항목이 없습니다"
                desc="마음에 드는 대회, 코트, 동호회를 찜해보세요!"
                ctaLabel="피클볼장 찾기"
                ctaHref="/courts"
              />
            )}
            {activeTab === 5 && (
              <EmptySection
                icon={<Bell className="w-10 h-10" />}
                title="알림이 없습니다"
                desc="대회 접수, 번개 모집 등 새로운 소식을 알려드려요."
              />
            )}
          </div>
        </div>

        {/* ═══ 운영자 전용 섹션 ═══ */}
        {user.role === "organizer" && (
          <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-brand-cyan" />
              <h3 className="font-bold text-white">운영자 도구</h3>
            </div>
            <p className="text-sm text-text-muted mb-3">
              {user.clubName ? `${user.clubName} 운영자입니다.` : "동호회/대회를 운영하세요."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/tournaments/register" className="text-xs px-3 py-1.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-lg hover:bg-brand-cyan/20 transition-colors">
                대회 등록 요청
              </Link>
              <Link href="/request?type=club" className="text-xs px-3 py-1.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-lg hover:bg-brand-cyan/20 transition-colors">
                동호회 등록 요청
              </Link>
            </div>
          </div>
        )}

        {/* ═══ 로그아웃 ═══ */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-text-muted hover:text-red-400 border border-ui-border rounded-lg hover:border-red-400/30 transition-colors">
          <LogOut className="w-4 h-4" /> 로그아웃
        </button>
      </div>
    </div>
  );
}

function ProfileBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const isSet = value !== "미설정";
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isSet ? "bg-white/[0.02] border-ui-border" : "bg-transparent border-dashed border-ui-border/50"}`}>
      <span className={isSet ? "text-brand-cyan" : "text-text-muted/30"}>{icon}</span>
      <div>
        <p className="text-[10px] text-text-muted">{label}</p>
        <p className={`text-xs font-medium ${isSet ? "text-white" : "text-text-muted/40"}`}>{value}</p>
      </div>
    </div>
  );
}

function EmptySection({ icon, title, desc, ctaLabel, ctaHref }: {
  icon: React.ReactNode; title: string; desc: string; ctaLabel?: string; ctaHref?: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="text-text-muted/15 mx-auto mb-3 w-fit">{icon}</div>
      <p className="text-text-muted font-medium mb-1">{title}</p>
      <p className="text-xs text-text-muted/60 mb-4">{desc}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref}
          className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
          {ctaLabel} <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
