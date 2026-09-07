"use client";

import { useMemo, useState } from "react";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { ALL_TARGETS, DEFAULT_TARGET, TARGETS_BY_KEY } from "@/lib/targets";
import { specFor } from "@/lib/composer";
import { CanvasItem } from "@/components/build/CanvasItem";
import { generate } from "@/components/build/generate";
import type { StackItem, TrayItem } from "@/components/build/types";
import "@/styles/workspace.css";

/**
 * Playground — Workspace hub.
 *
 * The single-component sandbox that used to live behind the Knowledge detail
 * page. Pick one component, flip its props, switch across all 11 skins live,
 * and read the generated code for any target. Everything is local state; it
 * reuses the same renderers and generator as the Build Hub composer so a
 * preview here matches what a build emits.
 */

let seq = 0;
const uid = () => `pg${++seq}`;

export function Playground({
  tray,
  initialSlug,
}: {
  tray: TrayItem[];
  initialSlug?: string;
}) {
  const renderable = useMemo(() => tray.filter((t) => t.renderable), [tray]);
  const fallback = renderable[0]?.slug ?? tray[0]?.slug ?? "button";
  const [slug, setSlug] = useState<string>(
    initialSlug && tray.some((t) => t.slug === initialSlug) ? initialSlug : fallback,
  );
  const [skin, setSkin] = useState<string>("ujg");
  const [target, setTarget] = useState<string>(DEFAULT_TARGET);
  const [copied, setCopied] = useState(false);

  const meta = tray.find((t) => t.slug === slug);
  const spec = specFor(slug);

  // Prop state is keyed by slug so switching components and coming back keeps edits.
  const [propsBySlug, setPropsBySlug] = useState<Record<string, StackItem["props"]>>({});
  const props = propsBySlug[slug] ?? { ...spec.defaults };

  const item: StackItem = {
    uid: uid(),
    slug,
    name: meta?.name ?? slug,
    category: meta?.category ?? "",
    props,
  };

  const code = useMemo(
    () => generate([item], target, skin, meta?.name ?? "Playground"),
    // item is rebuilt each render; depend on the values that actually change it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, target, skin, props, meta?.name],
  );

  function setProp(key: string, value: string | boolean) {
    setPropsBySlug((s) => ({
      ...s,
      [slug]: { ...(s[slug] ?? { ...spec.defaults }), [key]: value },
    }));
  }

  function reset() {
    setPropsBySlug((s) => ({ ...s, [slug]: { ...spec.defaults } }));
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

  return (
    <main className="pg">
      <header className="pg-head">
        <div>
          <p className="pg-eyebrow">Workspace · Playground</p>
          <h1 className="pg-title">One component, every skin.</h1>
          <p className="pg-lede">
            Pick a component, flip its props, and switch skins to see the token
            layer do its work. The code updates as you go.
          </p>
        </div>
        <label className="pg-picker">
          <span className="pg-picker__label">Component</span>
          <select
            className="pg-select"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            {tray.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
                {t.renderable ? "" : " · doc"}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="pg-body">
        <section className="pg-stagewrap" aria-label="Preview">
          <div className="pg-skins" role="group" aria-label="Visual skin">
            {ALL_STYLES.map((k) => (
              <button
                key={k}
                type="button"
                className={`pg-skin${skin === k ? " is-active" : ""}`}
                aria-pressed={skin === k}
                onClick={() => setSkin(k)}
              >
                {STYLE_NAMES[k]}
              </button>
            ))}
          </div>
          <div className="pg-stage" data-style={skin}>
            <CanvasItem item={item} />
          </div>
          {!meta?.renderable && (
            <p className="pg-note">
              This component is documented but has no live playground renderer
              yet — its full spec and code live on its{" "}
              <a href={`/knowledge/${slug}`}>Knowledge Hub page</a>.
            </p>
          )}
        </section>

        <aside className="pg-panel" aria-label="Controls">
          <div className="pg-panel__head">
            <h2 className="pg-panel__title">{meta?.name ?? slug}</h2>
            <button type="button" className="pg-mini" onClick={reset}>
              Reset
            </button>
          </div>

          <div className="pg-fields">
            {spec.fields.map((f) => {
              const value = props[f.key];
              const fid = `pg-${f.key}`;
              if (f.kind === "toggle") {
                return (
                  <div key={f.key} className="pg-row">
                    <label htmlFor={fid} className="pg-row__label">
                      {f.label}
                    </label>
                    <button
                      id={fid}
                      type="button"
                      role="switch"
                      aria-checked={Boolean(value)}
                      className={`pg-switch${value ? " is-on" : ""}`}
                      onClick={() => setProp(f.key, !value)}
                    >
                      <span className="pg-switch__dot" />
                    </button>
                  </div>
                );
              }
              if (f.kind === "select") {
                return (
                  <div key={f.key} className="pg-ctrl">
                    <label htmlFor={fid} className="pg-ctrl__label">
                      {f.label}
                    </label>
                    <select
                      id={fid}
                      className="pg-select"
                      value={String(value ?? "")}
                      onChange={(e) => setProp(f.key, e.target.value)}
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
                <div key={f.key} className="pg-ctrl">
                  <label htmlFor={fid} className="pg-ctrl__label">
                    {f.label}
                  </label>
                  <input
                    id={fid}
                    type="text"
                    className="pg-input"
                    value={String(value ?? "")}
                    onChange={(e) => setProp(f.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="pg-panel__block">
            <span className="pg-eyebrow">Accessibility</span>
            <ul className="pg-a11y">
              {spec.a11y.map((line) => (
                <li key={line}>
                  <span className="pg-a11y__tick" aria-hidden="true">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="pg-code" aria-label="Generated code">
        <div className="pg-code__bar">
          <label className="pg-code__target">
            <span className="pg-eyebrow">Target</span>
            <select
              className="pg-select pg-select--dark"
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
          </label>
          <span className="pg-code__name">
            {targetMeta?.label ?? target} · {STYLE_NAMES[skin]}
          </span>
          <button type="button" className="pg-code__copy" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="pg-code__pre">
          <code>{code}</code>
        </pre>
      </section>
    </main>
  );
}
