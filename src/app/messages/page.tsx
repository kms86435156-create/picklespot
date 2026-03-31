"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { MessageCircle, ChevronRight, Clock } from "lucide-react";

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login?from=/messages");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [user]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {}
    setFetching(false);
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-text-muted text-sm animate-pulse">로딩 중...</div></div>;
  }

  function timeAgo(dateStr: string) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">메시지</h1>
            <p className="text-sm text-text-muted">1:1 대화</p>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-surface border border-ui-border rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-full" />
                  <div className="flex-1"><div className="h-4 w-1/3 bg-white/5 rounded mb-2" /><div className="h-3 w-2/3 bg-white/5 rounded" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
            <MessageCircle className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
            <p className="text-text-muted font-medium mb-1">아직 대화가 없습니다</p>
            <p className="text-xs text-text-muted/60 mb-4">번개나 동호회에서 다른 피클볼러에게 메시지를 보내보세요!</p>
            <Link href="/matches" className="text-sm text-brand-cyan hover:underline font-bold">번개 둘러보기</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(c => (
              <Link key={c.id} href={`/messages/${c.id}`} className="block">
                <div className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${c.unreadCount > 0 ? "bg-brand-cyan/5 border-brand-cyan/20 hover:border-brand-cyan/40" : "bg-surface border-ui-border hover:border-text-muted/30"}`}>
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/5 border border-ui-border rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-text-muted">{(c.partnerName || "?")[0]}</span>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-cyan text-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${c.unreadCount > 0 ? "text-white" : "text-text-muted"}`}>{c.partnerName}</p>
                      <span className="text-[10px] text-text-muted/60 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${c.unreadCount > 0 ? "text-text-muted" : "text-text-muted/50"}`}>
                      {c.lastMessage || "대화를 시작하세요"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted/30 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
