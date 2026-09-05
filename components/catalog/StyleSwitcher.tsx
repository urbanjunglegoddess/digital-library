"use client";

import { useState } from "react";
import { STYLE_NAMES } from "@/lib/styles";

/**
 * The 11-style switcher. Renders a live preview of the component inside a
 * `[data-style="…"]` wrapper and lets the visitor flip between the skins the
 * component supports. The skin styling comes entirely from styles/tokens.css —
 * this only swaps the wrapper attribute, proving the token layer works.
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
  const previewLabel = label ?? name;

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
            onClick={() => setActive(key)}
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
