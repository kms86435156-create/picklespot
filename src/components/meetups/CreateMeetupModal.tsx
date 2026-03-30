"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

const LEVELS = ["전체", "입문", "D", "C", "B", "A이상"];

export default function CreateMeetupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"form" | "submitting" | "success" | "error">("form");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", region: "", venueName: "", meetupDate: "", meetupTime: "",
    hostName: "", hostPhone: "", maxPlayers: 4, skillLevel: "전체",
    fee: 0, description: "",
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.hostName || !form.hostPhone || !form.meetupDate || !form.meetupTime) {
      setError("필수 항목을 입력해주세요."); return;
    }
    setStep("submitting");
    try {
      const res = await fetch("/api/meetups", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setStep("success");
    } catch (e: any) { setError(e.message); setStep("error"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-ui-border rounded-lg overflow-hidden my-4">
        <div className="sticky top-0 bg-surface border-b border-ui-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] font-mono text-brand-cyan tracking-widest">CREATE MEETUP</p>
            <h2 className="font-bold text-lg text-white">번개 만들기</h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-[11px] text-text-muted mb-1">제목 <span className="text-brand-red">*</span></label>
              <input type="text" required value={form.title} onChange={e => set("title", e.target.value)} placeholder="잠실 주말 오전 가볍게 한 판"
                className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1">날짜 <span className="text-brand-red">*</span></label>
                <input type="date" required value={form.meetupDate} onChange={e => set("meetupDate", e.target.value)}
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">시간 <span className="text-brand-red">*</span></label>
                <input type="time" required value={form.meetupTime} onChange={e => set("meetupTime", e.target.value)}
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1">지역</label>
                <input type="text" value={form.region} onChange={e => set("region", e.target.value)} placeholder="서울 송파구"
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">장소명</label>
                <input type="text" value={form.venueName} onChange={e => set("venueName", e.target.value)} placeholder="잠실 피클볼 파크"
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1">주최자 이름 <span className="text-brand-red">*</span></label>
                <input type="text" required value={form.hostName} onChange={e => set("hostName", e.target.value)}
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">연락처 <span className="text-brand-red">*</span></label>
                <input type="tel" required value={form.hostPhone} onChange={e => set("hostPhone", e.target.value)} placeholder="010-0000-0000"
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1">모집 인원</label>
                <input type="number" min={2} max={20} value={form.maxPlayers} onChange={e => set("maxPlayers", +e.target.value)}
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">실력</label>
                <select value={form.skillLevel} onChange={e => set("skillLevel", e.target.value)}
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">참가비(원)</label>
                <input type="number" min={0} step={1000} value={form.fee} onChange={e => set("fee", +e.target.value)}
                  className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1">설명</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="간단한 안내 사항"
                className="w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none resize-none" />
            </div>
            {error && <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3"><AlertTriangle className="w-4 h-4 shrink-0" /> {error}</div>}
            <button type="submit" className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors">번개 만들기</button>
          </form>
        )}

        {step === "submitting" && (
          <div className="p-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-brand-cyan animate-spin mb-4" />
            <p className="font-bold text-white">생성 중...</p>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-brand-cyan/15 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-brand-cyan" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">번개 생성 완료!</h3>
            <p className="text-sm text-text-muted mb-4">모임이 등록되었습니다. 참가자를 기다려보세요.</p>
            <button onClick={() => { onClose(); window.location.reload(); }} className="w-full py-3 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-bold text-sm rounded hover:bg-brand-cyan/20 transition-colors">확인</button>
          </div>
        )}

        {step === "error" && (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2">생성 실패</h3>
            <p className="text-sm text-text-muted mb-4">{error}</p>
            <button onClick={() => { setStep("form"); setError(""); }} className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded">다시 시도</button>
          </div>
        )}
      </div>
    </div>
  );
}
