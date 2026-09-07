import type { DocSnippet } from "@/components/build/types";

/**
 * Shared, client-safe helpers for surfacing the REAL code documented in a
 * component's md file — used by both the Playground and the Build Hub composer
 * so a component's code reads the same everywhere.
 *
 * Pure string work (no fs), so it's safe to import from a client component.
 */

/** Which doc snippet languages satisfy a given code target. */
export const TARGET_SNIPPET_LANGS: Record<string, string[]> = {
  html: ["html"],
  tailwind: ["html"],
  react: ["tsx", "jsx", "typescript", "javascript"],
  "react-ts": ["tsx", "typescript"],
  next: ["tsx", "jsx", "typescript"],
  "react-native": ["tsx", "jsx"],
  vue: ["vue"],
  svelte: ["svelte"],
  angular: ["ts", "typescript"],
  "web-components": ["js", "javascript"],
  swiftui: ["swift"],
  compose: ["kotlin", "kt"],
  flutter: ["dart"],
};

/** Find the documented snippet that best matches a code target, if any. */
export function pickSnippet(
  snippets: DocSnippet[] | undefined,
  targetKey: string,
): DocSnippet | undefined {
  if (!snippets?.length) return undefined;
  const langs = TARGET_SNIPPET_LANGS[targetKey] ?? [];
  const reactish = targetKey === "react" || targetKey === "react-ts" || targetKey === "next" || targetKey === "react-native";
  return (
    snippets.find((s) => langs.includes((s.language ?? "").toLowerCase())) ??
    (reactish ? snippets.find((s) => (s.framework ?? "").toLowerCase() === "react") : undefined)
  );
}

/**
 * Where the canonical code lives in a ported doc body: the numbered "The Code"
 * section (## 9 …). Docs present the primary implementation first inside it, so
 * the first block per language there is the one to show — not some earlier
 * inline teaser or a later test file.
 */
function codeSectionStart(body: string): number {
  const m = body.match(/^#{2,4}\s*(?:9[.)\s]|.*\bthe code\b)/im);
  return m && typeof m.index === "number" ? m.index : 0;
}

function firstBlockPerLang(source: string, into: Map<string, DocSnippet>) {
  const re = /```([a-zA-Z0-9+#-]*)\r?\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const language = (m[1] || "text").toLowerCase();
    const code = m[2].replace(/\s+$/, "");
    if (!code || language === "text" || language === "plain") continue;
    if (!into.has(language)) into.set(language, { language, code });
  }
}

/**
 * Extract documented code from a doc body: the first block of each language
 * inside the "The Code" section (the canonical implementation), falling back to
 * the first block elsewhere for languages that section doesn't cover.
 */
export function extractBodySnippets(body: string): DocSnippet[] {
  const out = new Map<string, DocSnippet>();
  const start = codeSectionStart(body);
  if (start > 0) firstBlockPerLang(body.slice(start), out);
  firstBlockPerLang(body, out); // fill any languages not in the code section
  return [...out.values()];
}
