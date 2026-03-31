"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MessageSquare, Heart, MessageCircle, Eye, Send, Flag } from "lucide-react";

const CATEGORIES = ["전체", "자유", "질문", "장비", "대회후기", "코트후기"];
const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const SORTS = [{ value: "recent", label: "최신순" }, { value: "popular", label: "인기순" }, { value: "comments", label: "댓글순" }];

const catColors: Record<string, string> = {
  "자유": "bg-white/5 text-text-muted", "질문": "bg-blue-400/10 text-blue-400",
  "장비": "bg-purple-400/10 text-purple-400", "대회후기": "bg-yellow-400/10 text-yellow-400",
  "코트후기": "bg-green-400/10 text-green-400",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");
  const [region, setRegion] = useState("전체");
  const [sort, setSort] = useState("recent");
  const [showWrite, setShowWrite] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postCat, setPostCat] = useState("자유");
  const [postRegion, setPostRegion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  useEffect(() => { fetchPosts(); }, [category, region, sort]);

  async function fetchPosts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "전체") params.set("category", category);
    if (region !== "전체") params.set("region", region);
    params.set("sort", sort);
    const res = await fetch(`/api/community?${params}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    await fetch("/api/community", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category: postCat, region: postRegion }),
    });
    setTitle(""); setContent(""); setShowWrite(false);
    await fetchPosts();
    setSubmitting(false);
  }

  async function handleLike(postId: string) {
    await fetch("/api/community", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "like" }),
    });
    await fetchPosts();
  }

  async function handleComment(postId: string) {
    const text = commentTexts[postId];
    if (!text?.trim()) return;
    await fetch("/api/community", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "comment", commentText: text }),
    });
    setCommentTexts(prev => ({ ...prev, [postId]: "" }));
    await fetchPosts();
  }

  async function handleReport(postId: string) {
    if (!confirm("이 게시글을 신고하시겠습니까?")) return;
    await fetch("/api/community", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "report", reason: "inappropriate" }),
    });
    alert("신고가 접수되었습니다.");
  }

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">커뮤니티</h1>
              <p className="text-sm text-text-muted">피클볼러들의 이야기</p>
            </div>
          </div>
          {user && (
            <button onClick={() => setShowWrite(!showWrite)}
              className="px-4 py-2 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors">
              글쓰기
            </button>
          )}
        </div>

        {showWrite && (
          <form onSubmit={handlePost} className="bg-surface border border-ui-border rounded-lg p-4 mb-6 space-y-3">
            <div className="flex gap-2">
              <select value={postCat} onChange={e => setPostCat(e.target.value)} className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                {CATEGORIES.filter(c => c !== "전체").map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={postRegion} onChange={e => setPostRegion(e.target.value)} className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                <option value="">지역</option>
                {REGIONS.filter(r => r !== "전체").map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목"
              className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용을 입력하세요" rows={4}
              className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none resize-y" />
            <button type="submit" disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-cyan text-dark font-bold text-sm rounded-lg disabled:opacity-50 transition-colors">
              <Send className="w-3.5 h-3.5" /> {submitting ? "작성 중..." : "게시"}
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c ? "bg-brand-cyan text-dark" : "bg-white/5 text-text-muted hover:text-white"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          <select value={region} onChange={e => setRegion(e.target.value)} className="px-3 py-1.5 bg-dark border border-ui-border rounded text-xs text-white focus:border-brand-cyan focus:outline-none">
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-1.5 bg-dark border border-ui-border rounded text-xs text-white focus:border-brand-cyan focus:outline-none">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-surface rounded-lg animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
            <MessageSquare className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
            <p className="text-text-muted">게시글이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(p => (
              <div key={p.id} className="bg-surface border border-ui-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${catColors[p.category] || "bg-white/5 text-text-muted"}`}>{p.category}</span>
                  {p.region && <span className="text-[10px] text-text-muted">{p.region}</span>}
                  <span className="text-[10px] text-text-muted/50 ml-auto">{timeAgo(p.createdAt)}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{p.title}</h3>
                <p className="text-xs text-text-muted/80 line-clamp-2 mb-3">{p.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span>{p.authorName}</span>
                    <button onClick={() => user && handleLike(p.id)} className="flex items-center gap-1 hover:text-red-400 transition-colors">
                      <Heart className={`w-3.5 h-3.5 ${p.likedBy?.includes(user?.id) ? "text-red-400 fill-red-400" : ""}`} /> {p.likes || 0}
                    </button>
                    <button onClick={() => setExpandedPost(expandedPost === p.id ? null : p.id)} className="flex items-center gap-1 hover:text-brand-cyan transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" /> {p.comments?.length || 0}
                    </button>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {p.views || 0}</span>
                  </div>
                  {user && <button onClick={() => handleReport(p.id)} className="text-text-muted/30 hover:text-yellow-400"><Flag className="w-3.5 h-3.5" /></button>}
                </div>
                {expandedPost === p.id && (
                  <div className="mt-3 pt-3 border-t border-ui-border space-y-2">
                    {(p.comments || []).map((cm: any) => (
                      <div key={cm.id} className="flex gap-2">
                        <span className="text-[10px] text-brand-cyan font-bold shrink-0">{cm.authorName}</span>
                        <span className="text-[11px] text-text-muted">{cm.text}</span>
                      </div>
                    ))}
                    {user && (
                      <div className="flex gap-2 mt-1">
                        <input type="text" value={commentTexts[p.id] || ""} onChange={e => setCommentTexts(prev => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="댓글" className="flex-1 px-2 py-1.5 bg-dark border border-ui-border rounded text-xs text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none"
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleComment(p.id); } }} />
                        <button onClick={() => handleComment(p.id)} className="text-xs text-brand-cyan hover:underline font-bold">등록</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
