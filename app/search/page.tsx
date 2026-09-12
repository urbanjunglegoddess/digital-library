import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/search.css";
import { getFacets, searchComponents } from "@/lib/supabase/queries";
import { STYLE_NAMES } from "@/lib/styles";
import {
  SearchControls,
  type SearchFacets,
} from "@/components/search/SearchControls";
import { WebResults } from "@/components/search/WebResults";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Full-text search across every documented component, filtered by category, tag, language target and visual style.",
};

export const dynamic = "force-dynamic";

/** searchParams gives `string | string[]` per key; normalize to a list. */
function toList(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  const values = (Array.isArray(value) ? value : [value])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  return values.length ? values : undefined;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const PAGE_SIZE = 60;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = first(sp.q) ?? "";
  const offset = Math.max(Number.parseInt(first(sp.offset) ?? "0", 10) || 0, 0);

  const filters = {
    q,
    categories: toList(sp.category),
    tags: toList(sp.tag),
    languages: toList(sp.language),
    styles: toList(sp.style),
    limit: PAGE_SIZE,
    offset,
  };

  const [result, facetData] = await Promise.all([
    searchComponents(filters),
    getFacets(),
  ]);

  // Supabase unreachable or unseeded: say so plainly rather than rendering an
  // empty result set that looks like "nothing matched".
  if (!result || !facetData) {
    return (
      <main className="page">
        <div className="page__intro">
          <p className="eyebrow">Search</p>
          <h1 className="page__title">Search is offline</h1>
          <p className="page__lede">
            The catalog index could not be reached. Check that the Supabase
            environment variables are set, that the migrations in{" "}
            <code>supabase/migrations</code> have been applied, and that{" "}
            <Link href="/api/health">/api/health</Link> reports a connection.
          </p>
          <p className="page__lede">
            You can still browse the file-backed catalog in the{" "}
            <Link href="/knowledge">Knowledge Hub</Link>.
          </p>
        </div>
      </main>
    );
  }

  const facets: SearchFacets = {
    categories: facetData.categories.map((c) => ({
      value: c.slug,
      label: c.name,
      count: c.count,
    })),
    tags: facetData.tags.map((t) => ({
      value: t.slug,
      label: t.name,
      count: t.count,
    })),
    languages: facetData.languages.map((l) => ({
      value: l.language,
      label: l.language,
      count: l.count,
    })),
    // Core skins first (the locked 11), extended ones after — the facet list
    // is already ordered by `sort`, so this only relabels.
    styles: facetData.styles.map((s) => ({
      value: s.key,
      label: STYLE_NAMES[s.key] ?? s.name,
    })),
  };

  const shownTo = offset + result.hits.length;
  const hasPrev = offset > 0;
  const hasNext = shownTo < result.total;

  function pageHref(nextOffset: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    for (const [key, source] of [
      ["category", filters.categories],
      ["tag", filters.tags],
      ["language", filters.languages],
      ["style", filters.styles],
    ] as const) {
      for (const v of source ?? []) params.append(key, v);
    }
    if (nextOffset > 0) params.set("offset", String(nextOffset));
    return `/search?${params}`;
  }

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Search</p>
        <h1 className="page__title">Search the library</h1>
        <p className="page__lede">
          Full-text search across every component doc, ranked by relevance and
          forgiving of typos, with filters for category, language target, visual
          style and tag.
        </p>
      </div>

      {/* A plain GET form: without JavaScript this still searches and filters. */}
      <form method="get" action="/search" className="srch__form">
        <SearchControls
          facets={facets}
          total={result.total}
          tookMs={result.tookMs}
        />
      </form>

      {result.hits.length === 0 ? (
        <p className="catalog-empty">
          Nothing matched{q ? ` “${q}”` : " those filters"}.{" "}
          <Link href="/search">Clear the filters</Link> and try again.
        </p>
      ) : (
        <ol className="srch__results">
          {result.hits.map((hit) => (
            <li key={hit.id}>
              <Link href={`/knowledge/${hit.slug}`} className="srch__hit">
                <div className="srch__hit-head">
                  <span className="srch__hit-name">{hit.name}</span>
                  <span className={`status status--${hit.status}`}>{hit.status}</span>
                </div>
                {hit.summary && <p className="srch__hit-summary">{hit.summary}</p>}
                <div className="srch__hit-meta">
                  {hit.category_name && (
                    <span className="srch__hit-cat">{hit.category_name}</span>
                  )}
                  {hit.tags.slice(0, 4).map((t) => (
                    <span key={t} className="card__tag">
                      {t}
                    </span>
                  ))}
                  {hit.languages.length > 0 && (
                    <span className="srch__hit-langs">
                      {hit.languages.length} language
                      {hit.languages.length === 1 ? "" : "s"}
                    </span>
                  )}
                  <span className="card__styles">{hit.style_count} skins</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {/* The catalog answers first; the wider web is one click further. */}
      <WebResults query={q} />

      {(hasPrev || hasNext) && (
        <nav className="srch__pager" aria-label="Search result pages">
          {hasPrev ? (
            <Link href={pageHref(Math.max(offset - PAGE_SIZE, 0))} rel="prev">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="srch__pager-count">
            {offset + 1}–{shownTo} of {result.total}
          </span>
          {hasNext ? (
            <Link href={pageHref(offset + PAGE_SIZE)} rel="next">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
