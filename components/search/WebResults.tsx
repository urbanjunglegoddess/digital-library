"use client";

import { useEffect, useState } from "react";

interface WebResult {
  title: string;
  url: string;
  description: string;
  source: string;
}

const SOURCE_LABEL: Record<string, string> = {
  mdn: "MDN",
  apg: "WAI-ARIA APG",
  so: "Stack Overflow",
  github: "GitHub",
  other: "Web",
};

/**
 * Web results for the current query, from /api/websearch (Phase 4).
 *
 * Collapsed by default and fetched only when opened: the library's own catalog
 * is the answer most of the time, and an unprompted upstream call on every
 * keystroke would be both slow and wasteful.
 *
 * When no provider is configured the endpoint returns scoped search links
 * instead of failing, and the note below says so plainly rather than presenting
 * them as though they were live results.
 */
export function WebResults({ query }: { query: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; results: WebResult[]; configured: boolean; message?: string }
    | { status: "error" }
  >({ status: "idle" });

  // A new query invalidates whatever was fetched for the previous one.
  useEffect(() => {
    setState({ status: "idle" });
  }, [query]);

  useEffect(() => {
    if (!open || state.status !== "idle" || !query.trim()) return;

    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/websearch?q=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return;
        setState({
          status: "done",
          results: data.results ?? [],
          configured: Boolean(data.configured),
          message: data.message,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [open, state.status, query]);

  if (!query.trim()) return null;

  return (
    <section className="web">
      <button
        type="button"
        className="web__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? "▾" : "▸"}</span> Search the web for “
        {query}”
      </button>

      {open && (
        <div className="web__body">
          {state.status === "loading" && <p className="web__note">Searching…</p>}

          {state.status === "error" && (
            <p className="web__note web__note--err" role="alert">
              Web search is unavailable right now.
            </p>
          )}

          {state.status === "done" && (
            <>
              {!state.configured && state.message && (
                <p className="web__note">{state.message}</p>
              )}
              <ul className="web__list">
                {state.results.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="web__hit"
                    >
                      <span className="web__hit-title">{r.title}</span>
                      {r.description && (
                        <span className="web__hit-desc">{r.description}</span>
                      )}
                      <span className="web__hit-src">
                        {SOURCE_LABEL[r.source] ?? "Web"}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}
