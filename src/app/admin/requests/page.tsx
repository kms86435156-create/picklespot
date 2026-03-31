"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "pending", label: "대기중" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "반려" },
];

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  tournament: { label: "대회", cls: "text-brand-cyan bg-brand-cyan/10" },
  court: { label: "피클볼장", cls: "text-green-400 bg-green-400/10" },
  club: { label: "동호회", cls: "text-purple-400 bg-purple-400/10" },
};

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-yellow-400/10 text-yellow-400" },
  approved: { label: "승인", cls: "bg-green-400/10 text-green-400" },
  rejected: { label: "반려", cls: "bg-red-400/10 text-red-400" },
};

interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function AdminRequestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", "20");
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/admin/requests?${params}`);
      const data = await res.json();
      if (data.items) { setItems(data.items); setPagination(data.pagination); }
    } catch { setItems([]); }
    setLoading(false);
  }, [pagination.page, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function handleStatusChange(val: string) { setStatusFilter(val); setPagination(p => ({ ...p, page: 1 })); }
  function goPage(p: number) { setPagination(prev => ({ ...prev, page: p })); }

  const filtered = keyword
    ? items.filter(r => r.name?.includes(keyword) || r.submitterName?.includes(keyword))
    : items;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">등록 요청 관리</h1>
          <p className="text-xs text-text-muted mt-0.5">전체 <span className="text-brand-cyan font-bold">{pagination.total}</span>건</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={searchInput} onChange={e => { setSearchInput(e.target.value); setKeyword(e.target.value); }} placeholder="이름, 제출자 검색..." className="w-full pl-10 pr-3 py-2 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
        </div>
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => handleStatusChange(s.value)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${statusFilter === s.value ? "bg-brand-cyan text-dark" : "bg-surface border border-ui-border text-text-muted hover:text-white"}`}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-ui-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted">등록 요청이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border bg-dark/30">
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium w-20">유형</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">이름</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">지역</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">제출자</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">제출일</th>
                  <th className="px-4 py-3 text-right text-[11px] text-text-muted font-mono font-medium w-20">상세</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const tl = TYPE_LABELS[r.type] || TYPE_LABELS.tournament;
                  const sb = STATUS_BADGES[r.status] || STATUS_BADGES.pending;
                  return (
                    <tr key={r.id} className="border-b border-ui-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tl.cls}`}>{tl.label}</span></td>
                      <td className="px-4 py-3 text-white font-medium">{r.name || "-"}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">{r.region || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-text-muted">{r.submitterName}</span>
                        <span className="text-[10px] text-text-muted/60 ml-1">{r.submitterContact}</span>
                      </td>
                      <td className="px-4 py-3 text-center"><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${sb.cls}`}>{sb.label}</span></td>
                      <td className="px-4 py-3 text-xs text-text-muted font-mono">{r.createdAt?.slice(0, 10) || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/requests/${r.id}`} className="text-xs text-brand-cyan hover:underline">보기</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ui-border">
            <p className="text-xs text-text-muted">{(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}건</p>
            <div className="flex items-center gap-1">
              <button onClick={() => goPage(pagination.page - 1)} disabled={pagination.page <= 1} className="p-1.5 rounded text-text-muted hover:text-white disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2).map((p, i, arr) => (
                <span key={p}>{i > 0 && arr[i - 1] !== p - 1 && <span className="text-text-muted/30 px-1">...</span>}<button onClick={() => goPage(p)} className={`min-w-[28px] h-7 text-xs rounded transition-colors ${p === pagination.page ? "bg-brand-cyan text-dark font-bold" : "text-text-muted hover:text-white"}`}>{p}</button></span>
              ))}
              <button onClick={() => goPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded text-text-muted hover:text-white disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
