export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseEnabled } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "JPG, PNG, WebP, GIF만 업로드 가능합니다." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Supabase Storage
    if (isSupabaseEnabled && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from("posters")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        // bucket이 없으면 로컬 fallback
        console.warn("Supabase upload failed, falling back to local:", error.message);
      } else {
        const { data: urlData } = supabaseAdmin.storage
          .from("posters")
          .getPublicUrl(data.path);
        return NextResponse.json({ url: urlData.publicUrl });
      }
    }

    // Local fallback: public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "업로드 실패" }, { status: 500 });
  }
}
