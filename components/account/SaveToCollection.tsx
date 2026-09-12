"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

interface CollectionRef {
  id: string;
  name: string;
}

/**
 * "Save to collection" for a component page.
 *
 * The surrounding page is statically generated, so this control starts with no
 * knowledge of the viewer and asks `/api/collections` once it mounts. Until
 * that answers it renders nothing at all rather than a signed-out state that
 * would flip a moment later.
 *
 * Toggles are optimistic — the checkbox moves immediately and rolls back if the
 * request fails — because saving is cheap, reversible, and the round trip is
 * long enough to feel broken otherwise.
 */
export function SaveToCollection({ slug, name }: { slug: string; name: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "anonymous" }
    | { status: "ready"; collections: CollectionRef[]; memberOf: string[] }
  >({ status: "loading" });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/collections?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return;
        setState(
          data.signed_in
            ? {
                status: "ready",
                collections: data.collections ?? [],
                memberOf: data.member_of ?? [],
              }
            : { status: "anonymous" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "anonymous" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Close the panel on Escape or a click outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (state.status === "loading") return null;

  if (state.status === "anonymous") {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/knowledge/${slug}`)}`}
        className="save__cta save__cta--out"
      >
        Sign in to save
      </Link>
    );
  }

  const { collections, memberOf } = state;

  async function toggle(collectionId: string, shouldBeIn: boolean) {
    setError(null);
    // Optimistic: move the checkbox now, undo it if the server disagrees.
    setState((prev) =>
      prev.status === "ready"
        ? {
            ...prev,
            memberOf: shouldBeIn
              ? [...prev.memberOf, collectionId]
              : prev.memberOf.filter((id) => id !== collectionId),
          }
        : prev,
    );

    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle",
        collection_id: collectionId,
        slug,
        member: shouldBeIn,
      }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setError("Could not save. Try again.");
      setState((prev) =>
        prev.status === "ready"
          ? {
              ...prev,
              memberOf: shouldBeIn
                ? prev.memberOf.filter((id) => id !== collectionId)
                : [...prev.memberOf, collectionId],
            }
          : prev,
      );
    }
  }

  async function createCollection(formData: FormData) {
    const newName = String(formData.get("name") ?? "").trim();
    if (!newName) return;
    setCreating(true);
    setError(null);

    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name: newName }),
    }).catch(() => null);

    setCreating(false);

    if (!res || !res.ok) {
      setError("Could not create that collection.");
      return;
    }

    const { collection } = await res.json();
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, collections: [...prev.collections, collection] }
        : prev,
    );
    // A collection created from this page is almost certainly meant to hold
    // the component you are looking at.
    await toggle(collection.id, true);
  }

  const savedCount = memberOf.length;

  return (
    <div className="save" ref={panelRef}>
      <button
        type="button"
        className={`save__cta${savedCount > 0 ? " is-saved" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {savedCount > 0
          ? `Saved to ${savedCount} collection${savedCount === 1 ? "" : "s"}`
          : "Save to collection"}
      </button>

      {open && (
        <div className="save__panel" id={panelId}>
          <p className="save__panel-title">Save “{name}” to…</p>

          {collections.length === 0 ? (
            <p className="save__empty">No collections yet — make your first below.</p>
          ) : (
            <ul className="save__list">
              {collections.map((c) => {
                const checked = memberOf.includes(c.id);
                return (
                  <li key={c.id}>
                    <label className="save__row">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggle(c.id, e.target.checked)}
                      />
                      <span>{c.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <form action={createCollection} className="save__new">
            <label className="save__new-label" htmlFor={`${panelId}-new`}>
              New collection
            </label>
            <div className="save__new-row">
              <input
                id={`${panelId}-new`}
                type="text"
                name="name"
                placeholder="e.g. Checkout flow"
                maxLength={80}
                className="save__input"
              />
              <button type="submit" className="save__add" disabled={creating}>
                {creating ? "…" : "Add"}
              </button>
            </div>
          </form>

          <div aria-live="polite">
            {error && (
              <p className="save__error" role="alert">
                {error}
              </p>
            )}
          </div>

          <Link href="/account" className="save__manage">
            Manage collections →
          </Link>
        </div>
      )}
    </div>
  );
}
