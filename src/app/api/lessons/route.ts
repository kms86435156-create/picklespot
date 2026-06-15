import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";

export async function GET() {
  const lessons = readJSON("lessons.json");
  return NextResponse.json(lessons);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { coachName, region, lessonType, price, intro, contact } = body;

  if (!coachName || !region || !lessonType || !price || !intro || !contact) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }

  const lesson = {
    id: `lesson_${Date.now()}`,
    coachName,
    region,
    lessonType,
    price,
    intro,
    contact,
    createdAt: new Date().toISOString(),
  };

  const lessons = readJSON("lessons.json");
  lessons.unshift(lesson);
  writeJSON("lessons.json", lessons);

  return NextResponse.json(lesson, { status: 201 });
}
