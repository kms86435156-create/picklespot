"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";

interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  category: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORY_STYLES: Record<string, string> = {
  bug: "text-red-400 bg-red-400/10",
  feature: "text-blue-400 bg-blue-400/10",
  complaint: "text-yellow-400 bg-yellow-400/10",
  general: "text-text-muted bg-white/5",
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "버그",
  feature: "기능 제안",
  complaint: "불만",
  general: "일반",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  in_progress: "text-blue-400 bg-blue-400/10",
  resolved: "text-green-400 bg-green-400/10",
  dismissed: "text-text-muted bg-white/5",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  in_progress: "처리중",
  resolved: "완료",
  dismissed: "반려",
};

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/feedbacks?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFeedbacks(data.items);
      setPagination(data.pagination);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, categoryFilter, statusFilter]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-brand-cyan" />
            피드백 관리
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            전체 {pagination.total}건
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="제목, 내용, 작성자 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchFeedbacks(1)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
        >
          <option value="">전체 카테고리</option>
          <option value="bug">버그 신고</option>
          <option value="feature">기능 제안</option>
          <option value="complaint">불만/민원</option>
          <option value="general">일반 문의</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
        >
          <option value="">전체 상태</option>
          <option value="pending">대기</option>
          <option value="in_progress">처리중</option>
          <option value="resolved">완료</option>
          <option value="dismissed">반려</option>
        </select>
        <button
          onClick={() => fetchFeedbacks(1)}
          className="px-4 py-2.5 bg-brand-cyan/10 text-brand-cyan text-sm font-medium rounded-lg hover:bg-brand-cyan/20 transition-colors"
        >
          검색
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-ui-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-white/5 rounded" />)}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            피드백이 없습니다.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ui-border text-text-muted text-xs">
                    <th className="text-left px-4 py-3 font-medium">카테고리</th>
                    <th className="text-left px-4 py-3 font-medium">제목</th>
                    <th className="text-left px-4 py-3 font-medium">작성자</th>
                    <th className="text-left px-4 py-3 font-medium">상태</th>
                    <th className="text-left px-4 py-3 font-medium">등록일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/50">
                  {feedbacks.map(fb => (
                    <tr key={fb.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${CATEGORY_STYLES[fb.category] || CATEGORY_STYLES.general}`}>
                          {CATEGORY_LABELS[fb.category] || fb.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/feedbacks/${fb.id}`} className="text-white hover:text-brand-cyan transition-colors font-medium">
                          {fb.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{fb.userName || "익명"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${STATUS_STYLES[fb.status]}`}>
                          {STATUS_LABELS[fb.status] || fb.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs font-mono">
                        {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("ko-KR") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-ui-border/50">
              {feedbacks.map(fb => (
                <Link
                  key={fb.id}
                  href={`/admin/feedbacks/${fb.id}`}
                  className="block px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${CATEGORY_STYLES[fb.category] || CATEGORY_STYLES.general}`}>
                      {CATEGORY_LABELS[fb.category] || fb.category}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${STATUS_STYLES[fb.status]}`}>
                      {STATUS_LABELS[fb.status] || fb.status}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">{fb.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{fb.userName || "익명"}</span>
                    <span className="font-mono">{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("ko-KR") : ""}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ui-border">
            <span className="text-xs text-text-muted">
              {pagination.total}건 중 {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchFeedbacks(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </button>
              <span className="text-xs text-text-muted font-mono px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchFeedbacks(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
