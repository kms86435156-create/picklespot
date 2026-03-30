"use client";

import { useState, useEffect } from "react";
import { Trash2, Users } from "lucide-react";

export default function AdminMeetupsPage() {
  const [meetups, setMeetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/meetups").then(r => r.json()).then(d => { setMeetups(d.meetups || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/meetups/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };

  const deleteMeetup = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/admin/meetups/${id}`, { method: "DELETE" });
    load();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await fetch(`/api/admin/meetups/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFeatured: !current }) });
    load();
  };

  if (loading) return <div className="p-8 text-center text-text-muted">로딩 중...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">번개모임 관리</h1>
        <span className="text-sm text-text-muted">{meetups.length}건</span>
      </div>

      {meetups.length === 0 ? (
        <div className="bg-surface border border-dashed border-ui-border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
          <p className="text-text-muted">등록된 번개모임이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {meetups.map(m => (
            <div key={m.id} className="bg-surface border border-ui-border rounded-lg p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${m.status === "open" ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-text-muted bg-white/5 border-ui-border"}`}>{m.status}</span>
                  {m.isFeatured && <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">추천</span>}
                  <span className="text-xs text-text-muted">{m.meetupDate} {m.meetupTime}</span>
                </div>
                <h3 className="font-bold text-sm truncate">{m.title}</h3>
                <div className="text-xs text-text-muted">{m.hostName} · {m.venueName || m.region} · {m.currentPlayers || 0}/{m.maxPlayers}명</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleFeatured(m.id, m.isFeatured)} className="px-2 py-1 text-xs text-text-muted hover:text-yellow-400 border border-ui-border rounded">
                  {m.isFeatured ? "추천해제" : "추천"}
                </button>
                {m.status === "open" && <button onClick={() => updateStatus(m.id, "closed")} className="px-2 py-1 text-xs text-text-muted hover:text-red-400 border border-ui-border rounded">마감</button>}
                {m.status === "closed" && <button onClick={() => updateStatus(m.id, "open")} className="px-2 py-1 text-xs text-text-muted hover:text-green-400 border border-ui-border rounded">재오픈</button>}
                <button onClick={() => deleteMeetup(m.id)} className="p-1 text-text-muted hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
