import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/websearch?q=… — web results for a component question (Phase 4).
 *
 * A server-side proxy rather than a browser fetch, for three reasons: the
 * provider key never reaches the client, the allowed providers are fixed here
 * rather than by whatever the page asks for, and responses can be cached at the
 * edge for everyone instead of per visitor.
 *
 * Configure with:
 *   WEBSEARCH_PROVIDER=brave|tavily
 *   WEBSEARCH_API_KEY=…
 *
 * With no key configured the endpoint still answers usefully: it returns
 * scoped search links for the four sources the library actually cites (MDN,
 * the WAI-ARIA APG, Stack Overflow, GitHub) and reports `configured: false`.
 * That keeps the feature honest on a fresh clone instead of erroring.
 */
export const dynamic = "force-dynamic";

const MAX_RESULTS = 10;

interface WebResult {
  title: string;
  url: string;
  description: string;
  source: string;
}

/** Deep links that work with no API key at all. */
function fallbackLinks(query: string): WebResult[] {
  const q = encodeURIComponent(query);
  return [
    {
      title: `MDN Web Docs — “${query}”`,
      url: `https://developer.mozilla.org/en-US/search?q=${q}`,
      description: "Reference documentation for the underlying web platform features.",
      source: "mdn",
    },
    {
      title: `WAI-ARIA Authoring Practices — “${query}”`,
      url: `https://www.google.com/search?q=${q}+site:w3.org/WAI/ARIA/apg`,
      description: "The accessibility pattern this component should implement.",
      source: "apg",
    },
    {
      title: `Stack Overflow — “${query}”`,
      url: `https://stackoverflow.com/search?q=${q}`,
      description: "Implementation problems other people have already hit.",
      source: "so",
    },
    {
      title: `GitHub code — “${query}”`,
      url: `https://github.com/search?type=code&q=${q}`,
      description: "Real implementations to compare against.",
      source: "github",
    },
  ];
}

/** Classify a result URL against the `reference_source` enum in the schema. */
function sourceFor(url: string): string {
  if (/developer\.mozilla\.org/i.test(url)) return "mdn";
  if (/w3\.org\/WAI\/ARIA\/apg/i.test(url)) return "apg";
  if (/stackoverflow\.com/i.test(url)) return "so";
  if (/github\.com/i.test(url)) return "github";
  return "other";
}

async function searchBrave(query: string, key: string): Promise<WebResult[]> {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(MAX_RESULTS));

  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": key },
    // Don't let a slow provider hold a request open indefinitely.
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Brave search returned ${res.status}`);

  const json = (await res.json()) as {
    web?: { results?: { title: string; url: string; description?: string }[] };
  };

  return (json.web?.results ?? []).slice(0, MAX_RESULTS).map((r) => ({
    title: r.title,
    url: r.url,
    description: r.description ?? "",
    source: sourceFor(r.url),
  }));
}

async function searchTavily(query: string, key: string): Promise<WebResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      max_results: MAX_RESULTS,
      search_depth: "basic",
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Tavily search returned ${res.status}`);

  const json = (await res.json()) as {
    results?: { title: string; url: string; content?: string }[];
  };

  return (json.results ?? []).slice(0, MAX_RESULTS).map((r) => ({
    title: r.title,
    url: r.url,
    description: r.content ?? "",
    source: sourceFor(r.url),
  }));
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (!query) {
    return NextResponse.json(
      { error: "bad_request", message: "`q` is required." },
      { status: 400 },
    );
  }
  if (query.length > 200) {
    return NextResponse.json(
      { error: "bad_request", message: "Query is too long." },
      { status: 400 },
    );
  }

  const provider = (process.env.WEBSEARCH_PROVIDER ?? "").toLowerCase();
  const key = process.env.WEBSEARCH_API_KEY ?? "";

  if (!provider || !key) {
    return NextResponse.json(
      {
        query,
        configured: false,
        provider: null,
        message:
          "No web-search provider is configured. Set WEBSEARCH_PROVIDER (brave or tavily) and WEBSEARCH_API_KEY to get live results; these are scoped search links in the meantime.",
        results: fallbackLinks(query),
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } },
    );
  }

  try {
    const results =
      provider === "brave"
        ? await searchBrave(query, key)
        : provider === "tavily"
          ? await searchTavily(query, key)
          : null;

    if (results === null) {
      return NextResponse.json(
        {
          error: "unknown_provider",
          message: `WEBSEARCH_PROVIDER “${provider}” is not supported. Use brave or tavily.`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { query, configured: true, provider, results },
      // Web results are the same for everyone and change slowly; cache them so
      // a burst of identical lookups costs one upstream call.
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    // A provider outage should degrade to the links, not to a dead feature.
    return NextResponse.json(
      {
        query,
        configured: true,
        provider,
        error: "provider_failed",
        message: err instanceof Error ? err.message : "The search provider did not respond.",
        results: fallbackLinks(query),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
