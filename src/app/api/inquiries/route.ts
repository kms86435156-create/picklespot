export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { genId } from "@/lib/csv-parser";

const DATA_DIR = path.join(process.cwd(), "data");

function readJSON(file: string): any[] {
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch { return []; }
}

function writeJSON(file: string, data: any) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const inquiry = {
    id: genId(),
    type: body.type || "general",
    clubName: body.clubName || "",
    contactName: body.contactName || "",
    phone: body.phone || "",
    region: body.region || "",
    memberCount: body.memberCount || "",
    message: body.message || "",
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const data = readJSON("inquiries.json");
  data.push(inquiry);
  writeJSON("inquiries.json", data);
  return NextResponse.json({ success: true, id: inquiry.id });
}

export async function GET() {
  return NextResponse.json(readJSON("inquiries.json"));
}
