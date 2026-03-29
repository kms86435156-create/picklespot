import { NextResponse } from "next/server";
import { getSyncJobs } from "@/lib/db";

export async function GET() {
  const jobs = getSyncJobs();
  return NextResponse.json({ jobs });
}
