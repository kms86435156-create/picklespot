import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/auth/oauth?provider=google|kakao&from=/current-path
 * Supabase Auth OAuth 시작점 — 사용자를 OAuth provider로 리다이렉트
 */
export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider") as "google" | "kakao";
  const from = req.nextUrl.searchParams.get("from") || "/";

  if (!provider || !["google", "kakao"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "OAuth 설정이 되어 있지 않습니다." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const redirectTo = `${siteUrl}/auth/callback?from=${encodeURIComponent(from)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error || !data.url) {
    return NextResponse.json(
      { error: error?.message || "OAuth 시작에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
