export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { genId } from "@/lib/csv-parser";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = "contents.json";

function readContents(): any[] {
  try {
    const p = path.join(DATA_DIR, FILE);
    if (!fs.existsSync(p)) return getDefaults();
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    return data.length ? data : getDefaults();
  } catch { return getDefaults(); }
}

function writeContents(data: any[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, FILE), JSON.stringify(data, null, 2));
}

function getDefaults() {
  return [
    { id: "tournament-guide", slug: "tournament-guide", title: "전국 피클볼 대회 일정 총정리", body: "매주 업데이트되는 전국 피클볼 대회 정보입니다.\n\n접수중인 대회를 확인하고 바로 신청하세요.", isPublished: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "venue-guide", slug: "venue-guide", title: "내 근처 피클볼장 찾기", body: "전국 피클볼장 정보를 한눈에 확인하세요.\n\n실내/실외, 코트 수, 운영시간, 주차 여부를 비교할 수 있습니다.", isPublished: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "organizer-guide", slug: "organizer-guide", title: "동호회 운영자가 이 플랫폼을 써야 하는 이유", body: "카카오톡으로 대회 접수를 받고 계신가요?\n\nPBL.SYS를 사용하면 대회 접수, 참가자 관리, 정원 관리를 자동화할 수 있습니다.\n\n## 주요 기능\n- 대회 접수 자동화\n- 참가자 명단 자동 생성\n- 정원 관리 및 대기자 처리\n- CSV 참가자 다운로드\n\n모든 기능이 무료입니다.", isPublished: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
}

export async function GET() {
  return NextResponse.json(readContents());
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const now = new Date().toISOString();
  const content = {
    id: genId(),
    slug: b.slug || b.title?.toLowerCase().replace(/\s+/g, "-").slice(0, 50) || genId(),
    title: b.title || "",
    body: b.body || "",
    isPublished: b.isPublished !== false,
    createdAt: now,
    updatedAt: now,
  };
  const data = readContents();
  data.push(content);
  writeContents(data);
  return NextResponse.json(content, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const data = readContents();
  const idx = data.findIndex((c: any) => c.id === b.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...b, updatedAt: new Date().toISOString() };
  writeContents(data);
  return NextResponse.json(data[idx]);
}
