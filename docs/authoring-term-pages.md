# Authoring dictionary / term pages (markdown)

Term entries live in **`content/terms/<slug>.mdx`** — one file per term. Each is
YAML frontmatter followed by a Markdown body on a fixed 10-section bar. This is
the terminology counterpart to the component docs (`content/docs/<slug>.mdx`,
see `authoring-component-pages.md`): same shape, different subject — a term
instead of a component.

Start from **`content/terms/_TERM_TEMPLATE.mdx`** (copy it to `<slug>.mdx`). Files
starting with `_` and any `README.md` are ignored, so the template is safe to
keep in place.

## What a term entry is for

A term entry defines one piece of vocabulary to the same bar every time:
what it means, how it **operates** in practice (common instances and rare
ones), what the **research** says, and which real-world **occurrences** are
proven. The point is that every term is documented to equal depth and every
claim is traceable to a source — the dictionary analogue of the component
library's 17-section bar.

## Frontmatter fields

| Field | Required | Notes |
| --- | --- | --- |
| `term` | ✅ | Display name. |
| `slug` | ✅ | URL-safe; must match the filename. |
| `domain` | ✅ | The field the term belongs to (e.g. `Web Performance`, `Herbalism`, `Finance`). Groups entries. |
| `status` | ✅ | `drafting` \| `defined` \| `researched` \| `verified` — the term ladder (see below). |
| `summary` | ✅ | One sentence, ≤160 chars, quoted — the plain definition. |
| `aliases` | – | Other names/abbreviations people search for. |
| `tags` | ✅ | Lowercase list, e.g. `[metric, loading, core-web-vital]`. |
| `sources` | ✅ | The research backing the entry: each has `title`, `url`, `kind` (`research`\|`reference`\|`primary`\|`dataset`\|`other`). |
| `related` | – | Slugs of adjacent entries. |

## The term status ladder

Mirrors the component ladder (Idea→…→Reusable), but for how well-evidenced a
term is:

- **drafting** — definition sketched, not yet filled out.
- **defined** — §1–§4 complete: meaning and operation instances are solid.
- **researched** — §5 complete: findings gathered and cited.
- **verified** — §6 complete: at least one occurrence is proven with a primary source.

## Body — the 10-section bar

Plain GitHub-flavored Markdown (headings, tables, lists). It is **not** MDX, so
`<`, `{`, and raw HTML are safe — write them literally.

1. **Definition** — is / is-not / rule of thumb.
2. **Etymology & origin** — where it came from, how it shifted.
3. **Operation instances — Common** — the everyday cases, each named.
4. **Operation instances — Rare** — the edge cases, each with why it is rare.
5. **Research findings** — what the literature says, each claim sourced.
6. **Proven occurrences** — documented real occurrences, each with a citation.
7. **Distinctions & commonly confused with** — the near-terms and the traps.
8. **Usage & register** — when/where to use it, with example sentences.
9. **Related terms** — cross-links.
10. **Sources & evidence** — the full citation list.

## Conventions

- **Every claim in §5 and §6 is sourced.** An unsourced "occurrence" is an
  instance (§3/§4), not a proven occurrence (§6). Keep the two honest.
- The first heading should be `## 1 · …` (or `## 1. …`).
- `slug` is the identity: renaming the file renames the entry.
- Prefer primary sources; mark secondary ones as such in §10.
