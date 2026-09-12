"use client";

import { useEffect, useState } from "react";
import { ALL_STYLES, STYLE_NAMES } from "@/lib/styles";
import { ALL_TARGETS } from "@/lib/targets";

/**
 * Account defaults: the skin a component preview opens in, and the code target
 * the composer starts on.
 *
 * These live on the profile rather than in localStorage so they follow the user
 * between devices. The values are validated again server-side — this form is a
 * convenience, not the check.
 */
export function PreferencesCard() {
  const [style, setStyle] = useState("");
  const [target, setTarget] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setStyle(data?.preferences?.default_style ?? "");
        setTarget(data?.preferences?.default_target ?? "");
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const res = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_style: style, default_target: target }),
    }).catch(() => null);

    setSaving(false);

    if (!res || !res.ok) {
      setStatus({ kind: "err", text: "Could not save your defaults." });
      return;
    }
    setStatus({ kind: "ok", text: "Defaults saved." });
  }

  return (
    <section className="acct__card" aria-labelledby="acct-prefs">
      <h2 className="acct__card-title" id="acct-prefs">
        Defaults
      </h2>
      <p className="acct__card-lede">
        What the catalog opens with. Saved to your account, so they apply
        wherever you sign in.
      </p>

      <form onSubmit={save} className="acct__form">
        <label className="acct__field">
          <span className="acct__label">Opening visual style</span>
          <select
            className="acct__input"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={!loaded}
          >
            <option value="">UJG (built-in default)</option>
            {ALL_STYLES.map((key) => (
              <option key={key} value={key}>
                {STYLE_NAMES[key] ?? key}
              </option>
            ))}
          </select>
        </label>

        <label className="acct__field">
          <span className="acct__label">Default code target</span>
          <select
            className="acct__input"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={!loaded}
          >
            <option value="">React + TypeScript (built-in default)</option>
            {ALL_TARGETS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
                {t.emit ? "" : " — docs only"}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="acct__btn" disabled={saving || !loaded}>
          {saving ? "Saving…" : "Save defaults"}
        </button>
      </form>

      <div aria-live="polite" className="acct__messages">
        {status && (
          <p
            className={`acct__msg acct__msg--${status.kind === "ok" ? "notice" : "error"}`}
            role={status.kind === "err" ? "alert" : undefined}
          >
            {status.text}
          </p>
        )}
      </div>
    </section>
  );
}
