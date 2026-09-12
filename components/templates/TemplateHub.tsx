"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { specFor } from "@/lib/composer";
import { ALL_TARGETS, DEFAULT_TARGET } from "@/lib/targets";
import { CanvasItem } from "@/components/build/CanvasItem";
import type { StackItem, TrayItem } from "@/components/build/types";
import "@/styles/templates.css";

/**
 * Template Hub — curated compositions you can edit.
 *
 * A template is an ordered list of component slugs. Pick one, then add or
 * remove components and reorder them; the preview re-renders live under the
 * chosen skin.
 *
 * Persistence (Phase 4): a signed-in user's templates live in the Supabase
 * `templates` table, owner-scoped by RLS, and load in over the curated seeds on
 * mount. The seeds stay available to everyone as starting points — editing one
 * and saving it creates your own copy rather than changing the seed.
 *
 * Export produces a real project ZIP through /api/templates/export, which
 * generates from the same module the preview renders from.
 */

interface Template {
  id: string;
  name: string;
  description: string;
  components: string[]; // slugs, in order
  /** Row id in `templates` once saved; null for an unsaved seed or draft. */
  savedId?: string | null;
}

const SEED: Template[] = [
  {
    id: "signup",
    name: "Signup screen",
    description: "Email + password capture with a consent check and a primary action.",
    components: ["field", "field", "checkbox", "button"],
  },
  {
    id: "landing-hero",
    name: "Landing hero",
    description: "A badge, a pull quote, a divider and a call to action.",
    components: ["badge", "blockquote", "divider", "button"],
  },
  {
    id: "contact",
    name: "Contact form",
    description: "Name, email, message, submit — the shape every site needs.",
    components: ["field", "field", "textarea", "button"],
  },
  {
    id: "dashboard",
    name: "Dashboard shell",
    description: "A status banner over metric cards and a data table.",
    components: ["alert", "stats-metric-card", "table", "badge"],
  },
];

let seq = 0;
const uid = () => `t${++seq}`;

function toStackItem(slug: string, tray: TrayItem[]): StackItem {
  const meta = tray.find((t) => t.slug === slug);
  return {
    uid: uid(),
    slug,
    name: meta?.name ?? slug,
    category: meta?.category ?? "",
    props: { ...specFor(slug).defaults },
  };
}

export function TemplateHub({ tray }: { tray: TrayItem[] }) {
  const [templates, setTemplates] = useState<Template[]>(SEED);
  const [selectedId, setSelectedId] = useState<string>(SEED[0].id);
  const [skin, setSkin] = useState<string>("ujg");
  const [addSlug, setAddSlug] = useState<string>(tray[0]?.slug ?? "");
  const [target, setTarget] = useState<string>(DEFAULT_TARGET);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<null | "saving" | "exporting">(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];

  // Load the viewer's saved templates over the curated seeds. A 401 just means
  // signed out, which is a normal state here, not an error to show.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/templates")
      .then(async (res) => {
        if (res.status === 401) {
          if (!cancelled) setSignedIn(false);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (cancelled || !data) return;
        setSignedIn(true);
        const saved: Template[] = (data.templates ?? []).map((row: any) => ({
          id: `db:${row.id}`,
          savedId: row.id,
          name: row.name,
          description: row.description ?? "",
          components: Array.isArray(row.config?.components) ? row.config.components : [],
        }));
        if (saved.length) {
          setTemplates((current) => [...saved, ...current]);
          setSelectedId(saved[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveTemplate = useCallback(async () => {
    if (!selected) return;
    setBusy("saving");
    setStatus(null);

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.savedId ?? undefined,
        name: selected.name,
        description: selected.description,
        config: { components: selected.components, skin },
      }),
    }).catch(() => null);

    setBusy(null);

    if (res?.status === 401) {
      setSignedIn(false);
      setStatus({ kind: "err", text: "Sign in to save templates." });
      return;
    }
    if (!res || !res.ok) {
      const detail = res ? ((await res.json().catch(() => null))?.message ?? "") : "";
      setStatus({ kind: "err", text: detail || "Could not save that template." });
      return;
    }

    const { template } = await res.json();
    // Re-key the local entry onto the saved row so the next save updates
    // rather than creating a duplicate.
    setTemplates((ts) =>
      ts.map((t) =>
        t.id === selected.id
          ? { ...t, id: `db:${template.id}`, savedId: template.id }
          : t,
      ),
    );
    setSelectedId(`db:${template.id}`);
    setStatus({ kind: "ok", text: `Saved “${template.name}”.` });
  }, [selected, skin]);

  const exportZip = useCallback(async () => {
    if (!selected || selected.components.length === 0) return;
    setBusy("exporting");
    setStatus(null);

    const res = await fetch("/api/templates/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selected.name,
        target,
        skin,
        stack: selected.components.map((slug) => toStackItem(slug, tray)),
      }),
    }).catch(() => null);

    setBusy(null);

    if (!res || !res.ok) {
      setStatus({ kind: "err", text: "Could not build that export." });
      return;
    }

    // Hand the blob to the browser as a download, then release the object URL.
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const filename =
      res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ??
      "composition.zip";
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setStatus({ kind: "ok", text: `Downloaded ${filename}.` });
  }, [selected, skin, target, tray]);

  const nameFor = (slug: string) => tray.find((t) => t.slug === slug)?.name ?? slug;

  const previewItems = useMemo(
    () => (selected ? selected.components.map((s) => toStackItem(s, tray)) : []),
    [selected, tray],
  );

  function patch(id: string, next: Partial<Template>) {
    setTemplates((ts) => ts.map((t) => (t.id === id ? { ...t, ...next } : t)));
  }

  function removeAt(index: number) {
    if (!selected) return;
    patch(selected.id, {
      components: selected.components.filter((_, i) => i !== index),
    });
  }

  function move(index: number, dir: -1 | 1) {
    if (!selected) return;
    const to = index + dir;
    const list = [...selected.components];
    if (to < 0 || to >= list.length) return;
    [list[index], list[to]] = [list[to], list[index]];
    patch(selected.id, { components: list });
  }

  function addComponent() {
    if (!selected || !addSlug) return;
    patch(selected.id, { components: [...selected.components, addSlug] });
  }

  function newTemplate() {
    const t: Template = {
      id: uid(),
      name: "Untitled template",
      description: "",
      components: [],
    };
    setTemplates((ts) => [...ts, t]);
    setSelectedId(t.id);
  }

  async function deleteTemplate(id: string) {
    const template = templates.find((t) => t.id === id);
    // Remove the stored row too, otherwise it would reappear on next load.
    if (template?.savedId) {
      await fetch(`/api/templates?id=${encodeURIComponent(template.savedId)}`, {
        method: "DELETE",
      }).catch(() => null);
    }
    setTemplates((ts) => {
      const next = ts.filter((t) => t.id !== id);
      if (id === selectedId && next[0]) setSelectedId(next[0].id);
      return next;
    });
    setStatus(null);
  }

  return (
    <main className="th">
      <aside className="th-list" aria-label="Templates">
        <div className="th-list__head">
          <h1 className="th-title">Template Hub</h1>
          <button type="button" className="th-mini" onClick={newTemplate}>
            + New
          </button>
        </div>
        <ul className="th-list__items">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`th-listitem${t.id === selectedId ? " is-active" : ""}`}
                onClick={() => setSelectedId(t.id)}
              >
                <span className="th-listitem__name">
                  {t.name}
                  {t.savedId && (
                    <span className="th-saved" title="Saved to your account">
                      ●
                    </span>
                  )}
                </span>
                <span className="th-listitem__count">{t.components.length}</span>
              </button>
            </li>
          ))}
          {templates.length === 0 && (
            <li className="th-empty">No templates. Create one to start.</li>
          )}
        </ul>
      </aside>

      {selected ? (
        <section className="th-editor" aria-label="Template editor">
          <header className="th-editor__head">
            <input
              className="th-nameinput"
              value={selected.name}
              onChange={(e) => patch(selected.id, { name: e.target.value })}
              aria-label="Template name"
            />
            <div className="th-editor__actions">
              <select
                className="th-select th-select--sm"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                aria-label="Export target"
              >
                {ALL_TARGETS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="th-mini"
                onClick={exportZip}
                disabled={busy !== null || selected.components.length === 0}
              >
                {busy === "exporting" ? "Building…" : "Export ZIP"}
              </button>
              <button
                type="button"
                className="th-mini th-mini--primary"
                onClick={saveTemplate}
                disabled={busy !== null}
              >
                {busy === "saving" ? "Saving…" : selected.savedId ? "Save" : "Save to account"}
              </button>
              <button
                type="button"
                className="th-mini th-mini--danger"
                onClick={() => deleteTemplate(selected.id)}
              >
                Delete template
              </button>
            </div>
          </header>

          <div aria-live="polite" className="th-status">
            {status && (
              <p className={`th-status__msg th-status__msg--${status.kind}`}>
                {status.text}
              </p>
            )}
            {signedIn === false && !status && (
              <p className="th-status__msg th-status__msg--hint">
                <Link href="/login?next=/templates">Sign in</Link> to save
                templates to your account. Export works either way.
              </p>
            )}
          </div>
          <input
            className="th-descinput"
            value={selected.description}
            onChange={(e) => patch(selected.id, { description: e.target.value })}
            placeholder="Short description…"
            aria-label="Template description"
          />

          <div className="th-cols">
            <div className="th-parts">
              <div className="th-parts__head">
                <span className="th-eyebrow">Components · {selected.components.length}</span>
              </div>
              <ul className="th-partlist">
                {selected.components.map((slug, i) => (
                  <li key={`${slug}-${i}`} className="th-part">
                    <span className="th-part__grip" aria-hidden="true">⠿</span>
                    <span className="th-part__name">{nameFor(slug)}</span>
                    <div className="th-part__actions">
                      <button
                        type="button"
                        className="th-icon"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${nameFor(slug)} up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="th-icon"
                        onClick={() => move(i, 1)}
                        disabled={i === selected.components.length - 1}
                        aria-label={`Move ${nameFor(slug)} down`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="th-icon th-icon--danger"
                        onClick={() => removeAt(i)}
                        aria-label={`Remove ${nameFor(slug)}`}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
                {selected.components.length === 0 && (
                  <li className="th-empty">Empty template — add a component below.</li>
                )}
              </ul>

              <div className="th-add">
                <select
                  className="th-select"
                  value={addSlug}
                  onChange={(e) => setAddSlug(e.target.value)}
                  aria-label="Component to add"
                >
                  {tray.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="th-addbtn" onClick={addComponent}>
                  + Add component
                </button>
              </div>
            </div>

            <div className="th-previewwrap">
              <div className="th-preview__bar">
                <span className="th-eyebrow">Preview</span>
                <select
                  className="th-select th-select--sm"
                  value={skin}
                  onChange={(e) => setSkin(e.target.value)}
                  aria-label="Preview skin"
                >
                  {ALL_STYLES.map((k) => (
                    <option key={k} value={k}>
                      {STYLE_NAMES[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="th-preview" data-style={skin}>
                {previewItems.length === 0 ? (
                  <p className="th-preview__empty">Nothing to preview yet.</p>
                ) : (
                  previewItems.map((item) => (
                    <div key={item.uid} className="th-preview__slot">
                      <CanvasItem item={item} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="th-editor th-editor--empty">
          <p>Select a template on the left, or create a new one.</p>
        </section>
      )}
    </main>
  );
}
