import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Reference library content layer.
 *
 * Broader design/system references (design styles, layout styles, screen and
 * feature taxonomies, resources) — distinct from the per-component docs in
 * content/docs. Each is one Markdown file in content/reference/<slug>.md with
 * lightweight frontmatter. Read on the server, like lib/content.ts.
 */

export interface ReferenceDoc {
  title: string;
  slug: string;
  group: string;
  order: number;
  summary: string;
  body: string;
}

export interface ReferenceGroup {
  group: string;
  docs: ReferenceDoc[];
}

const DIR = path.join(process.cwd(), "content", "reference");

/** Preferred group order; unknown groups sort after these. */
const GROUP_ORDER = ["Design System", "Screens", "Features", "Resources"];

let cache: ReferenceDoc[] | null = null;

function readAll(): ReferenceDoc[] {
  if (cache) return cache;
  if (!fs.existsSync(DIR)) {
    cache = [];
    return cache;
  }
  const files = fs
    .readdirSync(DIR)
    .filter((f) => (f.endsWith(".md") || f.endsWith(".mdx")) && !f.startsWith("_"));

  const docs = files.map((file) => {
    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = data as Partial<ReferenceDoc>;
    const slug = fm.slug ?? file.replace(/\.mdx?$/, "");
    return {
      title: fm.title ?? slug,
      slug,
      group: fm.group ?? "Reference",
      order: typeof fm.order === "number" ? fm.order : 999,
      summary: fm.summary ?? "",
      body: content.trim(),
    } satisfies ReferenceDoc;
  });

  docs.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  cache = docs;
  return cache;
}

export function getAllReference(): ReferenceDoc[] {
  return readAll();
}

export function getReference(slug: string): ReferenceDoc | undefined {
  return readAll().find((d) => d.slug === slug);
}

export function getReferenceSlugs(): string[] {
  return readAll().map((d) => d.slug);
}

export function getReferenceGroups(): ReferenceGroup[] {
  const byGroup = new Map<string, ReferenceDoc[]>();
  for (const doc of readAll()) {
    const list = byGroup.get(doc.group) ?? [];
    list.push(doc);
    byGroup.set(doc.group, list);
  }
  return [...byGroup.entries()]
    .map(([group, docs]) => ({ group, docs }))
    .sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.group);
      const bi = GROUP_ORDER.indexOf(b.group);
      if (ai === -1 && bi === -1) return a.group.localeCompare(b.group);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
}
