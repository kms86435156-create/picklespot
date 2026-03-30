"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus } from "lucide-react";

export default function AdminContentsPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/contents");
    setContents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    const method = editing.id && contents.find((c: any) => c.id === editing.id) ? "PUT" : "POST";
    await fetch("/api/admin/contents", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">콘텐츠 관리</h1>
        <button onClick={() => setEditing({ title: "", slug: "", body: "", isPublished: true })}
          className="px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded hover:bg-brand-cyan/90 transition-colors flex items-center gap-1">
          <Plus className="w-4 h-4" /> 새 콘텐츠
        </button>
      </div>

      {editing ? (
        <div className="bg-surface border border-ui-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">제목</label>
              <input type="text" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">슬러그 (URL용)</label>
              <input type="text" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })}
                placeholder="자동 생성됩니다"
                className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">본문 (Markdown 지원)</label>
            <textarea value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white font-mono focus:border-brand-cyan focus:outline-none resize-y" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editing.isPublished} onChange={e => setEditing({ ...editing, isPublished: e.target.checked })}
              className="w-4 h-4 accent-brand-cyan" />
            <span className="text-sm text-text-muted">공개</span>
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded">저장</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-text-muted border border-ui-border rounded">취소</button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-8 text-center text-text-muted">로딩 중...</div>
      ) : (
        <div className="space-y-3">
          {contents.map(c => (
            <div key={c.id} className="bg-surface border border-ui-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-cyan" />
                  <span className="font-bold text-white">{c.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.isPublished ? "bg-green-400/10 text-green-400" : "bg-white/5 text-text-muted"}`}>
                    {c.isPublished ? "공개" : "비공개"}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">/{c.slug} · {c.body?.length || 0}자</p>
              </div>
              <button onClick={() => setEditing({ ...c })} className="text-xs text-brand-cyan hover:underline">수정</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
