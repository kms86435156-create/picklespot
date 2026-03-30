export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { genId } from "@/lib/csv-parser";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = "leads.json";

function readLeads(): any[] {
  try {
    const p = path.join(DATA_DIR, FILE);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch { return []; }
}

function writeLeads(data: any[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, FILE), JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const lead = {
    id: genId(),
    contactName: b.contactName || "",
    clubName: b.clubName || "",
    region: b.region || "",
    phone: b.phone || "",
    currentProblem: b.currentProblem || "",
    memberCount: b.memberCount || "",
    runsTournaments: b.runsTournaments || "",
    memo: b.memo || "",
    // 관리용 필드
    status: "new",
    adminMemo: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const data = readLeads();
  data.push(lead);
  writeLeads(data);
  return NextResponse.json({ success: true, id: lead.id });
}

export async function GET() {
  const leads = readLeads().sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
  return NextResponse.json(leads);
}
