import { NextResponse, type NextRequest } from "next/server";
import { searchComponents, getFacets } from "@/lib/supabase/queries";

/**
 * GET /api/search — ranked component search (Phase 2).
 *
 * Query parameters (all optional, repeatable ones may also be comma-separated):
 *   q          free text; full-text with a trigram fallback for typos
 *   category   category slug          (repeatable)
 *   tag        tag slug               (repeatable)
 *   language   snippet language       (repeatable)
 *   style      visual style key       (repeatable)
 *   status     component status       (repeatable, admins only in practice)
 *   limit      1..200, default 60
 *   offset     default 0
 *   facets     "1" to include the filter facets in the response
 *
 * Authorization lives in the database: the RPC runs SECURITY INVOKER under the
 * caller's RLS context, so an anonymous request can only ever match published
 * components no matter what `status` it asks for.
 */
export const dynamic = "force-dynamic";

function list(params: URLSearchParams, key: string): string[] | undefined {
  const values = params
    .getAll(key)
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  return values.length ? values : undefined;
}

function int(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw === null) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const result = await searchComponents({
    q: params.get("q") ?? undefined,
    categories: list(params, "category"),
    tags: list(params, "tag"),
    languages: list(params, "language"),
    styles: list(params, "style"),
    statuses: list(params, "status"),
    limit: int(params, "limit"),
    offset: int(params, "offset"),
  });

  if (!result) {
    return NextResponse.json(
      {
        error: "search_unavailable",
        message:
          "Supabase is not reachable or not configured. Check the environment variables and that migrations have been applied.",
      },
      { status: 503 },
    );
  }

  const body: Record<string, unknown> = {
    query: params.get("q") ?? "",
    total: result.total,
    count: result.hits.length,
    offset: Math.max(int(params, "offset") ?? 0, 0),
    took_ms: result.tookMs,
    results: result.hits,
  };

  if (params.get("facets") === "1") {
    body.facets = await getFacets();
  }

  return NextResponse.json(body, {
    // Search results are public and change only when the catalog is reseeded,
    // so let the CDN serve bursts while revalidating in the background.
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
  });
}
