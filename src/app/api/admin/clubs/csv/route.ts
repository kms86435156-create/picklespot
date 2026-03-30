import { NextRequest, NextResponse } from "next/server";
import { bulkCreateEntities, readJSON } from "@/lib/db";
import { parseCSV, genId, genSlug } from "@/lib/csv-parser";
import { validateCSVRows } from "@/lib/csv-validator";

const rules = [
  { csvKeys: ["동호회명", "name"], jsonKey: "name", required: true },
  { csvKeys: ["지역", "region"], jsonKey: "region" },
  { csvKeys: ["활동장소", "home_venue"], jsonKey: "homeVenue" },
  { csvKeys: ["담당자", "contact_name"], jsonKey: "contactName" },
  { csvKeys: ["연락처", "contact_phone_or_kakao"], jsonKey: "contactPhoneOrKakao" },
  { csvKeys: ["회원수", "member_count"], jsonKey: "memberCount", type: "number" as const },
  { csvKeys: ["가입방법", "join_method"], jsonKey: "joinMethod" },
  { csvKeys: ["외부링크", "external_link"], jsonKey: "externalLink" },
  { csvKeys: ["소개", "description"], jsonKey: "description" },
  { csvKeys: ["추천", "is_featured"], jsonKey: "isFeatured", type: "boolean" as const },
];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return NextResponse.json({ error: "Empty CSV" }, { status: 400 });

  const existing = readJSON("clubs.json");
  const validation = validateCSVRows(rows, rules, existing, "name");

  const now = new Date().toISOString();
  const items = validation.valid.map(v => ({
    id: genId(),
    slug: genSlug(v.name || "club"),
    ...v,
    isFeatured: v.isFeatured || false,
    createdAt: now,
    updatedAt: now,
  }));

  const count = bulkCreateEntities("clubs.json", items);
  return NextResponse.json({ success: true, count, total: rows.length, errors: validation.errors, warnings: validation.warnings, duplicates: validation.duplicates });
}
