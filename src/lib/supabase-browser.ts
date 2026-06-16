import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return client;
}
