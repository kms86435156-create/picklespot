"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Phone, MapPin, MessageCircle, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "new", label: "신규", color: "bg-blue-400/10 text-blue-400" },
  { value: "contacted", label: "연락완료", color: "bg-yellow-400/10 text-yellow-400" },
  { value: "demo_scheduled", label: "데모예정", color: "bg-purple-400/10 text-purple-400" },
  { value: "converted", label: "전환", color: "bg-green-400/10 text-green-400" },
  { value: "on_hold", label: "보류", color: "bg-white/5 text-text-muted" },
];

function statusInfo(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [memoEditing, setMemoEditing] = useState<string | null>(null);
  const [memoText, setMemoText] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateLead = async (id: string, updates: any) => {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchLeads();
  };

  const saveMemo = async (id: string) => {
    await updateLead(id, { adminMemo: memoText });
    setMemoEditing(null);
  };

  const filtered = filterStatus ? leads.filter(l => l.status === filterStatus) : leads;

  const statusCounts = STATUS_OPTIONS.map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.value).length,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">운영자 리드 관리</h1>
          <p className="text-sm text-text-muted mt-0.5">총 <span className="text-brand-cyan font-bold">{leads.length}</span>건</p>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {statusCounts.map(s => (
          <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? "" : s.value)}
            className={`p-3 rounded-lg border transition-colors text-left ${
              filterStatus === s.value ? "border-brand-cyan bg-brand-cyan/5" : "border-ui-border bg-surface hover:border-brand-cyan/20"
            }`}>
            <p className="text-2xl font-bold font-mono text-white">{s.count}</p>
            <p className="text-[11px] text-text-muted">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Leads list */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-surface border border-ui-border rounded-lg p-8 text-center text-text-muted">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-ui-border rounded-lg p-8 text-center">
            <Users className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted">{leads.length === 0 ? "아직 리드가 없습니다" : "해당 상태의 리드가 없습니다"}</p>
          </div>
        ) : (
          filtered.map(lead => {
            const si = statusInfo(lead.status);
            const isExpanded = expandedId === lead.id;
            return (
              <div key={lead.id} className="bg-surface border border-ui-border rounded-lg overflow-hidden">
                {/* Summary row */}
                <button onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-brand-cyan/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{lead.clubName || "미입력"}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${si.color}`}>{si.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                      <span>{lead.contactName}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>
                      {lead.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.region}</span>}
                      <span>{lead.createdAt?.slice(0, 10)}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-ui-border pt-3 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <Detail label="예상 회원수" value={lead.memberCount} />
                      <Detail label="현재 문제" value={lead.currentProblem} />
                      <Detail label="대회 운영" value={{
                        yes_regular: "정기 운영", yes_occasional: "가끔", planning: "계획중", no: "안함",
                      }[lead.runsTournaments as string] || lead.runsTournaments || "-"} />
                      <Detail label="등록일" value={lead.createdAt?.slice(0, 10)} />
                    </div>
                    {lead.memo && (
                      <div className="text-xs"><span className="text-text-muted">기타 메모:</span> <span className="text-white">{lead.memo}</span></div>
                    )}

                    {/* Status change */}
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map(s => (
                        <button key={s.value} onClick={() => updateLead(lead.id, { status: s.value })}
                          className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                            lead.status === s.value ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan" : "border-ui-border text-text-muted hover:text-white"
                          }`}>
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Admin memo */}
                    <div>
                      <p className="text-[11px] text-text-muted mb-1">관리자 메모</p>
                      {memoEditing === lead.id ? (
                        <div className="flex gap-2">
                          <input type="text" value={memoText} onChange={e => setMemoText(e.target.value)}
                            className="flex-1 px-2 py-1.5 bg-dark border border-ui-border rounded text-xs text-white focus:border-brand-cyan focus:outline-none"
                            placeholder="메모 입력..." autoFocus />
                          <button onClick={() => saveMemo(lead.id)} className="px-3 py-1.5 text-xs bg-brand-cyan text-dark font-bold rounded">저장</button>
                          <button onClick={() => setMemoEditing(null)} className="px-3 py-1.5 text-xs text-text-muted border border-ui-border rounded">취소</button>
                        </div>
                      ) : (
                        <button onClick={() => { setMemoEditing(lead.id); setMemoText(lead.adminMemo || ""); }}
                          className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {lead.adminMemo || "메모 추가하기"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-muted">{label}</p>
      <p className="text-white font-medium">{value || "-"}</p>
    </div>
  );
}
