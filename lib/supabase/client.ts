import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { requireSupabasePublicEnv } from "@/lib/env";

/**
 * Browser Supabase client. Anon/publishable key only — safe to ship to the
 * client. All access is governed by Row-Level Security. The secret
 * (service-role) key must NEVER be imported here or into any client component.
 */
export function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
