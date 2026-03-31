"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pin, Eye, EyeOff, Edit2, Trash2, X, ArrowUp, ArrowDown, Image } from "lucide-react";

// ═══════════════════════════════
// 공지사항 관리
// ═══════════════════════════════

function NoticesSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notices");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    const isNew = !items.find(n => n.id === editing.id);
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/notices" : `/api/admin/notices/${editing.id}`;
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    load();
  }

  async function togglePin(item: any) {
    await fetch(`/api/admin/notices/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !item.isPinned }),
    });
    load();
  }

  async function togglePublish(item: any) {
    await fetch(`/api/admin/notices/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !item.isPublished }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">공지사항</h2>
        <button onClick={() => setEditing({ title: "", content: "", isPinned: false, isPublished: true })}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> 새 공지
        </button>
      </div>

      {editing && (
        <div className="bg-surface border border-ui-border rounded-lg p-5 mb-4 space-y-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">제목 <span className="text-red-400">*</span></label>
            <input type="text" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="공지 제목" className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">내용</label>
            <textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={5} placeholder="공지 내용을 작성하세요..." className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50 resize-y" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted">
              <input type="checkbox" checked={editing.isPinned || false} onChange={e => setEditing({ ...editing, isPinned: e.target.checked })} className="w-4 h-4 accent-brand-cyan" />
              <Pin className="w-3.5 h-3.5" /> 상단 고정
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted">
              <input type="checkbox" checked={editing.isPublished !== false} onChange={e => setEditing({ ...editing, isPublished: e.target.checked })} className="w-4 h-4 accent-brand-cyan" />
              공개
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded-lg">저장</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-text-muted border border-ui-border rounded-lg">취소</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-text-muted text-sm">로딩 중...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-text-muted bg-surface border border-ui-border rounded-lg">공지사항이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <div key={n.id} className={`bg-surface border rounded-lg p-4 flex items-start justify-between gap-3 ${n.isPinned ? "border-yellow-500/30" : "border-ui-border"}`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {n.isPinned && <Pin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                  <span className="font-medium text-white text-sm truncate">{n.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${n.isPublished ? "bg-green-400/10 text-green-400" : "bg-white/5 text-text-muted"}`}>
                    {n.isPublished ? "공개" : "비공개"}
                  </span>
                </div>
                <p className="text-xs text-text-muted line-clamp-1">{n.content || "(내용 없음)"}</p>
                <p className="text-[10px] text-text-muted/50 font-mono mt-1">{n.createdAt?.slice(0, 10)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePin(n)} title={n.isPinned ? "고정 해제" : "고정"} className={`p-1.5 rounded transition-colors ${n.isPinned ? "text-yellow-400 hover:text-yellow-300" : "text-text-muted/30 hover:text-yellow-400"}`}><Pin className="w-3.5 h-3.5" /></button>
                <button onClick={() => togglePublish(n)} title={n.isPublished ? "비공개" : "공개"} className="p-1.5 text-text-muted/50 hover:text-white transition-colors">{n.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                <button onClick={() => setEditing({ ...n })} className="p-1.5 text-brand-cyan/60 hover:text-brand-cyan transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(n.id)} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════
// 배너 관리
// ═══════════════════════════════

function BannersSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setEditing((prev: any) => ({ ...prev, imageUrl: data.url }));
      else alert(data.error || "업로드 실패");
    } catch { alert("업로드 실패"); }
    setUploading(false);
  }

  async function save() {
    if (!editing) return;
    const isNew = !items.find(b => b.id === editing.id);
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/banners" : `/api/admin/banners/${editing.id}`;
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleActive(item: any) {
    await fetch(`/api/admin/banners/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    load();
  }

  async function moveOrder(item: any, dir: number) {
    const newOrder = (item.order ?? 0) + dir;
    await fetch(`/api/admin/banners/${item.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder }),
    });
    load();
  }

  function isExpired(b: any) {
    return b.endDate && b.endDate < new Date().toISOString();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">메인 배너</h2>
        <button onClick={() => setEditing({ title: "", imageUrl: "", linkUrl: "", startDate: "", endDate: "", isActive: true, order: items.length })}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> 새 배너
        </button>
      </div>

      {editing && (
        <div className="bg-surface border border-ui-border rounded-lg p-5 mb-4 space-y-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">배너 제목</label>
            <input type="text" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="프로모션 제목" className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">배너 이미지</label>
            <div className="flex items-start gap-3">
              {editing.imageUrl ? (
                <div className="relative w-48 h-24 bg-dark rounded-lg overflow-hidden border border-ui-border">
                  <img src={editing.imageUrl} alt="배너" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setEditing({ ...editing, imageUrl: "" })} className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-48 h-24 flex flex-col items-center justify-center gap-1 bg-dark border-2 border-dashed border-ui-border rounded-lg text-text-muted hover:border-brand-cyan/50 hover:text-brand-cyan transition-colors">
                  <Image className="w-5 h-5" />
                  <span className="text-[10px]">{uploading ? "업로드중..." : "이미지 선택"}</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">클릭 시 이동 URL</label>
            <input type="url" value={editing.linkUrl} onChange={e => setEditing({ ...editing, linkUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">게시 시작일</label>
              <input type="date" value={editing.startDate?.slice(0, 10) || ""} onChange={e => setEditing({ ...editing, startDate: e.target.value ? e.target.value + "T00:00:00.000Z" : "" })} className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">게시 종료일</label>
              <input type="date" value={editing.endDate?.slice(0, 10) || ""} onChange={e => setEditing({ ...editing, endDate: e.target.value ? e.target.value + "T23:59:59.999Z" : "" })} className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">순서 (작을수록 앞)</label>
              <input type="number" value={editing.order ?? 0} onChange={e => setEditing({ ...editing, order: Number(e.target.value) })} min={0} className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted">
            <input type="checkbox" checked={editing.isActive !== false} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} className="w-4 h-4 accent-brand-cyan" />
            활성
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded-lg">저장</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-text-muted border border-ui-border rounded-lg">취소</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-text-muted text-sm">로딩 중...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-text-muted bg-surface border border-ui-border rounded-lg">등록된 배너가 없습니다</div>
      ) : (
        <div className="space-y-2">
          {items.map(b => (
            <div key={b.id} className={`bg-surface border rounded-lg p-4 flex items-center gap-4 ${isExpired(b) ? "border-red-500/20 opacity-60" : b.isActive ? "border-ui-border" : "border-ui-border opacity-50"}`}>
              {b.imageUrl ? (
                <img src={b.imageUrl} alt={b.title} className="w-20 h-12 rounded object-cover shrink-0 border border-ui-border" />
              ) : (
                <div className="w-20 h-12 rounded bg-dark border border-ui-border flex items-center justify-center shrink-0"><Image className="w-4 h-4 text-text-muted/30" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-white text-sm truncate">{b.title || "(제목 없음)"}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${b.isActive ? "bg-green-400/10 text-green-400" : "bg-white/5 text-text-muted"}`}>
                    {isExpired(b) ? "만료" : b.isActive ? "활성" : "비활성"}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted font-mono">
                  {b.startDate?.slice(0, 10) || "시작일 없음"} ~ {b.endDate?.slice(0, 10) || "종료일 없음"}
                  {" · "}순서: {b.order ?? "-"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => moveOrder(b, -1)} title="위로" className="p-1.5 text-text-muted/30 hover:text-white transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => moveOrder(b, 1)} title="아래로" className="p-1.5 text-text-muted/30 hover:text-white transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleActive(b)} className="p-1.5 text-text-muted/50 hover:text-white transition-colors">{b.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                <button onClick={() => setEditing({ ...b })} className="p-1.5 text-brand-cyan/60 hover:text-brand-cyan transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(b.id)} className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════
// 메인 페이지
// ═══════════════════════════════

export default function AdminNoticesPage() {
  return (
    <div className="space-y-10">
      <NoticesSection />
      <div className="border-t border-ui-border" />
      <BannersSection />
    </div>
  );
}
