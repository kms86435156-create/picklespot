"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const { refresh } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", passwordConfirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) { setForm(prev => ({ ...prev, [key]: val })); }

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
      await refresh();
      router.push(from);
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 pt-14">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">회원가입</h1>
          <p className="text-sm text-text-muted mt-1">PBL.SYS에 가입하고 피클볼을 즐기세요</p>
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
      </div>
    </div>
  );
}
