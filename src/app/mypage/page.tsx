"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, Trophy, LogOut, Clock } from "lucide-react";

export default function MyPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?from=/mypage");
    }
  }, [user, loading, router]);

  // 내 참가 신청 내역 로드 (연락처 기반 — 향후 userId 기반으로 개선 가능)
  useEffect(() => {
    if (!user) return;
    setLoadingRegs(true);
    fetch("/api/auth/my-registrations")
      .then(r => r.json())
      .then(data => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingRegs(false));
  }, [user]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark pt-14 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-80">
          <div className="h-8 bg-white/5 rounded" />
          <div className="h-32 bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    pending: { label: "신청완료", cls: "text-yellow-400 bg-yellow-400/10" },
    paid: { label: "입금확인", cls: "text-blue-400 bg-blue-400/10" },
    approved: { label: "참가확정", cls: "text-green-400 bg-green-400/10" },
    waitlisted: { label: "대기", cls: "text-purple-400 bg-purple-400/10" },
    cancelled: { label: "취소", cls: "text-red-400 bg-red-400/10" },
    rejected: { label: "거부", cls: "text-red-400 bg-red-400/10" },
  };

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 프로필 */}
        <div className="bg-surface border border-ui-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-ui-border">
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" /> 로그아웃
            </button>
          </div>
        </div>

        {/* 대회 참가 내역 */}
        <div className="bg-surface border border-ui-border rounded-lg">
          <div className="px-6 py-4 border-b border-ui-border flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-cyan" />
            <h2 className="text-sm font-bold text-white">대회 참가 내역</h2>
          </div>

          {loadingRegs ? (
            <div className="p-8 text-center text-text-muted text-sm">로딩 중...</div>
          ) : registrations.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">참가 신청 내역이 없습니다</div>
          ) : (
            <div className="divide-y divide-ui-border/50">
              {registrations.map(r => {
                const sl = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                return (
                  <div key={r.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{r.tournamentTitle || "대회"}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                          {r.regNumber && <span className="font-mono">{r.regNumber}</span>}
                          {r.division && <span>{r.division}</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${sl.cls}`}>{sl.label}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-text-muted">
                      <Clock className="w-3 h-3" /> {r.createdAt?.slice(0, 10)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
