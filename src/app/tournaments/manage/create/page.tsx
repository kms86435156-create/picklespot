"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    fee: "",
    maxParticipants: "8",
    visibility: "public",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.maxParticipants) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fee: Number(formData.fee) || 0,
          maxParticipants: Number(formData.maxParticipants) || 8,
          // Generate invite code if invite-only
          inviteCode: formData.visibility === "invite" ? Math.random().toString(36).substring(2, 8).toUpperCase() : null,
          creatorId: "current_user_id", // MVP placeholder, should get from auth
        }),
      });
      
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`서버 오류 (${res.status})`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      
      alert(`대회가 성공적으로 개설되었습니다!${data.inviteCode ? `\n초대코드: ${data.inviteCode}` : ""}`);
      router.push(`/tournaments/manage/${data.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-text-main pb-24">
      <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-md border-b border-ui-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-text-muted hover:text-text-main">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">대회 개설하기</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-muted">공개 범위</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full bg-ui-dark border border-ui-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
            >
              <option value="public">🌍 전체 공개 (검색 가능, 누구나 신청)</option>
              <option value="invite">🔒 초대코드 전용 (초대코드 입력 시에만 신청 가능)</option>
              <option value="private">👻 비공개 (검색 불가, 링크 전용)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-muted">대회 이름 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="예) 제1회 뚝섬 피클볼 최강자전"
              className="w-full bg-ui-dark border border-ui-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-muted">대회 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="대회 방식, 안내사항 등을 자유롭게 적어주세요."
              className="w-full bg-ui-dark border border-ui-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-muted">개최일 *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-ui-dark border border-ui-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-muted">모집 인원 (개인전) *</label>
              <select
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full bg-ui-dark border border-ui-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
              >
                <option value="4">4명 (4강)</option>
                <option value="8">8명 (8강)</option>
                <option value="16">16명 (16강)</option>
                <option value="32">32명 (32강)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-muted">개최 장소</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="예) 뚝섬 한강공원"
                className="w-full bg-ui-dark border border-ui-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-muted">참가비</label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-ui-dark border border-ui-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-cyan text-dark font-bold rounded-xl hover:bg-cyan-400 disabled:opacity-50 mt-8 flex items-center justify-center gap-2"
          >
            {loading ? "개설 중..." : <><Plus className="w-5 h-5" /> 대회 개설하기</>}
          </button>
        </form>
      </main>
    </div>
  );
}
