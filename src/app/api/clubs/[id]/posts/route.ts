export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readJSON, createEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** GET — 게시글 목록 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const posts = readJSON("club-posts.json")
    .filter((p: any) => p.clubId === params.id && !p.isDeleted)
    .sort((a: any, b: any) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  return NextResponse.json({ posts });
}

/** POST — 글쓰기 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  // Check membership
  const members = readJSON("club-members.json");
  const isMember = members.find((m: any) => m.clubId === params.id && m.userId === session.id && m.status === "active");
  if (!isMember) return NextResponse.json({ error: "회원만 글을 작성할 수 있습니다." }, { status: 403 });

  const { title, content, type } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });

  const post = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clubId: params.id,
    authorId: session.id,
    authorName: session.name,
    title: title.trim(),
    content: content.trim(),
    type: type || "free",
    isPinned: false,
    isDeleted: false,
    comments: [],
    createdAt: new Date().toISOString(),
  };
  createEntity("club-posts.json", post);
  return NextResponse.json({ success: true, post }, { status: 201 });
}

/** PATCH — 댓글 추가 / 공지 고정 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { postId, action, commentText } = await req.json();
  const posts = readJSON("club-posts.json");
  const idx = posts.findIndex((p: any) => p.id === postId && p.clubId === params.id);
  if (idx === -1) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });

  if (action === "comment") {
    const members = readJSON("club-members.json");
    const isMember = members.find((m: any) => m.clubId === params.id && m.userId === session.id && m.status === "active");
    if (!isMember) return NextResponse.json({ error: "회원만 댓글을 작성할 수 있습니다." }, { status: 403 });
    if (!commentText?.trim()) return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });

    const comment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      authorId: session.id,
      authorName: session.name,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    if (!posts[idx].comments) posts[idx].comments = [];
    posts[idx].comments.push(comment);
  } else if (action === "pin" || action === "unpin") {
    // Only owner can pin
    const clubs = readJSON("clubs.json");
    const club = clubs.find((c: any) => c.id === params.id);
    if (!club || club.ownerId !== session.id) return NextResponse.json({ error: "운영자만 공지 고정할 수 있습니다." }, { status: 403 });
    posts[idx].isPinned = action === "pin";
  } else if (action === "delete") {
    if (posts[idx].authorId !== session.id) {
      const clubs = readJSON("clubs.json");
      const club = clubs.find((c: any) => c.id === params.id);
      if (!club || club.ownerId !== session.id) return NextResponse.json({ error: "작성자 또는 운영자만 삭제할 수 있습니다." }, { status: 403 });
    }
    posts[idx].isDeleted = true;
  }

  const { writeJSON } = await import("@/lib/db");
  writeJSON("club-posts.json", posts);
  return NextResponse.json({ success: true });
}
