"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, CheckCircle, Clock,
  XCircle, Loader2,
} from "lucide-react";

interface FeedbackDetail {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  category: string;
  title: string;
  message: string;
  status: string;
  adminNote: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: "버그 신고",
  feature: "기능 제안",
  complaint: "불만/민원",
  general: "일반 문의",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "대기", icon: Clock, color: "text-yellow-400" },
  { value: "in_progress", label: "처리중", icon: Loader2, color: "text-blue-400" },
  { value: "resolved", label: "완료", icon: CheckCircle, color: "text-green-400" },
  { value: "dismissed", label: "반려", icon: XCircle, color: "text-text-muted" },
];

export default function AdminFeedbackDetailPage() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id as string;
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/feedbacks/${feedbackId}`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => {
        setFeedback(data);
        setAdminNote(data.adminNote || "");
        setLoading(false);
      })
      .catch(() => { setError("피드백을 불러올 수 없습니다."); setLoading(false); });
  }, [feedbackId]);

  async function handleStatusChange(newStatus: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFeedback(prev => prev ? { ...prev, ...data.feedback } : prev);
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFeedback(prev => prev ? { ...prev, adminNote: data.feedback.adminNote } : prev);
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
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

  if (error || !feedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <p className="text-red-400 text-sm">{error || "피드백을 찾을 수 없습니다."}</p>
        <Link href="/admin/feedbacks" className="text-sm text-brand-cyan hover:underline">목록으로</Link>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === feedback.status) || STATUS_OPTIONS[0];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/feedbacks")} className="p-1.5 rounded hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{feedback.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-muted">{CATEGORY_LABELS[feedback.category] || feedback.category}</span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-muted">{feedback.createdAt ? new Date(feedback.createdAt).toLocaleString("ko-KR") : ""}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 본문 */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="피드백 내용">
            <div className="whitespace-pre-wrap text-sm text-white leading-relaxed">
              {feedback.message}
            </div>
          </Section>

          <Section title="작성자 정보">
            <InfoRow icon={<User className="w-4 h-4" />} label="이름" value={feedback.userName || "익명"} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="이메일" value={feedback.userEmail || "-"} />
            {feedback.userId && (
              <div className="mt-2 pt-2 border-t border-ui-border/30">
                <Link href={`/admin/users/${feedback.userId}`} className="text-sm text-brand-cyan hover:underline">
                  회원 상세 보기 →
                </Link>
              </div>
            )}
          </Section>

          {/* 관리자 메모 */}
          <Section title="관리자 메모">
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="내부 처리 메모를 입력하세요"
              rows={4}
              className="w-full bg-dark border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50 resize-none mb-3"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="px-4 py-2 bg-brand-cyan/10 text-brand-cyan text-sm font-medium rounded-lg hover:bg-brand-cyan/20 transition-colors disabled:opacity-50"
            >
              {saving ? "저장중..." : "메모 저장"}
            </button>
          </Section>
        </div>

        {/* 상태 관리 패널 */}
        <div className="space-y-4">
          <Section title="상태 관리">
            <div className="space-y-2">
              {STATUS_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isActive = feedback.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={saving || isActive}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? `${opt.color} bg-white/5 font-medium cursor-default`
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    } disabled:opacity-50`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                    {isActive && <span className="ml-auto text-[10px]">현재</span>}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="처리 이력">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">현재 상태</span>
                <span className={currentStatus.color}>{currentStatus.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">등록일</span>
                <span className="text-white text-xs font-mono">
                  {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString("ko-KR") : "-"}
                </span>
              </div>
              {feedback.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-text-muted">완료일</span>
                  <span className="text-white text-xs font-mono">
                    {new Date(feedback.resolvedAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">최종 수정</span>
                <span className="text-white text-xs font-mono">
                  {feedback.updatedAt ? new Date(feedback.updatedAt).toLocaleDateString("ko-KR") : "-"}
                </span>
              </div>
            </div>
          </Section>
        </div>
      </div>
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
      <span className="text-sm text-text-muted w-20 shrink-0">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}
