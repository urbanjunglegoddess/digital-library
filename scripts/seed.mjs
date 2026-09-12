#!/usr/bin/env node
/**
 * Port the MDX component docs into Supabase (Phase 2).
 *
 * `content/docs/<slug>.mdx` is the authored source of truth: YAML frontmatter
 * (structured metadata, code snippets, references) plus the deep-spec Markdown
 * body from ClickUp 838qa-81211. This script mirrors that into the relational
 * tables so the app can query, filter and full-text search it.
 *
 *   node scripts/seed.mjs             # upsert everything
 *   node scripts/seed.mjs --dry-run   # report what would change, write nothing
 *   node scripts/seed.mjs --prune     # also delete DB components with no MDX
 *
 * Idempotent: components are upserted on `slug`, and each component's child
 * rows (snippets, tags, references, styles) are replaced wholesale inside one
 * transaction, so re-running converges rather than duplicating.
 *
 * It connects straight to Postgres rather than going through PostgREST because
 * seeding is an admin operation that must write past RLS, and doing it over the
 * same connection as the migrations keeps one credential path instead of two.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import pg from "pg";
import { loadEnv, pgConfig } from "./lib/env.mjs";
// Imported as TypeScript directly — Node strips the types. Sharing the module
// with the app keeps one definition of "which code block is the canonical one",
// instead of a copy here that drifts from what the UI shows.
import { extractBodySnippets } from "../lib/snippets.ts";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const prune = args.has("--prune");

/** Matches the display order in lib/content.ts. */
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

const VALID_STATUS = new Set(["idea", "drafting", "built", "audited", "reusable"]);
const VALID_SOURCE = new Set(["mdn", "so", "github", "apg", "other"]);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleize(slug) {
  return String(slug)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Frontmatter values that carry a trailing "# a | b | c" hint comment parse as
 * a string with the comment attached (YAML only strips `#` when it follows
 * whitespace outside a value). Take the first token and validate it.
 */
function cleanScalar(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return String(value).split("#")[0].trim() || fallback;
}

function inferSource(url) {
  const u = String(url);
  if (/w3\.org\/WAI\/ARIA\/apg/i.test(u)) return "apg";
  if (/developer\.mozilla\.org/i.test(u)) return "mdn";
  if (/stackoverflow\.com/i.test(u)) return "so";
  if (/github\.com/i.test(u)) return "github";
  return "other";
}

function readDocs() {
  const files = readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .filter((f) => !f.startsWith("_") && !/^readme\.mdx?$/i.test(f))
    .sort();

  return files.map((file) => {
    const { data, content } = matter(readFileSync(path.join(DOCS_DIR, file), "utf8"));
    const slug = cleanScalar(data.slug, file.replace(/\.mdx?$/, ""));
    const status = cleanScalar(data.status, "drafting");
    const category = cleanScalar(data.category, "Utilities");
    const body = content.trim();

    // Most docs carry their code in the "## 9. The Code" section rather than in
    // frontmatter. Prefer the curated frontmatter snippets where an author
    // wrote them, and fall back to the documented body code otherwise — the
    // same precedence the Workspace and Build Hub already use, so the DB's
    // language facets match the code the UI actually shows.
    const frontmatterSnippets = (Array.isArray(data.snippets) ? data.snippets : [])
      .filter((s) => s && s.code)
      .map((s) => ({
        language: cleanScalar(s.language, "text").toLowerCase(),
        // `framework: null` in YAML round-trips as the string "null".
        framework:
          cleanScalar(s.framework, "") && cleanScalar(s.framework, "") !== "null"
            ? cleanScalar(s.framework, "")
            : null,
        code: String(s.code),
        isPrimary: Boolean(s.primary),
      }));

    const snippets = frontmatterSnippets.length
      ? frontmatterSnippets
      : extractBodySnippets(body).map((s, i) => ({
          language: String(s.language).toLowerCase(),
          framework: null,
          code: String(s.code),
          isPrimary: i === 0,
        }));

    return {
      file,
      slug,
      name: cleanScalar(data.name, slug),
      category,
      categorySlug: slugify(category),
      status: VALID_STATUS.has(status) ? status : "drafting",
      summary: cleanScalar(data.summary, "") || null,
      clickupPageId: cleanScalar(data.clickup_page_id, "") || null,
      tags: (Array.isArray(data.tags) ? data.tags : [])
        .map((t) => slugify(t))
        .filter(Boolean),
      styles: (Array.isArray(data.styles) ? data.styles : [])
        .map((s) => cleanScalar(s, "").toLowerCase())
        .filter(Boolean),
      snippets,
      references: (Array.isArray(data.references) ? data.references : [])
        .filter((r) => r && r.url)
        .map((r) => {
          const source = cleanScalar(r.source, "") || inferSource(r.url);
          return {
            title: cleanScalar(r.title, "") || String(r.url),
            url: String(r.url).trim(),
            source: VALID_SOURCE.has(source) ? source : "other",
          };
        }),
      meta: {
        ...(data.playground ? { playground: cleanScalar(data.playground, "") } : {}),
        ...(data.preview && typeof data.preview === "object"
          ? { preview: data.preview }
          : {}),
      },
      body,
    };
  });
}

async function main() {
  const docs = readDocs();
  if (docs.length === 0) {
    console.error(`No component docs found in ${DOCS_DIR}`);
    process.exit(1);
  }

  const dupes = docs
    .map((d) => d.slug)
    .filter((s, i, arr) => arr.indexOf(s) !== i);
  if (dupes.length) {
    console.error(`Duplicate slugs in content/docs: ${[...new Set(dupes)].join(", ")}`);
    process.exit(1);
  }

  const { databaseUrl, projectRef } = loadEnv();
  if (!databaseUrl) {
    console.error("No database connection string. Set SUPABASE_DB_URL in .env.local.");
    process.exit(1);
  }

  const client = new pg.Client(pgConfig(databaseUrl));
  await client.connect();
  console.log(
    `connected: ${new URL(databaseUrl).host}${projectRef ? `  (project ${projectRef})` : ""}`,
  );
  console.log(`${docs.length} component docs found in content/docs`);

  if (dryRun) {
    const byCategory = new Map();
    for (const d of docs) byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + 1);
    for (const [cat, n] of [...byCategory].sort()) console.log(`  ${String(n).padStart(3)}  ${cat}`);
    console.log(
      `  snippets: ${docs.reduce((n, d) => n + d.snippets.length, 0)}` +
        `  refs: ${docs.reduce((n, d) => n + d.references.length, 0)}` +
        `  tags: ${new Set(docs.flatMap((d) => d.tags)).size} distinct`,
    );
    console.log("dry run — nothing written.");
    await client.end();
    return;
  }

  try {
    await client.query("begin");

    // --- categories --------------------------------------------------------
    const categories = [...new Map(docs.map((d) => [d.categorySlug, d.category])).entries()];
    for (const [slug, name] of categories) {
      const order = CATEGORY_ORDER.indexOf(name);
      await client.query(
        `insert into public.categories (slug, name, sort) values ($1, $2, $3)
         on conflict (slug) do update set name = excluded.name, sort = excluded.sort`,
        [slug, name, order === -1 ? 99 : order + 1],
      );
    }

    // --- tags --------------------------------------------------------------
    const tagSlugs = [...new Set(docs.flatMap((d) => d.tags))];
    for (const slug of tagSlugs) {
      await client.query(
        `insert into public.tags (slug, name) values ($1, $2)
         on conflict (slug) do update set name = excluded.name`,
        [slug, titleize(slug)],
      );
    }

    const categoryIds = new Map(
      (await client.query("select id, slug from public.categories")).rows.map((r) => [r.slug, r.id]),
    );
    const tagIds = new Map(
      (await client.query("select id, slug from public.tags")).rows.map((r) => [r.slug, r.id]),
    );
    const styleIds = new Map(
      (await client.query("select id, key from public.visual_styles")).rows.map((r) => [r.key, r.id]),
    );

    const unknownStyles = new Set();
    let snippetCount = 0;
    let refCount = 0;
    let styleLinkCount = 0;

    // --- components + children --------------------------------------------
    for (const doc of docs) {
      const { rows } = await client.query(
        `insert into public.components
           (slug, name, category_id, status, summary, doc_md, clickup_page_id, meta)
         values ($1, $2, $3, $4::public.component_status, $5, $6, $7, $8::jsonb)
         on conflict (slug) do update set
           name            = excluded.name,
           category_id     = excluded.category_id,
           status          = excluded.status,
           summary         = excluded.summary,
           doc_md          = excluded.doc_md,
           clickup_page_id = excluded.clickup_page_id,
           meta            = excluded.meta
         returning id`,
        [
          doc.slug,
          doc.name,
          categoryIds.get(doc.categorySlug) ?? null,
          doc.status,
          doc.summary,
          doc.body,
          doc.clickupPageId,
          JSON.stringify(doc.meta),
        ],
      );
      const componentId = rows[0].id;

      // Children are authored wholesale in the MDX, so replace rather than
      // merge — that way a snippet deleted from a doc disappears from the DB.
      await client.query("delete from public.code_snippets where component_id = $1", [componentId]);
      for (const s of doc.snippets) {
        await client.query(
          `insert into public.code_snippets (component_id, language, framework, code, is_primary)
           values ($1, $2, $3, $4, $5)`,
          [componentId, s.language, s.framework, s.code, s.isPrimary],
        );
        snippetCount++;
      }

      await client.query("delete from public.references where component_id = $1", [componentId]);
      for (const r of doc.references) {
        await client.query(
          `insert into public.references (title, url, source, component_id)
           values ($1, $2, $3::public.reference_source, $4)`,
          [r.title, r.url, r.source, componentId],
        );
        refCount++;
      }

      await client.query("delete from public.component_tags where component_id = $1", [componentId]);
      for (const tag of doc.tags) {
        const tagId = tagIds.get(tag);
        if (!tagId) continue;
        await client.query(
          `insert into public.component_tags (component_id, tag_id) values ($1, $2)
           on conflict do nothing`,
          [componentId, tagId],
        );
      }

      await client.query("delete from public.component_styles where component_id = $1", [componentId]);
      // No explicit `styles:` in the frontmatter means the component ships
      // under every skin — same default lib/content.ts applies.
      const styles = doc.styles.length ? doc.styles : [...styleIds.keys()];
      for (const key of styles) {
        const styleId = styleIds.get(key);
        if (!styleId) {
          unknownStyles.add(key);
          continue;
        }
        await client.query(
          `insert into public.component_styles (component_id, style_id) values ($1, $2)
           on conflict do nothing`,
          [componentId, styleId],
        );
        styleLinkCount++;
      }
    }

    let pruned = 0;
    if (prune) {
      const slugs = docs.map((d) => d.slug);
      const res = await client.query(
        "delete from public.components where slug <> all($1::text[]) returning slug",
        [slugs],
      );
      pruned = res.rowCount ?? 0;
      for (const r of res.rows) console.log(`  pruned ${r.slug}`);
    }

    await client.query("commit");

    console.log(
      `seeded: ${docs.length} components · ${categories.length} categories · ` +
        `${tagSlugs.length} tags · ${snippetCount} snippets · ${refCount} references · ` +
        `${styleLinkCount} style links${prune ? ` · ${pruned} pruned` : ""}`,
    );
    if (unknownStyles.size) {
      console.warn(
        `  ! unknown style keys skipped (not in visual_styles): ${[...unknownStyles].join(", ")}`,
      );
    }
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error(`seed failed, rolled back: ${err.message}`);
    await client.end();
    process.exit(1);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
