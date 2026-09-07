"use client";

import { useMemo, useState } from "react";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { specFor } from "@/lib/composer";
import { CanvasItem } from "@/components/build/CanvasItem";
import type { StackItem, TrayItem } from "@/components/build/types";
import "@/styles/templates.css";

/**
 * Template Hub — curated compositions you can edit.
 *
 * A template is an ordered list of component slugs. Pick one, then add or
 * remove components and reorder them; the preview re-renders live under the
 * chosen skin. Local state for now — Phase 4 persists templates to the
 * Supabase `templates` table (owner-scoped via RLS).
 */

interface Template {
  id: string;
  name: string;
  description: string;
  components: string[]; // slugs, in order
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

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];

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

  function deleteTemplate(id: string) {
    setTemplates((ts) => {
      const next = ts.filter((t) => t.id !== id);
      if (id === selectedId && next[0]) setSelectedId(next[0].id);
      return next;
    });
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
                <span className="th-listitem__name">{t.name}</span>
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
            <button
              type="button"
              className="th-mini th-mini--danger"
              onClick={() => deleteTemplate(selected.id)}
            >
              Delete template
            </button>
          </header>
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
