import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { requireSupabasePublicEnv } from "@/lib/env";

/**
 * Server-side Supabase clients.
 *
 * This module is server-only (see the `server-only` import above): it must
 * never be pulled into a client component. In particular `createAdminClient`
 * uses the privileged key, which bypasses Row-Level Security and must stay
 * on the server.
 */

/**
 * The privileged key. Supabase's newer naming calls this the "secret" key
 * (`sb_secret_…`); the legacy name is the service-role JWT. Either spelling is
 * accepted — both bypass RLS.
 */
function requireSecretKey(): string {
  const value =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!value) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY). See .env.example, set it in .env.local, and mirror it in the Vercel dashboard.",
    );
  }
  return value;
}

/**
 * Cookie-aware SSR client bound to the request. Uses the anon/publishable key,
 * so every query is subject to Row-Level Security — this is the client route
 * handlers and server components should use for user-scoped reads/writes. RLS
 * is the real authorization boundary.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` was called from a Server Component. This can be ignored
          // when middleware is refreshing the session; the cookies still get
          // written on the response that middleware controls.
        }
      },
    },
  });
}

/**
 * Privileged client. Bypasses RLS — server-only, for operations that must see
 * or write past the policies (seeding, admin tasks, background jobs). Never
 * expose this to the browser.
 */
export function createAdminClient() {
  const { url } = requireSupabasePublicEnv();

  return createSupabaseClient<Database>(url, requireSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
