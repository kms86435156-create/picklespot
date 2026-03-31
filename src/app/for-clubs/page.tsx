"use client";

import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Users, Trophy, MessageCircle, ClipboardList, CreditCard, Bell,
  CheckCircle, ArrowRight, Send, Star, ChevronDown, Zap, Shield,
  BarChart3, FileText, UserPlus, Calendar,
} from "lucide-react";
import Link from "next/link";

/* ─── 애니메이션 래퍼 ─── */
function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 25 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════
   문제 공감 데이터
   ═══════════════════════════════ */
const painPoints = [
  {
    icon: MessageCircle,
    title: "카톡으로 대회 접수 받고 계신가요?",
    desc: "\"참가합니다\" 댓글 세고, 중복 확인하고, 정원 넘으면 다시 공지하고… 매번 30분씩 날립니다.",
  },
  {
    icon: ClipboardList,
    title: "명단 관리, 엑셀로 하고 계시죠?",
    desc: "참가자 이름, 연락처, 종별, 입금 확인까지 — 실수 한 번이면 대회 당일 혼란.",
  },
  {
    icon: CreditCard,
    title: "참가비 입금 확인, 지금도 수동이신가요?",
    desc: "\"입금했는데요\" 문의에 통장 열어서 확인하고 체크 표시 — 회원이 30명만 넘어도 지옥.",
  },
  {
    icon: Bell,
    title: "공지사항, 카톡에 묻히지 않나요?",
    desc: "중요한 일정 변경이나 장소 공지가 잡담 사이에 묻혀서 \"못 봤어요\" 연락 받아본 적 있으실 겁니다.",
  },
  {
    icon: Users,
    title: "신입 회원 문의 올 때마다 같은 말 반복?",
    desc: "\"어디서 하나요?\", \"회비는 얼마예요?\", \"초보도 되나요?\" — 매번 같은 대답 복붙.",
  },
];

/* ═══════════════════════════════
   기능 카드
   ═══════════════════════════════ */
const features = [
  { icon: Trophy, title: "대회 접수 자동화", desc: "링크 하나로 접수, 정원 자동 마감, 종별 분류, 참가자 명단 자동 생성", badge: "핵심" },
  { icon: UserPlus, title: "회원 모집 & 관리", desc: "가입 신청 폼, 회원 목록, 활동 이력이 한 곳에. 더 이상 엑셀 안 써도 됩니다.", badge: "" },
  { icon: Calendar, title: "일정 관리 & 공지", desc: "정기 모임, 대회 일정을 등록하면 회원에게 자동 안내. 공지 누락 제로.", badge: "" },
  { icon: FileText, title: "동호회 프로필 페이지", desc: "검색에 노출되는 공식 소개 페이지. 신입 문의 시 링크 하나만 보내면 끝.", badge: "" },
  { icon: BarChart3, title: "참가/활동 통계", desc: "월별 참여율, 대회 이력, 회원 증감 추이를 한눈에 확인.", badge: "" },
  { icon: Shield, title: "완전 무료", desc: "런칭 파트너 동호회는 모든 기능을 무료로 제공합니다. 숨겨진 비용 없습니다.", badge: "무료" },
];

/* ═══════════════════════════════
   도입 3단계
   ═══════════════════════════════ */
const steps = [
  { step: "1", title: "사전등록 신청", desc: "아래 폼에서 동호회 정보와 연락처를 남겨주세요. 1영업일 이내 연락드립니다." },
  { step: "2", title: "초기 설정 (10분)", desc: "담당자와 함께 동호회 프로필, 회원 목록, 첫 대회 접수 페이지를 세팅합니다." },
  { step: "3", title: "바로 운영 시작", desc: "접수 링크를 회원에게 공유하세요. 참가자 관리는 시스템이 알아서 합니다." },
];

/* ═══════════════════════════════
   사례 + FAQ
   ═══════════════════════════════ */
const testimonials: { name: string; club: string; text: string }[] = [];

const faqs = [
  { q: "정말 무료인가요?", a: "네, 런칭 파트너 동호회는 모든 기능을 무료로 사용하실 수 있습니다. 향후 유료 기능이 추가되더라도 기본 운영 기능은 계속 무료입니다." },
  { q: "우리 동호회는 회원이 10명밖에 안 되는데 써도 되나요?", a: "물론입니다. 10명이든 100명이든 운영 효율화가 필요한 건 같습니다. 소규모 동호회에 특히 유용합니다." },
  { q: "기존 카카오톡 단톡방을 없애야 하나요?", a: "아닙니다. 기존 소통 채널은 그대로 유지하시면 됩니다. 접수/관리/공지 같은 '운영 업무'만 시스템으로 옮기는 겁니다." },
  { q: "대회를 안 여는 동호회도 가입할 수 있나요?", a: "네. 회원 관리, 일정 공유, 동호회 홍보 페이지만 사용하셔도 됩니다." },
  { q: "데이터는 안전한가요?", a: "모든 데이터는 암호화되어 저장되며, 동호회 운영자만 회원 정보에 접근할 수 있습니다." },
];

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

/* ═══════════════════════════════
   메인 컴포넌트
   ═══════════════════════════════ */
export default function ForClubsPage() {
  const [form, setForm] = useState({
    contactName: "", clubName: "", region: "", phone: "",
    currentProblem: "", memberCount: "", runsTournaments: "",  memo: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [stats, setStats] = useState<{ clubs: number; venues: number; tournaments: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/clubs").then(r => r.json()).catch(() => []),
      fetch("/api/venues").then(r => r.json()).catch(() => []),
      fetch("/api/tournaments").then(r => r.json()).catch(() => []),
    ]).then(([clubs, venues, tournaments]) => {
      setStats({
        clubs: Array.isArray(clubs) ? clubs.length : 0,
        venues: Array.isArray(venues) ? venues.length : 0,
        tournaments: Array.isArray(tournaments) ? tournaments.length : 0,
      });
    });
  }, []);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName || !form.clubName || !form.phone) return;
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      alert("전송에 실패했습니다. 다시 시도해주세요.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-dark pt-14">

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/10 via-transparent to-brand-red/5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[250px]" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full text-sm text-brand-cyan mb-6">
              <Star className="w-4 h-4" /> 런칭 파트너 동호회 모집중 · 완전 무료
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              동호회 운영,<br />
              <span className="text-brand-cyan">아직도 카톡으로 하세요?</span>
            </h1>
            <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto mb-4">
              대회 접수, 참가자 관리, 회원 모집, 공지까지<br />
              피클볼 동호회 운영에 필요한 모든 것을 <strong className="text-white">무료</strong>로 제공합니다.
            </p>
            <p className="text-sm text-text-muted/70 mb-8">동호회 대표 1명이 오면, 팀원 10~20명이 따라옵니다.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-cyan text-dark font-bold text-lg rounded hover:bg-brand-cyan/90 transition-colors">
                무료 사전등록 <ArrowRight className="w-5 h-5" />
              </a>
              <Link href="/clubs" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-ui-border text-white font-bold text-lg rounded hover:border-brand-cyan/50 transition-colors">
                등록된 동호회 보기
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 수치 바 ═══ */}
      <section className="border-y border-ui-border bg-surface/50">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-4 text-center">
          {[
            ...(stats && stats.clubs > 0 ? [{ v: `${stats.clubs}`, l: "등록 동호회" }] : []),
            ...(stats && stats.venues > 0 ? [{ v: `${stats.venues}`, l: "전국 피클볼장" }] : []),
            ...(stats && stats.tournaments > 0 ? [{ v: `${stats.tournaments}`, l: "대회 정보" }] : []),
            { v: "₩0", l: "이용료" },
            ...(!stats ? [{ v: "—", l: "런칭 준비중" }] : []),
          ].map(s => (
            <div key={s.l}>
              <p className="text-xl md:text-2xl font-black text-brand-cyan">{s.v}</p>
              <p className="text-[10px] md:text-xs text-text-muted mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 문제 공감 ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <FadeIn>
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono text-brand-cyan tracking-widest block mb-2">PAIN POINTS</span>
            <h2 className="text-2xl md:text-3xl font-black text-white">혹시 이런 경험, 있지 않으세요?</h2>
          </div>
        </FadeIn>
        <div className="space-y-4">
          {painPoints.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <div className="bg-surface border border-ui-border rounded-lg p-5 md:p-6 flex items-start gap-4 hover:border-brand-red/30 transition-colors">
                <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/20 rounded-lg flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{p.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 해결책 전환 ═══ */}
      <section className="bg-gradient-to-b from-transparent via-brand-cyan/5 to-transparent py-16">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full text-sm text-brand-cyan mb-4">
                <Zap className="w-4 h-4" /> 해결책
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                PBL.SYS 하나면,<br /><span className="text-brand-cyan">운영이 10배 쉬워집니다</span>
              </h2>
              <p className="text-sm text-text-muted max-w-lg mx-auto">
                카톡 단톡방은 소통용으로 남기고, 운영 업무는 시스템에 맡기세요.<br />
                대표님의 주말 저녁 시간을 돌려드립니다.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="bg-surface border border-ui-border rounded-lg p-6 hover:border-brand-cyan/30 transition-colors h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg flex items-center justify-center">
                      <f.icon className="w-5 h-5 text-brand-cyan" />
                    </div>
                    {f.badge && <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan rounded">{f.badge}</span>}
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 도입 3단계 ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <FadeIn>
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono text-brand-cyan tracking-widest block mb-2">HOW IT WORKS</span>
            <h2 className="text-2xl font-black text-white">시작은 10분이면 충분합니다</h2>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-14 h-14 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-brand-cyan">{s.step}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center absolute">
                  <ArrowRight className="w-5 h-5 text-text-muted" />
                </div>
              )}
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 성공 사례 ═══ */}
      {testimonials.length > 0 ? (
        <section className="bg-surface/50 border-y border-ui-border py-16">
          <div className="max-w-5xl mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-10">
                <span className="text-[11px] font-mono text-brand-cyan tracking-widest block mb-2">TESTIMONIALS</span>
                <h2 className="text-2xl font-black text-white">이미 사용중인 동호회</h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <FadeIn key={t.name} delay={i * 0.1}>
                  <div className="bg-dark border border-ui-border rounded-lg p-6 h-full flex flex-col">
                    <p className="text-sm text-text-muted leading-relaxed flex-1 mb-4">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-brand-cyan">{t.club}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-surface/50 border-y border-ui-border py-12">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <FadeIn>
              <span className="text-[11px] font-mono text-brand-cyan tracking-widest block mb-2">TESTIMONIALS</span>
              <h2 className="text-xl font-black text-white mb-2">서비스 출시 후 후기가 업데이트됩니다</h2>
              <p className="text-sm text-text-muted">런칭 파트너 동호회의 사용 후기를 곧 공개합니다.</p>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <FadeIn>
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono text-brand-cyan tracking-widest block mb-2">FAQ</span>
            <h2 className="text-2xl font-black text-white">자주 묻는 질문</h2>
          </div>
        </FadeIn>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </div>
                {openFaq === i && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-sm text-text-muted mt-3 leading-relaxed">
                    {faq.a}
                  </motion.p>
                )}
              </button>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 리드 수집 폼 ═══ */}
      <section id="register" className="bg-gradient-to-b from-brand-cyan/5 to-transparent py-16">
        <div className="max-w-2xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white mb-2">무료 사전등록</h2>
              <p className="text-sm text-text-muted">신청하시면 1영업일 이내에 담당자가 연락드립니다.</p>
            </div>
          </FadeIn>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-brand-cyan/30 rounded-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-brand-cyan mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">사전등록이 완료되었습니다!</h3>
              <p className="text-sm text-text-muted mb-1">담당자가 빠르게 연락드리겠습니다.</p>
              <p className="text-xs text-text-muted">보통 1영업일 이내에 전화 또는 카카오톡으로 연락드립니다.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-surface border border-ui-border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="담당자명" required value={form.contactName} onChange={v => set("contactName", v)} placeholder="홍길동" />
                <Field label="동호회명" required value={form.clubName} onChange={v => set("clubName", v)} placeholder="강남피클러스" />
                <Field label="연락처 (전화/카카오)" required value={form.phone} onChange={v => set("phone", v)} placeholder="010-0000-0000" />
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">지역</label>
                  <select value={form.region} onChange={e => set("region", e.target.value)}
                    className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                    <option value="">선택</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">현재 가장 불편한 점</label>
                <select value={form.currentProblem} onChange={e => set("currentProblem", e.target.value)}
                  className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                  <option value="">선택</option>
                  <option value="대회접수">카톡으로 대회 접수 받는 것</option>
                  <option value="명단관리">참가자/회원 명단 관리</option>
                  <option value="참가비">참가비 입금 확인</option>
                  <option value="회원모집">신입 회원 모집</option>
                  <option value="공지">공지/일정 전달</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="예상 회원 수" value={form.memberCount} onChange={v => set("memberCount", v)} placeholder="예: 30명" />
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">대회 운영 여부</label>
                  <select value={form.runsTournaments} onChange={e => set("runsTournaments", e.target.value)}
                    className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none">
                    <option value="">선택</option>
                    <option value="yes_regular">네, 정기적으로 운영합니다</option>
                    <option value="yes_occasional">네, 가끔 합니다</option>
                    <option value="planning">계획 중입니다</option>
                    <option value="no">아니요</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">기타 메모</label>
                <textarea value={form.memo} onChange={e => set("memo", e.target.value)} rows={2}
                  placeholder="궁금한 점이나 필요한 기능이 있으시면 알려주세요"
                  className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none resize-y" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" />
                {submitting ? "전송 중..." : "무료 사전등록 신청하기"}
              </button>
              <p className="text-[11px] text-text-muted/50 text-center">제출된 정보는 서비스 안내 목적으로만 사용됩니다.</p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

/* ─── 폼 필드 컴포넌트 ─── */
function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-text-muted mb-1.5 font-medium">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      <input type="text" required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted/50 focus:border-brand-cyan focus:outline-none" />
    </div>
  );
}
