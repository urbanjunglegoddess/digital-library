"use client";

import { useMemo, useState } from "react";
import { runAudit, type Severity } from "@/lib/audit";

/**
 * Auditor — Build Hub.
 *
 * Paste any markup (or send the current build's HTML from the composer) and
 * get a live accessibility + semantics report: an accessible-name check, label
 * association, semantic misuse, heading order, duplicate ids and dangling ARIA
 * references, scored and grouped by severity. Runs entirely in the browser.
 */

const SAMPLE = `<section>
  <h1>Create your account</h1>
  <div class="field">
    <input type="email" placeholder="Email" />
  </div>
  <img src="/logo.png" />
  <div onclick="submit()">Sign up</div>
  <a>Learn more</a>
  <h4>Fine print</h4>
</section>`;

const SEV_LABEL: Record<Severity, string> = {
  error: "Error",
  warning: "Warning",
  info: "Note",
};

export function Auditor({ seed }: { seed?: string }) {
  const [input, setInput] = useState(seed ?? SAMPLE);
  const report = useMemo(() => runAudit(input), [input]);

  const scoreTone =
    report.score >= 90 ? "good" : report.score >= 70 ? "warn" : "bad";

  return (
    <div className="au">
      <div className="au-input">
        <div className="au-input__bar">
          <span className="bh-eyebrow">Markup to audit</span>
          <div className="au-input__actions">
            <button type="button" className="bh-mini" onClick={() => setInput(SAMPLE)}>
              Load sample
            </button>
            <button type="button" className="bh-mini bh-mini--danger" onClick={() => setInput("")}>
              Clear
            </button>
          </div>
        </div>
        <textarea
          className="au-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          aria-label="HTML markup to audit"
          placeholder="Paste HTML here…"
        />
      </div>

      <div className="au-report" aria-live="polite">
        <div className={`au-score au-score--${scoreTone}`}>
          <span className="au-score__num">{report.score}</span>
          <span className="au-score__label">
            {report.ok ? "No blocking errors" : `${report.counts.error} to fix`}
          </span>
          <span className="au-score__meta">{report.elements} elements scanned</span>
        </div>

        <div className="au-tallies">
          <span className="au-tally au-tally--error">{report.counts.error} errors</span>
          <span className="au-tally au-tally--warning">{report.counts.warning} warnings</span>
          <span className="au-tally au-tally--info">{report.counts.info} notes</span>
        </div>

        {report.findings.length === 0 ? (
          <p className="au-clean">
            {input.trim()
              ? "Clean — nothing flagged by the heuristic checks."
              : "Paste some markup to run the checks."}
          </p>
        ) : (
          <ul className="au-list">
            {report.findings.map((f, i) => (
              <li key={i} className={`au-finding au-finding--${f.severity}`}>
                <div className="au-finding__head">
                  <span className={`au-badge au-badge--${f.severity}`}>
                    {SEV_LABEL[f.severity]}
                  </span>
                  <code className="au-finding__rule">{f.rule}</code>
                </div>
                <p className="au-finding__msg">{f.message}</p>
                {f.snippet && <code className="au-finding__snippet">{f.snippet}</code>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
