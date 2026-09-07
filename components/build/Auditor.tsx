"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  runAudit,
  toMarkdown,
  CATEGORY_LABEL,
  type AuditResult,
  type Category,
  type Check,
} from "@/lib/audit";

/**
 * Auditor — Build Hub (deep-spec).
 *
 * A consulting deliverable: paste markup, run a categorized audit, and export a
 * client-ready Markdown report. Meta fields (Client / Auditor / Date) persist
 * to localStorage. Everything runs in the browser.
 */

const SAMPLE = `<section>
  <h1>Create your account</h1>
  <label for="email">Email</label>
  <input id="email" type="email" />
  <button type="button" onclick="submit()">Sign up</button>
</section>`;

const CATEGORIES: Category[] = ["accessibility", "validity", "wiring"];

const STATUS_ICON: Record<Check["status"], string> = {
  pass: "✓",
  fail: "✗",
  warn: "▲",
  skip: "—",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function Auditor({ seed }: { seed?: string }) {
  const [input, setInput] = useState(seed ?? SAMPLE);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [client, setClient] = useState("");
  const [auditor, setAuditor] = useState("UJG Digital Library");
  const [open, setOpen] = useState<Record<Category, boolean>>({
    accessibility: true,
    validity: true,
    wiring: true,
  });
  const resultsRef = useRef<HTMLDivElement>(null);
  const date = useMemo(todayISO, []);

  // When the composer hands over fresh HTML, load it and clear the last run.
  useEffect(() => {
    if (seed !== undefined) {
      setInput(seed);
      setResult(null);
      setError("");
    }
  }, [seed]);

  // Persisted meta fields.
  useEffect(() => {
    try {
      const c = localStorage.getItem("dl-audit-client");
      const a = localStorage.getItem("dl-audit-auditor");
      if (c !== null) setClient(c);
      if (a !== null) setAuditor(a);
    } catch {
      /* storage blocked — use defaults */
    }
  }, []);
  function persist(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }

  function run() {
    if (!input.trim()) {
      setError("Paste markup first.");
      setResult(null);
      return;
    }
    setError("");
    setResult(runAudit(input));
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function exportReport() {
    if (!result) return;
    const md = toMarkdown(result, { client, auditor, date });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = date;
    a.href = url;
    a.download = `${(client || "component").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-audit-${stamp}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const scoreTone = result
    ? result.pct >= 100
      ? "perfect"
      : result.pct >= 80
        ? "a"
        : result.pct >= 60
          ? "b"
          : result.pct >= 40
            ? "c"
            : "f"
    : "a";

  return (
    <div className="au">
      <header className="au-head">
        <h1 className="au-h1">Auditor</h1>
        <span className="au-badge-tool">Consulting deliverable</span>
      </header>

      <div className="au-meta">
        <label className="au-field">
          <span className="au-field__label">Client</span>
          <input
            className="au-input"
            value={client}
            placeholder="Client name"
            onChange={(e) => {
              setClient(e.target.value);
              persist("dl-audit-client", e.target.value);
            }}
          />
        </label>
        <label className="au-field">
          <span className="au-field__label">Auditor</span>
          <input
            className="au-input"
            value={auditor}
            onChange={(e) => {
              setAuditor(e.target.value);
              persist("dl-audit-auditor", e.target.value);
            }}
          />
        </label>
        <label className="au-field">
          <span className="au-field__label">Date</span>
          <input className="au-input" value={date} readOnly aria-readonly="true" />
        </label>
      </div>

      <textarea
        className="au-paste"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        aria-label="Markup to audit"
        placeholder="Paste your component HTML or JSX markup here…"
      />

      <div className="au-runrow">
        {error && <span className="au-error" role="alert">{error}</span>}
        <button type="button" className="au-run" onClick={run}>
          Run Audit
        </button>
      </div>

      {result && (
        <div className="au-results" ref={resultsRef}>
          <div className={`au-score au-score--${scoreTone}`}>
            <div className="au-score__top">
              <span className="au-score__count">
                {result.passed}/{result.total} checks passed
                <em> ({result.pct}%)</em>
              </span>
              <span className="au-grade">Grade {result.grade}</span>
            </div>
            <div className="au-bar">
              <div className="au-bar__fill" style={{ width: `${result.pct}%` }} />
            </div>
            <div className="au-score__foot">
              {result.critical} critical • {result.warnings} warnings
              {result.skipped > 0 && <> • {result.skipped} not applicable</>}
              <span className="au-fw">detected as {result.framework}</span>
            </div>
          </div>

          {CATEGORIES.map((cat) => {
            const rows = result.checks.filter((c) => c.category === cat);
            const scored = rows.filter((c) => c.status !== "skip");
            const passed = scored.filter((c) => c.status === "pass").length;
            return (
              <section key={cat} className="au-cat">
                <button
                  type="button"
                  className="au-cat__head"
                  aria-expanded={open[cat]}
                  onClick={() => setOpen((o) => ({ ...o, [cat]: !o[cat] }))}
                >
                  <span className="au-cat__name">{CATEGORY_LABEL[cat]}</span>
                  <span className="au-cat__count">
                    {passed}/{scored.length}
                  </span>
                  <span className="au-cat__chevron" aria-hidden="true">
                    {open[cat] ? "▾" : "▸"}
                  </span>
                </button>
                {open[cat] && (
                  <ul className="au-checks">
                    {rows.map((c) => (
                      <li key={c.id} className={`au-check au-check--${c.status}`}>
                        <div className="au-check__line">
                          <span className="au-check__icon" aria-hidden="true">
                            {STATUS_ICON[c.status]}
                          </span>
                          <span className="au-check__label">{c.label}</span>
                          {c.status !== "pass" && c.status !== "skip" && (
                            <span className={`au-sev au-sev--${c.severity}`}>{c.severity}</span>
                          )}
                        </div>
                        <div className="au-check__found">Found: {c.found}</div>
                        {(c.status === "fail" || c.status === "warn") && (
                          <>
                            <div className="au-check__meta">Expected: {c.expected}</div>
                            {c.fix && <div className="au-check__fix">Fix: {c.fix}</div>}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          <div className="au-exportrow">
            <button type="button" className="au-export" onClick={exportReport}>
              ⭳ Export report (.md)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
