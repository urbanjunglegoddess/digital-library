"use client";

import { useState } from "react";
import { BuildComposer } from "./BuildComposer";
import { Auditor } from "./Auditor";
import type { TrayItem } from "./types";
import "./build.css";

/**
 * Build Hub shell — two tools under one roof.
 *
 *   Compose → the tray/canvas/inspector composer
 *   Audit   → the accessibility + markup auditor
 *
 * The composer's "Audit" button hands the current build's HTML to the auditor
 * and flips the tab, so you can compose then check without leaving the hub.
 */
export function BuildHub({ tray }: { tray: TrayItem[] }) {
  const [tab, setTab] = useState<"compose" | "audit">("compose");
  const [seed, setSeed] = useState<string | undefined>(undefined);

  function auditHtml(html: string) {
    setSeed(html);
    setTab("audit");
  }

  return (
    <div className="bh-hub">
      <div className="bh-hubtabs" role="tablist" aria-label="Build Hub tools">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "compose"}
          className={`bh-hubtab${tab === "compose" ? " is-active" : ""}`}
          onClick={() => setTab("compose")}
        >
          Compose
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "audit"}
          className={`bh-hubtab${tab === "audit" ? " is-active" : ""}`}
          onClick={() => setTab("audit")}
        >
          Audit
        </button>
      </div>

      {tab === "compose" ? (
        <BuildComposer tray={tray} onAudit={auditHtml} />
      ) : (
        <div className="bh-auditwrap">
          <Auditor seed={seed} />
        </div>
      )}
    </div>
  );
}
