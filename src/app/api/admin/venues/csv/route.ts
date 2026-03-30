import { NextRequest, NextResponse } from "next/server";
import { bulkCreateEntities, readJSON } from "@/lib/db";
import { parseCSV, genId, genSlug } from "@/lib/csv-parser";
import { validateCSVRows } from "@/lib/csv-validator";

const rules = [
  { csvKeys: ["이름", "name"], jsonKey: "name", required: true },
  { csvKeys: ["주소", "address"], jsonKey: "address" },
  { csvKeys: ["도로명주소", "road_address"], jsonKey: "roadAddress" },
  { csvKeys: ["지역", "region"], jsonKey: "region" },
  { csvKeys: ["전화", "phone"], jsonKey: "phone" },
  { csvKeys: ["운영시간", "operating_hours"], jsonKey: "operatingHours" },
  { csvKeys: ["코트수", "court_count"], jsonKey: "courtCount", type: "number" as const },
  { csvKeys: ["실내외", "indoor_outdoor"], jsonKey: "indoorOutdoor" },
  { csvKeys: ["주차", "parking_available"], jsonKey: "parkingAvailable", type: "boolean" as const },
  { csvKeys: ["설명", "description"], jsonKey: "description" },
  { csvKeys: ["지도링크", "map_link"], jsonKey: "mapLink" },
  { csvKeys: ["추천", "is_featured"], jsonKey: "isFeatured", type: "boolean" as const },
];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return NextResponse.json({ error: "Empty CSV" }, { status: 400 });

  const existing = readJSON("venues.json");
  const validation = validateCSVRows(rows, rules, existing, "name");

  const now = new Date().toISOString();
  const items = validation.valid.map(v => ({
    id: genId(),
    slug: genSlug(v.name || "venue"),
    ...v,
    isFeatured: v.isFeatured || false,
    createdAt: now,
    updatedAt: now,
  }));

  const count = bulkCreateEntities("venues.json", items);
  return NextResponse.json({ success: true, count, total: rows.length, errors: validation.errors, warnings: validation.warnings, duplicates: validation.duplicates });
}
