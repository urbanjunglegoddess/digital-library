"use client";

import { useMemo, useRef, useState } from "react";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { ALL_TARGETS, DEFAULT_TARGET, TARGETS_BY_KEY } from "@/lib/targets";
import { specFor } from "@/lib/composer";
import { CanvasItem } from "./CanvasItem";
import { generate, fileList } from "./generate";
import type { LayoutKey, StackItem, TrayItem } from "./types";
import "./build.css";

/**
 * Build Hub composer — tray → canvas → inspector.
 *
 * Three panels at desktop. At 768–1023px the tray collapses behind an
 * "Add component" trigger so the canvas keeps its width (the nav rail is
 * already icons-only by then). At ≤767px the canvas goes full width and both
 * side panels become sheets.
 *
 * Phase 1 is local state: pick a skin, pick a target, compose, copy the code.
 * Phase 4 wires the export ZIP and persists builds to the `templates` table.
 */

let seq = 0;
const nextUid = () => `i${++seq}`;

const CATEGORY_ORDER = [
  "Actions",
  "Inputs & Forms",
  "Navigation",
  "Overlays & Popouts",
  "Feedback & Status",
  "Data Display",
  "Media",
  "Layout & Structure",
  "Marketing & Content",
  "Utilities",
];

/**
 * Canvas layouts. Names are drawn from the UJG avant-garde layout catalog:
 * flow (single column), a plain grid, Extreme Asymmetry (80/20), Split-Screen,
 * a Bento mosaic, and Overlapping Layers (free-positioned depth collage). The
 * layered mode is what lets components sit on top of each other.
 */
const LAYOUTS: { key: LayoutKey; label: string }[] = [
  { key: "flow", label: "Flow · stack" },
  { key: "two-col", label: "Two column" },
  { key: "asym", label: "Asymmetric · 80/20" },
  { key: "split", label: "Split screen" },
  { key: "bento", label: "Bento grid" },
  { key: "layered", label: "Layered · overlap" },
];

function seed(slug: string, name: string, category: string): StackItem {
  return {
    uid: nextUid(),
    slug,
    name,
    category,
    props: { ...specFor(slug).defaults },
  };
}

export function BuildComposer({
  tray,
  onAudit,
}: {
  tray: TrayItem[];
  onAudit?: (html: string) => void;
}) {
  const [title, setTitle] = useState("Signup screen");
  const [skin, setSkin] = useState<string>("ujg");
  const [target, setTarget] = useState<string>(DEFAULT_TARGET);
  const [layout, setLayout] = useState<LayoutKey>("flow");
  const [view, setView] = useState<"stack" | "code">("stack");
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<"tray" | "inspector" | null>(null);
  const [copied, setCopied] = useState(false);

  const [stack, setStack] = useState<StackItem[]>(() => {
    const find = (slug: string) => tray.find((t) => t.slug === slug);
    const initial: StackItem[] = [];
    for (const slug of ["field", "checkbox", "button"]) {
      const t = find(slug);
      if (t) initial.push(seed(t.slug, t.name, t.category));
    }
    return initial;
  });
  const [selected, setSelected] = useState<string | null>(
    () => null,
  );

  const selectedItem = stack.find((i) => i.uid === selected) ?? null;
  const spec = selectedItem ? specFor(selectedItem.slug) : null;

  const groupedTray = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = tray.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
    const byCat = new Map<string, TrayItem[]>();
    for (const t of hits) {
      const list = byCat.get(t.category) ?? [];
      list.push(t);
      byCat.set(t.category, list);
    }
    return [...byCat.entries()].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a[0]);
      const bi = CATEGORY_ORDER.indexOf(b[0]);
      if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [tray, query]);

  const code = useMemo(
    () => generate(stack, target, skin, title),
    [stack, target, skin, title],
  );
  const files = useMemo(() => fileList(stack, target, title), [stack, target, title]);

  const dragRef = useRef<{ uid: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  const topZ = () => stack.reduce((m, i) => Math.max(m, i.layer?.z ?? 0), 0);

  function append(t: TrayItem) {
    const item = seed(t.slug, t.name, t.category);
    const n = stack.length;
    item.layer = { x: 28 + (n % 5) * 30, y: 28 + (n % 5) * 30, z: topZ() + 1 };
    setStack((s) => [...s, item]);
    setSelected(item.uid);
    setSheet(null);
  }

  function setLayer(uid: string, patch: Partial<{ x: number; y: number; z: number }>) {
    setStack((s) =>
      s.map((i) =>
        i.uid === uid
          ? { ...i, layer: { x: 28, y: 28, z: 1, ...i.layer, ...patch } }
          : i,
      ),
    );
  }

  function bringForward(uid: string) {
    setLayer(uid, { z: topZ() + 1 });
  }
  function sendBack(uid: string) {
    const minZ = stack.reduce((m, i) => Math.min(m, i.layer?.z ?? 0), Infinity);
    setLayer(uid, { z: (Number.isFinite(minZ) ? minZ : 1) - 1 });
  }

  function onLayerPointerDown(e: React.PointerEvent, item: StackItem) {
    if (layout !== "layered") return;
    setSelected(item.uid);
    const l = item.layer ?? { x: 28, y: 28, z: 1 };
    dragRef.current = { uid: item.uid, sx: e.clientX, sy: e.clientY, ox: l.x, oy: l.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onLayerPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    d.moved = true;
    setLayer(d.uid, { x: Math.max(0, d.ox + dx), y: Math.max(0, d.oy + dy) });
  }
  function onLayerPointerUp(e: React.PointerEvent) {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
    dragRef.current = null;
  }

  function setProp(uid: string, key: string, value: string | boolean) {
    setStack((s) =>
      s.map((i) => (i.uid === uid ? { ...i, props: { ...i.props, [key]: value } } : i)),
    );
  }

  function move(uid: string, dir: -1 | 1) {
    setStack((s) => {
      const idx = s.findIndex((i) => i.uid === uid);
      const to = idx + dir;
      if (idx === -1 || to < 0 || to >= s.length) return s;
      const next = [...s];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }

  function remove(uid: string) {
    setStack((s) => s.filter((i) => i.uid !== uid));
    setSelected((cur) => (cur === uid ? null : cur));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const targetMeta = TARGETS_BY_KEY[target];

  /* ---------------------------------------------------------------- panels */

  const trayPanel = (
    <div className="bh-tray">
      <input
        type="search"
        className="bh-tray__search"
        placeholder={`Search ${tray.length} components…`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search components"
      />
      <div className="bh-tray__groups">
        {groupedTray.map(([category, list]) => (
          <div key={category} className="bh-tray__group">
            <h3 className="bh-tray__cat">{category}</h3>
            <ul className="bh-tray__list">
              {list.map((t) => (
                <li key={t.slug}>
                  <button
                    type="button"
                    className={`bh-tray__item${t.renderable ? "" : " is-pending"}`}
                    onClick={() => append(t)}
                  >
                    <span className="bh-tray__grip" aria-hidden="true">
                      ⠿
                    </span>
                    <span className="bh-tray__name">{t.name}</span>
                    {!t.renderable && (
                      <span className="bh-tray__flag" title="No composer renderer yet">
                        doc
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {groupedTray.length === 0 && (
          <p className="bh-tray__empty">No components match that search.</p>
        )}
      </div>
      <p className="bh-tray__hint">
        Click to append to the canvas. Reorder from the inspector.
      </p>
    </div>
  );

  const inspectorPanel = (
    <div className="bh-inspect">
      {!selectedItem || !spec ? (
        <div className="bh-inspect__idle">
          <h2 className="bh-inspect__idletitle">Nothing selected</h2>
          <p className="bh-inspect__idlebody">
            Pick a component on the canvas to edit its props, reorder it, or
            remove it.
          </p>
        </div>
      ) : (
        <>
          <div className="bh-inspect__head">
            <span className="bh-eyebrow">Selected</span>
            <div className="bh-inspect__title">
              <h2>{selectedItem.name}</h2>
              <span className="bh-inspect__cat">{selectedItem.category}</span>
            </div>
          </div>

          <div className="bh-inspect__fields">
            {spec.fields.map((f) => {
              const value = selectedItem.props[f.key];
              const fid = `prop-${selectedItem.uid}-${f.key}`;
              if (f.kind === "toggle") {
                return (
                  <div key={f.key} className="bh-row">
                    <label htmlFor={fid} className="bh-row__label">
                      {f.label}
                    </label>
                    <button
                      id={fid}
                      type="button"
                      role="switch"
                      aria-checked={Boolean(value)}
                      className={`bh-switch${value ? " is-on" : ""}`}
                      onClick={() => setProp(selectedItem.uid, f.key, !value)}
                    >
                      <span className="bh-switch__dot" />
                    </button>
                  </div>
                );
              }
              if (f.kind === "select") {
                return (
                  <div key={f.key} className="bh-ctrl">
                    <label htmlFor={fid} className="bh-ctrl__label">
                      {f.label}
                    </label>
                    <select
                      id={fid}
                      className="bh-select"
                      value={String(value ?? "")}
                      onChange={(e) => setProp(selectedItem.uid, f.key, e.target.value)}
                    >
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <div key={f.key} className="bh-ctrl">
                  <label htmlFor={fid} className="bh-ctrl__label">
                    {f.label}
                  </label>
                  <input
                    id={fid}
                    type="text"
                    className="bh-input"
                    value={String(value ?? "")}
                    onChange={(e) => setProp(selectedItem.uid, f.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="bh-inspect__block">
            <span className="bh-eyebrow">Accessibility</span>
            <ul className="bh-a11y">
              {spec.a11y.map((line) => (
                <li key={line}>
                  <span className="bh-a11y__tick" aria-hidden="true">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {layout === "layered" && (
            <div className="bh-inspect__block">
              <span className="bh-eyebrow">Position &amp; depth</span>
              <div className="bh-xy">
                <label className="bh-ctrl">
                  <span className="bh-ctrl__label">X</span>
                  <input
                    type="number"
                    className="bh-input"
                    value={selectedItem.layer?.x ?? 28}
                    onChange={(e) => setLayer(selectedItem.uid, { x: Number(e.target.value) })}
                  />
                </label>
                <label className="bh-ctrl">
                  <span className="bh-ctrl__label">Y</span>
                  <input
                    type="number"
                    className="bh-input"
                    value={selectedItem.layer?.y ?? 28}
                    onChange={(e) => setLayer(selectedItem.uid, { y: Number(e.target.value) })}
                  />
                </label>
                <label className="bh-ctrl">
                  <span className="bh-ctrl__label">Layer</span>
                  <input
                    type="number"
                    className="bh-input"
                    value={selectedItem.layer?.z ?? 1}
                    onChange={(e) => setLayer(selectedItem.uid, { z: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="bh-inspect__actions">
            {layout === "layered" ? (
              <>
                <button
                  type="button"
                  className="bh-mini"
                  onClick={() => bringForward(selectedItem.uid)}
                >
                  Bring forward
                </button>
                <button
                  type="button"
                  className="bh-mini"
                  onClick={() => sendBack(selectedItem.uid)}
                >
                  Send back
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="bh-mini"
                  onClick={() => move(selectedItem.uid, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="bh-mini"
                  onClick={() => move(selectedItem.uid, 1)}
                >
                  Move down
                </button>
              </>
            )}
            <button
              type="button"
              className="bh-mini bh-mini--danger"
              onClick={() => remove(selectedItem.uid)}
            >
              Remove
            </button>
          </div>
        </>
      )}

      <div className="bh-inspect__foot">
        <span className="bh-eyebrow">Output · {files.length} files</span>
        <p className="bh-files">{files.join(" · ")}</p>
      </div>
    </div>
  );

  /* ----------------------------------------------------------------- shell */

  return (
    <div className="bh">
      <header className="bh-bar">
        <div className="bh-bar__id">
          <span className="bh-eyebrow">Build Hub</span>
          <input
            className="bh-bar__title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Build name"
          />
        </div>

        <div className="bh-bar__knobs">
          <div className="bh-knob">
            <label htmlFor="bh-skin" className="bh-knob__label">
              Skin
            </label>
            <select
              id="bh-skin"
              className="bh-select"
              value={skin}
              onChange={(e) => setSkin(e.target.value)}
            >
              {ALL_STYLES.map((k) => (
                <option key={k} value={k}>
                  {STYLE_NAMES[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="bh-knob">
            <label htmlFor="bh-layout" className="bh-knob__label">
              Layout
            </label>
            <select
              id="bh-layout"
              className="bh-select"
              value={layout}
              onChange={(e) => setLayout(e.target.value as LayoutKey)}
            >
              {LAYOUTS.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bh-knob">
            <label htmlFor="bh-target" className="bh-knob__label">
              Target
            </label>
            <select
              id="bh-target"
              className="bh-select"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {ALL_TARGETS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                  {t.emit ? "" : " · Phase 4"}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="bh-btn" onClick={copy}>
            {copied ? "Copied" : "Copy code"}
          </button>
          {onAudit && (
            <button
              type="button"
              className="bh-btn"
              onClick={() => onAudit(generate(stack, "html", skin, title))}
              title="Run the accessibility auditor on this build's HTML"
            >
              Audit
            </button>
          )}
          <button type="button" className="bh-btn bh-btn--primary" disabled title="Export ZIP lands in Phase 4">
            Export ZIP
          </button>
        </div>
      </header>

      <div className="bh-body">
        <aside className="bh-panel bh-panel--tray" aria-label="Component tray">
          {trayPanel}
        </aside>

        <section className="bh-stagewrap" aria-label="Canvas">
          <div className="bh-stagebar">
            <button
              type="button"
              className="bh-btn bh-btn--add"
              onClick={() => setSheet("tray")}
            >
              ＋ Add component
            </button>
            <span className="bh-eyebrow bh-stagebar__count">
              Canvas · {stack.length} component{stack.length === 1 ? "" : "s"}
            </span>
            <div className="bh-toggle" role="group" aria-label="Canvas view">
              <button
                type="button"
                className={`bh-toggle__btn${view === "stack" ? " is-active" : ""}`}
                aria-pressed={view === "stack"}
                onClick={() => setView("stack")}
              >
                Stack
              </button>
              <button
                type="button"
                className={`bh-toggle__btn${view === "code" ? " is-active" : ""}`}
                aria-pressed={view === "code"}
                onClick={() => setView("code")}
              >
                Code
              </button>
            </div>
          </div>

          {view === "stack" ? (
            <div className={`bh-stage bh-stage--${layout}`} data-style={skin}>
              <h2 className="bh-stage__title">{title}</h2>
              <div className={`bh-area bh-area--${layout}`}>
                {stack.map((item) => {
                  const isSel = selected === item.uid;
                  const style =
                    layout === "layered"
                      ? {
                          left: item.layer?.x ?? 28,
                          top: item.layer?.y ?? 28,
                          zIndex: item.layer?.z ?? 1,
                        }
                      : undefined;
                  return (
                    <div
                      key={item.uid}
                      className={`bh-slot${isSel ? " is-selected" : ""}${
                        layout === "layered" ? " bh-slot--layered" : ""
                      }`}
                      style={style}
                      onPointerDown={
                        layout === "layered"
                          ? (e) => onLayerPointerDown(e, item)
                          : undefined
                      }
                      onPointerMove={layout === "layered" ? onLayerPointerMove : undefined}
                      onPointerUp={layout === "layered" ? onLayerPointerUp : undefined}
                    >
                      <button
                        type="button"
                        className="bh-slot__hit"
                        onClick={() => setSelected(item.uid)}
                        aria-label={
                          layout === "layered"
                            ? `Select and drag ${item.name}`
                            : `Select ${item.name}`
                        }
                      />
                      {isSel && (
                        <span className="bh-slot__tag">{item.name} · selected</span>
                      )}
                      <CanvasItem item={item} />
                    </div>
                  );
                })}
                {layout !== "layered" && (
                  <button
                    type="button"
                    className="bh-drop"
                    onClick={() => setSheet("tray")}
                  >
                    Drop a component here
                  </button>
                )}
              </div>
              {layout === "layered" && (
                <button
                  type="button"
                  className="bh-drop bh-drop--layered"
                  onClick={() => setSheet("tray")}
                >
                  ＋ Add a layer
                </button>
              )}
            </div>
          ) : (
            <div className="bh-code">
              <div className="bh-code__bar">
                <span>{targetMeta?.label ?? target}</span>
                <button type="button" className="bh-code__copy" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bh-code__pre">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </section>

        <aside className="bh-panel bh-panel--inspect" aria-label="Inspector">
          {inspectorPanel}
        </aside>
      </div>

      <div className="bh-actionbar">
        <button type="button" className="bh-actionbar__btn" onClick={() => setSheet("tray")}>
          ⠿ Components
        </button>
        <button
          type="button"
          className="bh-actionbar__btn bh-actionbar__btn--dark"
          onClick={() => setSheet("inspector")}
        >
          {selectedItem ? `Edit ${selectedItem.name}` : "Inspector"}
        </button>
      </div>

      {sheet && (
        <div className="bh-sheetwrap">
          <button
            type="button"
            className="bh-sheetwrap__scrim"
            aria-label="Close"
            onClick={() => setSheet(null)}
          />
          <div className="bh-sheet" role="dialog" aria-modal="true">
            <div className="bh-sheet__grab" aria-hidden="true" />
            {sheet === "tray" ? trayPanel : inspectorPanel}
          </div>
        </div>
      )}
    </div>
  );
}
