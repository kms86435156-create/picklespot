"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { MapPin, Target, Clock, Users, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const SKILL_LEVELS = [
  { value: "입문", label: "입문", desc: "피클볼을 처음 접해요", icon: "🌱" },
  { value: "초급", label: "초급", desc: "기본 규칙은 알고 있어요", icon: "🎾" },
  { value: "중급", label: "중급", desc: "대회 출전 경험이 있어요", icon: "🏆" },
  { value: "상급", label: "상급", desc: "B부 이상 실력이에요", icon: "⚡" },
];

const TIME_OPTIONS = [
  { value: "weekday_morning", label: "평일 오전" },
  { value: "weekday_afternoon", label: "평일 오후" },
  { value: "weekday_evening", label: "평일 저녁" },
  { value: "weekend_morning", label: "주말 오전" },
  { value: "weekend_afternoon", label: "주말 오후" },
];

const PLAY_STYLES = [
  { value: "복식", label: "복식", desc: "2:2로 즐겨요" },
  { value: "단식", label: "단식", desc: "1:1 집중 플레이" },
  { value: "둘다", label: "둘 다", desc: "상관없어요!" },
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [region, setRegion] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [playStyle, setPlayStyle] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?from=/onboarding");
    }
    if (!loading && user?.onboardingCompleted) {
      router.push("/mypage");
    }
  }, [user, loading, router]);

  function toggleTime(t: string) {
    setPreferredTimes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleComplete() {
    setSaving(true);
    try {
      await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          skillLevel,
          preferredTimes: preferredTimes.join(","),
          playStyle,
          onboardingCompleted: true,
        }),
      });
      await refresh();
      router.push("/courts");
    } catch {
      router.push("/mypage");
    }
    setSaving(false);
  }

  function canNext() {
    if (step === 1) return !!region;
    if (step === 2) return !!skillLevel;
    if (step === 3) return preferredTimes.length > 0;
    if (step === 4) return !!playStyle;
    return false;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-text-muted text-sm animate-pulse">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-mono">{step}/{TOTAL_STEPS}</span>
            <span className="text-xs text-brand-cyan font-medium">
              {user.name}님, 환영해요!
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-cyan rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: 지역 */}
        {step === 1 && (
          <StepContainer
            icon={<MapPin className="w-6 h-6 text-brand-cyan" />}
            title="어디서 피클볼을 치세요?"
            subtitle="주로 활동하는 지역을 선택해주세요"
          >
            <div className="grid grid-cols-3 gap-2">
              {REGIONS.map(r => (
                <button key={r} type="button" onClick={() => setRegion(r)}
                  className={`px-3 py-3 rounded-lg border text-sm font-medium transition-all ${
                    region === r
                      ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan"
                      : "bg-surface border-ui-border text-text-muted hover:border-text-muted hover:text-white"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 2: 실력 */}
        {step === 2 && (
          <StepContainer
            icon={<Target className="w-6 h-6 text-brand-cyan" />}
            title="현재 실력은 어느 정도인가요?"
            subtitle="부담 없이 선택하세요. 나중에 변경 가능해요"
          >
            <div className="space-y-3">
              {SKILL_LEVELS.map(s => (
                <button key={s.value} type="button" onClick={() => setSkillLevel(s.value)}
                  className={`w-full p-4 rounded-lg border text-left transition-all flex items-center gap-4 ${
                    skillLevel === s.value
                      ? "bg-brand-cyan/10 border-brand-cyan/50"
                      : "bg-surface border-ui-border hover:border-text-muted"
                  }`}>
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className={`font-bold text-sm ${skillLevel === s.value ? "text-brand-cyan" : "text-white"}`}>{s.label}</p>
                    <p className="text-xs text-text-muted">{s.desc}</p>
                  </div>
                  {skillLevel === s.value && <Check className="w-5 h-5 text-brand-cyan ml-auto" />}
                </button>
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 3: 선호 시간대 */}
        {step === 3 && (
          <StepContainer
            icon={<Clock className="w-6 h-6 text-brand-cyan" />}
            title="언제 치는 걸 좋아하세요?"
            subtitle="여러 개 선택할 수 있어요"
          >
            <div className="space-y-2">
              {TIME_OPTIONS.map(t => (
                <button key={t.value} type="button" onClick={() => toggleTime(t.value)}
                  className={`w-full px-4 py-3.5 rounded-lg border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    preferredTimes.includes(t.value)
                      ? "bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan"
                      : "bg-surface border-ui-border text-text-muted hover:border-text-muted hover:text-white"
                  }`}>
                  {t.label}
                  {preferredTimes.includes(t.value) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </StepContainer>
        )}

        {/* Step 4: 플레이 유형 */}
        {step === 4 && (
          <StepContainer
            icon={<Users className="w-6 h-6 text-brand-cyan" />}
            title="어떤 플레이를 선호하세요?"
            subtitle="매칭할 때 참고할게요"
          >
            <div className="space-y-3">
              {PLAY_STYLES.map(s => (
                <button key={s.value} type="button" onClick={() => setPlayStyle(s.value)}
                  className={`w-full p-4 rounded-lg border text-left transition-all flex items-center gap-4 ${
                    playStyle === s.value
                      ? "bg-brand-cyan/10 border-brand-cyan/50"
                      : "bg-surface border-ui-border hover:border-text-muted"
                  }`}>
                  <div>
                    <p className={`font-bold text-sm ${playStyle === s.value ? "text-brand-cyan" : "text-white"}`}>{s.label}</p>
                    <p className="text-xs text-text-muted">{s.desc}</p>
                  </div>
                  {playStyle === s.value && <Check className="w-5 h-5 text-brand-cyan ml-auto" />}
                </button>
              ))}
            </div>

            {/* 완료 요약 */}
            {playStyle && (
              <div className="mt-6 p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                  <span className="text-sm font-bold text-brand-cyan">프로필 요약</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                  <span>지역: <span className="text-white">{region}</span></span>
                  <span>실력: <span className="text-white">{skillLevel}</span></span>
                  <span>스타일: <span className="text-white">{playStyle}</span></span>
                  <span>시간: <span className="text-white">{preferredTimes.length}개 선택</span></span>
                </div>
              </div>
            )}
          </StepContainer>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2.5 text-sm text-text-muted hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> 이전
            </button>
          ) : (
            <button onClick={() => router.push("/mypage")}
              className="text-sm text-text-muted hover:text-white transition-colors">
              건너뛰기
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className="flex items-center gap-1 px-6 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              다음 <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleComplete} disabled={!canNext() || saving}
              className="flex items-center gap-1 px-6 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {saving ? "저장 중..." : "완료"} <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepContainer({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
