"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Users, Eye, EyeOff } from "lucide-react";

const RECRUIT_OPTIONS = [
  { value: "", label: "전체" },
  { value: "모집중", label: "모집중" },
  { value: "상시모집", label: "상시모집" },
  { value: "모집마감", label: "모집마감" },
];

const RECRUIT_BADGES: Record<string, { label: string; cls: string }> = {
  "모집중": { label: "모집중", cls: "bg-green-400/10 text-green-400" },
  "상시모집": { label: "상시모집", cls: "bg-brand-cyan/10 text-brand-cyan" },
  "모집마감": { label: "모집마감", cls: "bg-white/5 text-text-muted" },
};

interface Club {
  id: string;
  name: string;
  region: string;
  homeVenue: string;
  meetingVenue: string;
  contactName: string;
  memberCount: number;
  recruitStatus: string;
  isRecruiting: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function AdminClubsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Club[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [recruitFilter, setRecruitFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", "20");
    if (recruitFilter) params.set("recruitStatus", recruitFilter);
    if (keyword) params.set("keyword", keyword);
    try {
      const res = await fetch(`/api/admin/clubs?${params}`);
      const data = await res.json();
      if (data.items) { setItems(data.items); setPagination(data.pagination); }
      else if (Array.isArray(data)) { setItems(data); setPagination({ page: 1, limit: 20, total: data.length, totalPages: 1 }); }
    } catch { setItems([]); }
    setLoading(false);
  }, [pagination.page, recruitFilter, keyword]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setKeyword(searchInput); setPagination(p => ({ ...p, page: 1 })); }
  function handleFilterChange(val: string) { setRecruitFilter(val); setPagination(p => ({ ...p, page: 1 })); }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 동호회를 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/clubs/${id}`, { method: "DELETE" });
    fetchItems();
  }

  function goPage(p: number) { setPagination(prev => ({ ...prev, page: p })); }

  function getRecruitLabel(c: Club) {
    const status = c.recruitStatus || (c.isRecruiting ? "모집중" : "모집마감");
    return RECRUIT_BADGES[status] || RECRUIT_BADGES["모집중"];
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">동호회 관리</h1>
          <p className="text-xs text-text-muted mt-0.5">전체 <span className="text-brand-cyan font-bold">{pagination.total}</span>건</p>
        </div>
        <Link href="/admin/clubs/new" className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors">
          <Plus className="w-4 h-4" /> 동호회 등록
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="동호회명, 지역, 활동 장소 검색..." className="w-full pl-10 pr-3 py-2 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <button type="submit" className="px-4 py-2 text-sm bg-surface border border-ui-border text-text-muted hover:text-white rounded-lg transition-colors">검색</button>
        </form>
        <div className="flex gap-1.5">
          {RECRUIT_OPTIONS.map(s => (
            <button key={s.value} onClick={() => handleFilterChange(s.value)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${recruitFilter === s.value ? "bg-brand-cyan text-dark" : "bg-surface border border-ui-border text-text-muted hover:text-white"}`}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-ui-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm">로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted mb-2">등록된 동호회가 없습니다</p>
            <Link href="/admin/clubs/new" className="text-brand-cyan text-sm hover:underline">첫 동호회를 등록해보세요</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border bg-dark/30">
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium w-[200px]">동호회명</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">지역</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">활동 장소</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">회원</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">모집</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">공개</th>
                  <th className="px-4 py-3 text-right text-[11px] text-text-muted font-mono font-medium w-[100px]">작업</th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => {
                  const badge = getRecruitLabel(c);
                  return (
                    <tr key={c.id} className="border-b border-ui-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/clubs/${c.id}/edit`} className="text-white hover:text-brand-cyan transition-colors font-medium line-clamp-1">{c.name || "(이름 없음)"}</Link>
                        {c.contactName && <p className="text-[10px] text-text-muted mt-0.5">{c.contactName}</p>}
                      </td>
                      <td className="px-4 py-3 text-center"><span className="text-xs text-text-muted">{c.region || "-"}</span></td>
                      <td className="px-4 py-3"><span className="text-xs text-text-muted truncate block max-w-[150px]">{c.homeVenue || c.meetingVenue || "-"}</span></td>
                      <td className="px-4 py-3 text-center"><span className="text-xs font-mono text-white flex items-center justify-center gap-1"><Users className="w-3 h-3 text-text-muted" />{c.memberCount || "-"}</span></td>
                      <td className="px-4 py-3 text-center"><span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${badge.cls}`}>{badge.label}</span></td>
                      <td className="px-4 py-3 text-center">
                        {c.isPublished !== false ? <Eye className="w-3.5 h-3.5 text-green-400 mx-auto" /> : <EyeOff className="w-3.5 h-3.5 text-text-muted/40 mx-auto" />}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => router.push(`/admin/clubs/${c.id}/edit`)} className="inline-flex items-center text-xs text-brand-cyan hover:text-brand-cyan/80 transition-colors mr-2"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="inline-flex items-center text-xs text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <button onClick={() => goPage(pagination.page - 1)} disabled={pagination.page <= 1} className="p-1.5 rounded text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2).map((p, i, arr) => (
                <span key={p}>{i > 0 && arr[i - 1] !== p - 1 && <span className="text-text-muted/30 px-1">...</span>}<button onClick={() => goPage(p)} className={`min-w-[28px] h-7 text-xs rounded transition-colors ${p === pagination.page ? "bg-brand-cyan text-dark font-bold" : "text-text-muted hover:text-white"}`}>{p}</button></span>
              ))}
              <button onClick={() => goPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
