import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
  fs.writeFileSync(path.join(DATA_DIR, FILE), JSON.stringify(data, null, 2));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data = readLeads();
  const idx = data.findIndex((l: any) => l.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body, updatedAt: new Date().toISOString() };
  writeLeads(data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = readLeads();
  const idx = data.findIndex((l: any) => l.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data.splice(idx, 1);
  writeLeads(data);
  return NextResponse.json({ success: true });
}
