# Authoring component reference pages (markdown)

Component docs live in **`content/docs/<slug>.mdx`** — one file per component. Each
is YAML frontmatter followed by a Markdown body. Drop a file in, and the catalog
renders it automatically: a card on `/catalog`, a detail page at
`/catalog/<slug>`, the 11-style switcher, copyable code tabs, references, and a
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
