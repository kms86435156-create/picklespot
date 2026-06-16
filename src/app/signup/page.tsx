"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/components/auth/AuthProvider";
import { logger } from "@/lib/logger";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", passwordConfirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) { setForm(prev => ({ ...prev, [key]: val })); }

  function getFrom() {
    if (typeof window === "undefined") return "/";
    const params = new URLSearchParams(window.location.search);
    return params.get("from") || "/";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("이름, 이메일, 비밀번호는 필수입니다.");
      return;
    }
    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }
      logger.event("SIGNUP_SUCCESS", { email: form.email });
      await refresh();
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      logger.error(err, "SignupPage.handleSubmit");
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  const from = getFrom();

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 pt-14">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">회원가입</h1>
          <p className="text-sm text-text-muted mt-1">PBL.SYS에 가입하고 피클볼을 즐기세요</p>
        </div>

        {/* Social Login */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={() => { window.location.href = `/api/auth/oauth?provider=google&from=/onboarding`; }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-gray-800 font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = `/api/auth/oauth?provider=kakao&from=/onboarding`; }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FEE500] text-[#191919] font-medium text-sm rounded-lg hover:bg-[#FDD800] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#191919" d="M12 3C6.48 3 2 6.44 2 10.64c0 2.72 1.8 5.1 4.5 6.44-.2.73-.72 2.64-.82 3.05-.13.5.18.5.38.36.16-.1 2.46-1.67 3.46-2.35.48.07.97.1 1.48.1 5.52 0 10-3.44 10-7.6C22 6.44 17.52 3 12 3z"/>
            </svg>
            카카오로 계속하기
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-ui-border" />
          <span className="text-xs text-text-muted">또는 이메일로 가입</span>
          <div className="flex-1 h-px bg-ui-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label className="block text-xs text-text-muted mb-1.5">이름 <span className="text-red-400">*</span></label>
            <input type="text" value={form.name} onChange={e => set("name", e.target.value)} required placeholder="홍길동"
              className="w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">이메일 <span className="text-red-400">*</span></label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="email@example.com" autoComplete="email"
              className="w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">연락처 <span className="text-text-muted/50">(선택)</span></label>
            <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000"
              className="w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">비밀번호 <span className="text-red-400">*</span></label>
            <PasswordInput value={form.password} onChange={e => set("password", e.target.value)} required placeholder="6자 이상" autoComplete="new-password"
              className="w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">비밀번호 확인 <span className="text-red-400">*</span></label>
            <PasswordInput value={form.passwordConfirm} onChange={e => set("passwordConfirm", e.target.value)} required placeholder="비밀번호 재입력" autoComplete="new-password"
              className="w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href={`/login${from !== "/" ? `?from=${encodeURIComponent(from)}` : ""}`} className="text-brand-cyan hover:underline font-medium">
            로그인
          </Link>
        </p>

        {/* 운영자 가입 배너 */}
        <div className="mt-8 pt-6 border-t border-ui-border">
          <Link href="/signup/organizer" className="block bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-4 hover:bg-brand-cyan/10 transition-colors group">
            <p className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">동호회/대회 운영자이신가요?</p>
            <p className="text-xs text-text-muted mt-0.5">운영자로 가입하면 동호회 관리, 대회 접수 등 추가 기능을 사용할 수 있습니다.</p>
            <span className="text-xs text-brand-cyan font-medium mt-2 inline-block">운영자로 가입하기 →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
