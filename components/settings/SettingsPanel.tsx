"use client";

import { useEffect, useState } from "react";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { ALL_TARGETS, DEFAULT_TARGET } from "@/lib/targets";
import { PREF_SKIN, PREF_TARGET, getPref, setPref, clearPref } from "@/lib/prefs";
import "@/styles/settings.css";

/**
 * Settings — working preferences (localStorage). The default skin and language
 * target chosen here are what the Playground and Build Hub composer open with.
 * Account / profile settings arrive with auth in Phase 3.
 */
export function SettingsPanel() {
  const [skin, setSkin] = useState<string>("flat");
  const [target, setTarget] = useState<string>(DEFAULT_TARGET);
  const [saved, setSaved] = useState(false);

  // Load saved prefs after mount (avoids a hydration mismatch).
  useEffect(() => {
    const s = getPref(PREF_SKIN);
    const t = getPref(PREF_TARGET);
    if (s && ALL_STYLES.includes(s as (typeof ALL_STYLES)[number])) setSkin(s);
    if (t && ALL_TARGETS.some((x) => x.key === t)) setTarget(t);
  }, []);

  function flash() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }
  function changeSkin(v: string) {
    setSkin(v);
    setPref(PREF_SKIN, v);
    flash();
  }
  function changeTarget(v: string) {
    setTarget(v);
    setPref(PREF_TARGET, v);
    flash();
  }
  function reset() {
    clearPref(PREF_SKIN);
    clearPref(PREF_TARGET);
    setSkin("flat");
    setTarget(DEFAULT_TARGET);
    flash();
  }

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Settings</p>
        <h1 className="page__title">Preferences</h1>
        <p className="page__lede">
          Per-browser defaults for now. The skin and language target you choose
          here are what the Playground and the Build Hub composer open with.
          Account, profile, and sync arrive with sign-in in Phase 3.
        </p>
      </div>

      <section className="set-card" aria-label="Defaults">
        <div className="set-card__head">
          <h2 className="set-card__title">Defaults</h2>
          <span
            className={`set-saved${saved ? " is-on" : ""}`}
            aria-live="polite"
          >
            Saved
          </span>
        </div>

        <div className="set-grid">
          <label className="set-field">
            <span className="set-field__label">Default visual style</span>
            <select
              className="set-select"
              value={skin}
              onChange={(e) => changeSkin(e.target.value)}
            >
              {ALL_STYLES.map((k) => (
                <option key={k} value={k}>
                  {STYLE_NAMES[k] ?? k}
                </option>
              ))}
            </select>
            <span className="set-field__hint">
              One of {ALL_STYLES.length} skins.
            </span>
          </label>

          <label className="set-field">
            <span className="set-field__label">Default language target</span>
            <select
              className="set-select"
              value={target}
              onChange={(e) => changeTarget(e.target.value)}
            >
              {ALL_TARGETS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                  {t.emit ? "" : " · Phase 4"}
                </option>
              ))}
            </select>
            <span className="set-field__hint">
              What the code panel shows first.
            </span>
          </label>
        </div>

        <button type="button" className="set-reset" onClick={reset}>
          Reset to defaults
        </button>
      </section>

      <section className="set-card set-card--muted" aria-label="Coming with accounts">
        <h2 className="set-card__title">With sign-in (Phase 3)</h2>
        <ul className="set-list">
          <li>
            <strong>Profile</strong> — display name and role, backed by the{" "}
            <code>profiles</code> table.
          </li>
          <li>
            <strong>Sync</strong> — these preferences follow you across devices
            instead of living in one browser.
          </li>
          <li>
            <strong>Data &amp; privacy</strong> — export or delete your
            workspace data; deletion cascades across collections and templates.
          </li>
        </ul>
      </section>
    </main>
  );
}
