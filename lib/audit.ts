/**
 * Static accessibility + markup auditor for the Build Hub.
 *
 * Parses an HTML string in the browser (DOMParser) and runs a set of
 * heuristic checks — the kind a senior reviewer eyeballs first: accessible
 * names, labels, semantics, heading order, duplicate ids, dangling ARIA
 * references. It is deliberately conservative: every finding points at a real
 * element and a fixable cause. It does not replace an axe-core run; it catches
 * the mistakes that make it into hand-written markup.
 *
 * Client-only (needs DOMParser). Guarded so an accidental server import is a
 * no-op rather than a crash.
 */

export type Severity = "error" | "warning" | "info";

export interface Finding {
  severity: Severity;
  rule: string;
  message: string;
  /** A short snippet of the offending element, for context. */
  snippet?: string;
}

export interface AuditReport {
  findings: Finding[];
  score: number;
  counts: { error: number; warning: number; info: number };
  elements: number;
  ok: boolean;
}

const PENALTY: Record<Severity, number> = { error: 9, warning: 4, info: 1 };

function snippetOf(el: Element): string {
  const html = el.outerHTML ?? "";
  const open = html.split(">")[0] + ">";
  return open.length > 120 ? open.slice(0, 117) + "…>" : open;
}

function accessibleName(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria && aria.trim()) return aria.trim();
  const labelledby = el.getAttribute("aria-labelledby");
  if (labelledby && labelledby.trim()) return "ref";
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text;
  const title = el.getAttribute("title");
  if (title && title.trim()) return title.trim();
  // An <img alt> inside counts as a name.
  const img = el.querySelector("img[alt]");
  if (img && (img.getAttribute("alt") ?? "").trim()) return "img";
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
  if (el.tagName === "INPUT" && (type === "hidden" || type === "submit" || type === "button" || type === "reset")) {
    return true; // these don't need a <label>
  }
  return false;
}

export function runAudit(html: string): AuditReport {
  const empty: AuditReport = {
    findings: [],
    score: 100,
    counts: { error: 0, warning: 0, info: 0 },
    elements: 0,
    ok: true,
  };
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return empty;
  const source = html.trim();
  if (!source) return empty;

  const doc = new DOMParser().parseFromString(source, "text/html");
  const findings: Finding[] = [];
  const add = (severity: Severity, rule: string, message: string, el?: Element) =>
    findings.push({ severity, rule, message, snippet: el ? snippetOf(el) : undefined });

  const all = Array.from(doc.body.querySelectorAll("*"));

  // Images need alt (alt="" is allowed = decorative).
  for (const img of doc.body.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) {
      add("error", "img-alt", "Image has no alt attribute — add alt text, or alt=\"\" if decorative.", img);
    }
  }

  // Links.
  for (const a of doc.body.querySelectorAll("a")) {
    if (!a.hasAttribute("href")) {
      add("warning", "link-href", "Anchor without href isn't keyboard-focusable — use a <button> for actions.", a);
    } else if (!accessibleName(a)) {
      add("error", "link-name", "Link has no accessible name (no text, aria-label, or titled child).", a);
    }
    const target = a.getAttribute("target");
    const rel = a.getAttribute("rel") ?? "";
    if (target === "_blank" && !/\bnoopener\b/.test(rel)) {
      add("warning", "link-rel", "target=\"_blank\" without rel=\"noopener\" is a tab-nabbing risk.", a);
    }
  }

  // Buttons.
  for (const btn of doc.body.querySelectorAll("button")) {
    if (!accessibleName(btn)) {
      add("error", "button-name", "Button has no accessible name — add text or an aria-label.", btn);
    }
    if (!btn.hasAttribute("type")) {
      add("info", "button-type", "Button has no explicit type — defaults to submit inside a form.", btn);
    }
  }

  // Form controls need a label.
  for (const ctrl of doc.body.querySelectorAll("input, select, textarea")) {
    if (!hasLabel(ctrl, doc)) {
      add("error", "control-label", "Form control has no associated label.", ctrl);
    }
  }

  // Clickable non-interactive elements.
  for (const el of all) {
    const tag = el.tagName.toLowerCase();
    if ((tag === "div" || tag === "span") && el.hasAttribute("onclick")) {
      const role = el.getAttribute("role");
      if (role !== "button" && role !== "link") {
        add("error", "clickable-div", `<${tag} onclick> is not keyboard-accessible — use a <button>.`, el);
      }
    }
    const ti = el.getAttribute("tabindex");
    if (ti && Number(ti) > 0) {
      add("warning", "tabindex", "Positive tabindex fights the natural tab order — use 0 or -1.", el);
    }
  }

  // Duplicate ids.
  const seen = new Map<string, number>();
  for (const el of doc.body.querySelectorAll("[id]")) {
    const id = el.getAttribute("id") ?? "";
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) add("error", "dup-id", `id="${id}" appears ${count} times — ids must be unique.`);
  }

  // Dangling ARIA references.
  for (const attr of ["aria-labelledby", "aria-describedby", "aria-controls"]) {
    for (const el of doc.body.querySelectorAll(`[${attr}]`)) {
      const ids = (el.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean);
      for (const id of ids) {
        if (!doc.getElementById(id)) {
          add("warning", "aria-ref", `${attr} points at "#${id}", which doesn't exist in this markup.`, el);
        }
      }
    }
  }

  // Heading order.
  const headings = Array.from(doc.body.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  let prev = 0;
  for (const h of headings) {
    const level = Number(h.tagName[1]);
    if (prev && level > prev + 1) {
      add("warning", "heading-skip", `Heading jumps from h${prev} to h${level} — don't skip levels.`, h);
    }
    prev = level;
  }
  if (doc.body.querySelectorAll("h1").length > 1) {
    add("info", "multiple-h1", "More than one h1 — a page usually has exactly one.");
  }

  // Autoplay media.
  for (const media of doc.body.querySelectorAll("audio[autoplay], video[autoplay]")) {
    add("warning", "autoplay", "Autoplaying media is disorienting and a WCAG 1.4.2 concern.", media);
  }

  const counts = { error: 0, warning: 0, info: 0 };
  let penalty = 0;
  for (const f of findings) {
    counts[f.severity] += 1;
    penalty += PENALTY[f.severity];
  }
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    findings: findings.sort(
      (a, b) =>
        ["error", "warning", "info"].indexOf(a.severity) -
        ["error", "warning", "info"].indexOf(b.severity),
    ),
    score,
    counts,
    elements: all.length,
    ok: counts.error === 0,
  };
}
