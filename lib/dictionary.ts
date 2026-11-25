import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Dictionary content layer.
 *
 * Each term is one file in `content/terms/<slug>.mdx`: frontmatter (the term,
 * its domain, status, sources) + a Markdown body on the 10-section bar from
 * the Dictionary / Term Asset Template (`content/terms/_TERM_TEMPLATE.mdx`).
 * Read on the server, like lib/content.ts and lib/reference.ts. Entries are
 * grouped by `domain`, the way reference docs group by `group`.
 */

export type TermStatus = "drafting" | "defined" | "researched" | "verified";

export interface TermSource {
  title: string;
  url: string;
  kind?: string;
}

export interface TermDoc {
  term: string;
  slug: string;
  domain: string;
  status: TermStatus;
  summary: string;
  aliases: string[];
  tags: string[];
  sources: TermSource[];
  related: string[];
  body: string;
}

export interface TermGroup {
  domain: string;
  terms: TermDoc[];
}

const DIR = path.join(process.cwd(), "content", "terms");

let cache: TermDoc[] | null = null;

function readAll(): TermDoc[] {
  if (cache) return cache;
  if (!fs.existsSync(DIR)) {
    cache = [];
    return cache;
  }
  const files = fs
    .readdirSync(DIR)
    .filter((f) => (f.endsWith(".md") || f.endsWith(".mdx")) && !f.startsWith("_"));

  const terms = files.map((file) => {
    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = data as Record<string, any>;
    const slug = fm.slug ?? file.replace(/\.mdx?$/, "");
    return {
      term: fm.term ?? slug,
      slug,
      domain: fm.domain ?? "General",
      status: (fm.status as TermStatus) ?? "drafting",
      summary: fm.summary ?? "",
      aliases: Array.isArray(fm.aliases) ? fm.aliases.map(String) : [],
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      sources: Array.isArray(fm.sources)
        ? fm.sources
            .filter((s: any) => s && s.title && s.url)
            .map((s: any) => ({ title: String(s.title), url: String(s.url), kind: s.kind ? String(s.kind) : undefined }))
        : [],
      related: Array.isArray(fm.related) ? fm.related.map(String) : [],
      body: content.trim(),
    } satisfies TermDoc;
  });

  terms.sort((a, b) => a.term.localeCompare(b.term));
  cache = terms;
  return cache;
}

export function getAllTerms(): TermDoc[] {
  return readAll();
}

export function getTerm(slug: string): TermDoc | undefined {
  return readAll().find((t) => t.slug === slug);
}

export function getTermSlugs(): string[] {
  return readAll().map((t) => t.slug);
}

export function getTermGroups(): TermGroup[] {
  const byDomain = new Map<string, TermDoc[]>();
  for (const term of readAll()) {
    const list = byDomain.get(term.domain) ?? [];
    list.push(term);
    byDomain.set(term.domain, list);
  }
  return [...byDomain.entries()]
    .map(([domain, terms]) => ({ domain, terms }))
    .sort((a, b) => a.domain.localeCompare(b.domain));
}
