import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEnabledProvider } from "@/lib/oauth";
import type { Provider } from "@supabase/supabase-js";

/**
 * GET /auth/oauth?provider=github&next=/account
 *
 * Starts an OAuth sign-in. Doing this server-side keeps the PKCE verifier in an
 * httpOnly cookie rather than in browser storage, and means the sign-in buttons
 * are plain links that work without JavaScript.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const provider = searchParams.get("provider");
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  // Only providers the deployment has actually configured; anything else would
  // send the user to a Supabase error page.
  if (!isEnabledProvider(provider)) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("That sign-in provider is not enabled.")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "Could not start sign-in.")}`,
    );
  }

  return NextResponse.redirect(data.url);
}
