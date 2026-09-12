import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabasePublicEnv } from "@/lib/env";

/**
 * Refresh the Supabase auth session on every matched request.
 *
 * Access tokens are short-lived. Server Components cannot write cookies, so
 * without this the refreshed token would be minted and then thrown away, and
 * users would be logged out mid-session. Middleware is the one place that can
 * both read the request cookies and write them onto the response, so the
 * refresh has to happen here.
 *
 * Two rules this file follows, because getting either wrong causes bugs that
 * only show up in production:
 *
 *  1. `supabase.auth.getUser()` must be called. It revalidates the token with
 *     the auth server; `getSession()` merely decodes whatever cookie was sent,
 *     which a client can forge.
 *  2. The response object created here must be the one returned, cookies and
 *     all. Building a fresh `NextResponse` later would drop the refreshed
 *     session.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  // No Supabase configured (a preview deploy without env vars, say): pass the
  // request through untouched rather than failing every route.
  if (!hasSupabasePublicEnv) return response;

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate the authenticated surfaces here as defence in depth. RLS is still the
  // real boundary — this only spares a signed-out visitor a flash of an empty
  // page before the redirect.
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Already signed in? The login and signup pages have nothing to offer.
  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.searchParams.get("next") || "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

/** Routes that require a signed-in user. */
const PROTECTED_PREFIXES = ["/account"];
