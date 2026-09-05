"use client";

import { useState } from "react";
import type { CodeSnippet } from "@/lib/content";

/**
 * Copyable, tabbed code viewer. One tab per snippet (per language/framework
 * target). The copy button writes the active snippet to the clipboard.
 */
export function CodeTabs({ snippets }: { snippets: CodeSnippet[] }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!snippets.length) return null;

  const current = snippets[Math.min(active, snippets.length - 1)];

  const tabLabel = (s: CodeSnippet) =>
    s.label ?? ([s.framework, s.language].filter(Boolean).join(" · ") || s.language);

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="codetabs">
      <div className="codetabs__bar">
        <div className="codetabs__tabs" role="tablist" aria-label="Code targets">
          {snippets.map((s, i) => (
            <button
              key={`${s.language}-${s.framework ?? "x"}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`codetabs__tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              {tabLabel(s)}
            </button>
          ))}
        </div>
        <button type="button" className="codetabs__copy" onClick={copy}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="codetabs__pre" tabIndex={0}>
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
