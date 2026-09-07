/**
 * Accessibility + markup auditor for the Build Hub (deep-spec model).
 *
 * Parses pasted markup in the browser and runs a registry of checks across
 * three categories — Accessibility, Code Validity, Wiring — each returning a
 * typed result with what was found, what was expected, a suggested fix, and a
 * severity. The Auditor renders these as a client-ready, exportable report.
 *
 * Client-only (DOMParser). Guarded so a stray server import is a safe no-op.
 * Conservative by design: checks that need CSS or layout to verify (focus ring,
 * touch-target size, colour-only meaning) are reported as `skip`, not `fail`,
 * so well-written markup produces no false positives.
 */

export type Category = "accessibility" | "validity" | "wiring";
export type CheckStatus = "pass" | "fail" | "warn" | "skip";
export type Severity = "critical" | "serious" | "moderate" | "minor";

export interface Check {
  id: string;
  category: Category;
  label: string;
  status: CheckStatus;
  /** What was actually detected in the markup. */
  found: string;
  /** What should be there. */
  expected: string;
  /** Suggested fix (null when passing/skipped). */
  fix: string | null;
  severity: Severity;
}

export interface AuditResult {
  checks: Check[];
  passed: number;
  total: number; // excludes skipped
  skipped: number;
  pct: number;
  grade: "A+" | "A" | "B" | "C" | "F";
  critical: number;
  warnings: number;
  framework: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  accessibility: "Accessibility",
  validity: "Code Validity",
  wiring: "Wiring",
};

const INTERACTIVE = "a[href], button, input, select, textarea, [role='button'], [role='link']";
const VALID_ROLES = new Set([
  "alert", "alertdialog", "button", "checkbox", "dialog", "grid", "gridcell",
  "link", "listbox", "menu", "menubar", "menuitem", "option", "progressbar",
  "radio", "radiogroup", "region", "search", "separator", "slider", "spinbutton",
  "status", "switch", "tab", "tablist", "tabpanel", "textbox", "toolbar",
  "tooltip", "tree", "treeitem", "navigation", "banner", "main", "complementary",
  "contentinfo", "form", "list", "listitem", "table", "row", "cell", "columnheader",
  "rowheader", "presentation", "none", "img", "heading", "group", "note",
]);

export interface ParsedMarkup {
  root: HTMLElement;
  raw: string;
  isJSX: boolean;
  isVue: boolean;
  isSvelte: boolean;
  isAngular: boolean;
  framework: string;
}

export function parseMarkup(input: string): ParsedMarkup {
  const doc = new DOMParser().parseFromString(input, "text/html");
  const isJSX = /className=|onClick=|onChange=|\{[^}]+\}/.test(input);
  const isVue = /v-if|v-for|:class|@click|v-on:/.test(input);
  const isSvelte = /on:click|bind:|\{#if|\{#each/.test(input);
  const isAngular = /\[class\]|\(click\)|\*ngIf|\*ngFor/.test(input);
  const framework = isVue
    ? "Vue"
    : isSvelte
      ? "Svelte"
      : isAngular
        ? "Angular"
        : isJSX
          ? "React / JSX"
          : "HTML";
  return { root: doc.body, raw: input, isJSX, isVue, isSvelte, isAngular, framework };
}

function accessibleName(el: Element): string {
  const aria = (el.getAttribute("aria-label") ?? "").trim();
  if (aria) return `aria-label="${aria}"`;
  if ((el.getAttribute("aria-labelledby") ?? "").trim()) return "aria-labelledby";
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return `text "${text.slice(0, 32)}"`;
  const title = (el.getAttribute("title") ?? "").trim();
  if (title) return `title="${title}"`;
  const alt = el.querySelector("img[alt]");
  if (alt && (alt.getAttribute("alt") ?? "").trim()) return "child img alt";
  return "";
}

function hasLabel(el: Element, doc: Document): boolean {
  if ((el.getAttribute("aria-label") ?? "").trim()) return true;
  if ((el.getAttribute("aria-labelledby") ?? "").trim()) return true;
  if ((el.getAttribute("title") ?? "").trim()) return true;
  const id = el.getAttribute("id");
  if (id && doc.querySelector(`label[for="${CSS.escape(id)}"]`)) return true;
  if (el.closest("label")) return true;
  const type = (el.getAttribute("type") ?? "").toLowerCase();
  if (el.tagName === "INPUT" && ["hidden", "submit", "button", "reset"].includes(type)) return true;
  return false;
}

const HANDLER_RE = /\bon(click|change|input|submit|keydown|keyup|toggle)\s*=|addEventListener|onClick=|onChange=|@click|v-on:|on:click|\(click\)|ng-click/i;

export function runAudit(input: string): AuditResult {
  const emptyGrade = "A+" as const;
  if (typeof window === "undefined" || typeof DOMParser === "undefined" || !input.trim()) {
    return { checks: [], passed: 0, total: 0, skipped: 0, pct: 0, grade: emptyGrade, critical: 0, warnings: 0, framework: "HTML" };
  }

  const parsed = parseMarkup(input);
  const doc = parsed.root.ownerDocument;
  const body = parsed.root;
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  const interactives = Array.from(body.querySelectorAll(INTERACTIVE));

  /* ---------------------------------------------------------- accessibility */
  {
    const missing = interactives.filter((el) => !accessibleName(el));
    add({
      id: "a11y-accessible-name",
      category: "accessibility",
      label: "Interactive elements have an accessible name",
      status: interactives.length === 0 ? "skip" : missing.length ? "fail" : "pass",
      found: interactives.length === 0 ? "no interactive elements" : missing.length ? `${missing.length} of ${interactives.length} missing a name` : `all ${interactives.length} named`,
      expected: "Every button, link and control exposes a name (text, aria-label, or labelled child).",
      fix: missing.length ? "Add visible text or an aria-label to each unnamed control." : null,
      severity: "critical",
    });
  }
  {
    const imgs = Array.from(body.querySelectorAll("img"));
    const noAlt = imgs.filter((i) => !i.hasAttribute("alt"));
    add({
      id: "a11y-img-alt",
      category: "accessibility",
      label: "Images declare alt text",
      status: imgs.length === 0 ? "skip" : noAlt.length ? "fail" : "pass",
      found: imgs.length === 0 ? "no images" : noAlt.length ? `${noAlt.length} of ${imgs.length} missing alt` : `all ${imgs.length} have alt`,
      expected: 'Every <img> has alt text, or alt="" if purely decorative.',
      fix: noAlt.length ? 'Add alt describing the image, or alt="" for decoration.' : null,
      severity: "serious",
    });
  }
  {
    const controls = Array.from(body.querySelectorAll("input, select, textarea"));
    const unlabelled = controls.filter((c) => !hasLabel(c, doc));
    add({
      id: "a11y-label",
      category: "accessibility",
      label: "Form controls are labelled",
      status: controls.length === 0 ? "skip" : unlabelled.length ? "fail" : "pass",
      found: controls.length === 0 ? "no form controls" : unlabelled.length ? `${unlabelled.length} of ${controls.length} unlabelled` : `all ${controls.length} labelled`,
      expected: "Each control has a <label for>, wrapping <label>, or aria-label.",
      fix: unlabelled.length ? "Associate a <label> or add an aria-label to each control." : null,
      severity: "critical",
    });
  }
  {
    const refAttrs = ["aria-labelledby", "aria-describedby", "aria-controls"];
    const dangling: string[] = [];
    for (const attr of refAttrs) {
      for (const el of body.querySelectorAll(`[${attr}]`)) {
        for (const id of (el.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean)) {
          if (!doc.getElementById(id)) dangling.push(`${attr}→#${id}`);
        }
      }
    }
    const anyRefs = refAttrs.some((a) => body.querySelector(`[${a}]`));
    add({
      id: "a11y-aria-ref",
      category: "accessibility",
      label: "ARIA references resolve",
      status: !anyRefs ? "skip" : dangling.length ? "fail" : "pass",
      found: !anyRefs ? "no ARIA references" : dangling.length ? dangling.join(", ") : "all references resolve",
      expected: "Every aria-labelledby / describedby / controls points at an id in the document.",
      fix: dangling.length ? "Fix the id, or add the element it should point to." : null,
      severity: "moderate",
    });
  }
  {
    const headings = Array.from(body.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    let skip = "";
    let prev = 0;
    for (const h of headings) {
      const lvl = Number(h.tagName[1]);
      if (prev && lvl > prev + 1) skip = `h${prev} → h${lvl}`;
      prev = lvl;
    }
    add({
      id: "a11y-heading-order",
      category: "accessibility",
      label: "Heading levels don't skip",
      status: headings.length === 0 ? "skip" : skip ? "warn" : "pass",
      found: headings.length === 0 ? "no headings" : skip ? `jump ${skip}` : "sequential",
      expected: "Headings step down one level at a time (h1 → h2 → h3).",
      fix: skip ? "Use the next heading level down, or restyle instead of jumping." : null,
      severity: "minor",
    });
  }
  {
    // Focus ring: only flags a real signal (inline outline removal).
    const killed = Array.from(body.querySelectorAll("[style]")).filter((el) =>
      /outline\s*:\s*(none|0)/i.test(el.getAttribute("style") ?? ""),
    );
    const anyStyle = body.querySelector("[style]");
    add({
      id: "a11y-focus-ring",
      category: "accessibility",
      label: "Focus indicator not removed",
      status: !anyStyle ? "skip" : killed.length ? "fail" : "pass",
      found: !anyStyle ? "no inline styles to check (verify in CSS)" : killed.length ? `${killed.length} element(s) set outline:none` : "no inline outline removal",
      expected: "Focus outlines stay visible (or are replaced with a :focus-visible style).",
      fix: killed.length ? "Remove outline:none, or pair it with a visible :focus-visible ring." : null,
      severity: "serious",
    });
  }

  /* ------------------------------------------------------------- validity */
  {
    const bad = Array.from(body.querySelectorAll("div, span")).filter(
      (el) => el.hasAttribute("onclick") && el.getAttribute("role") !== "button" && el.getAttribute("role") !== "link",
    );
    const jsxBad = parsed.isJSX && /<(div|span)[^>]*onClick=/.test(parsed.raw);
    add({
      id: "valid-semantic",
      category: "validity",
      label: "Clickable elements are semantic",
      status: bad.length || jsxBad ? "fail" : "pass",
      found: bad.length ? `${bad.length} <div|span onclick>` : jsxBad ? "<div|span onClick> in JSX" : "no clickable div/span",
      expected: "Actions use <button>; navigation uses <a>. Not a div with a click handler.",
      fix: bad.length || jsxBad ? "Replace the clickable div/span with a <button> (or <a> if it navigates)." : null,
      severity: "serious",
    });
  }
  {
    const nested =
      body.querySelector("a a, button button, a button, button a, a [role='button'], button [role='link']") !== null;
    add({
      id: "valid-nested-interactive",
      category: "validity",
      label: "No nested interactive elements",
      status: nested ? "fail" : "pass",
      found: nested ? "interactive element inside another" : "none nested",
      expected: "Buttons and links are never nested inside each other.",
      fix: nested ? "Flatten the structure so only one interactive element wraps the content." : null,
      severity: "serious",
    });
  }
  {
    const roles = Array.from(body.querySelectorAll("[role]"));
    const invalid = roles
      .map((el) => el.getAttribute("role") ?? "")
      .filter((r) => r && !VALID_ROLES.has(r.toLowerCase()));
    add({
      id: "valid-aria-role",
      category: "validity",
      label: "ARIA roles are valid",
      status: roles.length === 0 ? "skip" : invalid.length ? "fail" : "pass",
      found: roles.length === 0 ? "no roles used" : invalid.length ? `invalid: ${[...new Set(invalid)].join(", ")}` : "all roles valid",
      expected: "Every role= is a real ARIA role.",
      fix: invalid.length ? "Correct the role name, or drop it if the native element already implies it." : null,
      severity: "moderate",
    });
  }
  {
    const seen = new Map<string, number>();
    for (const el of body.querySelectorAll("[id]")) {
      const id = el.getAttribute("id") ?? "";
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }
    const dups = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    add({
      id: "valid-dup-id",
      category: "validity",
      label: "Element ids are unique",
      status: seen.size === 0 ? "skip" : dups.length ? "fail" : "pass",
      found: seen.size === 0 ? "no ids" : dups.length ? `duplicated: ${dups.join(", ")}` : "all unique",
      expected: "Each id appears at most once.",
      fix: dups.length ? "Rename the duplicate ids so each is unique." : null,
      severity: "moderate",
    });
  }

  /* --------------------------------------------------------------- wiring */
  {
    const hasHandler = HANDLER_RE.test(parsed.raw);
    add({
      id: "wire-handler",
      category: "wiring",
      label: "Interactive elements are wired to a handler",
      status: interactives.length === 0 ? "skip" : hasHandler ? "pass" : "warn",
      found: interactives.length === 0 ? "no interactive elements" : hasHandler ? `handler detected (${parsed.framework})` : "no handler found in markup",
      expected: "Actions have an event handler (onclick, onClick, @click, on:click, addEventListener…).",
      fix: !hasHandler && interactives.length ? "Wire the control to a handler — or confirm it's bound in code outside this snippet." : null,
      severity: "serious",
    });
  }
  {
    const dead = Array.from(body.querySelectorAll("a[href]")).filter((a) => {
      const h = (a.getAttribute("href") ?? "").trim();
      return h === "#" || h === "" || /^javascript:\s*void/i.test(h);
    });
    const anchors = body.querySelectorAll("a[href]");
    add({
      id: "wire-dead-link",
      category: "wiring",
      label: "Links point somewhere real",
      status: anchors.length === 0 ? "skip" : dead.length ? "fail" : "pass",
      found: anchors.length === 0 ? "no links" : dead.length ? `${dead.length} dead href` : "all links have a destination",
      expected: 'href is a real URL — not "#", empty, or javascript:void.',
      fix: dead.length ? "Give the link a real href, or make it a <button> if it triggers an action." : null,
      severity: "moderate",
    });
  }
  {
    const blank = Array.from(body.querySelectorAll('a[target="_blank"]'));
    const unsafe = blank.filter((a) => !/\bnoopener\b/.test(a.getAttribute("rel") ?? ""));
    add({
      id: "wire-target-rel",
      category: "wiring",
      label: "New-tab links are safe",
      status: blank.length === 0 ? "skip" : unsafe.length ? "fail" : "pass",
      found: blank.length === 0 ? "no _blank links" : unsafe.length ? `${unsafe.length} missing rel=noopener` : "all safe",
      expected: 'target="_blank" links include rel="noopener".',
      fix: unsafe.length ? 'Add rel="noopener" (or "noopener noreferrer") to each _blank link.' : null,
      severity: "minor",
    });
  }

  const scored = checks.filter((c) => c.status !== "skip");
  const passed = scored.filter((c) => c.status === "pass").length;
  const total = scored.length;
  const skipped = checks.length - total;
  const pct = total ? Math.round((passed / total) * 100) : 100;
  const grade =
    pct >= 100 ? "A+" : pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "F";
  const critical = checks.filter(
    (c) => c.status === "fail" && (c.severity === "critical" || c.severity === "serious"),
  ).length;
  const warnings = checks.filter(
    (c) => c.status === "warn" || (c.status === "fail" && (c.severity === "moderate" || c.severity === "minor")),
  ).length;

  return { checks, passed, total, skipped, pct, grade, critical, warnings, framework: parsed.framework };
}

/* --------------------------------------------------------- Markdown report */

export interface ReportMeta {
  client: string;
  auditor: string;
  date: string;
  component?: string;
}

const SEV_ORDER: Severity[] = ["critical", "serious", "moderate", "minor"];

export function toMarkdown(result: AuditResult, meta: ReportMeta): string {
  const lines: string[] = [];
  lines.push(`# Accessibility & Markup Audit`);
  lines.push("");
  lines.push(`- **Client:** ${meta.client || "—"}`);
  lines.push(`- **Auditor:** ${meta.auditor || "UJG Digital Library"}`);
  lines.push(`- **Date:** ${meta.date}`);
  if (meta.component) lines.push(`- **Component:** ${meta.component}`);
  lines.push(`- **Detected as:** ${result.framework}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`**${result.passed}/${result.total} checks passed (${result.pct}%) · Grade ${result.grade}** — ${result.critical} critical, ${result.warnings} warnings.`);
  lines.push("");
  lines.push(`| Category | Passed | Total |`);
  lines.push(`| --- | --- | --- |`);
  for (const cat of ["accessibility", "validity", "wiring"] as Category[]) {
    const inCat = result.checks.filter((c) => c.category === cat && c.status !== "skip");
    const p = inCat.filter((c) => c.status === "pass").length;
    lines.push(`| ${CATEGORY_LABEL[cat]} | ${p} | ${inCat.length} |`);
  }
  lines.push("");

  const fails = result.checks
    .filter((c) => c.status === "fail" || c.status === "warn")
    .sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));
  if (fails.length) {
    lines.push(`## Issues to fix`);
    lines.push("");
    for (const c of fails) {
      lines.push(`### ${c.status === "fail" ? "✗" : "▲"} ${c.label} · _${c.severity}_`);
      lines.push(`- **Found:** ${c.found}`);
      lines.push(`- **Expected:** ${c.expected}`);
      if (c.fix) lines.push(`- **Fix:** ${c.fix}`);
      lines.push("");
    }
  } else {
    lines.push(`## Issues to fix`);
    lines.push("");
    lines.push(`None — every scored check passed.`);
    lines.push("");
  }

  lines.push(`## All results`);
  lines.push("");
  for (const cat of ["accessibility", "validity", "wiring"] as Category[]) {
    lines.push(`### ${CATEGORY_LABEL[cat]}`);
    lines.push("");
    lines.push(`| Check | Status | Severity | Found |`);
    lines.push(`| --- | --- | --- | --- |`);
    for (const c of result.checks.filter((c) => c.category === cat)) {
      lines.push(`| ${c.label} | ${c.status} | ${c.severity} | ${c.found} |`);
    }
    lines.push("");
  }
  lines.push(`---`);
  lines.push(`_Generated by the UJG Digital Asset Library auditor._`);
  return lines.join("\n");
}
