import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { source } = await req.json();

  if (!source) {
    return NextResponse.json({ error: "source is required" }, { status: 400 });
  }

  // Collector execution — requires API keys to be set
  // For now, return info about required env vars
  const requiredKeys: Record<string, string[]> = {
    "naver-local": ["NAVER_CLIENT_ID", "NAVER_CLIENT_SECRET"],
    "kakao-local": ["KAKAO_REST_KEY"],
    "public-data": ["PUBLIC_DATA_KEY"],
  };

  const keys = requiredKeys[source];
  if (!keys) {
    return NextResponse.json({ error: `Unknown source: ${source}` }, { status: 400 });
  }

  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    return NextResponse.json({
      error: `Missing env vars: ${missing.join(", ")}`,
      message: "Set these environment variables to enable data collection",
    }, { status: 400 });
  }

  return NextResponse.json({ message: `Collector ${source} ready but not yet connected to JSON db layer` });
}
