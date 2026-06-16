"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, UserCog, ChevronLeft, ChevronRight } from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  skillLevel: string;
  region: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROLE_LABELS: Record<string, string> = {
  user: "일반",
  organizer: "운영자",
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-green-400 bg-green-400/10",
  suspended: "text-red-400 bg-red-400/10",
  withdrawn: "text-text-muted bg-white/5",
};

const STATUS_LABELS: Record<string, string> = {
  active: "활성",
  suspended: "정지",
  withdrawn: "탈퇴",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.items);
      setPagination(data.pagination);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-brand-cyan" />
            회원 관리
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            전체 {pagination.total}명
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="이름, 이메일, 전화번호 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchUsers(1)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); }}
          className="bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
        >
          <option value="">전체 역할</option>
          <option value="user">일반</option>
          <option value="organizer">운영자</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); }}
          className="bg-surface border border-ui-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
        >
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="suspended">정지</option>
          <option value="withdrawn">탈퇴</option>
        </select>
        <button
          onClick={() => fetchUsers(1)}
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
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            회원이 없습니다.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ui-border text-text-muted text-xs">
                    <th className="text-left px-4 py-3 font-medium">이름</th>
                    <th className="text-left px-4 py-3 font-medium">이메일</th>
                    <th className="text-left px-4 py-3 font-medium">전화번호</th>
                    <th className="text-left px-4 py-3 font-medium">역할</th>
                    <th className="text-left px-4 py-3 font-medium">상태</th>
                    <th className="text-left px-4 py-3 font-medium">가입일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${user.id}`} className="text-white hover:text-brand-cyan transition-colors font-medium">
                          {user.name || "(이름 없음)"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{user.email}</td>
                      <td className="px-4 py-3 text-text-muted font-mono text-xs">{user.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-text-muted">{ROLE_LABELS[user.role] || user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${STATUS_STYLES[user.status || "active"]}`}>
                          {STATUS_LABELS[user.status || "active"]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs font-mono">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ko-KR") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-ui-border/50">
              {users.map(user => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="block px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{user.name || "(이름 없음)"}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${STATUS_STYLES[user.status || "active"]}`}>
                      {STATUS_LABELS[user.status || "active"]}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{user.email}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{ROLE_LABELS[user.role] || user.role}</span>
                    <span className="font-mono">{user.phone || "-"}</span>
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
              {pagination.total}명 중 {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </button>
              <span className="text-xs text-text-muted font-mono px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
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
