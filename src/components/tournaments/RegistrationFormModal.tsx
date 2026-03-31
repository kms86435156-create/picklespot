"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2, AlertTriangle, Users, Copy, Check } from "lucide-react";

interface Props {
  tournament: any;
  onClose: () => void;
}

const LEVELS = ["입문", "초급", "중급", "상급", "선수급"];
const DEFAULT_DIVISIONS = ["남자단식", "여자단식", "남자복식", "여자복식", "혼합복식"];

export default function RegistrationFormModal({ tournament: t, onClose }: Props) {
  const [step, setStep] = useState<"form" | "submitting" | "success" | "error">("form");
  const [error, setError] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);
  const [regNumber, setRegNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [regSummary, setRegSummary] = useState<any>(null);

  const [form, setForm] = useState({
    playerName: "",
    playerPhone: "",
    gender: "",
    divisions: [] as string[],
    partnerName: "",
    partnerPhone: "",
    clubName: "",
    level: "",
    memo: "",
    privacyAgreed: false,
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  // 대회 종별 파싱
  const availableDivisions = (() => {
    const raw = t.eventTypes || t.divisions || "";
    const parsed = raw.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean);
    return parsed.length > 0 ? parsed : DEFAULT_DIVISIONS;
  })();

  // 복식 종목 선택 여부
  const hasDoublesSelected = form.divisions.some(d => d.includes("복식"));

  // 참가 현황 로드
  const [liveCount, setLiveCount] = useState<{ total: number; byDivision: Record<string, number> } | null>(null);
  useEffect(() => {
    fetch(`/api/tournaments/${t.id}/register`)
      .then(r => r.json())
      .then(setLiveCount)
      .catch(() => {});
  }, [t.id]);

  function toggleDivision(d: string) {
    setForm(prev => ({
      ...prev,
      divisions: prev.divisions.includes(d)
        ? prev.divisions.filter(x => x !== d)
        : [...prev.divisions, d],
    }));
  }

  async function copyRegNumber() {
    await navigator.clipboard.writeText(regNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName || !form.playerPhone) { setError("이름과 연락처를 입력해주세요."); return; }
    if (!form.privacyAgreed) { setError("개인정보 수집에 동의해주세요."); return; }
    setError("");
    setStep("submitting");

    try {
      const res = await fetch(`/api/tournaments/${t.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "신청에 실패했습니다.");
        setStep("error");
        return;
      }
      setWaitlisted(!!data.waitlisted);
      setRegNumber(data.regNumber || data.registration?.regNumber || "");
      setRegSummary(data);
      setStep("success");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setStep("error");
    }
  };

  const maxP = Number(t.maxParticipants) || 0;
  const curP = liveCount?.total ?? (Number(t.currentParticipants) || 0);
  const pct = maxP > 0 ? Math.min(Math.round((curP / maxP) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-ui-border rounded-lg overflow-hidden my-4">

        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-ui-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] font-mono text-brand-cyan tracking-widest">REGISTRATION</p>
            <h2 className="font-bold text-lg text-white">대회 참가 신청</h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form step */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* 대회 요약 + 참가현황 */}
            <div className="bg-dark/50 border border-ui-border rounded-lg p-4">
              <h3 className="font-bold text-white text-sm mb-1">{t.title}</h3>
              <div className="text-xs text-text-muted space-y-0.5">
                <p>{t.startDate} · {t.venueName || "장소 확인중"}</p>
                <p>참가비: ₩{(t.entryFee || 0).toLocaleString()}</p>
              </div>
              {maxP > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-muted flex items-center gap-1"><Users className="w-3 h-3" /> 참가 현황</span>
                    <span className={`font-bold font-mono ${pct >= 90 ? "text-red-400" : "text-white"}`}>{curP} / {maxP}명</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-yellow-400" : "bg-brand-cyan"}`} style={{ width: `${pct}%` }} />
                  </div>
                  {pct >= 100 && <p className="text-[10px] text-yellow-400 mt-1">정원 마감 — 신청 시 대기자로 등록됩니다</p>}
                </div>
              )}
            </div>

            {/* 필수 정보 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1">이름 <span className="text-red-400">*</span></label>
                <input type="text" required value={form.playerName} onChange={e => set("playerName", e.target.value)} placeholder="홍길동" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">연락처 <span className="text-red-400">*</span></label>
                <input type="tel" required value={form.playerPhone} onChange={e => set("playerPhone", e.target.value)} placeholder="010-0000-0000" className={inputCls} />
              </div>
            </div>

            {/* 종목 (복수 선택) */}
            <div>
              <label className="block text-[11px] text-text-muted mb-1.5">참가 종목 <span className="text-text-muted/50">(복수 선택 가능)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {availableDivisions.map((d: string) => (
                  <button key={d} type="button" onClick={() => toggleDivision(d)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      form.divisions.includes(d)
                        ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan font-medium"
                        : "border-ui-border text-text-muted hover:text-white"
                    }`}>
                    {d}
                    {liveCount?.byDivision?.[d] !== undefined && (
                      <span className="ml-1 text-[9px] opacity-60">({liveCount.byDivision[d]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 파트너 (복식 선택 시) */}
            {hasDoublesSelected && (
              <div className="grid grid-cols-2 gap-3 bg-brand-cyan/5 border border-brand-cyan/10 rounded-lg p-3">
                <div>
                  <label className="block text-[11px] text-brand-cyan mb-1">파트너 이름</label>
                  <input type="text" value={form.partnerName} onChange={e => set("partnerName", e.target.value)} placeholder="파트너 이름" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] text-brand-cyan mb-1">파트너 연락처</label>
                  <input type="tel" value={form.partnerPhone} onChange={e => set("partnerPhone", e.target.value)} placeholder="010-0000-0000" className={inputCls} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1">성별</label>
                <select value={form.gender} onChange={e => set("gender", e.target.value)} className={inputCls}>
                  <option value="">선택</option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">소속 동호회 <span className="text-text-muted/50">(선택)</span></label>
                <input type="text" value={form.clubName} onChange={e => set("clubName", e.target.value)} placeholder="동호회명" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-text-muted mb-1">실력 수준</label>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map(l => (
                  <button key={l} type="button" onClick={() => set("level", form.level === l ? "" : l)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      form.level === l ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" : "border-ui-border text-text-muted hover:text-white"
                    }`}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-text-muted mb-1">비고 <span className="text-text-muted/50">(선택)</span></label>
              <input type="text" value={form.memo} onChange={e => set("memo", e.target.value)} placeholder="참고사항, 요청사항 등" className={inputCls} />
            </div>

            {/* 개인정보 동의 */}
            <label className="flex items-start gap-2 cursor-pointer bg-dark/50 border border-ui-border rounded-lg p-3">
              <input type="checkbox" checked={form.privacyAgreed} onChange={e => set("privacyAgreed", e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand-cyan" />
              <span className="text-xs text-text-muted leading-relaxed">
                <span className="text-white font-medium">[필수] 개인정보 수집 및 이용 동의</span><br />
                대회 운영을 위해 이름, 연락처를 수집하며, 대회 종료 후 30일 이내 파기합니다.
              </span>
            </label>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="border-t border-ui-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-text-muted">참가비</span>
                <span className="text-xl font-black text-brand-cyan font-mono">₩{(t.entryFee || 0).toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors">
                참가 신청하기
              </button>
            </div>
          </form>
        )}

        {/* Submitting */}
        {step === "submitting" && (
          <div className="p-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-brand-cyan animate-spin mb-4" />
            <p className="font-bold text-white">신청 처리 중...</p>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-brand-cyan/15 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-brand-cyan" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              {waitlisted ? "대기자 등록 완료!" : "참가 신청 완료!"}
            </h3>
            <p className="text-sm text-text-muted mb-4">
              {waitlisted
                ? "현재 정원이 마감되어 대기자로 등록되었습니다. 빈자리 발생 시 연락드립니다."
                : "관리자 확인 후 참가가 확정됩니다."
              }
            </p>

            {/* 신청번호 */}
            {regNumber && (
              <div className="bg-dark border border-brand-cyan/30 rounded-lg p-4 mb-4">
                <p className="text-[10px] text-text-muted mb-1">신청번호</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-mono font-bold text-brand-cyan tracking-wider">{regNumber}</span>
                  <button onClick={copyRegNumber} className="p-1 text-text-muted hover:text-brand-cyan transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-text-muted mt-1">이 번호를 저장해주세요. 문의 시 필요합니다.</p>
              </div>
            )}

            <div className="bg-dark/50 border border-ui-border rounded-lg p-4 text-left space-y-1.5 text-sm mb-6">
              <div className="flex justify-between"><span className="text-text-muted">대회</span><span className="text-white font-medium truncate ml-2">{t.title}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">이름</span><span className="text-white">{form.playerName}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">연락처</span><span className="text-white font-mono">{form.playerPhone}</span></div>
              {form.divisions.length > 0 && <div className="flex justify-between"><span className="text-text-muted">종목</span><span className="text-white">{form.divisions.join(", ")}</span></div>}
              {form.partnerName && <div className="flex justify-between"><span className="text-text-muted">파트너</span><span className="text-white">{form.partnerName}</span></div>}
              <div className="flex justify-between">
                <span className="text-text-muted">상태</span>
                <span className={waitlisted ? "text-yellow-400 font-bold" : "text-brand-cyan font-bold"}>{waitlisted ? "대기" : "신청완료"}</span>
              </div>
              {regSummary?.currentCount !== undefined && maxP > 0 && (
                <div className="flex justify-between"><span className="text-text-muted">현재 인원</span><span className="text-white font-mono">{regSummary.currentCount}/{maxP}명</span></div>
              )}
            </div>
            <button onClick={onClose} className="w-full py-3 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-bold text-sm rounded-lg hover:bg-brand-cyan/20 transition-colors">
              닫기
            </button>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">신청 실패</h3>
            <p className="text-sm text-text-muted mb-4">{error}</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setStep("form"); setError(""); }} className="w-full py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg">다시 시도</button>
              <button onClick={onClose} className="w-full py-3 text-text-muted text-sm">닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none";
