"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, UserPlus, Copy, AlertTriangle, Loader2 } from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import ClipButton from "@/components/ui/ClipButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";

type Step = "confirm" | "processing" | "complete" | "error";

interface RegistrationModalProps {
  tournament: any;
  onClose: () => void;
}

export default function RegistrationModal({ tournament: t, onClose }: RegistrationModalProps) {
  const { user } = useAuth();
  const profile = {
    name: user?.name || "",
    phone: user?.phone || "",
    level: user?.skillLevel || "—",
    region: user?.region || "—",
  };
  const [step, setStep] = useState<Step>("confirm");
  const [partnerInvite, setPartnerInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const { toast } = useToast();

  const isWaitlist = t.status === "closed" || (t.maxSlots > 0 && t.currentSlots >= t.maxSlots);
  const isDoubles = t.type === "doubles" || t.type === "mixed" || t.type === "team";

  const handleSubmit = async () => {
    if (submitting) return; // prevent double-click
    setSubmitting(true);
    setStep("processing");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/tournaments/${t.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          level: profile.level,
          region: profile.region,
          isWaitlist,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "신청 처리에 실패했습니다.");
        setStep("error");
        setSubmitting(false);
        return;
      }

      if (data.isDemoMode) {
        toast("데모 환경에서 신청이 처리되었습니다.", "info");
      }

      setRegistrationResult(data.registration);
      setStep("complete");
    } catch {
      setErrorMessage("네트워크 요청에 실패했습니다. 다시 시도해주세요.");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`https://pbl.sys/tournaments/${t.id}/invite?partner=${encodeURIComponent(profile.name)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-ui-border rounded-sm"
      >
        <TechCorners color="rgba(0,212,255,0.3)" />

        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-ui-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <span className="text-[10px] font-mono text-brand-cyan tracking-widest block">
              {isWaitlist ? "WAITLIST.REGISTER" : "TOURNAMENT.REGISTER"}
            </span>
            <h2 className="font-bold text-lg mt-0.5">
              {isWaitlist ? "대기자 등록" : "대회 신청"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Step 1: 확인 & 입력 ─── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 space-y-4"
            >
              {/* 대회 요약 */}
              <div className="bg-dark/30 border border-ui-border rounded-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={isWaitlist ? "waitlist" : t.status} />
                  <span className="text-xs text-text-muted">
                    {t.date}{t.endDate ? ` ~ ${t.endDate.slice(5)}` : ""}
                  </span>
                </div>
                <h3 className="font-bold mb-1">{t.title}</h3>
                <div className="text-xs text-text-muted space-y-0.5">
                  <div>{t.location} · {t.typeLabel} · {t.level}</div>
                  <div>참가비: ₩{(t.entryFee || 0).toLocaleString()}</div>
                </div>
                {t.maxSlots > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="text-text-muted">모집현황: </span>
                    <span className="text-brand-cyan font-bold">{t.currentSlots}/{t.maxSlots}명</span>
                    {isWaitlist && <span className="text-yellow-400 ml-2">(대기자 등록)</span>}
                  </div>
                )}
              </div>

              {/* 프로필 기반 자동입력 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">참가자 정보</span>
                  <span className="text-[10px] text-brand-cyan font-mono">프로필에서 자동입력</span>
                </div>
                <div className="bg-dark/30 border border-ui-border rounded-sm p-4 space-y-3">
                  {[
                    { label: "이름", value: profile.name },
                    { label: "연락처", value: profile.phone },
                    { label: "레벨", value: profile.level },
                    { label: "지역", value: profile.region },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{field.label}</span>
                      <span className="text-sm font-mono">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 복식 파트너 초대 */}
              {isDoubles && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">파트너 초대 (선택)</span>
                  </div>
                  {!partnerInvite ? (
                    <button
                      onClick={() => setPartnerInvite(true)}
                      className="w-full py-3 text-sm text-text-muted bg-dark/30 border border-dashed border-ui-border rounded-sm hover:border-brand-cyan/30 hover:text-brand-cyan transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <UserPlus className="w-4 h-4" /> 파트너 초대하기
                    </button>
                  ) : (
                    <div className="bg-dark/30 border border-ui-border rounded-sm p-4 space-y-3">
                      <p className="text-xs text-text-muted">초대 링크를 파트너에게 공유하세요. 파트너가 수락하면 자동으로 팀이 구성됩니다.</p>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-dark/50 border border-ui-border rounded-sm px-3 py-2 text-xs font-mono text-text-muted truncate">
                          https://pbl.sys/invite/...
                        </div>
                        <button
                          onClick={handleCopyInvite}
                          className="px-3 py-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-sm text-brand-cyan text-xs font-bold hover:bg-brand-cyan/20 transition-all flex items-center gap-1 shrink-0 min-h-[40px]"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? "복사됨!" : "복사"}
                        </button>
                      </div>
                      <p className="text-[10px] text-text-muted/60">* 파트너 없이도 신청 가능합니다. 추후 매칭도 가능합니다.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 환불 규정 동의 */}
              <div className="bg-dark/30 border border-ui-border rounded-sm p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-yellow-400 block mb-0.5">환불 규정</span>
                    <p className="text-[11px] text-text-muted">{t.refundPolicy}</p>
                  </div>
                </div>
              </div>

              {/* 결제 요약 */}
              <div className="border-t border-ui-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold">결제 금액</span>
                  <span className="text-xl font-black text-brand-cyan font-mono">
                    ₩{(t.entryFee || 0).toLocaleString()}
                  </span>
                </div>
                <ClipButton
                  variant={isWaitlist ? "red" : "cyan"}
                  size="lg"
                  arrow
                  className="w-full justify-center"
                  onClick={handleSubmit}
                >
                  {isWaitlist ? "대기자 등록하기" : "결제 및 신청 완료"}
                </ClipButton>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: 처리중 ─── */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 flex flex-col items-center justify-center"
            >
              <Loader2 className="w-12 h-12 text-brand-cyan animate-spin mb-4" />
              <p className="font-bold text-lg">신청 처리 중...</p>
              <p className="text-sm text-text-muted mt-1">잠시만 기다려주세요</p>
            </motion.div>
          )}

          {/* ─── Step 3: 완료 ─── */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-brand-cyan/15 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-brand-cyan" />
              </div>
              <h3 className="text-xl font-black mb-2">
                {registrationResult?.type === "waitlist" ? "대기자 등록 완료!" : "신청 완료!"}
              </h3>
              <p className="text-sm text-text-muted mb-2">
                {registrationResult?.type === "waitlist"
                  ? "취소자 발생 시 자동으로 신청이 확정됩니다."
                  : "마이페이지에서 신청 내역을 확인할 수 있습니다."}
              </p>
              <StatusBadge status={registrationResult?.type === "waitlist" ? "waitlisted" : "registered"} size="md" />

              <div className="bg-dark/30 border border-ui-border rounded-sm p-4 mt-5 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">대회</span>
                  <span className="font-bold">{t.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">일시</span>
                  <span className="font-mono">{t.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">장소</span>
                  <span>{t.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">결제</span>
                  <span className="font-mono text-brand-cyan">₩{(t.entryFee || 0).toLocaleString()}</span>
                </div>
                {registrationResult?.id && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">신청번호</span>
                    <span className="font-mono text-brand-cyan text-xs">{registrationResult.id}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm font-bold bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-sm hover:bg-brand-cyan/20 transition-all min-h-[44px]"
                >
                  마이페이지에서 확인하기
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm text-text-muted hover:text-white transition-colors min-h-[44px]"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: 에러 ─── */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-brand-red/15 border border-brand-red/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-brand-red" />
              </div>
              <h3 className="text-xl font-black mb-2">신청에 실패했습니다</h3>
              <p className="text-sm text-text-muted mb-4">{errorMessage}</p>
              <div className="flex flex-col gap-2">
                <ClipButton
                  variant="cyan"
                  className="w-full justify-center"
                  onClick={() => { setStep("confirm"); setErrorMessage(""); }}
                >
                  다시 시도
                </ClipButton>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm text-text-muted hover:text-white transition-colors min-h-[44px]"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
