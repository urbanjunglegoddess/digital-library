import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";

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

  return NextResponse.json(
    viewer
      ? {
          signed_in: true,
          display_name: viewer.displayName,
          is_admin: viewer.isAdmin,
        }
      : { signed_in: false, display_name: null, is_admin: false },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
