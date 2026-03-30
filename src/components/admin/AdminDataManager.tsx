"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "boolean";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  listVisible?: boolean;
  width?: string;
  sticky?: boolean;       // 새로 등록 후 값을 유지할 필드 (region, organizer 등)
  defaultValue?: string;  // 초기 기본값
  csvExample?: string;    // CSV 샘플에 들어갈 예시값
}

interface Props {
  title: string;
  entityName: string;
  apiPath: string;
  fields: FieldDef[];
  csvTemplateHeaders: string;
}

export default function AdminDataManager({ title, entityName, apiPath, fields, csvTemplateHeaders }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [stickyDefaults, setStickyDefaults] = useState<any>({});
  const [showForm, setShowForm] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [continuousMode, setContinuousMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.set("keyword", searchKeyword);
      const qs = params.toString();
      const res = await fetch(`${apiPath}${qs ? "?" + qs : ""}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    setLoading(false);
  }, [apiPath, searchKeyword]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const listFields = fields.filter(f => f.listVisible !== false);
  const statusField = fields.find(f => f.key === "status");

  // Sorted + filtered items
  const processedItems = (() => {
    let result = [...items];
    if (filterStatus) result = result.filter(i => i.status === filterStatus);
    if (sortKey) {
      result.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
        return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return result;
  })();

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const openNew = () => {
    setEditingId(null);
    // 기본값 + sticky 값 병합
    const defaults: any = {};
    fields.forEach(f => {
      if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
      if (f.sticky && stickyDefaults[f.key] !== undefined) defaults[f.key] = stickyDefaults[f.key];
    });
    setFormData(defaults);
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setShowForm(true);
  };

  const handleSave = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${apiPath}/${editingId}` : apiPath;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok && !editingId) {
      // 등록 성공 후 sticky 값 저장
      const newSticky: any = { ...stickyDefaults };
      fields.forEach(f => {
        if (f.sticky && formData[f.key]) newSticky[f.key] = formData[f.key];
      });
      setStickyDefaults(newSticky);

      // 연속 입력 모드: 바로 다음 입력 준비
      if (continuousMode) {
        const defaults: any = {};
        fields.forEach(f => {
          if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
          if (f.sticky && newSticky[f.key] !== undefined) defaults[f.key] = newSticky[f.key];
        });
        setFormData(defaults);
        setEditingId(null);
        fetchItems();
        return;
      }
    }

    setShowForm(false);
    setFormData({});
    setEditingId(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const toggleFeatured = async (item: any) => {
    await fetch(`${apiPath}/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !item.isFeatured }),
    });
    fetchItems();
  };

  const handleCSV = async (file: File) => {
    setCsvUploading(true);
    setCsvResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${apiPath}/csv`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        const parts = [`${data.count}/${data.total}건 등록 완료`];
        if (data.errors?.length) parts.push(`오류 ${data.errors.length}건`);
        if (data.duplicates?.length) parts.push(`중복 ${data.duplicates.length}건`);
        if (data.warnings?.length) parts.push(`경고 ${data.warnings.length}건`);
        let detail = parts.join(" · ");
        // 오류 상세
        if (data.errors?.length) {
          detail += "\n" + data.errors.slice(0, 5).map((e: any) => `  행${e.row}: ${e.message}`).join("\n");
        }
        if (data.duplicates?.length) {
          detail += "\n" + data.duplicates.slice(0, 3).map((d: any) => `  행${d.row}: ${d.value} 중복`).join("\n");
        }
        setCsvResult(detail);
        fetchItems();
      } else {
        setCsvResult(`오류: ${data.error}`);
      }
    } catch {
      setCsvResult("업로드 실패");
    }
    setCsvUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) handleCSV(file);
  };

  const downloadTemplate = () => {
    // 헤더 + 예시 데이터 1행
    const exampleRow = fields
      .filter(f => csvTemplateHeaders.includes(f.label) || csvTemplateHeaders.includes(f.key))
      .map(f => f.csvExample || "")
      .join(",");
    const content = "\uFEFF" + csvTemplateHeaders + "\n" + exampleRow + "\n";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityName}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            총 <span className="text-brand-cyan font-bold">{items.length}</span>건
            {filterStatus && ` (필터: ${processedItems.length}건)`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} className="px-3 py-2 text-xs bg-surface border border-ui-border text-text-muted hover:text-white rounded transition-colors">
            CSV 샘플 다운로드
          </button>
          <button onClick={openNew} className="px-4 py-2 text-sm bg-brand-cyan text-dark font-bold rounded hover:bg-brand-cyan/90 transition-colors">
            + 새로 등록
          </button>
        </div>
      </div>

      {/* CSV Drop Zone */}
      <div
        className={`mb-4 border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${
          dragOver ? "border-brand-cyan bg-brand-cyan/10" : "border-ui-border hover:border-text-muted"
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
          onChange={e => e.target.files?.[0] && handleCSV(e.target.files[0])} />
        {csvUploading
          ? <p className="text-brand-cyan text-sm">업로드 중...</p>
          : <p className="text-text-muted text-sm">CSV 파일을 드래그하거나 클릭 — 한글/영문 헤더 모두 지원</p>
        }
        {csvResult && <pre className="text-brand-cyan text-sm mt-1 font-bold whitespace-pre-wrap font-mono">{csvResult}</pre>}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="검색 (이름, 지역 등)..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-surface border border-ui-border rounded text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none"
        />
        {statusField && statusField.options && (
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-surface border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none"
          >
            <option value="">전체 상태</option>
            {statusField.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface border border-ui-border rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-text-muted">로딩 중...</div>
        ) : processedItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-muted mb-2">
              {items.length === 0 ? "등록된 데이터가 없습니다" : "검색 결과가 없습니다"}
            </p>
            <p className="text-xs text-text-muted">&quot;새로 등록&quot; 또는 CSV 업로드로 시작하세요</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ui-border bg-dark/30">
                <th className="px-2 py-2 text-center text-text-muted font-mono text-[10px] w-10">추천</th>
                {listFields.map(f => (
                  <th
                    key={f.key}
                    className="px-3 py-2 text-left text-text-muted font-mono text-[10px] cursor-pointer hover:text-brand-cyan select-none"
                    style={{ width: f.width }}
                    onClick={() => toggleSort(f.key)}
                  >
                    {f.label} {sortKey === f.key && (sortDir === "asc" ? "▲" : "▼")}
                  </th>
                ))}
                <th className="px-3 py-2 text-right text-text-muted font-mono text-[10px] w-28">작업</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map(item => (
                <tr key={item.id} className="border-b border-ui-border/50 hover:bg-brand-cyan/5 transition-colors">
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`text-sm ${item.isFeatured ? "text-yellow-400" : "text-text-muted/30 hover:text-text-muted"} transition-colors`}
                      title={item.isFeatured ? "추천 해제" : "추천 설정"}
                    >
                      ★
                    </button>
                  </td>
                  {listFields.map(f => (
                    <td key={f.key} className="px-3 py-2 text-white truncate max-w-[200px]" title={String(item[f.key] ?? "")}>
                      {renderCell(f, item[f.key])}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(item)} className="text-brand-cyan hover:underline text-xs mr-3">수정</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline text-xs">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-surface border border-ui-border rounded-lg w-full max-w-2xl p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{editingId ? "수정" : "새로 등록"}</h2>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-white text-xl leading-none">&times;</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              {fields.map(f => (
                <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                  <label className="block text-[11px] text-text-muted mb-1 font-medium">
                    {f.label} {f.required && <span className="text-brand-red">*</span>}
                    {f.sticky && <span className="text-brand-cyan/40 ml-1">(유지)</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={formData[f.key] ?? ""}
                      onChange={e => setField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none resize-y"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={formData[f.key] ?? ""}
                      onChange={e => setField(f.key, e.target.value)}
                      className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none"
                    >
                      <option value="">선택</option>
                      {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === "boolean" ? (
                    <label className="flex items-center gap-2 cursor-pointer py-1.5">
                      <input
                        type="checkbox"
                        checked={!!formData[f.key]}
                        onChange={e => setField(f.key, e.target.checked)}
                        className="w-4 h-4 accent-brand-cyan"
                      />
                      <span className="text-sm text-text-muted">{f.placeholder || "예"}</span>
                    </label>
                  ) : (
                    <input
                      type={f.type || "text"}
                      value={formData[f.key] ?? ""}
                      onChange={e => setField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-ui-border">
              {!editingId && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-text-muted">
                  <input type="checkbox" checked={continuousMode} onChange={e => setContinuousMode(e.target.checked)} className="w-3.5 h-3.5 accent-brand-cyan" />
                  연속 입력 모드
                </label>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-text-muted hover:text-white border border-ui-border rounded transition-colors">
                  취소
                </button>
                <button onClick={handleSave} className="px-6 py-2 text-sm bg-brand-cyan text-dark font-bold rounded hover:bg-brand-cyan/90 transition-colors">
                  {editingId ? "수정 완료" : continuousMode ? "등록 후 계속" : "등록하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderCell(f: FieldDef, value: any): React.ReactNode {
  if (value === null || value === undefined || value === "") return <span className="text-text-muted/30">-</span>;
  if (f.type === "boolean") return value ? <span className="text-green-400">O</span> : <span className="text-text-muted/30">X</span>;
  if (f.key === "status") {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/20 text-gray-400",
      open: "bg-green-400/10 text-green-400",
      closed: "bg-red-400/10 text-red-400",
      cancelled: "bg-red-400/10 text-red-400",
    };
    const labels: Record<string, string> = { draft: "임시", open: "접수중", closed: "마감", cancelled: "취소" };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors[value] || ""}`}>{labels[value] || value}</span>;
  }
  return String(value);
}
