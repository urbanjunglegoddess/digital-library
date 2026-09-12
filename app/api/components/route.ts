import { NextResponse, type NextRequest } from "next/server";
import { searchComponents, getFacets } from "@/lib/supabase/queries";

/**
 * GET /api/components — the catalog index (Phase 2).
 *
 * Same filter vocabulary as /api/search but with no free-text term: this is the
 * "list and filter" endpoint the browse UI pages through, where /api/search is
 * the "rank by relevance" one. Both resolve to the same RPC, so a caller never
 * sees two different notions of which components exist.
 *
 *   ?category=…&tag=…&language=…&style=…&limit=…&offset=…&facets=1
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

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Number.parseInt(params.get("limit") ?? "200", 10);
  const offset = Number.parseInt(params.get("offset") ?? "0", 10);

  const result = await searchComponents({
    categories: list(params, "category"),
    tags: list(params, "tag"),
    languages: list(params, "language"),
    styles: list(params, "style"),
    statuses: list(params, "status"),
    limit: Number.isFinite(limit) ? limit : 200,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  if (!result) {
    return NextResponse.json(
      {
        error: "catalog_unavailable",
        message:
          "Supabase is not reachable or not configured. Check the environment variables and that migrations have been applied.",
      },
      { status: 503 },
    );
  }

  const body: Record<string, unknown> = {
    total: result.total,
    count: result.hits.length,
    offset: Number.isFinite(offset) ? offset : 0,
    took_ms: result.tookMs,
    // Ranking is meaningless without a search term; order by name instead.
    components: [...result.hits].sort((a, b) => a.name.localeCompare(b.name)),
  };

  if (params.get("facets") === "1") {
    body.facets = await getFacets();
  }

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
  });
}
