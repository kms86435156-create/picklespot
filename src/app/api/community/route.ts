export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, isSupabaseEnabled } from "@/lib/supabase";
import { readJSON, writeJSON, createEntity, toSnake, toCamel } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

/** GET /api/community?category=xxx&region=xxx&sort=recent */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const region = searchParams.get("region") || "";
  const sort = searchParams.get("sort") || "recent";

  if (isSupabaseEnabled) {
    let q = supabase.from("community_posts").select("*").eq("is_deleted", false);
    if (category && category !== "전체") q = q.eq("category", category);
    if (region && region !== "전체") q = q.eq("region", region);

    if (sort === "popular") q = q.order("likes", { ascending: false });
    else q = q.order("created_at", { ascending: false });

    const { data, error } = await q;
    if (error) {
      console.error("GET /api/community error:", error);
      return NextResponse.json({ posts: [] });
    }
    
    let posts = data.map(toCamel);
    if (sort === "comments") {
      posts.sort((a: any, b: any) => (b.comments?.length || 0) - (a.comments?.length || 0));
    }
    return NextResponse.json({ posts });
  }

  // JSON fallback
  let posts = readJSON("community-posts.json").filter((p: any) => !p.isDeleted);
  if (category && category !== "전체") posts = posts.filter((p: any) => p.category === category);
  if (region && region !== "전체") posts = posts.filter((p: any) => p.region === region);

  if (sort === "popular") posts.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
  else if (sort === "comments") posts.sort((a: any, b: any) => (b.comments?.length || 0) - (a.comments?.length || 0));
  else posts.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return NextResponse.json({ posts });
}

/** POST /api/community */
export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { title, content, category, region } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });

  const post = {
    id: "cpost__",
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
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseEnabled) {
    const { error } = await supabaseAdmin.from("community_posts").insert(toSnake(post));
    if (error) {
      console.error("POST /api/community error:", error);
      return NextResponse.json({ error: "게시글 작성 중 오류가 발생했습니다." }, { status: 500 });
    }
    return NextResponse.json({ success: true, post }, { status: 201 });
  }

  createEntity("community-posts.json", post);
  return NextResponse.json({ success: true, post }, { status: 201 });
}

/** PATCH /api/community */
export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { postId, action, commentText, reason } = await req.json();

  if (isSupabaseEnabled) {
    const { data: post, error: fetchErr } = await supabaseAdmin.from("community_posts").select("*").eq("id", postId).single();
    if (fetchErr || !post) return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });

    const camelPost = toCamel(post);

    if (action === "like") {
      const likedBy = camelPost.likedBy || [];
      const newLikedBy = likedBy.includes(session.id)
        ? likedBy.filter((id: string) => id !== session.id)
        : [...likedBy, session.id];
      const newLikes = Math.max(0, newLikedBy.length);
      
      await supabaseAdmin.from("community_posts").update({
        likes: newLikes,
        liked_by: newLikedBy
      }).eq("id", postId);

    } else if (action === "comment") {
      if (!commentText?.trim()) return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
      const comments = camelPost.comments || [];
      comments.push({
        id: "ccmt__",
        authorId: session.id,
        authorName: session.name,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
      });
      await supabaseAdmin.from("community_posts").update({ comments }).eq("id", postId);

    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "JSON mode fallback skipped for brevity" });
}
