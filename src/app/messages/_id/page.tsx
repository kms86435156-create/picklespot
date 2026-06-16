"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { ArrowLeft, Send, MoreVertical, Flag, Ban, Check, CheckCheck } from "lucide-react";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const convId = params.id as string;

  useEffect(() => {
    if (!loading && !user) router.push("/login?from=/messages");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    fetchPartner();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {}
  }

  async function fetchPartner() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      const conv = (data.conversations || []).find((c: any) => c.id === convId);
      if (conv) setPartner({ id: conv.partnerId, name: conv.partnerName });
    } catch {}
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, text: text.trim() }),
      });
      setText("");
      await fetchMessages();
    } catch {}
    setSending(false);
  }

  async function handleBlock() {
    if (!partner?.id) return;
    if (!confirm(`${partner.name}님을 차단하시겠습니까?`)) return;
    await fetch("/api/users/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: partner.id }),
    });
    router.push("/messages");
  }

  async function handleReport() {
    if (!partner?.id || !reportReason) return;
    await fetch("/api/users/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: partner.id, reason: reportReason, context: `conversation:${convId}` }),
    });
    setReportOpen(false);
    setReportReason("");
    alert("신고가 접수되었습니다.");
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-text-muted text-sm animate-pulse">로딩 중...</div></div>;
  }

  function formatTime(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }

  function formatDateDivider(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${(d.getMonth()+1).toString().padStart(2,"0")}.${d.getDate().toString().padStart(2,"0")}`;
  }

  let lastDate = "";

  return (
    <div className="min-h-screen bg-dark pt-14 flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-ui-border px-4 py-3 flex items-center justify-between sticky top-14 z-10">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 bg-white/5 border border-ui-border rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-text-muted">{(partner?.name || "?")[0]}</span>
          </div>
          <span className="text-sm font-bold text-white">{partner?.name || "..."}</span>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-text-muted hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-ui-border rounded-lg shadow-xl z-50 py-1">
                <button onClick={() => { setReportOpen(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-muted hover:text-yellow-400 hover:bg-yellow-400/5 transition-colors">
                  <Flag className="w-4 h-4" /> 신고하기
                </button>
                <button onClick={() => { handleBlock(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors">
                  <Ban className="w-4 h-4" /> 차단하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setReportOpen(false)}>
          <div className="bg-surface border border-ui-border rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white mb-3">사용자 신고</h3>
            <select value={reportReason} onChange={e => setReportReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white mb-3 focus:outline-none focus:border-brand-cyan/50">
              <option value="">신고 사유 선택</option>
              <option value="spam">스팸/광고</option>
              <option value="abuse">욕설/비방</option>
              <option value="fraud">사기/허위정보</option>
              <option value="harassment">괴롭힘</option>
              <option value="other">기타</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleReport} disabled={!reportReason}
                className="flex-1 py-2 bg-yellow-500 text-dark font-bold text-sm rounded-lg disabled:opacity-30 transition-colors">신고</button>
              <button onClick={() => setReportOpen(false)}
                className="flex-1 py-2 border border-ui-border text-text-muted text-sm rounded-lg hover:text-white transition-colors">취소</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <p className="text-center text-text-muted/40 text-sm py-8">대화를 시작해보세요!</p>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === user.id;
          const msgDate = formatDateDivider(msg.createdAt);
          let showDate = false;
          if (msgDate !== lastDate) { showDate = true; lastDate = msgDate; }

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="text-[10px] text-text-muted/40 bg-surface px-3 py-1 rounded-full">{msgDate}</span>
                </div>
              )}
              <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
                <div className={`max-w-[75%] ${isMine ? "order-2" : ""}`}>
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-brand-cyan text-dark rounded-br-sm"
                      : "bg-surface border border-ui-border text-white rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : ""}`}>
                    <span className="text-[9px] text-text-muted/40">{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      msg.isRead
                        ? <CheckCheck className="w-3 h-3 text-brand-cyan" />
                        : <Check className="w-3 h-3 text-text-muted/30" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-surface border-t border-ui-border px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2.5 bg-dark border border-ui-border rounded-full text-sm text-white placeholder:text-text-muted/40 focus:outline-none focus:border-brand-cyan/50"
            autoComplete="off"
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="w-10 h-10 bg-brand-cyan text-dark rounded-full flex items-center justify-center hover:bg-brand-cyan/90 disabled:opacity-30 transition-colors shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
