/**
 * Code generation for the Build Hub composer.
 *
 * Turns the canvas stack into source for the selected language target. Three
 * targets emit real code today (see lib/targets.ts); the rest return an honest
 * note rather than plausible-looking output nobody has verified.
 */

import { TARGETS_BY_KEY } from "@/lib/targets";
import type { StackItem } from "./types";

const esc = (s: string) => String(s).replace(/"/g, "&quot;");
const id = (item: StackItem) => `${item.slug}-${item.uid}`;

function htmlFor(item: StackItem): string {
  const p = item.props;
  switch (item.slug) {
    case "field":
      return [
        `  <div class="field${p.error ? " field--error" : ""}">`,
        `    <label class="field__label" for="${id(item)}">${p.label}${p.required ? ' <span aria-hidden="true">*</span>' : ""}</label>`,
        `    <input class="field__control" id="${id(item)}" type="${p.type ?? "text"}" placeholder="${esc(String(p.placeholder ?? ""))}"${p.required ? " required" : ""}${p.help ? ` aria-describedby="${id(item)}-help"` : ""}${p.error ? ' aria-invalid="true"' : ""} />`,
        p.help ? `    <p class="field__help" id="${id(item)}-help">${p.help}</p>` : "",
        `  </div>`,
      ].filter(Boolean).join("\n");
    case "checkbox":
      return [
        `  <div class="checkbox">`,
        `    <input class="checkbox__input" id="${id(item)}" type="checkbox"${p.checked ? " checked" : ""} />`,
        `    <label class="checkbox__label" for="${id(item)}">${p.label}</label>`,
        `  </div>`,
      ].join("\n");
    case "button":
      return `  <button class="btn btn--${p.variant} btn--${p.size}${p.block ? " btn--block" : ""}" type="button"${p.loading ? ' aria-busy="true" disabled' : ""}>${p.label}</button>`;
    case "alert":
      return [
        `  <div class="alert alert--${p.tone}" role="${p.tone === "danger" ? "alert" : "status"}">`,
        `    <span class="alert__icon" aria-hidden="true"></span>`,
        `    <p class="alert__text">${p.label}</p>`,
        `  </div>`,
      ].join("\n");
    case "badge":
      return `  <span class="badge badge--${p.tone}">${p.label}</span>`;
    case "divider":
      return p.label
        ? `  <div class="divider divider--labelled" role="separator"><span>${p.label}</span></div>`
        : `  <hr class="divider" />`;
    case "blockquote":
      return [
        `  <blockquote class="blockquote">`,
        `    <p>${p.label}</p>`,
        p.help ? `    <cite>${p.help}</cite>` : "",
        `  </blockquote>`,
      ].filter(Boolean).join("\n");
    default:
      return `  <!-- ${item.name}: renderer pending -->`;
  }
}

function jsxFor(item: StackItem, ts: boolean): string {
  const p = item.props;
  switch (item.slug) {
    case "field":
      return [
        `      <Field`,
        `        label="${esc(String(p.label))}"`,
        `        type="${p.type ?? "text"}"`,
        p.placeholder ? `        placeholder="${esc(String(p.placeholder))}"` : "",
        p.help ? `        help="${esc(String(p.help))}"` : "",
        p.required ? `        required` : "",
        p.error ? `        error="Enter a valid ${p.type ?? "value"}."` : "",
        `      />`,
      ].filter(Boolean).join("\n");
    case "checkbox":
      return `      <Checkbox label="${esc(String(p.label))}"${p.checked ? " defaultChecked" : ""} />`;
    case "button":
      return `      <Button variant="${p.variant}" size="${p.size}"${p.block ? " block" : ""}${p.loading ? " loading" : ""}>${p.label}</Button>`;
    case "alert":
      return `      <Alert tone="${p.tone}">${p.label}</Alert>`;
    case "badge":
      return `      <Badge tone="${p.tone}">${p.label}</Badge>`;
    case "divider":
      return p.label ? `      <Divider label="${esc(String(p.label))}" />` : `      <Divider />`;
    case "blockquote":
      return `      <Blockquote${p.help ? ` cite="${esc(String(p.help))}"` : ""}>${p.label}</Blockquote>`;
    default:
      return `      {/* ${item.name}: renderer pending */}`;
  }
}

function importsFor(stack: StackItem[]): string {
  const seen = new Set<string>();
  for (const item of stack) {
    const pascal = item.slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
    if (["Field", "Checkbox", "Button", "Alert", "Badge", "Divider", "Blockquote"].includes(pascal)) {
      seen.add(pascal);
    }
  }
  return [...seen]
    .sort()
    .map((n) => `import { ${n} } from "@/components/${n.toLowerCase()}/${n}";`)
    .join("\n");
}

export function generate(
  stack: StackItem[],
  target: string,
  skin: string,
  title: string,
): string {
  const t = TARGETS_BY_KEY[target];
  const componentName = title.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase()) || "Composition";

  if (!t?.emit) {
    return [
      `// ${t?.label ?? target} generator lands with the export pipeline (Phase 4).`,
      `//`,
      `// The stack is ${stack.length} component${stack.length === 1 ? "" : "s"} and the docs`,
      `// already carry ${t?.label ?? target} snippets in their frontmatter — the composer`,
      `// just doesn't assemble them yet. Switch to HTML, React, or React + TypeScript`,
      `// to see real output, or copy the per-component snippet from its doc page.`,
    ].join("\n");
  }

  if (target === "html") {
    return [
      `<!-- ${title} · ${skin} skin · generated by the Build Hub -->`,
      `<div class="stack" data-style="${skin}">`,
      ...stack.map(htmlFor),
      `</div>`,
    ].join("\n");
  }

  const ts = target === "react-ts";
  const imports = importsFor(stack);
  return [
    ts ? `import type { ReactElement } from "react";` : "",
    imports,
    "",
    `/** ${title} — generated by the Build Hub · ${skin} skin. */`,
    `export function ${componentName}()${ts ? ": ReactElement" : ""} {`,
    `  return (`,
    `    <div className="stack" data-style="${skin}">`,
    ...stack.map((item) => jsxFor(item, ts)),
    `    </div>`,
    `  );`,
    `}`,
  ].filter((line) => line !== "").join("\n");
}

export function fileList(stack: StackItem[], target: string, title: string): string[] {
  const t = TARGETS_BY_KEY[target];
  const base = title.replace(/[^a-zA-Z0-9]+/g, "") || "Composition";
  const slugs = [...new Set(stack.map((i) => i.slug))].sort();
  return [
    `${base}.${t?.ext ?? "txt"}`,
    ...slugs.map((s) => `${s}.css`),
    "tokens.css",
    "README.md",
  ];
}
