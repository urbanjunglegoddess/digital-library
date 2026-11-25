# Authoring component reference pages (markdown)

Component docs live in **`content/docs/<slug>.mdx`** — one file per component. Each
is YAML frontmatter followed by a Markdown body. Drop a file in, and the
Knowledge Hub renders it automatically: a card on `/knowledge`, a detail page at
`/knowledge/<slug>`, the style switcher, copyable code tabs, references, and a
ClickUp source link. No code changes needed.

Start from **`content/docs/_TEMPLATE.mdx`** (copy it to `<slug>.mdx`).

## Frontmatter fields

| Field | Required | Notes |
| --- | --- | --- |
| `name` | ✅ | Display name. |
| `slug` | ✅ | URL-safe; must match the filename. |
| `category` | ✅ | One of: Actions · Inputs & Forms · Navigation · Overlays & Popouts · Feedback & Status · Data Display · Media · Layout & Structure · Marketing & Content · Utilities. |
| `status` | ✅ | `idea` \| `drafting` \| `built` \| `audited` \| `reusable`. |
| `summary` | ✅ | One sentence, ≤160 chars, quoted. |
| `tags` | ✅ | Lowercase list, e.g. `[form, input, text]`. |
| `clickup_page_id` | – | Source page in doc `838qa-81211`, for traceability. |
| `styles` | – | Subset of the 11 skin keys; omit to support all 11. |
| `playground` | – | Basename of `public/playgrounds/<name>.html` to embed. |
| `preview.label` | – | Text shown inside the style switcher. |
| `snippets` | – | Code tabs: each has `language`, optional `framework`, `label`, `code` (block scalar `code: |`), and optional `primary: true`. |
| `references` | – | External links only: `title`, `url`, `source` (`mdn`\|`so`\|`github`\|`apg`\|`other`). |

## Body

Plain GitHub-flavored Markdown (headings, tables, lists, checklists, fenced code).
It is **not** MDX, so `<`, `{`, and raw HTML are safe — write them literally
(don't HTML-escape code as `&lt;`). The recommended structure is the 17-section
Component Asset Template v2 (see `_TEMPLATE.mdx`).

## Conventions

- Files starting with `_` (like `_TEMPLATE.mdx`) and any `README.md` are ignored
  by the loader — safe for templates and notes.
- The first ordered-list-style heading should be `## 1 · …` (or `## 1. …`).
- `slug` is the identity: renaming the file renames the URL.

## Component Asset Template v2 — the full spec

`_TEMPLATE.mdx` carries the 17 section headings and each section's minimum. This
is the rest of the v2 spec it refers to — the bar a page clears to count as
**Built**. Button is the depth standard; every page matches Button's depth, not
just its heading list.

### Definition of "Built"

A page is Built when it contains **all 17 sections** with the minimum met in
each, with real content — no shortcuts, no "see sibling doc," no one-liner
sections.

### The 17 sections (and their minimums)

1. **What it actually is** — definition + 2–4 confusions named + rule of thumb.
2. **Why it matters** — ≥3 stakes, specific to this component.
3. **Anatomy** — ≥5 named parts (3 for display-only).
4. **Sizes / scale / density** — a real table, ≥3 tiers, tokens + pixel values.
5. **States** — every state listed **and described**; interactive set is default · hover · focus · active · disabled · loading · error.
6. **Types / variants** — ≥4 for interactive components.
7. **When to use (and not)** — use-when, don't-use (name the alternative), placement.
8. **Across design systems** — ≥6 systems.
8b. **Visual styles / trends** — a 2026 trend subsection or inline skin coverage.
9. **The code** — ≥10 of the 17 target subsections, all real/runnable (see `_TEMPLATE.mdx` for the target list).
10. **Accessibility** — **standalone**; ARIA, keyboard map table, focus, contrast, 44px, reduced-motion.
11. **Innovative / emerging ideas** — ≥4, one 2026-era.
12. **Conversion / UX killers** — ≥5 specific, fixable failures.
13. **Advanced patterns** — ≥3, incl. one TS-enforced a11y pattern and one token pattern.
14. **Performance & bundle cost** — ≥4, incl. animation, tree-shaking, virtualize/lazy-load.
15. **Security** — **standalone**; attack surface, XSS, server validation, authz; if zero, say so honestly.
16. **Senior-level checklist** — ≥8 items.
17. **Visual styles** — the 11 core skins, each component-specific; end with "style is skin, behavior is the skeleton."

### Quality gates (a page is NOT Built if any hold)

- A section says "same as [sibling]" instead of real content.
- §9 has fewer than 10 real code subsections.
- §10 Accessibility or §15 Security is missing as a standalone heading, or folded into §9.
- §17 has fewer than 11 skins described in component-specific language.
- Any code block is pseudocode, a stub, or "// implement here".
- The keyboard map table is missing for an interactive component.
- States are listed without descriptions; Anatomy is one "same as X" sentence; Sizes has no real table.

### Status ladder

| Status | Definition |
| --- | --- |
| `idea` | Task exists, nothing built. |
| `drafting` | §1–§7 filled with real content; code section has stubs. |
| `built` | All 17 sections meet all minimums; playground live. |
| `audited` | Audit pass logged, all issues resolved. |
| `reusable` | Clears the bar, production-ready for client work. |

### Three deliverables per component

Nothing is done until all three exist: (1) this 17-section **reference doc**,
(2) a self-contained **playground** HTML with live preview + controls + copyable
code, and (3) an **audit tool** pass (heuristic a11y/validity/wiring checker;
the checklist is baked into §16 for static components).

### Hard rules

1. Every page needs all 17 sections — N/A sections still get the heading plus 2–3 honest sentences.
2. "See sibling doc" is not content — write full content for both.
3. Button is the depth standard.
4. Code is production-shaped — real imports, types, error handling.
5. No lazy one-liner sections.
6. Visual styles must be component-specific.
