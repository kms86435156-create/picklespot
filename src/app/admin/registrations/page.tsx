"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, Download, MessageCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "신청완료", color: "bg-yellow-400/10 text-yellow-400" },
  paid: { label: "입금확인", color: "bg-blue-400/10 text-blue-400" },
  approved: { label: "참가확정", color: "bg-green-400/10 text-green-400" },
  waitlisted: { label: "대기", color: "bg-purple-400/10 text-purple-400" },
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
      const items = data.items || (Array.isArray(data) ? data : []);
      setTournaments(items);
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
      body: JSON.stringify({ id, status, tournamentId: selectedTournament }),
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
    const targets = registrations.filter(r => r.status === "paid" || r.status === "pending");
    if (!targets.length || !confirm(`${targets.length}명을 일괄 참가확정하시겠습니까?`)) return;
    for (const r of targets) {
      await fetch("/api/admin/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, status: "approved" }),
      });
    }
    loadRegistrations(selectedTournament);
  };

  // Divisions
  const divisions = Array.from(new Set(
    registrations.flatMap(r => (r.division || "").split(/[,，]/).map((s: string) => s.trim()).filter(Boolean))
  ));

  // Filtered
  const filtered = registrations.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterDivision && !(r.division || "").includes(filterDivision)) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      if (!r.playerName?.toLowerCase().includes(kw) && !r.playerPhone?.includes(kw) && !r.clubName?.toLowerCase().includes(kw) && !(r.regNumber || "").toLowerCase().includes(kw)) return false;
    }
    return true;
  });

  // Stats
  const active = registrations.filter(r => !["cancelled", "rejected"].includes(r.status));
  const stats = {
    total: active.length,
    pending: registrations.filter(r => r.status === "pending").length,
    paid: registrations.filter(r => r.status === "paid").length,
    approved: registrations.filter(r => r.status === "approved").length,
    waitlisted: registrations.filter(r => r.status === "waitlisted").length,
    cancelled: registrations.filter(r => r.status === "cancelled" || r.status === "rejected").length,
  };
  const maxP = Number(selectedTournamentData?.maxParticipants) || 0;
  const divisionStats = divisions.map(d => ({
    division: d,
    count: active.filter(r => (r.division || "").includes(d)).length,
  }));

  // Excel CSV export
  const downloadExcel = () => {
    const headers = ["신청번호", "이름", "연락처", "성별", "종목", "파트너", "파트너연락처", "동호회", "실력", "상태", "메모", "신청일"];
    const rows = filtered.map(r => [
      r.regNumber || r.id?.slice(0, 8) || "",
      r.playerName, r.playerPhone, r.gender || "", r.division || "",
      r.partnerName || "", r.partnerPhone || "", r.clubName || "", r.level || "",
      STATUS_CONFIG[r.status]?.label || r.status,
      r.memo || "", r.createdAt?.slice(0, 10) || "",
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `참가자_${selectedTournamentData?.title || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">대회 참가자 관리</h1>
        {selectedTournament && registrations.length > 0 && (
          <div className="flex gap-2">
            <button onClick={bulkApprove} className="px-3 py-2 text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded-lg hover:bg-green-400/20 transition-colors">
              일괄 참가확정
            </button>
            <button onClick={downloadExcel} className="px-3 py-2 text-xs bg-surface border border-ui-border text-text-muted hover:text-white rounded-lg transition-colors flex items-center gap-1">
              <Download className="w-3 h-3" /> 엑셀 다운로드
            </button>
          </div>
        )}
      </div>

      {/* Tournament selector */}
      <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}
        className="w-full md:w-[500px] px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none mb-6">
        <option value="">대회를 선택하세요</option>
        {tournaments.map(t => (
          <option key={t.id} value={t.id}>
            [{t.status === "open" ? "접수중" : t.status === "closed" ? "마감" : t.status}] {t.title} ({t.startDate?.slice(0, 10)})
          </option>
        ))}
      </select>

      {!selectedTournament ? (
        <div className="bg-surface border border-ui-border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted">대회를 선택하면 참가자 현황이 표시됩니다</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            <StatCard label="유효 접수" value={stats.total} color="text-white" sub={maxP > 0 ? `/ ${maxP}명` : undefined} />
            <StatCard label="신청완료" value={stats.pending} color="text-yellow-400" />
            <StatCard label="입금확인" value={stats.paid} color="text-blue-400" />
            <StatCard label="참가확정" value={stats.approved} color="text-green-400" />
            <StatCard label="대기" value={stats.waitlisted} color="text-purple-400" />
            <StatCard label="취소/거부" value={stats.cancelled} color="text-text-muted" />
          </div>

          {/* Division stats */}
          {divisionStats.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="text-xs text-text-muted py-1">종목별:</span>
              {divisionStats.map(d => (
                <button key={d.division} onClick={() => setFilterDivision(filterDivision === d.division ? "" : d.division)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
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
              <input type="text" placeholder="이름, 연락처, 동호회, 신청번호 검색..." value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-surface border border-ui-border rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none">
              <option value="">전체 상태</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-surface border border-ui-border rounded-lg overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-text-muted">로딩 중...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-text-muted">{registrations.length === 0 ? "접수 내역이 없습니다" : "검색 결과가 없습니다"}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ui-border bg-dark/30 text-[10px] text-text-muted font-mono">
                    <th className="px-3 py-2.5 text-left">신청번호</th>
                    <th className="px-3 py-2.5 text-left">이름</th>
                    <th className="px-3 py-2.5 text-left">연락처</th>
                    <th className="px-3 py-2.5 text-left">종목</th>
                    <th className="px-3 py-2.5 text-left">파트너</th>
                    <th className="px-3 py-2.5 text-left">실력</th>
                    <th className="px-3 py-2.5 text-center">상태</th>
                    <th className="px-3 py-2.5 text-left">신청일</th>
                    <th className="px-3 py-2.5 text-right">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(reg => {
                    const sc = STATUS_CONFIG[reg.status] || { label: reg.status, color: "" };
                    return (
                      <tr key={reg.id} className="border-b border-ui-border/50 hover:bg-white/[0.02] transition-colors">
                        <td className="px-3 py-2.5 text-[10px] font-mono text-text-muted">{reg.regNumber || reg.id?.slice(0, 8)}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-white font-medium">{reg.playerName}</span>
                          {reg.clubName && <span className="text-[10px] text-text-muted ml-1">({reg.clubName})</span>}
                        </td>
                        <td className="px-3 py-2.5 text-text-muted font-mono text-xs">{reg.playerPhone}</td>
                        <td className="px-3 py-2.5 text-xs text-text-muted max-w-[120px] truncate">{reg.division || "-"}</td>
                        <td className="px-3 py-2.5 text-xs text-text-muted">
                          {reg.partnerName || "-"}
                          {reg.partnerPhone && <span className="text-[10px] block font-mono">{reg.partnerPhone}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-text-muted">{reg.level || "-"}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sc.color}`}>{sc.label}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[10px] text-text-muted font-mono">{reg.createdAt?.slice(0, 10)}</td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <StatusActions status={reg.status} onUpdate={(s) => updateStatus(reg.id, s)} />
                          <button onClick={() => { setMemoEditing(reg.id); setMemoText(reg.adminMemo || ""); }}
                            title={reg.adminMemo || "메모"} className="ml-1 text-text-muted/40 hover:text-white transition-colors inline-flex">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-2">{filtered.length}건 표시 / 전체 {registrations.length}건</p>

          {/* Memo editing modal */}
          {memoEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setMemoEditing(null)}>
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative bg-surface border border-ui-border rounded-lg p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-sm font-bold text-white mb-3">관리자 메모</h3>
                <textarea value={memoText} onChange={e => setMemoText(e.target.value)} rows={3} autoFocus
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:border-brand-cyan focus:outline-none resize-y mb-3" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setMemoEditing(null)} className="px-4 py-2 text-sm text-text-muted border border-ui-border rounded-lg">취소</button>
                  <button onClick={() => saveMemo(memoEditing)} className="px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded-lg">저장</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusActions({ status, onUpdate }: { status: string; onUpdate: (s: string) => void }) {
  // 신청완료 → 입금확인 or 참가확정 or 취소
  if (status === "pending") return (
    <>
      <button onClick={() => onUpdate("paid")} className="text-blue-400 hover:underline text-[10px] mr-1">입금확인</button>
      <button onClick={() => onUpdate("approved")} className="text-green-400 hover:underline text-[10px] mr-1">확정</button>
      <button onClick={() => onUpdate("cancelled")} className="text-red-400/60 hover:underline text-[10px]">취소</button>
    </>
  );
  // 입금확인 → 참가확정 or 취소
  if (status === "paid") return (
    <>
      <button onClick={() => onUpdate("approved")} className="text-green-400 hover:underline text-[10px] mr-1">확정</button>
      <button onClick={() => onUpdate("cancelled")} className="text-red-400/60 hover:underline text-[10px]">취소</button>
    </>
  );
  // 참가확정 → 취소
  if (status === "approved") return (
    <button onClick={() => onUpdate("cancelled")} className="text-red-400/60 hover:underline text-[10px]">취소</button>
  );
  // 대기 → 참가확정
  if (status === "waitlisted") return (
    <button onClick={() => onUpdate("approved")} className="text-green-400 hover:underline text-[10px]">확정</button>
  );
  // 취소/거부 → 복원
  if (status === "cancelled" || status === "rejected") return (
    <button onClick={() => onUpdate("pending")} className="text-text-muted hover:text-white text-[10px]">복원</button>
  );
  return null;
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div className="bg-surface border border-ui-border rounded-lg p-3">
      <p className="text-[10px] text-text-muted">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
        {sub && <span className="text-[10px] text-text-muted">{sub}</span>}
      </div>
    </div>
  );
}
