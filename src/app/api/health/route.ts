export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseStatus, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const status = getSupabaseStatus();
  let supabasePing: string | null = null;

  if (supabaseAdmin) {
    try {
      const start = Date.now();
      const timeoutId = setTimeout(() => {}, 3000); // keepalive
      const { error } = await supabaseAdmin
        .from("users")
        .select("id")
        .limit(1)
        .abortSignal(AbortSignal.timeout ? AbortSignal.timeout(3000) : new AbortController().signal);
      clearTimeout(timeoutId);
      supabasePing = error
        ? `error: ${error.message}`
        : `ok (${Date.now() - start}ms)`;
    } catch (e: any) {
      supabasePing = `unreachable: ${e.message}`;
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    db: {
      ...status,
      supabasePing,
    },
    env: process.env.NODE_ENV,
  });
}
