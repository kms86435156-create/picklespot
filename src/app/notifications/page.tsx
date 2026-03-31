"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Bell, Check } from "lucide-react";

function notifIcon(type: string) {
  if (type.startsWith("match_")) return "⚡";
  if (type.startsWith("chat_")) return "💬";
  if (type.startsWith("club_")) return "👥";
  if (type.startsWith("tournament_")) return "🏆";
  if (type === "system") return "📢";
  return "🔔";
}

function timeAgo(d: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login?from=/notifications");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  async function markRead(id: string, link?: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (link) router.push(link);
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-text-muted text-sm animate-pulse">로딩 중...</div></div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">알림</h1>
              <p className="text-sm text-text-muted">{unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모든 알림을 확인했습니다"}</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-cyan border border-brand-cyan/30 rounded-lg hover:bg-brand-cyan/10 transition-colors">
              <Check className="w-3.5 h-3.5" /> 모두 읽음
            </button>
          )}
        </div>

        {fetching ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-surface rounded-lg animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
            <Bell className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
            <p className="text-text-muted font-medium mb-1">알림이 없습니다</p>
            <p className="text-xs text-text-muted/60">번개 참가, 채팅 메시지 등 새로운 소식이 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <button key={n.id} onClick={() => markRead(n.id, n.link)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${!n.isRead ? "bg-brand-cyan/5 border-brand-cyan/20 hover:border-brand-cyan/40" : "bg-surface border-ui-border hover:border-text-muted/30"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{notifIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.isRead ? "text-white" : "text-text-muted"}`}>{n.title}</p>
                    <p className="text-xs text-text-muted/70 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-text-muted/40 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-brand-cyan rounded-full mt-2 shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
