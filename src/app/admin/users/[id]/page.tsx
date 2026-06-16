"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Shield, Calendar,
  Ban, CheckCircle,
} from "lucide-react";

interface UserDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  suspendedReason: string;
  suspendedAt: string;
  clubName: string;
  region: string;
  organizerNote: string;
  skillLevel: string;
  preferredTimes: string;
  playStyle: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLE_LABELS: Record<string, string> = { user: "일반 회원", organizer: "운영자" };
const SKILL_LABELS: Record<string, string> = { "입문": "입문", "초급": "초급", "중급": "중급", "상급": "상급" };

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setUser)
      .catch(() => setError("회원 정보를 불러올 수 없습니다."));
    setLoading(false);
  }, [userId]);

  async function handleSuspend() {
    if (!suspendReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend", reason: suspendReason }),
      });
      if (!res.ok) throw new Error();
      setUser(prev => prev ? { ...prev, status: "suspended", suspendedReason: suspendReason, suspendedAt: new Date().toISOString() } : prev);
      setShowSuspendModal(false);
      setSuspendReason("");
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivate() {
    if (!confirm("이 회원의 정지를 해제하시겠습니까?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate" }),
      });
      if (!res.ok) throw new Error();
      setUser(prev => prev ? { ...prev, status: "active", suspendedReason: "", suspendedAt: "" } : prev);
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded" />
        <div className="h-64 bg-white/5 rounded-lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <p className="text-red-400 text-sm">{error || "회원을 찾을 수 없습니다."}</p>
        <Link href="/admin/users" className="text-sm text-brand-cyan hover:underline">목록으로</Link>
      </div>
    );
  }

  const isSuspended = user.status === "suspended";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/users")} className="p-1.5 rounded hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{user.name || "(이름 없음)"}</h1>
          <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
        </div>
        {/* Status badge */}
        {isSuspended ? (
          <span className="text-xs px-3 py-1 rounded-full bg-red-400/10 text-red-400 font-medium">정지됨</span>
        ) : (
          <span className="text-xs px-3 py-1 rounded-full bg-green-400/10 text-green-400 font-medium">활성</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 기본 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="기본 정보">
            <InfoRow icon={<User className="w-4 h-4" />} label="이름" value={user.name || "-"} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="이메일" value={user.email} />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="전화번호" value={user.phone || "-"} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="지역" value={user.region || "-"} />
            <InfoRow icon={<Shield className="w-4 h-4" />} label="역할" value={ROLE_LABELS[user.role] || user.role} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="가입일" value={user.createdAt ? new Date(user.createdAt).toLocaleString("ko-KR") : "-"} />
          </Section>

          <Section title="피클볼 정보">
            <InfoRow label="실력" value={SKILL_LABELS[user.skillLevel] || user.skillLevel || "미설정"} />
            <InfoRow label="선호 시간" value={user.preferredTimes || "미설정"} />
            <InfoRow label="플레이 스타일" value={user.playStyle || "미설정"} />
            <InfoRow label="동호회" value={user.clubName || "-"} />
            {user.role === "organizer" && user.organizerNote && (
              <InfoRow label="운영자 메모" value={user.organizerNote} />
            )}
          </Section>

          {/* 정지 이력 */}
          {isSuspended && (
            <Section title="정지 정보">
              <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">계정 정지됨</span>
                </div>
                <p className="text-sm text-white mb-1">사유: {user.suspendedReason || "-"}</p>
                <p className="text-xs text-text-muted">
                  정지일: {user.suspendedAt ? new Date(user.suspendedAt).toLocaleString("ko-KR") : "-"}
                </p>
              </div>
            </Section>
          )}
        </div>

        {/* 액션 패널 */}
        <div className="space-y-4">
          <Section title="관리">
            <div className="space-y-3">
              {isSuspended ? (
                <button
                  onClick={handleActivate}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-400 text-sm font-medium rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  정지 해제
                </button>
              ) : (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  계정 정지
                </button>
              )}
            </div>
          </Section>

          <Section title="활동 요약">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">온보딩</span>
                <span className="text-white">{user.onboardingCompleted ? "완료" : "미완료"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">최종 수정</span>
                <span className="text-white text-xs font-mono">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("ko-KR") : "-"}
                </span>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* 정지 모달 */}
      {showSuspendModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[90]" onClick={() => setShowSuspendModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <div className="bg-surface border border-ui-border rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-white mb-1">계정 정지</h3>
              <p className="text-sm text-text-muted mb-4">
                <strong className="text-white">{user.name}</strong> 회원의 계정을 정지합니다.
              </p>
              <textarea
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                placeholder="정지 사유를 입력하세요"
                rows={3}
                className="w-full bg-dark border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50 resize-none mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowSuspendModal(false); setSuspendReason(""); }}
                  className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={!suspendReason.trim() || actionLoading}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "처리중..." : "정지하기"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-ui-border rounded-lg">
      <div className="px-5 py-3 border-b border-ui-border">
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center py-2 border-b border-ui-border/30 last:border-0">
      {icon && <span className="text-text-muted mr-3">{icon}</span>}
      <span className="text-sm text-text-muted w-24 shrink-0">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}
