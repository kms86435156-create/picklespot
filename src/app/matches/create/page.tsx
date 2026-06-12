"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, MapPin, Calendar, ChevronLeft, Clock, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { logger } from "@/lib/logger";

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const SKILL_LEVELS = ["처음이에요", "초보", "초중급", "중급", "중상급", "상급", "무관"];
const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-bold text-white mb-2">
      {children}
      {required && <span className="text-brand-cyan ml-1">*</span>}
    </label>
  );
}

function FieldGroup({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-5">
      {children}
      {hint && <p className="text-xs text-text-muted mt-1.5">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-surface border border-ui-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-cyan/50 transition-colors";

export default function CreateMeetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    region: "",
    venueName: "",
    venueAddress: "",
    maxPlayers: 4,
    skillLevel: "무관",
    fee: 0,
    description: "",
    isBeginnerFriendly: false,
  });

  // 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?from=/matches/create");
    }
  }, [user, authLoading, router]);

  // 인증 확인 중 로딩 표시
  if (authLoading || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  function set(key: string, val: any) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function isStep1Valid() {
    return form.title.trim() && form.date && form.startTime && form.region;
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "번개 생성에 실패했습니다.");
        return;
      }
      logger.event("MEETUP_CREATED", { meetupId: data.meetup.id, region: form.region });
      router.push(`/matches/${data.meetup.id}?created=1`);
    } catch (err) {
      logger.error(err, "CreateMeetupPage.handleSubmit");
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // 오늘 날짜 min
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/matches" className="p-2 text-text-muted hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-cyan" />
            번개 만들기
          </h1>
          <p className="text-xs text-text-muted">오늘 같이 칠 사람을 모아보세요!</p>
        </div>
      </div>

      {/* 진행 스텝 */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? "bg-brand-cyan text-dark" : "bg-white/10 text-text-muted"}`}>
              {s}
            </div>
            <div className={`h-0.5 flex-1 rounded-full transition-all ${s === 1 ? (step > 1 ? "bg-brand-cyan" : "bg-white/10") : "hidden"}`} />
            <span className={`text-xs font-bold ${step === s ? "text-white" : "text-text-muted"}`}>
              {s === 1 ? "기본 정보" : "상세 설정"}
            </span>
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        {step === 1 && (
          <div className="space-y-0">
            {/* 제목 */}
            <FieldGroup hint="예: 강남 실내코트 복식 번개, 주말 오전 초보 번개">
              <Label required>번개 제목</Label>
              <input
                type="text"
                placeholder="어떤 번개인지 간단히 적어주세요"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                maxLength={50}
                className={inputCls}
              />
            </FieldGroup>

            {/* 날짜 */}
            <FieldGroup>
              <Label required>날짜</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={e => set("date", e.target.value)}
                  className={`${inputCls} pl-10`}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </FieldGroup>

            {/* 시간 */}
            <FieldGroup>
              <Label required>시간</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => set("startTime", e.target.value)}
                    className={`${inputCls} pl-10`}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => set("endTime", e.target.value)}
                    className={`${inputCls} pl-10`}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
              <p className="text-xs text-text-muted mt-1.5">시작시간 (필수) · 종료시간 (선택)</p>
            </FieldGroup>

            {/* 지역 */}
            <FieldGroup>
              <Label required>지역</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {REGIONS.slice(0, 8).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("region", r)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${form.region === r ? "bg-brand-cyan text-dark" : "bg-surface border border-ui-border text-text-muted hover:text-white"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {REGIONS.slice(8).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("region", r)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${form.region === r ? "bg-brand-cyan text-dark" : "bg-surface border border-ui-border text-text-muted hover:text-white"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </FieldGroup>

            <button
              onClick={() => isStep1Valid() && setStep(2)}
              disabled={!isStep1Valid()}
              className="w-full py-4 bg-brand-cyan text-dark font-black rounded-xl text-base hover:bg-brand-cyan/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음 →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-0">
            {/* 장소 */}
            <FieldGroup hint="코트 이름이나 주소를 입력하면 참여자가 쉽게 찾을 수 있어요.">
              <Label>장소</Label>
              <div className="relative mb-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="코트/장소 이름 (예: 강남 피클볼파크)"
                  value={form.venueName}
                  onChange={e => set("venueName", e.target.value)}
                  className={`${inputCls} pl-10`}
                />
              </div>
              <input
                type="text"
                placeholder="상세 주소 (선택)"
                value={form.venueAddress}
                onChange={e => set("venueAddress", e.target.value)}
                className={inputCls}
              />
            </FieldGroup>

            {/* 모집 인원 */}
            <FieldGroup>
              <Label required>모집 인원</Label>
              <div className="flex gap-2">
                {MAX_PLAYERS_OPTIONS.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("maxPlayers", n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${form.maxPlayers === n ? "bg-brand-cyan text-dark" : "bg-surface border border-ui-border text-text-muted hover:text-white"}`}
                  >
                    {n}명
                  </button>
                ))}
              </div>
            </FieldGroup>

            {/* 실력 수준 */}
            <FieldGroup>
              <Label>실력 수준</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {SKILL_LEVELS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("skillLevel", s)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${form.skillLevel === s ? "bg-brand-cyan text-dark" : "bg-surface border border-ui-border text-text-muted hover:text-white"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FieldGroup>

            {/* 참가비 */}
            <FieldGroup hint="무료면 0으로 두세요.">
              <Label>참가비</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₩</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="0"
                  value={form.fee || ""}
                  onChange={e => set("fee", Number(e.target.value))}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </FieldGroup>

            {/* 소개글 */}
            <FieldGroup hint="초보자 환영 여부, 모집 조건, 코트 정보 등을 자유롭게 적어주세요.">
              <Label>소개 (선택)</Label>
              <textarea
                placeholder="번개에 대해 더 알려주세요"
                value={form.description}
                onChange={e => set("description", e.target.value)}
                rows={3}
                maxLength={500}
                className={`${inputCls} resize-none`}
              />
            </FieldGroup>

            {/* 초보 환영 */}
            <div className="flex items-center justify-between p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-xl mb-5">
              <div>
                <p className="text-sm font-bold text-white">🌱 초보자 환영</p>
                <p className="text-xs text-text-muted">피클볼 처음인 분도 환영합니다</p>
              </div>
              <button
                type="button"
                onClick={() => set("isBeginnerFriendly", !form.isBeginnerFriendly)}
                className={`relative w-11 h-6 rounded-full transition-all ${form.isBeginnerFriendly ? "bg-emerald-400" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${form.isBeginnerFriendly ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* 안내 */}
            <div className="flex items-start gap-2 p-3 bg-brand-cyan/5 border border-brand-cyan/15 rounded-xl mb-5 text-xs text-text-muted">
              <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
              <p>신청 즉시 참여 확정됩니다. 신청자는 호스트의 연락처를 확인할 수 있어요.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-4 bg-white/[0.06] border border-ui-border text-white font-bold rounded-xl hover:bg-white/[0.1] transition-all"
              >
                ← 이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-brand-cyan text-dark font-black rounded-xl text-base hover:bg-brand-cyan/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    번개 열기!
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
