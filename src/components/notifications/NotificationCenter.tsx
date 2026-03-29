"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, Settings, ChevronRight } from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
// Notification types — will be moved to shared types when notification system is live
interface Notification {
  id: string; type: string; priority: string; title: string; message: string;
  timestamp: string; read: boolean; actionUrl?: string; actionLabel?: string;
}

interface NotificationCategory {
  id: string; label: string; description: string; enabled: boolean; channel: string;
}

const notificationMeta: Record<string, { icon: string; color: string; categoryLabel: string }> = {
  tournament_registered: { icon: "🏆", color: "text-brand-cyan", categoryLabel: "대회" },
  court_reserved: { icon: "📍", color: "text-brand-cyan", categoryLabel: "코트" },
  schedule_reminder: { icon: "⏰", color: "text-yellow-400", categoryLabel: "리마인드" },
  deadline_approaching: { icon: "🔥", color: "text-brand-red", categoryLabel: "마감임박" },
  partner_accepted: { icon: "🤝", color: "text-green-400", categoryLabel: "파트너" },
  location_changed: { icon: "📢", color: "text-yellow-400", categoryLabel: "변경" },
  cancellation: { icon: "❌", color: "text-brand-red", categoryLabel: "취소" },
  refund_processed: { icon: "💰", color: "text-brand-cyan", categoryLabel: "환불" },
  flash_filled: { icon: "⚡", color: "text-brand-cyan", categoryLabel: "번개" },
  flash_joined: { icon: "✅", color: "text-green-400", categoryLabel: "번개" },
  result_recorded: { icon: "📊", color: "text-brand-cyan", categoryLabel: "기록" },
};

const defaultCategories: NotificationCategory[] = [
  { id: "booking", label: "예약 · 신청", description: "대회 신청, 코트 예약, 번개 참가 확정", enabled: true, channel: "both" },
  { id: "reminder", label: "일정 리마인드", description: "대회, 예약, 번개 하루 전 알림", enabled: true, channel: "both" },
  { id: "deadline", label: "마감 임박", description: "관심 대회 마감 임박 시", enabled: true, channel: "kakao" },
  { id: "partner", label: "파트너 · 매칭", description: "파트너 초대 수락, 번개 모집 완료", enabled: true, channel: "push" },
  { id: "changes", label: "변경 · 취소", description: "장소 변경, 취소, 환불 처리 결과", enabled: true, channel: "both" },
  { id: "activity", label: "활동 기록", description: "경기 결과 기록", enabled: false, channel: "push" },
];

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [view, setView] = useState<"list" | "settings">("list");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<NotificationCategory[]>(defaultCategories);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleCategory = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/50 z-50 md:bg-transparent"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-0 md:top-14 md:right-4 w-full md:w-[400px] h-full md:h-auto md:max-h-[calc(100vh-72px)] bg-surface border-l md:border border-ui-border md:rounded-sm z-50 flex flex-col shadow-2xl"
          >
            <TechCorners color="rgba(0,212,255,0.15)" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-cyan" />
                <h2 className="font-bold text-sm">
                  {view === "list" ? "알림" : "알림 설정"}
                </h2>
                {view === "list" && unreadCount > 0 && (
                  <span className="bg-brand-red text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {view === "list" && unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-brand-cyan hover:underline px-2 py-1 min-h-[32px]"
                  >
                    모두 읽음
                  </button>
                )}
                <button
                  onClick={() => setView(view === "list" ? "settings" : "list")}
                  className="p-1.5 text-text-muted hover:text-brand-cyan transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                  title={view === "list" ? "알림 설정" : "알림 목록"}
                >
                  {view === "list" ? <Settings className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-text-muted hover:text-white transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {view === "list" ? (
                <NotificationList
                  notifications={notifications}
                  onRead={markAsRead}
                  onClose={onClose}
                  formatTime={formatTime}
                />
              ) : (
                <NotificationSettings
                  categories={categories}
                  onToggle={toggleCategory}
                />
              )}
            </div>

            {/* Footer */}
            {view === "list" && (
              <div className="border-t border-ui-border px-4 py-2 shrink-0">
                <Link
                  href="/mypage"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1 text-xs text-text-muted hover:text-brand-cyan transition-colors py-1.5 min-h-[36px]"
                >
                  마이페이지에서 전체 내역 확인 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── 알림 리스트 ── */
function NotificationList({
  notifications,
  onRead,
  onClose,
  formatTime,
}: {
  notifications: Notification[];
  onRead: (id: string) => void;
  onClose: () => void;
  formatTime: (ts: string) => string;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <Bell className="w-10 h-10 text-text-muted/20 mb-3" />
        <p className="font-bold text-text-muted mb-1">알림이 없습니다</p>
        <p className="text-xs text-text-muted/60">새로운 알림이 오면 여기에 표시됩니다</p>
      </div>
    );
  }

  // 읽지 않은 것 먼저, 그 다음 시간순
  const sorted = [...notifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div>
      {sorted.map((n) => {
        const meta = notificationMeta[n.type];
        return (
          <div
            key={n.id}
            className={`border-b border-ui-border last:border-0 transition-all ${
              n.read ? "bg-transparent" : "bg-brand-cyan/[0.03]"
            }`}
          >
            <div className="px-4 py-3">
              <div className="flex items-start gap-3">
                {/* 아이콘 */}
                <div className="w-9 h-9 bg-ui-bg border border-ui-border rounded-sm flex items-center justify-center shrink-0 text-base">
                  {meta.icon}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-mono ${meta.color}`}>{meta.categoryLabel}</span>
                    {!n.read && <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full shrink-0" />}
                    {n.priority === "high" && n.read === false && (
                      <span className="text-[9px] text-brand-red font-mono">중요</span>
                    )}
                  </div>
                  <h4 className={`text-sm leading-snug mb-0.5 ${n.read ? "text-text-muted" : "font-bold"}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-text-muted/70 leading-relaxed mb-1.5">{n.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted/50 font-mono">{formatTime(n.timestamp)}</span>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <button
                          onClick={() => onRead(n.id)}
                          className="text-[10px] text-text-muted hover:text-brand-cyan transition-colors flex items-center gap-0.5 min-h-[28px]"
                        >
                          <Check className="w-3 h-3" />읽음
                        </button>
                      )}
                      {n.actionUrl && (
                        <Link
                          href={n.actionUrl}
                          onClick={() => { onRead(n.id); onClose(); }}
                          className="text-[10px] text-brand-cyan hover:underline flex items-center gap-0.5 min-h-[28px]"
                        >
                          {n.actionLabel || "보기"} <ChevronRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 알림 설정 ── */
function NotificationSettings({
  categories,
  onToggle,
}: {
  categories: NotificationCategory[];
  onToggle: (id: string) => void;
}) {
  const channelLabels: Record<string, string> = {
    kakao: "카카오톡",
    push: "앱 푸시",
    both: "카카오톡 + 앱 푸시",
  };

  return (
    <div className="px-4 py-3">
      <p className="text-xs text-text-muted mb-4">
        카테고리별로 알림 수신 여부를 설정할 수 있습니다.<br />
        운영 관련 중요 알림(장소 변경, 취소 등)은 항상 수신됩니다.
      </p>

      <div className="space-y-1">
        {categories.map((cat) => {
          const isChanges = cat.id === "changes";
          return (
            <div key={cat.id} className="flex items-center justify-between py-3 border-b border-ui-border last:border-0">
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-sm font-bold mb-0.5">{cat.label}</div>
                <div className="text-[11px] text-text-muted">{cat.description}</div>
                <div className="text-[10px] text-text-muted/50 mt-0.5 font-mono">
                  채널: {channelLabels[cat.channel]}
                </div>
              </div>
              {isChanges ? (
                <span className="text-[10px] text-text-muted bg-white/5 border border-ui-border rounded-sm px-2 py-1">
                  항상 수신
                </span>
              ) : (
                <button
                  onClick={() => onToggle(cat.id)}
                  className={`w-11 h-6 rounded-full flex items-center p-0.5 cursor-pointer transition-colors shrink-0 ${
                    cat.enabled ? "bg-brand-cyan/30 justify-end" : "bg-white/10 justify-start"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full transition-colors ${
                    cat.enabled ? "bg-brand-cyan" : "bg-text-muted/50"
                  }`} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-dark/30 border border-ui-border rounded-sm">
        <div className="text-[10px] font-mono text-text-muted/50 mb-1">카카오 알림톡 안내</div>
        <p className="text-xs text-text-muted">
          카카오 알림톡은 운영성 메시지만 발송됩니다. 광고성 메시지는 발송하지 않습니다.
          카카오톡 채널 차단 시에도 중요 알림(장소 변경, 취소)은 SMS로 대체 발송됩니다.
        </p>
      </div>
    </div>
  );
}
