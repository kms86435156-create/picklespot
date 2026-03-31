"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

const TYPE_LABELS: Record<string, string> = { tournament: "대회", court: "피클볼장", club: "동호회" };

const FIELD_MAP: Record<string, { label: string; key: string }[]> = {
  tournament: [
    { label: "대회명", key: "name" }, { label: "지역", key: "region" },
    { label: "시작일", key: "startDate" }, { label: "종료일", key: "endDate" },
    { label: "장소", key: "venueName" }, { label: "주최/주관", key: "organizer" },
    { label: "상세 설명", key: "description" },
  ],
  court: [
    { label: "장소명", key: "name" }, { label: "지역", key: "region" },
    { label: "주소", key: "address" }, { label: "코트 수", key: "courtCount" },
    { label: "코트 타입", key: "courtType" }, { label: "연락처", key: "phone" },
    { label: "상세 설명", key: "description" },
  ],
  club: [
    { label: "동호회명", key: "name" }, { label: "지역", key: "region" },
    { label: "대표자", key: "contactName" }, { label: "회원 수", key: "memberCount" },
    { label: "활동 일정", key: "meetingSchedule" }, { label: "상세 설명", key: "description" },
  ],
};

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/requests/${id}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => { setData(d); setEditData(d); })
      .catch(() => setError("요청을 찾을 수 없습니다."));
  }, [id]);

  async function handleApprove() {
    if (!confirm("이 요청을 승인하고 데이터를 등록하시겠습니까?")) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setData({ ...data, status: "approved" });
        alert("승인 완료! 해당 정보가 DB에 등록되었습니다.");
        router.push("/admin/requests");
      } else {
        const d = await res.json();
        alert(d.error || "승인 실패");
      }
    } catch { alert("서버 오류"); }
    setProcessing(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) { alert("반려 사유를 입력해주세요."); return; }
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectReason }),
      });
      if (res.ok) {
        setData({ ...data, status: "rejected", rejectReason });
        setShowReject(false);
        alert("반려 처리되었습니다.");
        router.push("/admin/requests");
      }
    } catch { alert("서버 오류"); }
    setProcessing(false);
  }

  function setEditField(key: string, value: string) {
    setEditData((prev: any) => ({ ...prev, [key]: value }));
  }

  if (error) return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-red-400 text-sm">{error}</p></div>;
  if (!data) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-white/5 rounded" /><div className="h-96 bg-white/5 rounded-lg" /></div>;

  const fields = FIELD_MAP[data.type] || FIELD_MAP.tournament;
  const isPending = data.status === "pending";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 text-text-muted hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-xl font-bold text-white">등록 요청 상세</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan font-bold">{TYPE_LABELS[data.type] || data.type}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              data.status === "approved" ? "bg-green-400/10 text-green-400" :
              data.status === "rejected" ? "bg-red-400/10 text-red-400" :
              "bg-yellow-400/10 text-yellow-400"
            }`}>{data.status === "approved" ? "승인됨" : data.status === "rejected" ? "반려됨" : "대기중"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* 제출 정보 (편집 가능) */}
        <div className="bg-surface border border-ui-border rounded-lg p-5">
          <h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-ui-border">
            제출 정보 {isPending && <span className="text-[10px] text-text-muted font-normal ml-2">(수정 후 승인 가능)</span>}
          </h2>
          <div className="space-y-3">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs text-text-muted mb-1">{f.label}</label>
                {isPending ? (
                  f.key === "description" ? (
                    <textarea value={editData[f.key] || ""} onChange={e => setEditField(f.key, e.target.value)} rows={3} className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50 resize-y" />
                  ) : (
                    <input type={f.key.includes("Date") ? "date" : f.key === "courtCount" || f.key === "memberCount" ? "number" : "text"} value={editData[f.key] || ""} onChange={e => setEditField(f.key, e.target.value)} className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/50" />
                  )
                ) : (
                  <p className="text-sm text-white px-3 py-2 bg-dark/50 rounded-lg">{data[f.key] || "-"}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 제출자 정보 */}
        <div className="bg-surface border border-ui-border rounded-lg p-5">
          <h2 className="text-sm font-bold text-white mb-4 pb-3 border-b border-ui-border">제출자 정보</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-xs text-text-muted">이름</span><p className="text-white">{data.submitterName}</p></div>
            <div><span className="text-xs text-text-muted">연락처</span><p className="text-white">{data.submitterContact}</p></div>
            {data.note && <div className="col-span-2"><span className="text-xs text-text-muted">비고</span><p className="text-white">{data.note}</p></div>}
          </div>
          <p className="text-[10px] text-text-muted font-mono mt-3">제출일: {data.createdAt}</p>
        </div>

        {/* 반려 사유 (반려된 경우) */}
        {data.status === "rejected" && data.rejectReason && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-5">
            <h2 className="text-sm font-bold text-red-400 mb-2">반려 사유</h2>
            <p className="text-sm text-white">{data.rejectReason}</p>
          </div>
        )}

        {/* 반려 모달 */}
        {showReject && (
          <div className="bg-surface border border-red-500/30 rounded-lg p-5">
            <h2 className="text-sm font-bold text-red-400 mb-3">반려 사유 입력</h2>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="반려 사유를 입력해주세요..." rows={3} className="w-full px-3 py-2 bg-dark border border-ui-border rounded-lg text-sm text-white focus:outline-none focus:border-red-400/50 resize-y mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setShowReject(false)} className="px-4 py-2 text-sm text-text-muted border border-ui-border rounded-lg hover:text-white transition-colors">취소</button>
              <button onClick={handleReject} disabled={processing} className="px-4 py-2 text-sm bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">반려 확정</button>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {isPending && !showReject && (
          <div className="flex gap-3 pt-4 border-t border-ui-border">
            <button onClick={() => setShowReject(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
              <XCircle className="w-4 h-4" /> 반려
            </button>
            <button onClick={handleApprove} disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors ml-auto">
              <CheckCircle className="w-4 h-4" /> {processing ? "처리 중..." : "승인 (DB 등록)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
