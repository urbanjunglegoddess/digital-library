"use client";

import { useEffect, useRef, useState } from "react";
import { STYLE_NAMES } from "@/lib/styles";

/**
 * The style switcher. Renders a live preview of the component inside a
 * `[data-style="…"]` wrapper and lets the visitor flip between the skins the
 * component supports. The skin styling comes entirely from styles/tokens.css —
 * this only swaps the wrapper attribute, proving the token layer works.
 *
 * A signed-in user's preferred skin (Settings → Defaults) is applied once on
 * mount. The page itself is statically generated, so that preference has to
 * arrive client-side; it is deliberately ignored the moment the visitor picks a
 * skin themselves, so a late response can never yank the preview out from under
 * someone mid-comparison.
 */
export function StyleSwitcher({
  name,
  styles,
  label,
}: {
  name: string;
  styles: string[];
  label?: string;
}) {
  const initial = styles.includes("ujg") ? "ujg" : styles[0] ?? "ujg";
  const [active, setActive] = useState(initial);
  const touched = useRef(false);
  const previewLabel = label ?? name;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const preferred = data?.preferences?.default_style;
        if (cancelled || touched.current) return;
        if (typeof preferred === "string" && styles.includes(preferred)) {
          setActive(preferred);
        }
      })
      .catch(() => {
        // Signed out or offline: the built-in default is already showing.
      });
    return () => {
      cancelled = true;
    };
  }, [styles]);

  function choose(key: string) {
    touched.current = true;
    setActive(key);
  }

  return (
    <div className="switcher">
      <div className="switcher__stage" data-style={active}>
        <div className="dl-skin switcher__preview">{previewLabel}</div>
      </div>

      <div className="switcher__controls" role="group" aria-label="Visual style">
        {styles.map((key) => (
          <button
            key={key}
            type="button"
            className={`switcher__chip${key === active ? " is-active" : ""}`}
            aria-pressed={key === active}
            onClick={() => choose(key)}
          >
            {STYLE_NAMES[key] ?? key}
          </button>
        ))}
      </div>
      <p className="switcher__hint">
        Rendering the <code>{STYLE_NAMES[active] ?? active}</code> skin ·{" "}
        <code>data-style=&quot;{active}&quot;</code>
      </p>
    </div>
  );
}
