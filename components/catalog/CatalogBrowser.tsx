"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface CatalogItem {
  name: string;
  slug: string;
  category: string;
  summary: string;
  status: string;
  tags: string[];
  styleCount: number;
}

/**
 * Client-side catalog browser: search box + tag filter over the full component
 * set, grouped by category. Filtering is instant and local (Phase 2 replaces
 * this with server-side Supabase full-text search).
 */
export function CatalogBrowser({
  items,
  categoryOrder,
  tags,
}: {
  items: CatalogItem[];
  categoryOrder: string[];
  tags: { tag: string; count: number }[];
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeTag && !it.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        it.summary.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.tags.some((t) => t.includes(q))
      );
    });
  }, [items, query, activeTag]);

  const grouped = useMemo(() => {
    const byCat = new Map<string, CatalogItem[]>();
    for (const it of filtered) {
      const list = byCat.get(it.category) ?? [];
      list.push(it);
      byCat.set(it.category, list);
    }
    return [...byCat.entries()].sort((a, b) => {
      const ai = categoryOrder.indexOf(a[0]);
      const bi = categoryOrder.indexOf(b[0]);
      if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [filtered, categoryOrder]);

  return (
    <div>
      <div className="catalog-controls">
        <input
          type="search"
          className="catalog-search"
          placeholder={`Search ${items.length} components…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search components"
        />
        <div className="catalog-tags" role="group" aria-label="Filter by tag">
          <button
            type="button"
            className={`tag-chip${activeTag === null ? " is-active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {tags.slice(0, 18).map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              className={`tag-chip${activeTag === tag ? " is-active" : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag} <span className="tag-chip__count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="catalog-count" aria-live="polite">
        {filtered.length} of {items.length} components
        {activeTag ? ` · tag: ${activeTag}` : ""}
      </p>

      {grouped.length === 0 && (
        <p className="catalog-empty">No components match that filter.</p>
      )}

      {grouped.map(([category, list]) => (
        <section key={category} className="catalog-group">
          <h2 className="catalog-group__title">{category}</h2>
          <div className="card-grid">
            {list.map((it) => (
              <Link key={it.slug} href={`/catalog/${it.slug}`} className="card">
                <div className="card__head">
                  <span className="card__name">{it.name}</span>
                  <span className={`status status--${it.status}`}>{it.status}</span>
                </div>
                <p className="card__summary">{it.summary}</p>
                <div className="card__meta">
                  {it.tags.slice(0, 3).map((t) => (
                    <span key={t} className="card__tag">
                      {t}
                    </span>
                  ))}
                  <span className="card__styles">{it.styleCount} skins</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
