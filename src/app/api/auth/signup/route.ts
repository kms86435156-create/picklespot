export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { signToken, setUserCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone, role, clubName, region, organizerNote } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "이메일, 비밀번호, 이름은 필수입니다." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
    }

    const isOrganizer = role === "organizer";
    if (isOrganizer) {
      if (!clubName) return NextResponse.json({ error: "동호회/단체명은 필수입니다." }, { status: 400 });
      if (!phone) return NextResponse.json({ error: "연락처는 필수입니다." }, { status: 400 });
      if (!region) return NextResponse.json({ error: "지역을 선택해주세요." }, { status: 400 });
    }

    const user = await createUser(email, password, name, phone || "", {
      role: isOrganizer ? "organizer" : "user",
      clubName: clubName || "",
      region: region || "",
      organizerNote: organizerNote || "",
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    setUserCookie(token);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (e: any) {
    const msg = e.message || "회원가입에 실패했습니다.";
    return NextResponse.json({ error: msg }, { status: msg.includes("이미 가입") ? 409 : 500 });
  }
}
