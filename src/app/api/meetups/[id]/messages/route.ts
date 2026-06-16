import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { supabaseAdmin, isSupabaseEnabled } from "@/lib/supabase";
import { readJSON, writeJSON } from "@/lib/db";

export const dynamic = "force-dynamic";

const TABLE = "meetup_messages";
const FILE = "meetup-messages.json";

// 참가자인지 확인
async function isParticipant(meetupId: string, userId: string): Promise<boolean> {
  if (isSupabaseEnabled && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("meetup_participants")
      .select("id")
      .eq("meetup_id", meetupId)
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .maybeSingle();
    return !!data;
  }
  return readJSON("meetup-participants.json")
    .some((p: any) => p.meetupId === meetupId && p.userId === userId && p.status === "confirmed");
}

// GET — 메시지 목록 조회
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const meetupId = params.id;
  if (!(await isParticipant(meetupId, session.id))) {
    return NextResponse.json({ error: "참여자만 채팅을 볼 수 있습니다." }, { status: 403 });
  }

  if (isSupabaseEnabled && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("meetup_id", meetupId)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ messages: data || [] });
  }

  const all = readJSON(FILE);
  const messages = all.filter((m: any) => m.meetup_id === meetupId || m.meetupId === meetupId);
  return NextResponse.json({ messages });
}

// POST — 메시지 전송
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const meetupId = params.id;
  if (!(await isParticipant(meetupId, session.id))) {
    return NextResponse.json({ error: "참여자만 메시지를 보낼 수 있습니다." }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  const message = {
    id: `mm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    meetup_id: meetupId,
    user_id: session.id,
    user_name: session.name,
    content: content.trim(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseEnabled && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from(TABLE).insert(message).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const all = readJSON(FILE);
  all.push(message);
  writeJSON(FILE, all);
  return NextResponse.json(message);
}
