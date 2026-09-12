import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Proof-of-life health route (Phase 0 gate).
 *
 * Queries Supabase for the count of seeded `visual_styles` rows using the
 * server SSR client (anon key). A successful count proves three things at once:
 * the server client is wired, the env keys are present, and the RLS public-read
 * path works. Kept dynamic so it runs per-request, never at build time.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const head = { count: "exact" as const, head: true };

    const [styles, coreStyles, components, snippets] = await Promise.all([
      supabase.from("visual_styles").select("*", head),
      supabase.from("visual_styles").select("*", head).eq("is_core", true),
      supabase.from("components").select("*", head),
      supabase.from("code_snippets").select("*", head),
    ]);

    const error =
      styles.error ?? coreStyles.error ?? components.error ?? snippets.error;
    if (error) {
      return NextResponse.json(
        { status: "error", stage: "query", message: error.message },
        { status: 500 },
      );
    }

    // The catalog is seeded from content/docs, so a zero component count means
    // the migrations ran but `scripts/seed.mjs` has not — a distinct failure
    // from "cannot reach Supabase", and worth reporting as its own state.
    const seeded = (components.count ?? 0) > 0;

    return NextResponse.json({
      status: seeded ? "ok" : "degraded",
      supabase: "connected",
      seeded,
      components: components.count ?? 0,
      code_snippets: snippets.count ?? 0,
      visual_styles: styles.count ?? 0,
      // The locked base 11 plus the extended skins the token layer added.
      visual_styles_core: coreStyles.count ?? 0,
      expected_core: 11,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        stage: "client",
        message: err instanceof Error ? err.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
