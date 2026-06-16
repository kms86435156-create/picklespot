"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User, Users, Phone, MessageCircle, Plus, X, Search, Copy, Check, ExternalLink } from "lucide-react";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const TYPES = ["전체", "개인", "그룹"];

export default function LessonsPage({ lessons: initialLessons }: { lessons: any[] }) {
  const [region, setRegion] = useState("전체");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [lessons, setLessons] = useState(initialLessons);

  const filtered = useMemo(() => {
    return lessons.filter(l => {
      if (region !== "전체" && l.region !== region) return false;
      if (typeFilter !== "전체" && l.lessonType !== typeFilter) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (!l.coachName?.toLowerCase().includes(kw) && !l.intro?.toLowerCase().includes(kw) && !l.region?.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [lessons, region, typeFilter, keyword]);

  function handleRegister(newLesson: any) {
    const lesson = {
      ...newLesson,
      id: `lesson_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLessons(prev => [lesson, ...prev]);
    setShowRegister(false);
  }

  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-cyan/5 to-transparent border-b border-ui-border">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">피클볼 레슨 찾기</h1>
              <p className="text-sm text-text-muted">입문자도 쉽게 시작할 수 있는 레슨을 찾아보세요.</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <span><span className="text-brand-cyan font-bold text-lg">{filtered.length}</span> <span className="text-text-muted">개 레슨</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Filters */}
        <div className="bg-surface border border-ui-border rounded-lg p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="코치명, 소개 검색..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none"
              />
            </div>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none"
            >
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none"
            >
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Register Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> 레슨 등록
          </button>
        </div>

        {/* Lesson Cards */}
        {filtered.length === 0 ? (
          <div className="bg-surface/50 border border-dashed border-ui-border rounded-2xl py-16 text-center px-4">
            <div className="text-5xl mb-4">🏓</div>
            <h3 className="font-bold text-white text-lg mb-2">등록된 레슨이 없습니다.</h3>
            <p className="text-text-muted text-sm mb-6">첫 번째 레슨을 등록해보세요.</p>
            <button
              onClick={() => setShowRegister(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-brand-cyan text-dark font-black rounded-xl hover:bg-brand-cyan/90 transition-all"
            >
              <Plus className="w-4 h-4" /> 레슨 등록하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <LessonCard lesson={l} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegister && (
          <RegisterModal onClose={() => setShowRegister(false)} onSubmit={handleRegister} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LessonCard({ lesson: l }: { lesson: any }) {
  const [showContact, setShowContact] = useState(false);
  const isKakao = l.contact?.includes("카카오") || l.contact?.includes("kakao");
  const ContactIcon = isKakao ? MessageCircle : Phone;

  return (
    <>
      <div className="bg-surface border border-ui-border rounded-lg p-5 hover:border-brand-cyan/30 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-brand-cyan font-bold text-base">{l.coachName?.[0]}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base">{l.coachName}</h3>
              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.region}</span>
                <span className="flex items-center gap-1">
                  {l.lessonType === "개인" ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {l.lessonType}레슨
                </span>
              </div>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-medium ${l.lessonType === "개인" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"}`}>
            {l.lessonType}
          </span>
        </div>

        <p className="text-sm text-text-muted mt-3 leading-relaxed">{l.intro}</p>

        <div className="mt-4 pt-3 border-t border-ui-border flex items-center justify-between flex-wrap gap-2">
          <span className="text-brand-cyan font-bold text-sm">{l.price}</span>
          <button
            onClick={() => setShowContact(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-cyan text-dark font-bold text-xs rounded-lg hover:bg-brand-cyan/90 transition-colors"
          >
            <ContactIcon className="w-3.5 h-3.5" /> 문의하기
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showContact && (
          <ContactModal lesson={l} onClose={() => setShowContact(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function parseContact(contact: string) {
  const urlMatch = contact.match(/https?:\/\/open\.kakao\.com\/[^\s,|]+/);
  const phoneMatch = contact.match(/(01[016789]-?\d{3,4}-?\d{4})/);
  const kakaoIdMatch = contact.match(/카카오톡:\s*([^\s,|]+)/i) || contact.match(/kakao(?:talk)?:\s*([^\s,|]+)/i);
  return {
    kakaoLink: urlMatch?.[0] || null,
    phone: phoneMatch?.[1] || null,
    kakaoId: kakaoIdMatch?.[1] || null,
  };
}

function ContactModal({ lesson: l, onClose }: { lesson: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const parsed = parseContact(l.contact || "");
  const isKakao = !!(parsed.kakaoLink || parsed.kakaoId);
  const isPhone = !!parsed.phone;

  function handleCopy(text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="relative w-full max-w-sm bg-surface border border-ui-border rounded-t-2xl sm:rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-ui-border flex items-center justify-between">
          <h2 className="text-base font-bold text-white">코치 문의하기</h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Coach Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-brand-cyan font-bold text-lg">{l.coachName?.[0]}</span>
            </div>
            <div>
              <h3 className="font-bold text-white">{l.coachName}</h3>
              <p className="text-xs text-text-muted">{l.region} · {l.lessonType}레슨 · {l.price}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-dark/50 border border-ui-border rounded-lg p-4 space-y-3">
            <p className="text-xs text-text-muted font-medium">연락처</p>
            <div className="flex items-center gap-2">
              {isKakao ? (
                <MessageCircle className="w-4 h-4 text-yellow-400 shrink-0" />
              ) : (
                <Phone className="w-4 h-4 text-brand-cyan shrink-0" />
              )}
              <span className="text-sm text-white break-all">{l.contact}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Primary: Kakao open chat link */}
            {parsed.kakaoLink && (
              <a
                href={parsed.kakaoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-[#191919] font-bold text-sm rounded-lg hover:bg-[#FEE500]/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                카카오톡으로 문의
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Primary: Phone call */}
            {isPhone && (
              <a
                href={`tel:${parsed.phone!.replace(/[^0-9]/g, "")}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 transition-colors"
              >
                <Phone className="w-4 h-4" />
                전화 문의
              </a>
            )}

            {/* Secondary: Copy */}
            <button
              onClick={() => handleCopy(parsed.kakaoId || parsed.phone || l.contact || "")}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent border border-ui-border text-text-muted font-medium text-sm rounded-lg hover:border-brand-cyan/50 hover:text-white transition-colors"
            >
              {copied ? (
                <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">복사 완료!</span></>
              ) : (
                <><Copy className="w-4 h-4" />{parsed.kakaoId ? `카카오톡 ID 복사 (${parsed.kakaoId})` : "연락처 복사"}</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RegisterModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    coachName: "",
    region: "서울",
    lessonType: "개인",
    price: "",
    intro: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.coachName || !form.price || !form.intro || !form.contact) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const saved = await res.json();
        onSubmit(saved);
      } else {
        // Fallback: client-side only
        onSubmit(form);
      }
    } catch {
      // Fallback: client-side only
      onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-3 py-2.5 bg-dark border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none";
  const labelClass = "block text-xs text-text-muted mb-1.5 font-medium";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="relative w-full max-w-lg bg-surface border border-ui-border rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-surface border-b border-ui-border px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-white">레슨 등록</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>이름 *</label>
            <input
              type="text"
              placeholder="코치 이름"
              value={form.coachName}
              onChange={e => set("coachName", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>지역 *</label>
              <select
                value={form.region}
                onChange={e => set("region", e.target.value)}
                className={inputClass}
              >
                {REGIONS.filter(r => r !== "전체").map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>레슨 유형 *</label>
              <select
                value={form.lessonType}
                onChange={e => set("lessonType", e.target.value)}
                className={inputClass}
              >
                <option value="개인">개인레슨</option>
                <option value="그룹">그룹레슨</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>가격 *</label>
            <input
              type="text"
              placeholder="예: 1회 50,000원"
              value={form.price}
              onChange={e => set("price", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>한 줄 소개 *</label>
            <textarea
              placeholder="레슨 내용, 경력 등을 간단히 소개해주세요."
              value={form.intro}
              onChange={e => set("intro", e.target.value)}
              rows={3}
              className={inputClass + " resize-none"}
            />
          </div>

          <div>
            <label className={labelClass}>연락처 *</label>
            <input
              type="text"
              placeholder="카카오톡 오픈채팅 링크 또는 전화번호"
              value={form.contact}
              onChange={e => set("contact", e.target.value)}
              className={inputClass}
            />
            <p className="text-[11px] text-text-muted/60 mt-1">카카오톡 오픈채팅 또는 전화번호를 입력하세요.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "레슨 등록하기"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
