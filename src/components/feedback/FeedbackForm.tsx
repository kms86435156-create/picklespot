"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

const CATEGORIES = [
  { value: "bug", label: "버그 신고" },
  { value: "feature", label: "기능 제안" },
  { value: "complaint", label: "불만/민원" },
  { value: "general", label: "일반 문의" },
];

export default function FeedbackForm() {
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title: title.trim(), message: message.trim(), userName, userEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "전송 실패");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "피드백 전송에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">피드백이 전송되었습니다</h2>
        <p className="text-sm text-text-muted mb-6">소중한 의견 감사합니다. 검토 후 반영하겠습니다.</p>
        <button
          onClick={() => { setSubmitted(false); setTitle(""); setMessage(""); setCategory("general"); }}
          className="text-sm text-brand-cyan hover:underline"
        >
          추가 피드백 보내기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category */}
      <div>
        <label className="block text-sm text-text-muted mb-1.5">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                category === cat.value
                  ? "border-brand-cyan text-brand-cyan bg-brand-cyan/10"
                  : "border-ui-border text-text-muted hover:border-brand-cyan/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm text-text-muted mb-1.5">제목 *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="간단한 제목을 입력해주세요"
          className="w-full bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm text-text-muted mb-1.5">내용 *</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="자세한 내용을 작성해주세요"
          rows={5}
          className="w-full bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50 resize-none"
        />
      </div>

      {/* Contact info (non-logged-in) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-muted mb-1.5">이름 (선택)</label>
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="이름"
            className="w-full bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1.5">이메일 (선택)</label>
          <input
            type="email"
            value={userEmail}
            onChange={e => setUserEmail(e.target.value)}
            placeholder="답변받을 이메일"
            className="w-full bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-brand-cyan text-dark text-sm font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {submitting ? "전송중..." : "피드백 보내기"}
      </button>
    </form>
  );
}
