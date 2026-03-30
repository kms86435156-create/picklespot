"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, Download, MessageCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "승인대기", color: "bg-yellow-400/10 text-yellow-400" },
  approved: { label: "승인", color: "bg-green-400/10 text-green-400" },
  waitlisted: { label: "대기자", color: "bg-blue-400/10 text-blue-400" },
  rejected: { label: "거부", color: "bg-red-400/10 text-red-400" },
  cancelled: { label: "취소", color: "bg-red-400/10 text-red-400" },
};

export default function AdminRegistrationsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedTournamentData, setSelectedTournamentData] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [memoEditing, setMemoEditing] = useState<string | null>(null);
  const [memoText, setMemoText] = useState("");

  useEffect(() => {
    fetch("/api/admin/tournaments").then(r => r.json()).then(data => {
      setTournaments(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const loadRegistrations = useCallback(async (tid: string) => {
    if (!tid) { setRegistrations([]); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/registrations?tournamentId=${tid}`);
    const data = await res.json();
    setRegistrations(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadRegistrations(selectedTournament);
      setSelectedTournamentData(tournaments.find(t => t.id === selectedTournament));
    }
  }, [selectedTournament, loadRegistrations, tournaments]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/registrations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadRegistrations(selectedTournament);
  };

  const saveMemo = async (id: string) => {
    await fetch("/api/admin/registrations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminMemo: memoText }),
    });
    setMemoEditing(null);
    loadRegistrations(selectedTournament);
  };

  const bulkApprove = async () => {
    const pendings = registrations.filter(r => r.status === "pending");
    if (!pendings.length || !confirm(`${pendings.length}명을 일괄 승인하시겠습니까?`)) return;
    for (const r of pendings) {
      await fetch("/api/admin/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, status: "approved" }),
      });
    }
    loadRegistrations(selectedTournament);
  };

  // Divisions extracted from registrations
  const divisions = Array.from(new Set(registrations.map(r => r.division).filter(Boolean)));

  // Filtered
  const filtered = registrations.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterDivision && r.division !== filterDivision) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      if (!r.playerName?.toLowerCase().includes(kw) && !r.playerPhone?.includes(kw) && !r.clubName?.toLowerCase().includes(kw)) return false;
    }
    return true;
  });

  // Stats
  const stats = {
    total: registrations.filter(r => r.status !== "cancelled" && r.status !== "rejected").length,
    pending: registrations.filter(r => r.status === "pending").length,
    approved: registrations.filter(r => r.status === "approved").length,
    waitlisted: registrations.filter(r => r.status === "waitlisted").length,
    rejected: registrations.filter(r => r.status === "rejected").length,
    cancelled: registrations.filter(r => r.status === "cancelled").length,
  };
  const divisionStats = divisions.map(d => ({
    division: d,
    count: registrations.filter(r => r.division === d && r.status !== "cancelled" && r.status !== "rejected").length,
  }));

  // CSV export
  const downloadCSV = () => {
    const headers = ["이름", "연락처", "성별", "종별", "파트너", "소속동호회", "레벨", "상태", "메모", "신청일"];
    const rows = filtered.map(r => [
      r.playerName, r.playerPhone, r.gender || "", r.division || "", r.partnerName || "",
      r.clubName || "", r.level || "", STATUS_CONFIG[r.status]?.label || r.status,
      r.memo || "", r.createdAt?.slice(0, 10) || "",
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants_${selectedTournamentData?.title || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">대회 접수 관리</h1>
        {selectedTournament && registrations.length > 0 && (
          <div className="flex gap-2">
            <button onClick={bulkApprove} className="px-3 py-2 text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded hover:bg-green-400/20 transition-colors">
              대기중 일괄 승인
            </button>
            <button onClick={downloadCSV} className="px-3 py-2 text-xs bg-surface border border-ui-border text-text-muted hover:text-white rounded transition-colors flex items-center gap-1">
              <Download className="w-3 h-3" /> CSV 다운로드
            </button>
          </div>
        )}
      </div>

      {/* Tournament selector */}
      <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}
        className="w-full md:w-[500px] px-3 py-2 bg-surface border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none mb-6">
        <option value="">대회를 선택하세요</option>
        {tournaments.filter(t => t.status !== "completed").map(t => (
          <option key={t.id} value={t.id}>
            [{t.status === "open" ? "접수중" : t.status === "draft" ? "임시" : "마감"}] {t.title} ({t.startDate})
          </option>
        ))}
      </select>

      {!selectedTournament ? (
        <div className="bg-surface border border-ui-border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted">대회를 선택하면 접수 현황이 표시됩니다</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            <StatCard label="유효 접수" value={stats.total} color="text-white" />
            <StatCard label="승인대기" value={stats.pending} color="text-yellow-400" />
            <StatCard label="승인" value={stats.approved} color="text-green-400" />
            <StatCard label="대기자" value={stats.waitlisted} color="text-blue-400" />
            <StatCard label="거부" value={stats.rejected} color="text-red-400" />
            <StatCard label="취소" value={stats.cancelled} color="text-text-muted" />
          </div>

          {/* Division stats */}
          {divisionStats.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="text-xs text-text-muted py-1">종별:</span>
              {divisionStats.map(d => (
                <button key={d.division} onClick={() => setFilterDivision(filterDivision === d.division ? "" : d.division)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    filterDivision === d.division ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" : "border-ui-border text-text-muted hover:text-white"
                  }`}>
                  {d.division} ({d.count})
                </button>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="이름, 연락처, 동호회 검색..." value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-surface border border-ui-border rounded text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-surface border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
              <option value="">전체 상태</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-surface border border-ui-border rounded-lg overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-text-muted">로딩 중...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                {registrations.length === 0 ? "접수 내역이 없습니다" : "검색 결과가 없습니다"}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ui-border bg-dark/30 text-[10px] text-text-muted font-mono">
                    <th className="px-3 py-2 text-left">이름</th>
                    <th className="px-3 py-2 text-left">연락처</th>
                    <th className="px-3 py-2 text-left">성별</th>
                    <th className="px-3 py-2 text-left">종별</th>
                    <th className="px-3 py-2 text-left">파트너</th>
                    <th className="px-3 py-2 text-left">동호회</th>
                    <th className="px-3 py-2 text-left">레벨</th>
                    <th className="px-3 py-2 text-left">상태</th>
                    <th className="px-3 py-2 text-left">메모</th>
                    <th className="px-3 py-2 text-right">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(reg => {
                    const sc = STATUS_CONFIG[reg.status] || { label: reg.status, color: "" };
                    return (
                      <tr key={reg.id} className="border-b border-ui-border/50 hover:bg-brand-cyan/5 transition-colors">
                        <td className="px-3 py-2 text-white font-medium">{reg.playerName}</td>
                        <td className="px-3 py-2 text-text-muted font-mono text-xs">{reg.playerPhone}</td>
                        <td className="px-3 py-2 text-text-muted">{reg.gender || "-"}</td>
                        <td className="px-3 py-2 text-text-muted">{reg.division || "-"}</td>
                        <td className="px-3 py-2 text-text-muted">{reg.partnerName || "-"}</td>
                        <td className="px-3 py-2 text-text-muted">{reg.clubName || "-"}</td>
                        <td className="px-3 py-2 text-text-muted">{reg.level || "-"}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sc.color}`}>{sc.label}</span>
                        </td>
                        <td className="px-3 py-2">
                          {memoEditing === reg.id ? (
                            <div className="flex gap-1">
                              <input type="text" value={memoText} onChange={e => setMemoText(e.target.value)}
                                className="w-24 px-1 py-0.5 bg-dark border border-ui-border rounded text-xs text-white focus:border-brand-cyan focus:outline-none" autoFocus />
                              <button onClick={() => saveMemo(reg.id)} className="text-[10px] text-brand-cyan">저장</button>
                            </div>
                          ) : (
                            <button onClick={() => { setMemoEditing(reg.id); setMemoText(reg.adminMemo || ""); }}
                              className="text-xs text-text-muted hover:text-white flex items-center gap-0.5">
                              {reg.adminMemo ? <span className="truncate max-w-[80px]">{reg.adminMemo}</span> : <MessageCircle className="w-3 h-3" />}
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          {reg.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(reg.id, "approved")} className="text-green-400 hover:underline text-xs mr-2">승인</button>
                              <button onClick={() => updateStatus(reg.id, "rejected")} className="text-red-400 hover:underline text-xs">거부</button>
                            </>
                          )}
                          {reg.status === "waitlisted" && (
                            <button onClick={() => updateStatus(reg.id, "approved")} className="text-green-400 hover:underline text-xs mr-2">승인</button>
                          )}
                          {reg.status === "approved" && (
                            <button onClick={() => updateStatus(reg.id, "cancelled")} className="text-red-400 hover:underline text-xs">취소</button>
                          )}
                          {(reg.status === "rejected" || reg.status === "cancelled") && (
                            <button onClick={() => updateStatus(reg.id, "pending")} className="text-text-muted hover:text-white text-xs">복원</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-2">{filtered.length}건 표시 / 전체 {registrations.length}건</p>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-surface border border-ui-border rounded-lg p-3">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
