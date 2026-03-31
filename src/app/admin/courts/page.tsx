"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

const COURT_TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "실내", label: "실내" },
  { value: "실외", label: "실외" },
  { value: "겸용", label: "겸용" },
];

interface Court {
  id: string;
  name: string;
  address: string;
  region: string;
  courtCount: number;
  courtType: string;
  indoorOutdoor: string;
  floorType: string;
  phone: string;
  isPublished: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminCourtsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Court[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [courtTypeFilter, setCourtTypeFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", "20");
    if (courtTypeFilter) params.set("courtType", courtTypeFilter);
    if (keyword) params.set("keyword", keyword);
    try {
      const res = await fetch(`/api/admin/courts?${params}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        setItems(data);
        setPagination({ page: 1, limit: 20, total: data.length, totalPages: 1 });
      }
    } catch { setItems([]); }
    setLoading(false);
  }, [pagination.page, courtTypeFilter, keyword]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setKeyword(searchInput);
    setPagination(p => ({ ...p, page: 1 }));
  }

  function handleTypeChange(val: string) {
    setCourtTypeFilter(val);
    setPagination(p => ({ ...p, page: 1 }));
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 피클볼장을 삭제하시겠습니까?`)) return;
    await fetch(`/api/admin/courts/${id}`, { method: "DELETE" });
    fetchItems();
  }

  function goPage(p: number) {
    setPagination(prev => ({ ...prev, page: p }));
  }

  function getCourtTypeLabel(c: Court): string {
    return c.courtType || c.indoorOutdoor || "-";
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">피클볼장 관리</h1>
          <p className="text-xs text-text-muted mt-0.5">
            전체 <span className="text-brand-cyan font-bold">{pagination.total}</span>건
          </p>
        </div>
        <Link
          href="/admin/courts/new"
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          피클볼장 등록
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="장소명, 주소 검색..."
              className="w-full pl-10 pr-3 py-2 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-sm bg-surface border border-ui-border text-text-muted hover:text-white rounded-lg transition-colors">
            검색
          </button>
        </form>

        <div className="flex gap-1.5">
          {COURT_TYPE_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => handleTypeChange(s.value)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                courtTypeFilter === s.value
                  ? "bg-brand-cyan text-dark"
                  : "bg-surface border border-ui-border text-text-muted hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-ui-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm">로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted mb-2">등록된 피클볼장이 없습니다</p>
            <Link href="/admin/courts/new" className="text-brand-cyan text-sm hover:underline">
              첫 피클볼장을 등록해보세요
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border bg-dark/30">
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium w-[220px]">장소명</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">주소</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">지역</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">코트</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">타입</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">공개</th>
                  <th className="px-4 py-3 text-right text-[11px] text-text-muted font-mono font-medium w-[100px]">작업</th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} className="border-b border-ui-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/courts/${c.id}/edit`} className="text-white hover:text-brand-cyan transition-colors font-medium line-clamp-1">
                        {c.name || "(이름 없음)"}
                      </Link>
                      {c.phone && <p className="text-[10px] text-text-muted mt-0.5">{c.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted truncate block max-w-[200px]">{c.address || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-text-muted">{c.region || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono text-white">{c.courtCount || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-text-muted">
                        {getCourtTypeLabel(c)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.isPublished !== false
                        ? <Eye className="w-3.5 h-3.5 text-green-400 mx-auto" />
                        : <EyeOff className="w-3.5 h-3.5 text-text-muted/40 mx-auto" />
                      }
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/admin/courts/${c.id}/edit`)}
                        className="inline-flex items-center text-xs text-brand-cyan hover:text-brand-cyan/80 transition-colors mr-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="inline-flex items-center text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ui-border">
            <p className="text-xs text-text-muted">
              {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}건
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => goPage(pagination.page - 1)} disabled={pagination.page <= 1} className="p-1.5 rounded text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
                .map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="text-text-muted/30 px-1">...</span>}
                    <button onClick={() => goPage(p)} className={`min-w-[28px] h-7 text-xs rounded transition-colors ${p === pagination.page ? "bg-brand-cyan text-dark font-bold" : "text-text-muted hover:text-white"}`}>
                      {p}
                    </button>
                  </span>
                ))}
              <button onClick={() => goPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
