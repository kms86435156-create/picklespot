"use client";

import { useState, useEffect } from "react";
import { Megaphone, Pin, ChevronDown, ChevronUp } from "lucide-react";

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notices")
      .then(r => r.json())
      .then(data => { setNotices(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">공지사항</h1>
            <p className="text-sm text-text-muted">PBL.SYS의 새 소식과 안내</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-surface border border-ui-border rounded-lg p-12 text-center">
            <Megaphone className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
            <p className="text-text-muted">등록된 공지사항이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map(n => {
              const isExpanded = expandedId === n.id;
              return (
                <div key={n.id} className={`bg-surface border rounded-lg overflow-hidden transition-colors ${n.isPinned ? "border-yellow-500/30" : "border-ui-border"}`}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : n.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {n.isPinned && <Pin className="w-4 h-4 text-yellow-400 shrink-0" />}
                      <span className="font-medium text-white truncate">{n.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs text-text-muted font-mono">{n.createdAt?.slice(0, 10)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                    </div>
                  </button>
                  {isExpanded && n.content && (
                    <div className="px-5 pb-5 border-t border-ui-border/50 pt-4">
                      <div className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed">{n.content}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
