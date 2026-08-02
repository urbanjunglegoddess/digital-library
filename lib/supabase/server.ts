import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server-side Supabase clients.
 *
 * This module is server-only (see the `server-only` import above): it must
 * never be pulled into a client component. In particular `createAdminClient`
 * uses the service-role key, which bypasses Row-Level Security and must stay
 * on the server.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. See .env.example and set it in .env.local (and in the Vercel dashboard).`,
    );
  }
  return value;
}

/**
 * Cookie-aware SSR client bound to the request. Uses the anon key, so every
 * query is subject to Row-Level Security — this is the client route handlers
 * and server components should use for user-scoped reads/writes. RLS is the
 * real authorization boundary.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
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
    },
  );
}

/**
 * Service-role client. Bypasses RLS — server-only, privileged operations
 * (seeding, admin tasks, background jobs). Never expose this to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
