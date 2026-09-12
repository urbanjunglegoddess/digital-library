"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export interface FacetOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchFacets {
  categories: FacetOption[];
  tags: FacetOption[];
  languages: FacetOption[];
  styles: FacetOption[];
}

/**
 * Search controls for /search.
 *
 * The surrounding markup is a real `<form method="get">`, so the whole thing
 * works with JavaScript off — every control submits and the server renders the
 * results. This component layers on the niceties: the text box pushes a
 * debounced URL update as you type, and toggling a facet navigates
 * immediately instead of waiting for a submit.
 *
 * The URL is the single source of truth for filter state — that keeps results
 * shareable, back/forward honest, and the server render authoritative.
 */
export function SearchControls({
  facets,
  total,
  tookMs,
}: {
  facets: SearchFacets;
  total: number;
  tookMs: number | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = params.get("q") ?? "";
  const [term, setTerm] = useState(urlQuery);
  // Track the value we last pushed so a back/forward navigation re-syncs the
  // box, without clobbering what the user is mid-way through typing.
  const pushed = useRef(urlQuery);

  useEffect(() => {
    if (urlQuery !== pushed.current) {
      pushed.current = urlQuery;
      setTerm(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    if (term === pushed.current) return;
    const id = setTimeout(() => {
      pushed.current = term;
      const next = new URLSearchParams(params.toString());
      if (term.trim()) next.set("q", term.trim());
      else next.delete("q");
      next.delete("offset");
      startTransition(() => router.replace(`/search?${next}`, { scroll: false }));
    }, 250);
    return () => clearTimeout(id);
  }, [term, params, router]);

  function toggle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    next.delete(key);
    for (const v of current) if (v !== value) next.append(key, v);
    if (!current.includes(value)) next.append(key, value);
    next.delete("offset");
    startTransition(() => router.push(`/search?${next}`, { scroll: false }));
  }

  const active = (key: string, value: string) => params.getAll(key).includes(value);

  const activeCount =
    ["category", "tag", "language", "style"].reduce(
      (n, key) => n + params.getAll(key).length,
      0,
    ) + (urlQuery ? 1 : 0);

  return (
    <div className={`srch${isPending ? " is-pending" : ""}`}>
      <div className="srch__bar">
        <label className="srch__field">
          <span className="srch__label">Search the library</span>
          <input
            type="search"
            name="q"
            className="srch__input"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Try “date picker”, “focus trap”, or a typo like “accordian”…"
            autoComplete="off"
          />
        </label>
        <noscript>
          <button type="submit" className="srch__submit">
            Search
          </button>
        </noscript>
      </div>

      <p className="srch__status" aria-live="polite">
        {total} {total === 1 ? "component" : "components"}
        {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"}` : ""}
        {tookMs !== null ? ` · ${tookMs}ms` : ""}
        {activeCount > 0 && (
          <>
            {" · "}
            <Link href="/search" className="srch__clear">
              Clear all
            </Link>
          </>
        )}
      </p>

      <FacetGroup
        legend="Category"
        name="category"
        options={facets.categories}
        active={active}
        onToggle={toggle}
      />
      <FacetGroup
        legend="Language / framework"
        name="language"
        options={facets.languages}
        active={active}
        onToggle={toggle}
      />
      <FacetGroup
        legend="Visual style"
        name="style"
        options={facets.styles}
        active={active}
        onToggle={toggle}
        collapsedAt={11}
      />
      <FacetGroup
        legend="Tag"
        name="tag"
        options={facets.tags}
        active={active}
        onToggle={toggle}
        collapsedAt={16}
      />
    </div>
  );
}

function FacetGroup({
  legend,
  name,
  options,
  active,
  onToggle,
  collapsedAt,
}: {
  legend: string;
  name: string;
  options: FacetOption[];
  active: (key: string, value: string) => boolean;
  onToggle: (key: string, value: string) => void;
  collapsedAt?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (options.length === 0) return null;

  const hidden = collapsedAt !== undefined && !expanded ? options.length - collapsedAt : 0;
  const shown = hidden > 0 ? options.slice(0, collapsedAt) : options;

  return (
    <fieldset className="srch__facet">
      <legend className="srch__legend">{legend}</legend>
      <div className="srch__chips">
        {shown.map((opt) => {
          const on = active(name, opt.value);
          return (
            <label key={opt.value} className={`srch__chip${on ? " is-active" : ""}`}>
              {/* A real checkbox keeps the no-JS form submission working and
                  gives the control its accessible name and checked state. */}
              <input
                type="checkbox"
                name={name}
                value={opt.value}
                checked={on}
                onChange={() => onToggle(name, opt.value)}
              />
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span className="srch__chip-count">{opt.count}</span>
              )}
            </label>
          );
        })}
        {hidden > 0 && (
          <button
            type="button"
            className="srch__more"
            onClick={() => setExpanded(true)}
          >
            +{hidden} more
          </button>
        )}
      </div>
    </fieldset>
  );
}
