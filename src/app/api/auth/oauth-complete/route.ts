import { NextRequest, NextResponse } from "next/server";
import { signToken, setUserCookie } from "@/lib/auth";
import { findUserByEmail } from "@/lib/users";
import { supabaseAdmin, isSupabaseEnabled } from "@/lib/supabase";

/**
 * POST /api/auth/oauth-complete
 * OAuth 로그인 완료 후 호출 — 자체 users 테이블에 upsert + JWT 발급
 */
export async function POST(req: NextRequest) {
  const { email, name, provider, providerId } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "이메일이 필요합니다." }, { status: 400 });
  }

  try {
    // 기존 사용자 확인
    let user = await findUserByEmail(email);

    if (user) {
      // 기존 사용자 — 정지 상태 확인
      if (user.status === "suspended") {
        return NextResponse.json({ error: "정지된 계정입니다." }, { status: 403 });
      }
    } else {
      // 신규 사용자 생성 (OAuth는 비밀번호 없이)
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newUser = {
        id,
        email: email.toLowerCase(),
        name: name || email.split("@")[0],
        phone: "",
        role: "user",
        club_name: "",
        region: "",
        organizer_note: "",
        skill_level: "",
        preferred_times: "",
        play_style: "",
        onboarding_completed: false,
        password_hash: `oauth:${provider}:${providerId}`,
        status: "active",
        suspended_reason: "",
        created_at: now,
        updated_at: now,
      };

      if (isSupabaseEnabled && supabaseAdmin) {
        const { error } = await supabaseAdmin.from("users").insert(newUser);
        if (error) {
          console.error("[OAuth] User insert error:", error);
          return NextResponse.json({ error: "계정 생성에 실패했습니다." }, { status: 500 });
        }
      }

      user = await findUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: "계정 생성에 실패했습니다." }, { status: 500 });
      }
    }

    // 자체 JWT 발급
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    setUserCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (e: any) {
    console.error("[OAuth] Error:", e);
    return NextResponse.json({ error: e.message || "OAuth 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
