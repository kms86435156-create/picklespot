"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import PasswordInput from "@/components/ui/PasswordInput";
import { Users } from "lucide-react";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const inputCls = "w-full px-3 py-2.5 bg-surface border border-ui-border rounded-lg text-sm text-white placeholder:text-text-muted/50 focus:outline-none focus:border-brand-cyan/50";

export default function OrganizerSignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", passwordConfirm: "",
    clubName: "", region: "", organizerNote: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) { setForm(prev => ({ ...prev, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) { setError("이름, 이메일, 비밀번호는 필수입니다."); return; }
    if (form.password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    if (form.password !== form.passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (!form.clubName) { setError("동호회/단체명을 입력해주세요."); return; }
    if (!form.phone) { setError("연락처를 입력해주세요."); return; }
    if (!form.region) { setError("지역을 선택해주세요."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "organizer" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "회원가입에 실패했습니다."); return; }
      await refresh();
      router.push("/mypage");
      router.refresh();
    } catch { setError("서버에 연결할 수 없습니다."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 pt-14">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-brand-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-white">운영자 가입</h1>
          <p className="text-sm text-text-muted mt-1">동호회/대회 운영자 전용 가입</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          {/* 기본 정보 */}
          <div className="bg-surface border border-ui-border rounded-lg p-4 space-y-3">
            <p className="text-xs text-text-muted font-medium mb-1">기본 정보</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">이름 <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => set("name", e.target.value)} required placeholder="홍길동" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">연락처 <span className="text-red-400">*</span></label>
                <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} required placeholder="010-0000-0000" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">이메일 <span className="text-red-400">*</span></label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="email@example.com" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">비밀번호 <span className="text-red-400">*</span></label>
                <PasswordInput value={form.password} onChange={e => set("password", e.target.value)} required placeholder="6자 이상" autoComplete="new-password" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">비밀번호 확인 <span className="text-red-400">*</span></label>
                <PasswordInput value={form.passwordConfirm} onChange={e => set("passwordConfirm", e.target.value)} required placeholder="재입력" autoComplete="new-password" className={inputCls} />
              </div>
            </div>
          </div>

          {/* 운영자 정보 */}
          <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-4 space-y-3">
            <p className="text-xs text-brand-cyan font-medium mb-1">운영자 정보</p>
            <div>
              <label className="block text-xs text-text-muted mb-1">동호회/단체명 <span className="text-red-400">*</span></label>
              <input type="text" value={form.clubName} onChange={e => set("clubName", e.target.value)} required placeholder="OO 피클볼 클럽" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">지역 <span className="text-red-400">*</span></label>
              <select value={form.region} onChange={e => set("region", e.target.value)} required className={inputCls}>
                <option value="">선택해주세요</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">운영 경험/메모 <span className="text-text-muted/50">(선택)</span></label>
              <textarea value={form.organizerNote} onChange={e => set("organizerNote", e.target.value)} placeholder="동호회 규모, 대회 운영 경험 등" rows={2} className={`${inputCls} resize-y`} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors">
            {loading ? "가입 중..." : "운영자로 가입하기"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          일반 회원으로 가입하시겠어요?{" "}
          <Link href="/signup" className="text-brand-cyan hover:underline font-medium">일반 회원가입</Link>
        </p>
        <p className="text-center text-sm text-text-muted mt-2">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-brand-cyan hover:underline font-medium">로그인</Link>
        </p>
      </div>
    </div>
  );
}
