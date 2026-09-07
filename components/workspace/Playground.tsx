"use client";

import { useMemo, useState } from "react";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { ALL_TARGETS, DEFAULT_TARGET, TARGETS_BY_KEY } from "@/lib/targets";
import { specFor } from "@/lib/composer";
import { pickSnippet } from "@/lib/snippets";
import { CanvasItem } from "@/components/build/CanvasItem";
import { generate } from "@/components/build/generate";
import type { StackItem, TrayItem } from "@/components/build/types";
import "@/styles/workspace.css";

/**
 * Playground — Workspace hub (deep-spec).
 *
 * Configure a component across variant / size / state / features / style /
 * language, see it live on a dotted stage, and read the code. Crucially, the
 * code panel shows the REAL snippet documented in the component's md file when
 * one exists for the chosen language — falling back to the generator only for
 * languages the doc doesn't cover.
 */

const STATES = ["default", "hover", "focus", "active", "disabled"] as const;
type StateKey = (typeof STATES)[number];

let seq = 0;
const uid = () => `pg${++seq}`;

export function Playground({ tray, initialSlug }: { tray: TrayItem[]; initialSlug?: string }) {
  const renderable = useMemo(() => tray.filter((t) => t.renderable), [tray]);
  const fallback = renderable[0]?.slug ?? tray[0]?.slug ?? "button";
  const [slug, setSlug] = useState<string>(
    initialSlug && tray.some((t) => t.slug === initialSlug) ? initialSlug : fallback,
  );
  const [skin, setSkin] = useState<string>("flat");
  const [target, setTarget] = useState<string>(DEFAULT_TARGET);
  const [state, setState] = useState<StateKey>("default");
  const [copied, setCopied] = useState(false);
  const [propsBySlug, setPropsBySlug] = useState<Record<string, StackItem["props"]>>({});

  const meta = tray.find((t) => t.slug === slug);
  const spec = specFor(slug);
  const props = propsBySlug[slug] ?? { ...spec.defaults };

  const textFields = spec.fields.filter((f) => f.kind === "text");
  const selectFields = spec.fields.filter((f) => f.kind === "select");
  const toggleFields = spec.fields.filter((f) => f.kind === "toggle");

  const item: StackItem = {
    uid: uid(),
    slug,
    name: meta?.name ?? slug,
    category: meta?.category ?? "",
    props,
  };

  const realSnippet = pickSnippet(meta?.snippets, target);
  const targetMeta = TARGETS_BY_KEY[target];

  const code = useMemo(() => {
    if (realSnippet) return realSnippet.code.replace(/\s+$/, "");
    if (targetMeta?.emit) return generate([item], target, skin, meta?.name ?? "Preview");
    return [
      `// ${targetMeta?.label ?? target} isn't documented for ${meta?.name ?? slug} yet.`,
      `// The full spec and any code for this target live on its Knowledge Hub page.`,
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, target, skin, props, realSnippet]);

  function setProp(key: string, value: string | boolean) {
    setPropsBySlug((s) => ({ ...s, [slug]: { ...(s[slug] ?? { ...spec.defaults }), [key]: value } }));
  }
  function reset() {
    setPropsBySlug((s) => ({ ...s, [slug]: { ...spec.defaults } }));
    setState("default");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const chip = (label: string, active: boolean, onClick: () => void, key?: string) => (
    <button
      key={key ?? label}
      type="button"
      className={`pg-chip${active ? " is-active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="pg">
      <header className="pg-header">
        <h1 className="pg-h1">Playground</h1>
        <span className="pg-toolbadge">{meta?.name ?? slug}</span>
        <label className="pg-picker">
          <span className="pg-srlabel">Component</span>
          <select className="pg-select" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {tray.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
                {t.renderable ? "" : " · doc"}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="pg-reset" onClick={reset}>
          Reset
        </button>
      </header>

      <aside className="pg-controls" aria-label="Controls">
        {textFields.length > 0 && (
          <div className="pg-group">
            <h3 className="pg-group__title">Content</h3>
            <div className="pg-texts">
              {textFields.map((f) => (
                <label key={f.key} className="pg-textrow">
                  <span className="pg-srlabel">{f.label}</span>
                  <input
                    className="pg-textinput"
                    value={String(props[f.key] ?? "")}
                    onChange={(e) => setProp(f.key, e.target.value)}
                    placeholder={f.label}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {selectFields.map((f) => (
          <div key={f.key} className="pg-group">
            <h3 className="pg-group__title">{f.label}</h3>
            <div className="pg-options">
              {f.options?.map((o) => chip(o, String(props[f.key]) === o, () => setProp(f.key, o), o))}
            </div>
          </div>
        ))}

        {toggleFields.length > 0 && (
          <div className="pg-group">
            <h3 className="pg-group__title">Features</h3>
            <div className="pg-options">
              {toggleFields.map((f) =>
                chip(f.label, Boolean(props[f.key]), () => setProp(f.key, !props[f.key]), f.key),
              )}
            </div>
          </div>
        )}

        <div className="pg-group">
          <h3 className="pg-group__title">State</h3>
          <div className="pg-options">
            {STATES.map((s) => chip(s, state === s, () => setState(s), s))}
          </div>
        </div>

        <div className="pg-group">
          <h3 className="pg-group__title">Style</h3>
          <div className="pg-options">
            {ALL_STYLES.map((k) => chip(STYLE_NAMES[k] ?? k, skin === k, () => setSkin(k), k))}
          </div>
        </div>

        <div className="pg-group">
          <h3 className="pg-group__title">Language</h3>
          <div className="pg-options">
            {ALL_TARGETS.map((t) => chip(t.label, target === t.key, () => setTarget(t.key), t.key))}
          </div>
        </div>
      </aside>

      <section className="pg-stage" aria-label="Preview">
        <div className={`pg-stage__inner is-${state}`} data-style={skin}>
          <CanvasItem item={item} />
        </div>
        {!meta?.renderable && (
          <p className="pg-stagenote">
            Documented component — no live renderer yet. Its full spec is on the{" "}
            <a href={`/knowledge/${slug}`}>Knowledge Hub page</a>.
          </p>
        )}
      </section>

      <section className="pg-code" aria-label="Code">
        <div className="pg-code__bar">
          <span className={`pg-code__src${realSnippet ? " is-real" : ""}`}>
            {realSnippet
              ? `From the docs · ${realSnippet.label ?? realSnippet.language}`
              : targetMeta?.emit
                ? "Generated"
                : "Not documented for this target"}
          </span>
          <span className="pg-code__lang">
            {targetMeta?.label ?? target} · {STYLE_NAMES[skin] ?? skin}
          </span>
          <button type="button" className={`pg-code__copy${copied ? " is-copied" : ""}`} onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="pg-code__pre">
          <code>{code}</code>
        </pre>
      </section>
    </div>
  );
}
