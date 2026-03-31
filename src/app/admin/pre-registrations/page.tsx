"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "new", label: "미확인" },
  { value: "contacted", label: "연락완료" },
  { value: "converted", label: "등록완료" },
  { value: "on_hold", label: "보류" },
];

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  new: { label: "미확인", cls: "bg-blue-400/10 text-blue-400" },
  contacted: { label: "연락완료", cls: "bg-yellow-400/10 text-yellow-400" },
  demo_scheduled: { label: "데모예정", cls: "bg-purple-400/10 text-purple-400" },
  converted: { label: "등록완료", cls: "bg-green-400/10 text-green-400" },
  on_hold: { label: "보류", cls: "bg-white/5 text-text-muted" },
};

const PROBLEM_LABELS: Record<string, string> = {
  no_system: "운영 시스템 없음",
  manual_work: "수작업 과다",
  member_management: "회원 관리 어려움",
  payment: "회비 수금",
  communication: "소통 채널 부재",
  other: "기타",
};

const TOURNAMENT_LABELS: Record<string, string> = {
  yes_regular: "정기 운영",
  yes_occasional: "가끔",
  planning: "계획중",
  no: "안함",
};

export default function AdminPreRegistrationsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [memoEditing, setMemoEditing] = useState<string | null>(null);
  const [memoText, setMemoText] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { setLeads([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function updateLead(id: string, updates: any) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchLeads();
  }

  async function saveMemo(id: string) {
    await updateLead(id, { adminMemo: memoText });
    setMemoEditing(null);
  }

  const filtered = leads.filter(l => {
    if (statusFilter && l.status !== statusFilter) return false;
    if (keyword && !l.clubName?.includes(keyword) && !l.contactName?.includes(keyword) && !l.phone?.includes(keyword)) return false;
    return true;
  });

  const statusCounts = STATUS_OPTIONS.filter(s => s.value).map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.value).length,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">사전등록 신청 목록</h1>
          <p className="text-xs text-text-muted mt-0.5">
            /for-clubs 페이지에서 제출된 신청 · 전체 <span className="text-brand-cyan font-bold">{leads.length}</span>건
          </p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {statusCounts.map(s => (
          <button key={s.value} onClick={() => setStatusFilter(statusFilter === s.value ? "" : s.value)}
            className={`p-3 rounded-lg border transition-colors text-left ${
              statusFilter === s.value ? "border-brand-cyan bg-brand-cyan/5" : "border-ui-border bg-surface hover:border-brand-cyan/20"
            }`}>
            <p className="text-2xl font-bold font-mono text-white">{s.count}</p>
            <p className="text-[11px] text-text-muted">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="동호회명, 담당자명, 연락처 검색..." className="w-full pl-10 pr-3 py-2 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-ui-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            {leads.length === 0 ? "아직 사전등록 신청이 없습니다" : "검색 결과가 없습니다"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border bg-dark/30">
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">담당자</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">동호회명</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">연락처</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">지역</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">회원수</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-[11px] text-text-muted font-mono font-medium">제출일</th>
                  <th className="px-4 py-3 text-center text-[11px] text-text-muted font-mono font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const badge = STATUS_BADGES[lead.status] || STATUS_BADGES.new;
                  const isExpanded = expandedId === lead.id;
                  return (
                    <>
                      <tr key={lead.id} className="border-b border-ui-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : lead.id)}>
                        <td className="px-4 py-3 text-white font-medium">{lead.contactName || "-"}</td>
                        <td className="px-4 py-3 text-text-muted">{lead.clubName || "-"}</td>
                        <td className="px-4 py-3 text-text-muted font-mono text-xs">{lead.phone || "-"}</td>
                        <td className="px-4 py-3 text-center text-xs text-text-muted">{lead.region || "-"}</td>
                        <td className="px-4 py-3 text-center text-xs font-mono text-white">{lead.memberCount || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={lead.status || "new"}
                            onClick={e => e.stopPropagation()}
                            onChange={e => updateLead(lead.id, { status: e.target.value })}
                            className={`text-[10px] font-bold px-2 py-1 rounded border-0 cursor-pointer focus:outline-none ${badge.cls}`}
                          >
                            {STATUS_OPTIONS.filter(s => s.value).map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-muted font-mono">{lead.createdAt?.slice(0, 10) || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${lead.id}-detail`} className="border-b border-ui-border/50">
                          <td colSpan={8} className="px-4 py-4 bg-dark/30">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                              <div><span className="text-text-muted">불편사항</span><p className="text-white mt-0.5">{PROBLEM_LABELS[lead.currentProblem] || lead.currentProblem || "-"}</p></div>
                              <div><span className="text-text-muted">대회운영</span><p className="text-white mt-0.5">{TOURNAMENT_LABELS[lead.runsTournaments] || lead.runsTournaments || "-"}</p></div>
                              <div><span className="text-text-muted">메모 (제출자)</span><p className="text-white mt-0.5">{lead.memo || "-"}</p></div>
                              <div><span className="text-text-muted">제출일시</span><p className="text-white mt-0.5 font-mono">{lead.createdAt || "-"}</p></div>
                            </div>

                            {/* 관리자 메모 */}
                            <div className="border-t border-ui-border pt-3">
                              <p className="text-[11px] text-text-muted mb-1.5 flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" /> 관리자 메모
                              </p>
                              {memoEditing === lead.id ? (
                                <div className="flex gap-2">
                                  <input type="text" value={memoText} onChange={e => setMemoText(e.target.value)}
                                    className="flex-1 px-3 py-1.5 bg-dark border border-ui-border rounded-lg text-xs text-white focus:border-brand-cyan focus:outline-none"
                                    placeholder="내부 메모 입력..." autoFocus
                                    onKeyDown={e => e.key === "Enter" && saveMemo(lead.id)} />
                                  <button onClick={() => saveMemo(lead.id)} className="px-3 py-1.5 text-xs bg-brand-cyan text-dark font-bold rounded-lg">저장</button>
                                  <button onClick={() => setMemoEditing(null)} className="px-3 py-1.5 text-xs text-text-muted border border-ui-border rounded-lg">취소</button>
                                </div>
                              ) : (
                                <button onClick={e => { e.stopPropagation(); setMemoEditing(lead.id); setMemoText(lead.adminMemo || ""); }}
                                  className="text-xs text-text-muted hover:text-white transition-colors">
                                  {lead.adminMemo || "메모 추가하기 →"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
