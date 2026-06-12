"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  const [form, setForm] = useState({ reuse: "", painPoint: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // MVP: DB 저장 없이 Vercel 로깅으로만 남김
    logger.event("FEEDBACK_SUBMITTED" as any, form);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="text-center bg-surface border border-ui-border rounded-xl p-8 max-w-sm w-full">
          <CheckCircle className="w-12 h-12 text-brand-cyan mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">의견이 전달되었습니다</h2>
          <p className="text-sm text-text-muted mb-6">소중한 피드백 감사합니다!</p>
          <Link href="/" className="inline-block w-full py-3 bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-20 pb-10 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">피드백 남기기</h1>
        <p className="text-sm text-text-muted mb-8">PBL.SYS 사용 경험은 어떠셨나요? 솔직한 의견을 남겨주시면 서비스 개선에 큰 도움이 됩니다.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 다시 사용할 의향 */}
          <div>
            <label className="block text-sm font-bold text-white mb-3">1. 앞으로도 이 서비스를 사용할 의향이 있으신가요?</label>
            <div className="flex gap-3">
              <label className={`flex-1 text-center py-3 rounded-lg border cursor-pointer transition-all ${form.reuse === "예" ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan font-bold" : "bg-surface border-ui-border text-text-muted hover:border-text-muted"}`}>
                <input type="radio" name="reuse" value="예" className="hidden" checked={form.reuse === "예"} onChange={() => setForm({ ...form, reuse: "예" })} required />
                예
              </label>
              <label className={`flex-1 text-center py-3 rounded-lg border cursor-pointer transition-all ${form.reuse === "아니오" ? "bg-red-500/10 border-red-500 text-red-400 font-bold" : "bg-surface border-ui-border text-text-muted hover:border-text-muted"}`}>
                <input type="radio" name="reuse" value="아니오" className="hidden" checked={form.reuse === "아니오"} onChange={() => setForm({ ...form, reuse: "아니오" })} required />
                아니오
              </label>
            </div>
          </div>

          {/* 2. 불편했던 점 */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">2. 사용하면서 가장 불편했던 점은 무엇인가요?</label>
            <textarea
              required
              value={form.painPoint}
              onChange={(e) => setForm({ ...form, painPoint: e.target.value })}
              placeholder="예) 주변에 번개가 너무 없어요, 버튼이 잘 안 눌려요..."
              className="w-full h-24 px-4 py-3 bg-surface border border-ui-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50 resize-none"
            />
          </div>

          {/* 3. 자유 의견 */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">3. 그 외 자유롭게 의견을 남겨주세요 (선택)</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="원하는 추가 기능이나 칭찬도 좋아요!"
              className="w-full h-24 px-4 py-3 bg-surface border border-ui-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50 resize-none"
            />
          </div>

          <button type="submit" className="w-full py-4 bg-brand-cyan text-dark font-black rounded-xl text-base hover:bg-brand-cyan/90 transition-all">
            의견 제출하기
          </button>
        </form>
      </div>
    </div>
  );
}
