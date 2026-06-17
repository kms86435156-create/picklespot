"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setError("인증 서비스에 연결할 수 없습니다.");
        return;
      }

      // PKCE flow: URL에 ?code= 파라미터가 있으면 세션으로 교환
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("[OAuth callback] code exchange error:", exchangeError);
          setError("인증 코드 교환에 실패했습니다. 다시 시도해주세요.");
          return;
        }
      }

      // 세션 확인 (PKCE 교환 후 또는 implicit flow의 hash 자동 감지)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("[OAuth callback] session error:", sessionError);
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      const supaUser = session.user;
      const email = supaUser.email;
      const name = supaUser.user_metadata?.full_name
        || supaUser.user_metadata?.name
        || email?.split("@")[0]
        || "사용자";

      // 서버에 OAuth 완료 알림 → 자체 users 테이블 upsert + JWT 발급
      try {
        const res = await fetch("/api/auth/oauth-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            provider: supaUser.app_metadata?.provider || "oauth",
            providerId: supaUser.id,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "계정 생성에 실패했습니다.");
          return;
        }

        const result = await res.json();
        await refresh();

        // 신규 사용자(온보딩 미완료)는 온보딩으로, 기존 사용자는 원래 페이지로
        if (result.user && !result.user.onboardingCompleted) {
          router.replace("/onboarding");
        } else {
          const from = searchParams.get("from") || "/";
          router.replace(from);
        }
      } catch {
        setError("서버에 연결할 수 없습니다.");
      }
    }

    handleCallback();
  }, [router, searchParams, refresh]);

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-brand-cyan text-dark font-bold text-sm rounded-lg"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-text-muted text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}
