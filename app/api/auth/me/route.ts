import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/me — who the caller is, for the app shell.
 *
 * The shell needs the signed-in name to render the rail's account block. Doing
 * that in the root layout would call `cookies()` on every route, which opts the
 * entire app out of static rendering — the catalog would be server-rendered per
 * request, with a Supabase round trip attached, and could not be CDN-cached.
 *
 * So the shell asks for it here instead: the 100-odd component pages stay
 * prerendered and cacheable, and the one per-viewer fragment fills in on
 * hydration. `no-store` because this response is specific to one session.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getViewer();

  if (!viewer) {
    return NextResponse.json(
      { signed_in: false, display_name: null, is_admin: false, preferences: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  // Preferences ride along rather than needing their own round trip: the shell
  // mirrors them into localStorage, which is where the Playground, the composer
  // and the style switcher read them from synchronously.
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", viewer.id)
    .maybeSingle();

  return NextResponse.json(
    {
      signed_in: true,
      display_name: viewer.displayName,
      is_admin: viewer.isAdmin,
      preferences: data?.preferences ?? {},
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
