"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import ChatButton from "@/components/chat/ChatButton";
import {
  Users, MapPin, Phone, MessageCircle, ArrowLeft, Calendar,
  UserPlus, UserMinus, Shield, FileText, Send, Pin, Check, X as XIcon,
} from "lucide-react";

function InfoItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  if (!value) return null;
  const inner = (
    <div className="flex items-start gap-3 py-3 border-b border-ui-border last:border-0">
      <div className="w-5 h-5 mt-0.5 text-brand-cyan shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener" className="block hover:bg-brand-cyan/5 transition-colors">{inner}</a>;
  return inner;
}

export default function ClubDetailPage({ club: c }: { club: any }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState("");

  // Post form
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  // Comment
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const isOwner = user && c.ownerId === user.id;
  const myMembership = user ? members.find(m => m.userId === user.id && m.status !== "left" && m.status !== "rejected") : null;
  const isMember = myMembership?.status === "active";
  const isPending = myMembership?.status === "pending";
  const activeMembers = members.filter(m => m.status === "active");
  const pendingMembers = members.filter(m => m.status === "pending");

  useEffect(() => {
    fetch(`/api/clubs/${c.id}/members`).then(r => r.json()).then(d => setMembers(d.members || [])).catch(() => {});
    fetch(`/api/clubs/${c.id}/posts`).then(r => r.json()).then(d => setPosts(d.posts || [])).catch(() => {});
  }, [c.id]);

  async function handleJoin() {
    if (!user) return;
    setJoining(true);
    const res = await fetch(`/api/clubs/${c.id}/join`, { method: "POST" });
    const data = await res.json();
    setJoinMsg(data.error || "가입 신청 완료! 운영자 승인을 기다려주세요.");
    setJoining(false);
    if (res.ok) {
      setMembers(prev => [...prev, { id: "temp", clubId: c.id, userId: user.id, userName: user.name, role: "member", status: "pending" }]);
    }
  }

  async function handleLeave() {
    if (!confirm("정말 탈퇴하시겠습니까?")) return;
    await fetch(`/api/clubs/${c.id}/join`, { method: "DELETE" });
    setMembers(prev => prev.filter(m => !(m.userId === user?.id && m.status === "active")));
  }

  async function handleMemberAction(memberId: string, action: string) {
    await fetch(`/api/clubs/${c.id}/members`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, action }),
    });
    // Refresh members
    const res = await fetch(`/api/clubs/${c.id}/members`);
    const data = await res.json();
    setMembers(data.members || []);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    setPostSubmitting(true);
    await fetch(`/api/clubs/${c.id}/posts`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: postTitle, content: postContent, type: "free" }),
    });
    setPostTitle(""); setPostContent("");
    const res = await fetch(`/api/clubs/${c.id}/posts`);
    const data = await res.json();
    setPosts(data.posts || []);
    setPostSubmitting(false);
  }

  async function handleComment(postId: string) {
    const text = commentText[postId];
    if (!text?.trim()) return;
    await fetch(`/api/clubs/${c.id}/posts`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "comment", commentText: text }),
    });
    setCommentText(prev => ({ ...prev, [postId]: "" }));
    const res = await fetch(`/api/clubs/${c.id}/posts`);
    const data = await res.json();
    setPosts(data.posts || []);
  }

  async function handlePinPost(postId: string, pin: boolean) {
    await fetch(`/api/clubs/${c.id}/posts`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: pin ? "pin" : "unpin" }),
    });
    const res = await fetch(`/api/clubs/${c.id}/posts`);
    setPosts((await res.json()).posts || []);
  }

  const tabs = [
    { label: "정보", icon: <Users className="w-3.5 h-3.5" /> },
    { label: `회원 (${activeMembers.length})`, icon: <Users className="w-3.5 h-3.5" /> },
    { label: `게시판 (${posts.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
    ...(isOwner ? [{ label: `관리 (${pendingMembers.length})`, icon: <Shield className="w-3.5 h-3.5" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link href="/clubs" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-cyan transition-colors">
          <ArrowLeft className="w-4 h-4" /> 동호회 목록
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {c.isRecruiting !== false && <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-400/10 text-green-400">모집중</span>}
              <span className="text-xs text-text-muted">{c.region} {c.city} · {c.level || "전 급수"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{c.name}</h1>
          </div>
          <div className="flex gap-2">
            {user && !isMember && !isPending && !isOwner && c.isRecruiting !== false && (
              <button onClick={handleJoin} disabled={joining}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
                <UserPlus className="w-4 h-4" /> {joining ? "신청 중..." : "가입 신청"}
              </button>
            )}
            {isPending && <span className="px-4 py-2 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">승인 대기중</span>}
            {isMember && !isOwner && (
              <button onClick={handleLeave}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/5 transition-colors">
                <UserMinus className="w-4 h-4" /> 탈퇴
              </button>
            )}
          </div>
        </div>
        {joinMsg && <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg px-4 py-3 text-sm text-brand-cyan mb-4">{joinMsg}</div>}

        {/* Tabs */}
        <div className="flex border-b border-ui-border mb-6 overflow-x-auto">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === i ? "text-brand-cyan border-b-2 border-brand-cyan" : "text-text-muted hover:text-white"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab: 정보 */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-ui-border rounded-lg p-5">
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="활동 장소" value={c.homeVenue || c.meetingVenue || ""} />
                <InfoItem icon={<Users className="w-4 h-4" />} label="회원 수" value={c.memberCount ? `${c.memberCount}명` : `${activeMembers.length}명`} />
                <InfoItem icon={<Calendar className="w-4 h-4" />} label="활동 일정" value={c.meetingSchedule || ""} />
                <InfoItem icon={<Phone className="w-4 h-4" />} label="연락처" value={c.contactPhone || c.contactPhoneOrKakao || ""} />
                {c.fee && <InfoItem icon={<MessageCircle className="w-4 h-4" />} label="회비" value={c.fee} />}
              </div>
              {c.description && (
                <div className="bg-surface border border-ui-border rounded-lg p-5">
                  <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">소개</h2>
                  <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{c.description}</p>
                </div>
              )}
              {Array.isArray(c.tags) && c.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">{c.tags.map((t: string) => <span key={t} className="text-xs px-3 py-1 bg-white/5 text-text-muted rounded-full">{t}</span>)}</div>
              )}
            </div>
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-surface border border-ui-border rounded-lg p-5 text-center">
                <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-brand-cyan" />
                </div>
                <h3 className="font-bold text-white mb-1">{c.name}</h3>
                <p className="text-xs text-text-muted mb-4">{c.region} · {c.level || "전 급수"}</p>
              </div>
              {c.ownerId && <ChatButton targetUserId={c.ownerId} context={`동호회: ${c.name}`} label="운영자에게 문의" />}
            </div>
          </div>
        )}

        {/* Tab: 회원 */}
        {activeTab === 1 && (
          <div className="space-y-2">
            {activeMembers.length === 0 ? (
              <p className="text-center text-text-muted py-8">아직 회원이 없습니다.</p>
            ) : activeMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-surface border border-ui-border rounded-lg">
                <div className="w-9 h-9 bg-white/5 border border-ui-border rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-text-muted">{(m.userName || "?")[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    {m.userName}
                    {m.role === "owner" && <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded ml-2">운영자</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: 게시판 */}
        {activeTab === 2 && (
          <div className="space-y-4">
            {/* Write form (members only) */}
            {isMember || isOwner ? (
              <form onSubmit={handlePost} className="bg-surface border border-ui-border rounded-lg p-4 space-y-3">
                <input type="text" value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="제목"
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none" />
                <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="내용을 입력하세요" rows={3}
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none resize-y" />
                <button type="submit" disabled={postSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
                  <Send className="w-3.5 h-3.5" /> {postSubmitting ? "작성 중..." : "글쓰기"}
                </button>
              </form>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">회원만 글을 작성할 수 있습니다.</p>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
              <p className="text-center text-text-muted py-8">아직 게시글이 없습니다.</p>
            ) : posts.map(p => (
              <div key={p.id} className={`bg-surface border rounded-lg p-4 ${p.isPinned ? "border-brand-cyan/30 bg-brand-cyan/5" : "border-ui-border"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {p.isPinned && <span className="text-[10px] text-brand-cyan font-bold mr-2">📌 공지</span>}
                    <span className="text-sm font-bold text-white">{p.title}</span>
                  </div>
                  <div className="flex gap-1">
                    {isOwner && (
                      <button onClick={() => handlePinPost(p.id, !p.isPinned)} className="p-1 text-text-muted hover:text-brand-cyan"><Pin className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed mb-2">{p.content}</p>
                <p className="text-[10px] text-text-muted">{p.authorName} · {new Date(p.createdAt).toLocaleDateString("ko")}</p>

                {/* Comments */}
                {(p.comments || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-ui-border space-y-2">
                    {p.comments.map((cm: any) => (
                      <div key={cm.id} className="flex gap-2">
                        <span className="text-[10px] text-brand-cyan font-bold shrink-0">{cm.authorName}</span>
                        <span className="text-[11px] text-text-muted">{cm.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(isMember || isOwner) && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={commentText[p.id] || ""} onChange={e => setCommentText(prev => ({ ...prev, [p.id]: e.target.value }))}
                      placeholder="댓글" className="flex-1 px-2 py-1 bg-dark border border-ui-border rounded text-xs text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleComment(p.id); } }} />
                    <button onClick={() => handleComment(p.id)} className="text-xs text-brand-cyan hover:underline">등록</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: 관리 (owner only) */}
        {activeTab === 3 && isOwner && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">가입 신청 ({pendingMembers.length})</h3>
            {pendingMembers.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">대기 중인 신청이 없습니다.</p>
            ) : pendingMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-surface border border-ui-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-text-muted">{(m.userName || "?")[0]}</span></div>
                  <p className="text-sm text-white">{m.userName}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleMemberAction(m.id, "approve")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-400 border border-green-400/30 rounded-lg hover:bg-green-400/5"><Check className="w-3 h-3" /> 승인</button>
                  <button onClick={() => handleMemberAction(m.id, "reject")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/5"><XIcon className="w-3 h-3" /> 거절</button>
                </div>
              </div>
            ))}

            <h3 className="text-sm font-bold text-white mt-6">회원 관리 ({activeMembers.length})</h3>
            {activeMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-surface border border-ui-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-text-muted">{(m.userName || "?")[0]}</span></div>
                  <p className="text-sm text-white">{m.userName} {m.role === "owner" && <span className="text-[10px] text-brand-cyan ml-1">운영자</span>}</p>
                </div>
                {m.role !== "owner" && (
                  <button onClick={() => handleMemberAction(m.id, "kick")}
                    className="text-[10px] text-red-400 hover:underline">강퇴</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
