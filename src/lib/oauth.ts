import { getSupabaseBrowser } from "./supabase-browser";

/**
 * 브라우저에서 Supabase OAuth를 시작합니다.
 * PKCE flow를 위해 반드시 브라우저에서 호출해야 합니다.
 * (서버 API route에서 호출하면 code_verifier가 브라우저에 저장되지 않음)
 */
export async function startOAuth(provider: "google" | "kakao", from: string = "/") {
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    alert("인증 서비스에 연결할 수 없습니다.");
    return;
  }

  const siteUrl = window.location.origin;
  const redirectTo = `${siteUrl}/auth/callback?from=${encodeURIComponent(from)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) {
    console.error("[OAuth] signInWithOAuth error:", error);
    alert(error.message || "로그인 시작에 실패했습니다.");
  }
}
