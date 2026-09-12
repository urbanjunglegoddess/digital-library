/**
 * Canonical Supabase environment access.
 *
 * Supabase renamed its API keys: the legacy `anon` / `service_role` JWTs became
 * publishable (`sb_publishable_…`) and secret (`sb_secret_…`) keys. Real
 * projects end up with a mix of both spellings across `.env.local`, Vercel and
 * the Supabase dashboard, so every reader goes through here and accepts either.
 *
 * NOTE ON `NEXT_PUBLIC_*`: Next.js inlines these at build time only when they
 * are referenced as a *literal* member expression. `process.env[someVar]` is
 * NOT inlined and reads as undefined in the browser — hence the explicit
 * literal reads below rather than a loop over candidate names.
 */

/** The project URL. Public by definition. */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";

/**
 * The browser-safe key (publishable / anon). Every request made with it is
 * subject to Row-Level Security.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

/** True when the public pair is present, so callers can degrade gracefully. */
export const hasSupabasePublicEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Throwing accessor for the public pair — use where a missing key is a
 * programming/config error rather than something to render around.
 */
export function requireSupabasePublicEnv(): { url: string; anonKey: string } {
  if (!SUPABASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Copy .env.example to .env.local and fill it in (and set it in the Vercel dashboard).",
    );
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY). See .env.example.",
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
