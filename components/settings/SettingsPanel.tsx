"use client";

import { useEffect, useState } from "react";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { ALL_TARGETS, DEFAULT_TARGET } from "@/lib/targets";
import {
  PREF_SKIN,
  PREF_TARGET,
  getPref,
  setPref,
  clearPref,
  saveAccountPreferences,
} from "@/lib/prefs";
import "@/styles/settings.css";

/**
 * Working preferences: the default skin and language target the Playground and
 * the Build Hub composer open with.
 *
 * Writes to both tiers (see lib/prefs.ts). localStorage updates immediately so
 * the change is live before any request finishes; when signed in the value is
 * also persisted to the account, which is what makes it follow you to another
 * device. The status line says which of the two actually happened rather than
 * implying a sync that did not occur.
 */
export function SettingsPanel({ signedIn = false }: { signedIn?: boolean }) {
  const [skin, setSkin] = useState<string>("flat");
  const [target, setTarget] = useState<string>(DEFAULT_TARGET);
  const [status, setStatus] = useState<"idle" | "local" | "synced" | "failed">("idle");

  // Load saved prefs after mount (avoids a hydration mismatch). The app shell
  // has already mirrored any account values into localStorage by now.
  useEffect(() => {
    const s = getPref(PREF_SKIN);
    const t = getPref(PREF_TARGET);
    if (s && ALL_STYLES.includes(s as (typeof ALL_STYLES)[number])) setSkin(s);
    if (t && ALL_TARGETS.some((x) => x.key === t)) setTarget(t);
  }, []);

  async function persist(nextSkin: string, nextTarget: string) {
    setPref(PREF_SKIN, nextSkin);
    setPref(PREF_TARGET, nextTarget);

    if (!signedIn) {
      setStatus("local");
      return;
    }
    const ok = await saveAccountPreferences({
      default_style: nextSkin,
      default_target: nextTarget,
    });
    setStatus(ok ? "synced" : "failed");
  }

  function changeSkin(v: string) {
    setSkin(v);
    void persist(v, target);
  }

  function changeTarget(v: string) {
    setTarget(v);
    void persist(skin, v);
  }

  async function reset() {
    clearPref(PREF_SKIN);
    clearPref(PREF_TARGET);
    setSkin("flat");
    setTarget(DEFAULT_TARGET);

    if (!signedIn) {
      setStatus("local");
      return;
    }
    // Empty strings clear the stored values server-side.
    const ok = await saveAccountPreferences({ default_style: "", default_target: "" });
    setStatus(ok ? "synced" : "failed");
  }

  const statusText =
    status === "synced"
      ? "Saved to your account"
      : status === "local"
        ? "Saved in this browser"
        : status === "failed"
          ? "Saved here, but not to your account"
          : "";

  return (
    <>
      <section className="set-card" aria-label="Defaults">
        <div className="set-card__head">
          <h2 className="set-card__title">Defaults</h2>
          <span
            className={`set-saved${status !== "idle" ? " is-on" : ""}${status === "failed" ? " is-warn" : ""}`}
            aria-live="polite"
          >
            {statusText}
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
                  {t.emit ? "" : " · docs only"}
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

        {!signedIn && (
          <p className="set-note">
            These are per-browser while you are signed out. Sign in and they
            follow you across devices.
          </p>
        )}
      </section>
    </>
  );
}
