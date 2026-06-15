"use client";

import { useState } from "react";
import { ArrowLeft, Check, X, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import BracketViewer from "./BracketViewer";

export default function TournamentDashboard({ initialTournament, initialRegistrations, initialMatches }: any) {
  const router = useRouter();
  const [tournament, setTournament] = useState(initialTournament);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [matches, setMatches] = useState(initialMatches);
  const [activeTab, setActiveTab] = useState<"participants" | "bracket">("participants");
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    if (!confirm(status === "closed" ? "모집을 마감하시겠습니까?" : "상태를 변경하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/_api/tournaments/${tournament.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setTournament({ ...tournament, status });
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (regId: string, status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/_api/tournaments/${tournament.id}/registrations/${regId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update registration");
      setRegistrations(registrations.map((r: any) => r.id === regId ? { ...r, status } : r));
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    if (!confirm("대진표를 생성하시겠습니까? (이 작업은 되돌릴 수 없습니다)")) return;
    setLoading(true);
    try {
      const res = await fetch(`/_api/tournaments/${tournament.id}/bracket`, { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate bracket");
      }
      const newMatches = await res.json();
      setMatches(newMatches);
      setActiveTab("bracket");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchWinner = async (matchId: string, winnerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/_api/tournaments/${tournament.id}/matches/${matchId}/winner`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId })
      });
      if (!res.ok) throw new Error("Failed to update winner");
      const updatedMatches = await res.json();
      setMatches(updatedMatches);
    } catch {
      alert("승자 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-text-main pb-24">
      <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-md border-b border-ui-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-2xl mx-auto">
          <button onClick={() => router.push("/tournaments")} className="p-2 -ml-2 text-text-muted hover:text-text-main">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 truncate">
            <h1 className="font-bold text-lg truncate">{tournament.title}</h1>
            <p className="text-xs text-text-muted">{tournament.status === "open" ? "🟢 모집중" : "🔴 모집마감"}</p>
          </div>
        </div>
        <div className="flex px-4 max-w-2xl mx-auto border-t border-ui-border">
          <button
            onClick={() => setActiveTab("participants")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "participants" ? "border-brand-cyan text-brand-cyan" : "border-transparent text-text-muted"}`}
          >
            참가자 관리 ({registrations.filter((r:any) => r.status === "approved").length}/{tournament.maxParticipants})
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "bracket" ? "border-brand-cyan text-brand-cyan" : "border-transparent text-text-muted"}`}
          >
            대진표
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "participants" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-ui-dark p-4 rounded-xl border border-ui-border">
              <div>
                <p className="text-sm text-text-muted">대회 상태</p>
                <p className="font-bold text-white">{tournament.status === "open" ? "접수중" : "접수마감"}</p>
              </div>
              {tournament.status === "open" ? (
                <button onClick={() => handleUpdateStatus("closed")} disabled={loading} className="px-4 py-2 bg-red-500/10 text-red-400 font-bold text-sm rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  모집 마감하기
                </button>
              ) : (
                <button onClick={() => handleUpdateStatus("open")} disabled={loading} className="px-4 py-2 bg-green-500/10 text-green-400 font-bold text-sm rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors">
                  다시 모집하기
                </button>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="font-bold text-white">신청자 목록</h2>
              {registrations.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">아직 신청자가 없습니다.</p>
              ) : (
                registrations.map((reg: any) => (
                  <div key={reg.id} className="flex items-center justify-between bg-surface border border-ui-border p-4 rounded-xl">
                    <div>
                      <p className="font-bold text-white">{reg.participantName || reg.name}</p>
                      <p className="text-xs text-text-muted">{reg.participantPhone || reg.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {reg.status === "approved" ? (
                        <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">승인됨</span>
                      ) : reg.status === "rejected" ? (
                        <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">거절됨</span>
                      ) : (
                        <>
                          <button onClick={() => handleApprove(reg.id, "rejected")} disabled={loading} className="p-2 bg-ui-dark text-text-muted rounded-lg hover:text-red-400 border border-ui-border"><X className="w-4 h-4" /></button>
                          <button onClick={() => handleApprove(reg.id, "approved")} disabled={loading} className="p-2 bg-brand-cyan/10 text-brand-cyan rounded-lg hover:bg-brand-cyan/20 border border-brand-cyan/30"><Check className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "bracket" && (
          <div className="space-y-6">
            {matches.length === 0 ? (
              <div className="text-center py-12 bg-surface border border-ui-border rounded-xl">
                <Trophy className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                <h2 className="text-white font-bold mb-2">아직 대진표가 없습니다</h2>
                <p className="text-sm text-text-muted mb-6">모집을 마감한 후 승인된 인원을 바탕으로<br/>자동 대진표를 생성합니다.</p>
                <button onClick={generateBracket} disabled={loading || tournament.status === "open"} className="px-6 py-3 bg-brand-cyan text-dark font-bold rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors">
                  {tournament.status === "open" ? "모집 마감 후 생성 가능" : "대진표 자동 생성"}
                </button>
              </div>
            ) : (
              <BracketViewer matches={matches} onSetWinner={handleMatchWinner} isAdmin={true} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
