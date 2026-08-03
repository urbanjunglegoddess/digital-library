import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Content layer for the component catalog (Phase 1).
 *
 * Each component is one file in `content/docs/<slug>.mdx`: YAML frontmatter
 * (structured metadata + code snippets + references) followed by a Markdown
 * body (the deep-spec doc ported from ClickUp 838qa-81211). This module reads
 * and parses them at build/request time on the server.
 *
 * Phase 2 moves this metadata into Supabase; the frontmatter schema here maps
 * 1:1 onto the `components` / `code_snippets` / `references` tables so the port
 * is mechanical.
 */

export type ComponentStatus =
  | "idea"
  | "drafting"
  | "built"
  | "audited"
  | "reusable";

export type ReferenceSource = "mdn" | "so" | "github" | "apg" | "other";

export interface CodeSnippet {
  language: string;
  framework?: string | null;
  label?: string;
  code: string;
  primary?: boolean;
}

export interface DocReference {
  title: string;
  url: string;
  source?: ReferenceSource;
}

export interface PreviewSpec {
  /** Which built-in preview renderer to use in the style switcher. */
  kind?: string;
  /** Text label shown inside the preview (e.g. a button caption). */
  label?: string;
}

export interface ComponentFrontmatter {
  name: string;
  slug: string;
  category: string;
  status: ComponentStatus;
  summary: string;
  clickup_page_id?: string;
  tags: string[];
  /** Which of the 11 skins apply; defaults to all. */
  styles?: string[];
  /** Basename of a playground HTML in public/playgrounds (without extension). */
  playground?: string;
  preview?: PreviewSpec;
  snippets?: CodeSnippet[];
  references?: DocReference[];
}

export interface ComponentDoc extends ComponentFrontmatter {
  /** Markdown body (the deep-spec doc). */
  body: string;
}

export interface CategoryGroup {
  category: string;
  components: ComponentDoc[];
}

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export const ALL_STYLES = [
  "ujg",
  "flat",
  "material",
  "glass",
  "liquid",
  "neu",
  "skeu",
  "brut",
  "clay",
  "aurora",
  "swiss",
] as const;

export const STYLE_NAMES: Record<string, string> = {
  ujg: "UJG",
  flat: "Flat",
  material: "Material",
  glass: "Glassmorphism",
  liquid: "Liquid Glass",
  neu: "Neumorphism",
  skeu: "Skeuomorphism",
  brut: "Neo-Brutalism",
  clay: "Claymorphism",
  aurora: "Aurora",
  swiss: "Swiss",
};

/** Preferred category display order; unknown categories sort after these. */
const CATEGORY_ORDER = [
  "Actions",
  "Inputs & Forms",
  "Navigation",
  "Overlays & Popouts",
  "Feedback & Status",
  "Data Display",
  "Media",
  "Layout & Structure",
  "Marketing & Content",
  "Utilities",
];

let cache: ComponentDoc[] | null = null;

function readAll(): ComponentDoc[] {
  if (cache) return cache;
  if (!fs.existsSync(DOCS_DIR)) {
    cache = [];
    return cache;
  }

  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const docs = files.map((file) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = data as Partial<ComponentFrontmatter>;
    const slug = fm.slug ?? file.replace(/\.mdx?$/, "");

    return {
      name: fm.name ?? slug,
      slug,
      category: fm.category ?? "Utilities",
      status: (fm.status ?? "drafting") as ComponentStatus,
      summary: fm.summary ?? "",
      clickup_page_id: fm.clickup_page_id,
      tags: fm.tags ?? [],
      styles:
        fm.styles && fm.styles.length ? fm.styles : [...ALL_STYLES],
      playground: fm.playground,
      preview: fm.preview,
      snippets: fm.snippets ?? [],
      references: fm.references ?? [],
      body: content.trim(),
    } satisfies ComponentDoc;
  });

  docs.sort((a, b) => a.name.localeCompare(b.name));
  cache = docs;
  return cache;
}

export function getAllComponents(): ComponentDoc[] {
  return readAll();
}

export function getComponent(slug: string): ComponentDoc | undefined {
  return readAll().find((d) => d.slug === slug);
}

export function getAllSlugs(): string[] {
  return readAll().map((d) => d.slug);
}

export function getCategories(): CategoryGroup[] {
  const byCat = new Map<string, ComponentDoc[]>();
  for (const doc of readAll()) {
    const list = byCat.get(doc.category) ?? [];
    list.push(doc);
    byCat.set(doc.category, list);
  }

  return [...byCat.entries()]
    .map(([category, components]) => ({ category, components }))
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.category);
      const bi = CATEGORY_ORDER.indexOf(b.category);
      if (ai === -1 && bi === -1) return a.category.localeCompare(b.category);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const doc of readAll()) {
    for (const tag of doc.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function playgroundExists(basename?: string): boolean {
  if (!basename) return false;
  return fs.existsSync(
    path.join(process.cwd(), "public", "playgrounds", `${basename}.html`),
  );
}
