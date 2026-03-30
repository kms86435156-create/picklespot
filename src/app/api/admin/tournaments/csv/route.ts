import { NextRequest, NextResponse } from "next/server";
import { bulkCreateEntities, readJSON } from "@/lib/db";
import { parseCSV, genId } from "@/lib/csv-parser";
import { validateCSVRows } from "@/lib/csv-validator";

const rules = [
  { csvKeys: ["대회명", "title"], jsonKey: "title", required: true },
  { csvKeys: ["시작일", "start_date"], jsonKey: "startDate" },
  { csvKeys: ["종료일", "end_date"], jsonKey: "endDate" },
  { csvKeys: ["접수마감", "registration_deadline"], jsonKey: "registrationDeadline" },
  { csvKeys: ["장소", "venue_name"], jsonKey: "venueName" },
  { csvKeys: ["지역", "region"], jsonKey: "region" },
  { csvKeys: ["주최", "organizer_name"], jsonKey: "organizerName" },
  { csvKeys: ["주최연락처", "organizer_contact"], jsonKey: "organizerContact" },
  { csvKeys: ["참가비", "entry_fee"], jsonKey: "entryFee", type: "number" as const },
  { csvKeys: ["종별", "event_types"], jsonKey: "eventTypes" },
  { csvKeys: ["정원", "max_participants"], jsonKey: "maxParticipants", type: "number" as const },
  { csvKeys: ["상태", "status"], jsonKey: "status" },
  { csvKeys: ["설명", "description"], jsonKey: "description" },
  { csvKeys: ["출처URL", "source_url"], jsonKey: "sourceUrl" },
  { csvKeys: ["추천", "is_featured"], jsonKey: "isFeatured", type: "boolean" as const },
];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return NextResponse.json({ error: "Empty CSV" }, { status: 400 });

  const existing = readJSON("tournaments.json");
  const validation = validateCSVRows(rows, rules, existing, "title");

  const now = new Date().toISOString();
  const items = validation.valid.map(v => ({
    id: genId(),
    ...v,
    currentParticipants: 0,
    status: v.status || "draft",
    isFeatured: v.isFeatured || false,
    createdAt: now,
    updatedAt: now,
  }));

  const count = bulkCreateEntities("tournaments.json", items);

  return NextResponse.json({
    success: true,
    count,
    total: rows.length,
    errors: validation.errors,
    warnings: validation.warnings,
    duplicates: validation.duplicates,
  });
}
