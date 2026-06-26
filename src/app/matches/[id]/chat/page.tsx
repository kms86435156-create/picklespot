"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, Users, Zap } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { maskName } from "@/lib/mask-name";

interface Message {
  id: string;
  meetup_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export default function MeetupChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetupTitle, setMeetupTitle] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) router.push(`/login?from=/matches/${id}/chat`);
  }, [user, authLoading, router, id]);

  // 번개 정보 + 메시지 로드
  useEffect(() => {
    if (!user) return;

    // 번개 정보
    fetch(`/api/meetups/${id}`)
      .then(r => r.json())
      .then(d => {
        setMeetupTitle(d.meetup?.title || "번개 채팅");
        setParticipantCount(d.participants?.length || 0);
      })
      .catch(() => {});

    // 메시지 목록
    fetch(`/api/meetups/${id}/messages`)
      .then(async r => {
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.error);
        }
        return r.json();
      })
      .then(d => setMessages(d.messages || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  // Supabase Realtime 구독
  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;

    const channel = sb.channel(`meetup-chat-${id}`)
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "meetup_messages", filter: `meetup_id=eq.${id}` },
        (payload: any) => {
          const row = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [id]);

  // 새 메시지 올 때 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/meetups/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      const msg = await res.json();
      // Realtime으로 올 수도 있지만 즉시 반영
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      setInput("");
    } catch (err: any) {
      alert(err.message || "전송 실패");
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }

  function formatDateSeparator(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  if (authLoading || !user) {
    return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-text-muted text-sm animate-pulse">로딩 중...</div></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-white mb-2">{error}</h2>
          <Link href={`/matches/${id}`} className="text-sm text-brand-cyan hover:underline">번개 상세로 돌아가기</Link>
        </div>
      </div>
    );
  }

  // 날짜별 그룹핑 헬퍼
  let lastDate = "";

  return (
    <div className="flex flex-col h-screen bg-dark">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-md border-b border-ui-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-2xl mx-auto">
          <Link href={`/matches/${id}`} className="p-2 -ml-2 text-text-muted hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{meetupTitle}</h1>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Users className="w-3 h-3" />
              <span>참여자 {participantCount}명</span>
            </div>
          </div>
          <Zap className="w-4 h-4 text-brand-cyan" />
        </div>
      </header>

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-text-muted text-sm animate-pulse">메시지 불러오는 중...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Zap className="w-12 h-12 text-brand-cyan/20 mb-3" />
            <p className="text-text-muted text-sm mb-1">아직 메시지가 없어요</p>
            <p className="text-text-muted/50 text-xs">첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => {
              const isMine = msg.user_id === user.id;
              const dateStr = formatDateSeparator(msg.created_at);
              let showDate = false;
              if (dateStr !== lastDate) { showDate = true; lastDate = dateStr; }

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-[10px] text-text-muted/50 bg-white/5 px-3 py-1 rounded-full">{dateStr}</span>
                    </div>
                  )}
                  <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
                    <div className={`max-w-[75%] ${isMine ? "order-2" : ""}`}>
                      {!isMine && (
                        <p className="text-[10px] text-text-muted mb-0.5 ml-1">{maskName(msg.user_name)}</p>
                      )}
                      <div className="flex items-end gap-1.5">
                        {isMine && <span className="text-[9px] text-text-muted/40 mb-0.5">{formatTime(msg.created_at)}</span>}
                        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                          isMine
                            ? "bg-brand-cyan text-dark rounded-br-md"
                            : "bg-white/[0.08] text-white rounded-bl-md"
                        }`}>
                          {msg.content}
                        </div>
                        {!isMine && <span className="text-[9px] text-text-muted/40 mb-0.5">{formatTime(msg.created_at)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* 입력 바 */}
      <div className="sticky bottom-0 bg-dark/95 backdrop-blur-md border-t border-ui-border">
        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2.5 bg-white/[0.06] border border-ui-border rounded-full text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50"
            maxLength={500}
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 flex items-center justify-center bg-brand-cyan rounded-full text-dark hover:bg-brand-cyan/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
