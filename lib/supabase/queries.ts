import "server-only";
import { createClient } from "./server";
import { hasSupabasePublicEnv } from "@/lib/env";
import type { ComponentStatus } from "./types";

/**
 * Server-side reads for the catalog (Phase 2).
 *
 * Every function here goes through the cookie-bound anon client, so Row-Level
 * Security decides what comes back: anonymous visitors see the published
 * catalog (`built | audited | reusable`), an admin additionally sees drafts.
 * Nothing in this module re-implements that check in JavaScript — the database
 * is the authorization boundary.
 *
 * All of them return `null` rather than throwing when Supabase is unreachable
 * or unconfigured. Callers fall back to the MDX content layer (`lib/content.ts`),
 * which is what the catalog rendered from in Phase 1. That keeps the site up on
 * a preview deploy with no env vars instead of turning a config gap into a 500.
 */

export interface SearchFilters {
  q?: string;
  categories?: string[];
  tags?: string[];
  languages?: string[];
  styles?: string[];
  statuses?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchHit {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  status: ComponentStatus;
  category_slug: string | null;
  category_name: string | null;
  tags: string[];
  languages: string[];
  style_count: number;
  rank: number;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  /** Wall-clock time for the round trip, surfaced so the <1s gate is testable. */
  tookMs: number;
}

/** Empty arrays must reach Postgres as NULL, or they'd filter everything out. */
function orNull(values: string[] | undefined): string[] | null {
  if (!values) return null;
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  return cleaned.length ? cleaned : null;
}

export async function searchComponents(
  filters: SearchFilters,
): Promise<SearchResult | null> {
  if (!hasSupabasePublicEnv) return null;

  const started = Date.now();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("search_components", {
      q: filters.q?.trim() || null,
      category_slugs: orNull(filters.categories),
      tag_slugs: orNull(filters.tags),
      languages: orNull(filters.languages),
      style_keys: orNull(filters.styles),
      status_filter: orNull(filters.statuses),
      lim: Math.min(Math.max(filters.limit ?? 60, 1), 200),
      off: Math.max(filters.offset ?? 0, 0),
    });

    if (error) {
      console.error("[queries] search_components:", error.message);
      return null;
    }

    const rows = (data ?? []) as (SearchHit & { total: number })[];
    return {
      hits: rows.map(({ total: _total, ...hit }) => hit),
      // The window total is identical on every row; an empty page means zero.
      total: rows.length ? Number(rows[0].total) : 0,
      tookMs: Date.now() - started,
    };
  } catch (err) {
    console.error("[queries] search_components threw:", err);
    return null;
  }
}

export interface ComponentRecord {
  id: string;
  slug: string;
  name: string;
  status: ComponentStatus;
  summary: string | null;
  doc_md: string | null;
  clickup_page_id: string | null;
  meta: Record<string, unknown>;
  category: { slug: string; name: string } | null;
  tags: string[];
  styles: string[];
  snippets: {
    language: string;
    framework: string | null;
    code: string;
    is_primary: boolean;
  }[];
  references: { title: string; url: string; source: string }[];
}

/** One component with everything the detail page renders, in a single request. */
export async function getComponentRecord(
  slug: string,
): Promise<ComponentRecord | null> {
  if (!hasSupabasePublicEnv) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("components")
      .select(
        `id, slug, name, status, summary, doc_md, clickup_page_id, meta,
         categories ( slug, name ),
         component_tags ( tags ( slug ) ),
         component_styles ( visual_styles ( key, sort ) ),
         code_snippets ( language, framework, code, is_primary ),
         references ( title, url, source )`,
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[queries] getComponentRecord:", error.message);
      return null;
    }
    if (!data) return null;

    // PostgREST returns embedded rows as arrays (or a single object when the
    // relationship is to-one); normalize both shapes before use.
    const row = data as Record<string, any>;
    const one = <T,>(v: T | T[] | null): T | null =>
      Array.isArray(v) ? (v[0] ?? null) : v;

    const category = one<{ slug: string; name: string }>(row.categories);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status,
      summary: row.summary,
      doc_md: row.doc_md,
      clickup_page_id: row.clickup_page_id,
      meta: (row.meta ?? {}) as Record<string, unknown>,
      category: category ? { slug: category.slug, name: category.name } : null,
      tags: (row.component_tags ?? [])
        .map((ct: any) => one<{ slug: string }>(ct.tags)?.slug)
        .filter(Boolean)
        .sort(),
      styles: (row.component_styles ?? [])
        .map((cs: any) => one<{ key: string; sort: number }>(cs.visual_styles))
        .filter(Boolean)
        .sort((a: any, b: any) => a.sort - b.sort)
        .map((vs: any) => vs.key),
      snippets: row.code_snippets ?? [],
      references: row.references ?? [],
    };
  } catch (err) {
    console.error("[queries] getComponentRecord threw:", err);
    return null;
  }
}

export interface Facets {
  categories: { slug: string; name: string; count: number }[];
  tags: { slug: string; name: string; count: number }[];
  languages: { language: string; count: number }[];
  styles: { key: string; name: string; is_core: boolean }[];
}

/** Filter facets for the search UI, counted over what the caller can see. */
export async function getFacets(): Promise<Facets | null> {
  if (!hasSupabasePublicEnv) return null;

  try {
    const supabase = await createClient();

    const [cats, tagCounts, styles, snippetLangs] = await Promise.all([
      supabase
        .from("categories")
        .select("slug, name, components(count)")
        .order("sort", { ascending: true }),
      supabase.rpc("component_tag_counts"),
      supabase
        .from("visual_styles")
        .select("key, name, is_core")
        .order("sort", { ascending: true }),
      supabase.from("code_snippets").select("language"),
    ]);

    if (cats.error || tagCounts.error || styles.error || snippetLangs.error) {
      console.error(
        "[queries] getFacets:",
        cats.error?.message ??
          tagCounts.error?.message ??
          styles.error?.message ??
          snippetLangs.error?.message,
      );
      return null;
    }

    const langCounts = new Map<string, number>();
    for (const row of snippetLangs.data ?? []) {
      const lang = String(row.language).toLowerCase();
      langCounts.set(lang, (langCounts.get(lang) ?? 0) + 1);
    }

    return {
      categories: (cats.data ?? []).map((c: any) => ({
        slug: c.slug,
        name: c.name,
        count: c.components?.[0]?.count ?? 0,
      })),
      tags: (tagCounts.data ?? []).map((t: any) => ({
        slug: t.slug,
        name: t.name,
        count: Number(t.count),
      })),
      languages: [...langCounts.entries()]
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language)),
      styles: (styles.data ?? []).map((s: any) => ({
        key: s.key,
        name: s.name,
        is_core: s.is_core,
      })),
    };
  } catch (err) {
    console.error("[queries] getFacets threw:", err);
    return null;
  }
}

/** Row counts for the Portal/Dashboard readiness panels. */
export async function getCatalogStats(): Promise<{
  components: number;
  categories: number;
  snippets: number;
  styles: number;
} | null> {
  if (!hasSupabasePublicEnv) return null;

  try {
    const supabase = await createClient();
    const head = { count: "exact" as const, head: true };
    const [components, categories, snippets, styles] = await Promise.all([
      supabase.from("components").select("*", head),
      supabase.from("categories").select("*", head),
      supabase.from("code_snippets").select("*", head),
      supabase.from("visual_styles").select("*", head),
    ]);

    if (components.error) {
      console.error("[queries] getCatalogStats:", components.error.message);
      return null;
    }

    return {
      components: components.count ?? 0,
      categories: categories.count ?? 0,
      snippets: snippets.count ?? 0,
      styles: styles.count ?? 0,
    };
  } catch (err) {
    console.error("[queries] getCatalogStats threw:", err);
    return null;
  }
}
