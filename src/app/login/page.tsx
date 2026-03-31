"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import PasswordInput from "@/components/ui/PasswordInput";

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
