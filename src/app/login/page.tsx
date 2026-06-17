"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import PasswordInput from "@/components/ui/PasswordInput";
import { startOAuth } from "@/lib/oauth";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getFrom() {
    if (typeof window === "undefined") return "/";
    const params = new URLSearchParams(window.location.search);
    return params.get("from") || "/";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }
      await refresh();
      router.push(getFrom());
      router.refresh();
    } catch {
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
          <h1 className="text-2xl font-bold text-white">로그인</h1>
          <p className="text-sm text-text-muted mt-1">PBL.SYS 계정으로 로그인하세요</p>
        </div>

        {/* Social Login */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={() => startOAuth("google", from)}
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
            onClick={() => startOAuth("kakao", from)}
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
          <span className="text-xs text-text-muted">또는</span>
          <div className="flex-1 h-px bg-ui-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs text-text-muted mb-1.5">이메일</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus autoComplete="email"
              className="w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50"
              placeholder="email@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-text-muted mb-1.5">비밀번호</label>
            <PasswordInput id="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
              className="w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50"
              placeholder="비밀번호 입력" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          계정이 없으신가요?{" "}
          <Link href={`/signup${from !== "/" ? `?from=${encodeURIComponent(from)}` : ""}`} className="text-brand-cyan hover:underline font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
