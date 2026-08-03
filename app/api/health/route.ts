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

    const { count, error } = await supabase
      .from("visual_styles")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { status: "error", stage: "query", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "ok",
      supabase: "connected",
      visual_styles: count ?? 0,
      expected: 11,
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
