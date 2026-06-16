import { NextResponse } from "next/server";
import { getUserSession, clearUserCookie } from "@/lib/auth";
import { supabaseAdmin, isSupabaseEnabled } from "@/lib/supabase";
import { readJSON, writeJSON } from "@/lib/db";

export const dynamic = "force-dynamic";

const ANON = "탈퇴한 회원";

export async function DELETE() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    const userId = session.id;

    if (isSupabaseEnabled && supabaseAdmin) {
      await anonymizeSupabase(userId);
      // Supabase Auth 계정 삭제 (service role 필요)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) console.error("Auth delete error:", error.message);
      // users 테이블에서도 삭제
      await supabaseAdmin.from("users").delete().eq("id", userId);
    } else {
      anonymizeJSON(userId);
    }

    clearUserCookie();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: error.message || "탈퇴 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// ═══ Supabase 익명화 + 삭제 ═══
async function anonymizeSupabase(userId: string) {
  const db = supabaseAdmin!;

  // 1. 번개 — hostId 익명화
  await db.from("meetups").update({ host_name: ANON }).eq("host_id", userId);

  // 2. 번개 참가 — 삭제
  await db.from("meetup_participants").delete().eq("user_id", userId);

  // 3. 동호회 — ownerId 익명화
  await db.from("clubs").update({ owner_id: null }).eq("owner_id", userId);

  // 4. 동호회 멤버 — 삭제
  await db.from("club_members").delete().eq("user_id", userId);

  // 5. 동호회 게시글 — 익명화
  await db.from("club_posts").update({ author_name: ANON }).eq("author_id", userId);

  // 6. 커뮤니티 게시글 — 익명화
  await db.from("community_posts").update({ author_name: ANON }).eq("author_id", userId);

  // 7. 장소 리뷰 — 익명화
  await db.from("venue_reviews").update({ author_name: ANON }).eq("author_id", userId);

  // 8. 메시지 — 익명화
  await db.from("messages").update({ sender_name: ANON }).eq("sender_id", userId);

  // 9. 대화 — 삭제 (참가자 배열 필터가 복잡하므로 삭제)
  await db.from("conversations").delete().contains("participant_ids", [userId]);

  // 10. 매너 평점 — 삭제 (양방향)
  await db.from("manner_ratings").delete().eq("from_user_id", userId);
  await db.from("manner_ratings").delete().eq("target_user_id", userId);

  // 11. 알림 — 삭제
  await db.from("notifications").delete().eq("user_id", userId);

  // 12. 차단 — 삭제 (양방향)
  await db.from("blocks").delete().eq("blocker_id", userId);
  await db.from("blocks").delete().eq("blocked_id", userId);

  // 13. 예약 — 익명화
  await db.from("bookings").update({ user_name: ANON }).eq("user_id", userId);

  // 14. 대회 등록 — 익명화
  await db.from("registrations").update({ player_name: ANON }).eq("user_id", userId);
}

// ═══ JSON 파일 모드 익명화 + 삭제 ═══
function anonymizeJSON(userId: string) {
  // 번개 — 익명화
  const meetups = readJSON("meetups.json");
  meetups.forEach((m: any) => { if (m.hostId === userId) m.hostName = ANON; });
  writeJSON("meetups.json", meetups);

  // 번개 참가 — 삭제
  writeJSON("meetup-participants.json",
    readJSON("meetup-participants.json").filter((p: any) => p.userId !== userId));

  // 동호회 — 익명화
  const clubs = readJSON("clubs.json");
  clubs.forEach((c: any) => { if (c.ownerId === userId) c.ownerId = null; });
  writeJSON("clubs.json", clubs);

  // 동호회 멤버 — 삭제
  writeJSON("club-members.json",
    readJSON("club-members.json").filter((m: any) => m.userId !== userId));

  // 게시글 — 익명화
  for (const file of ["club-posts.json", "community-posts.json"]) {
    const posts = readJSON(file);
    posts.forEach((p: any) => {
      if (p.authorId === userId) p.authorName = ANON;
      if (p.comments) p.comments.forEach((c: any) => {
        if (c.authorId === userId) c.authorName = ANON;
      });
      if (p.likedBy) p.likedBy = p.likedBy.filter((id: string) => id !== userId);
    });
    writeJSON(file, posts);
  }

  // 장소 리뷰 — 익명화
  const reviews = readJSON("venue-reviews.json");
  reviews.forEach((r: any) => { if (r.authorId === userId) r.authorName = ANON; });
  writeJSON("venue-reviews.json", reviews);

  // 메시지 — 익명화
  const messages = readJSON("messages.json");
  messages.forEach((m: any) => { if (m.senderId === userId) m.senderName = ANON; });
  writeJSON("messages.json", messages);

  // 대화 — 삭제
  writeJSON("conversations.json",
    readJSON("conversations.json").filter((c: any) => !(c.participantIds || []).includes(userId)));

  // 매너 평점 — 삭제
  writeJSON("manner-ratings.json",
    readJSON("manner-ratings.json").filter((r: any) => r.fromUserId !== userId && r.targetUserId !== userId));

  // 알림 — 삭제
  writeJSON("notifications.json",
    readJSON("notifications.json").filter((n: any) => n.userId !== userId));

  // 차단 — 삭제
  writeJSON("blocks.json",
    readJSON("blocks.json").filter((b: any) => b.blockerId !== userId && b.blockedId !== userId));

  // 예약 — 익명화
  const bookings = readJSON("bookings.json");
  bookings.forEach((b: any) => { if (b.userId === userId) b.userName = ANON; });
  writeJSON("bookings.json", bookings);

  // 유저 삭제
  writeJSON("users.json",
    readJSON("users.json").filter((u: any) => u.id !== userId));
}
