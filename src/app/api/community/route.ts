export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON, createEntity } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** GET /api/community?category=xxx&region=xxx&sort=recent */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const region = searchParams.get("region") || "";
  const sort = searchParams.get("sort") || "recent";

  let posts = readJSON("community-posts.json").filter((p: any) => !p.isDeleted);
  if (category && category !== "전체") posts = posts.filter((p: any) => p.category === category);
  if (region && region !== "전체") posts = posts.filter((p: any) => p.region === region);

  if (sort === "popular") posts.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
  else if (sort === "comments") posts.sort((a: any, b: any) => (b.comments?.length || 0) - (a.comments?.length || 0));
  else posts.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return NextResponse.json({ posts });
}

/** POST /api/community — 글쓰기 */
export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { title, content, category, region } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });

  const post = {
    id: `cpost_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    authorId: session.id,
    authorName: session.name,
    title: title.trim(),
    content: content.trim(),
    category: category || "자유",
    region: region || "",
    likes: 0,
    likedBy: [],
    comments: [],
    views: 0,
    isDeleted: false,
    createdAt: new Date().toISOString(),
  };
  createEntity("community-posts.json", post);
  return NextResponse.json({ success: true, post }, { status: 201 });
}

/** PATCH /api/community — 좋아요/댓글/신고 */
export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { postId, action, commentText, reason } = await req.json();
  const posts = readJSON("community-posts.json");
  const idx = posts.findIndex((p: any) => p.id === postId);
  if (idx === -1) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });

  if (action === "like") {
    const likedBy = posts[idx].likedBy || [];
    if (likedBy.includes(session.id)) {
      posts[idx].likedBy = likedBy.filter((id: string) => id !== session.id);
      posts[idx].likes = Math.max(0, (posts[idx].likes || 0) - 1);
    } else {
      posts[idx].likedBy = [...likedBy, session.id];
      posts[idx].likes = (posts[idx].likes || 0) + 1;
    }
  } else if (action === "comment") {
    if (!commentText?.trim()) return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
    if (!posts[idx].comments) posts[idx].comments = [];
    posts[idx].comments.push({
      id: `ccmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      authorId: session.id,
      authorName: session.name,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    });
  } else if (action === "report") {
    createEntity("reports.json", {
      id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      reporterId: session.id,
      reporterName: session.name,
      targetUserId: posts[idx].authorId,
      reason: reason || "community_post",
      context: `community_post:${postId}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    writeJSON("community-posts.json", posts);
    return NextResponse.json({ success: true });
  }

  writeJSON("community-posts.json", posts);
  return NextResponse.json({ success: true });
}
