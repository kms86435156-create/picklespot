"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Star, Send } from "lucide-react";

export default function VenueReviews({ venueId }: { venueId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [count, setCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchReviews(); }, [venueId]);

  async function fetchReviews() {
    const res = await fetch(`/api/venues/${venueId}/reviews`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setAvgRating(data.avgRating || 0);
    setCount(data.count || 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!rating) { setError("별점을 선택해주세요."); return; }
    if (!text.trim()) { setError("후기를 작성해주세요."); return; }
    setSubmitting(true);
    const res = await fetch(`/api/venues/${venueId}/reviews`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, text }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSubmitting(false); return; }
    setRating(0); setText(""); setShowForm(false);
    await fetchReviews();
    setSubmitting(false);
  }

  return (
    <div className="bg-surface border border-ui-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" /> 후기 ({count})
        </h2>
        <div className="flex items-center gap-1">
          {avgRating > 0 && (
            <>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-white">{avgRating}</span>
            </>
          )}
        </div>
      </div>

      {user && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full py-2 border border-dashed border-ui-border rounded-lg text-xs text-text-muted hover:text-brand-cyan hover:border-brand-cyan/30 transition-colors mb-4">
          후기 작성하기
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-dark rounded-lg space-y-3">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}>
                <Star className={`w-6 h-6 transition-colors ${n <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-text-muted/20"}`} />
              </button>
            ))}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="이용 후기를 작성해주세요" rows={3}
            className="w-full px-3 py-2 bg-surface border border-ui-border rounded text-sm text-white placeholder:text-text-muted/40 focus:border-brand-cyan focus:outline-none resize-y" />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="flex items-center gap-1 px-4 py-2 bg-brand-cyan text-dark font-bold text-xs rounded-lg disabled:opacity-50 transition-colors">
              <Send className="w-3 h-3" /> {submitting ? "작성 중..." : "등록"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs text-text-muted hover:text-white transition-colors">취소</button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">아직 후기가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-ui-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-text-muted/20"}`} />
                  ))}
                </div>
                <span className="text-[10px] text-text-muted">{r.authorName}</span>
                <span className="text-[10px] text-text-muted/40">{new Date(r.createdAt).toLocaleDateString("ko")}</span>
              </div>
              <p className="text-xs text-white/80">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
