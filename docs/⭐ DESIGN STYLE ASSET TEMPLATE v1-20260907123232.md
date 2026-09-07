# ⭐ DESIGN STYLE ASSET TEMPLATE v1

# ⭐ DESIGN STYLE ASSET TEMPLATE
The single source of truth for what every design style entry in the Digital Asset Library must contain. UJG Brand and Cyberpunk are the gold-standard references. Every style must match their depth, not just their heading list.

This is the style-side sibling of the ⭐ COMPONENT ASSET TEMPLATE. Where that one governs a **component across styles**, this one governs a **style across components**.

* * *
## DEFINITION OF "BUILT"
A design style entry is Built when it contains ALL 17 sections below with the minimum requirements met in each. No shortcuts, no "see sibling style," no one-liner sections. Two styles that share DNA (Grunge and Punk Grunge, Glassmorphism and Liquid Glass) each get full independent content.

* * *
## THE 17 REQUIRED SECTIONS
### § 1. The Philosophy
*   The core claim in one paragraph: what this style believes about surface, hierarchy, and attention
*   What it is reacting AGAINST, named (every style is a rebuttal to something)
*   A one-line rule of thumb separating it from the nearest adjacent style
### § 2. Origin & Lineage
*   Era with dates, not vibes ("2020–present", not "modern")
*   The named originators: people, studios, companies, movements
*   The catalyst: what made it possible or necessary (a browser API, a hardware limit, a political moment, a product launch)
*   Its ancestors and its descendants in the family tree
### § 3. Key CSS Signatures
*   Minimum 5 real declarations with real values, not descriptions
*   The ONE declaration that, if removed, kills the style
*   What the style specifically forbids (Neumorphism forbids borders; Flat forbids shadows)
### § 4. Typography
*   Named display face and named body face, with fallbacks
*   Case, tracking, and weight rules
*   The scale ratio or size contrast the style depends on
*   What type this style must never use
### § 5. Color Theory
*   The palette LOGIC, not just hex values: why these colors, in this relationship
*   Count discipline: how many hues are allowed simultaneously
*   Where color carries meaning vs. where it is decoration
*   Dark-mode behavior, or an honest note that the style is mode-locked
### § 6. Motion
*   Duration range and named easing curve, as real values
*   What moves, what stays still, and why that split is correct for this style
*   The signature motion: the one movement only this style would make
*   Ambient vs. triggered: does the style breathe at rest, or only on interaction?
### § 7. Token Structure
*   The complete CSS custom-property bundle, copy-ready
*   Minimum: surface, foreground, interactive, border, radius, shadow, motion
*   Names must follow the house convention (`--<style>-<role>`)
*   Must be droppable into the playground and the `styles/` directory unchanged
### § 8. Layout & Density
*   Grid behavior: strict column, asymmetric, compartmentalized, or free
*   Whitespace posture: dense, comfortable, or extreme
*   Which of the three density modes (Compact / Default / Spacious) this style supports, and which it breaks under
*   Responsive behavior: what simplifies or disappears below tablet
### § 9. The Style Across the Component Set
The biggest section. How this style renders each component, in component-specific language. MINIMUM 12 components covered:

1. Button (primary, secondary, ghost)
2. Card
3. Input / Field
4. Select / Dropdown
5. Checkbox & Radio
6. Switch / Toggle
7. Modal / Dialog
8. Navigation (header + side menu)
9. Table / Data Grid
10. Tabs
11. Toast / Alert
12. Progress / Skeleton

"Solid fill, no shadow" is not coverage. "The switch track as an inset groove in the same hue as the page, the knob a soft extruded pill that swaps to inset when off" is coverage. Every entry names the actual treatment for that actual component.
### § 10. Accessibility Cost
STANDALONE SECTION. Never folded into § 9. Must include:
*   Where this style fails WCAG AA by default, named specifically
*   What happens to the focus ring on this surface, and how it is preserved
*   Contrast risk zones: the exact foreground/background pairs that need testing
*   What must change under `prefers-reduced-motion`
*   What must change under `prefers-contrast: more` and `forced-colors: active`
*   Seizure, motion-sickness, or photosensitivity risk, stated plainly if present
*   The minimum honest verdict: production-safe, accent-only, or decorative-only
### § 11. Performance Budget
STANDALONE SECTION. Never folded into § 3. Must include:
*   Tier assignment: Zero-cost / Light / Medium / Heavy
*   The specific expensive property, if any (`backdrop-filter`, SVG filters, blend modes, hue cycling)
*   Maximum simultaneous instances before jank on a mid-range Android
*   The required fallback: what ships when the effect is unsupported or too costly
*   If the style has genuinely zero cost, state that in 2 honest sentences. Don't invent overhead, but DON'T SKIP THE HEADING
### § 12. Common Pitfalls
*   Minimum 4 failure modes specific to this style
*   Each explains WHY it fails and implies the fix
*   At least one must be the "done badly it just looks broken" trap
*   At least one must be a consistency rule (shadow direction, border weight, palette discipline)
### § 13. When to Use / When Not To
*   "Use when" with concrete industries, audiences, and product types
*   "Don't use / use something else when," naming the alternative style by number
*   Scale verdict: safe across 200+ screens, or campaign-only?
### § 14. Pairs With / Never Pair With
*   Minimum 3 styles it layers well with, and the role each plays (base, accent, behavior layer)
*   Minimum 2 combinations that fail, with the reason
*   Which layer this style occupies: surface, layout, or behavior
*   The worst-case test: if the accent is disabled, does the base still carry the product?
### § 15. Real-World Reference
*   Minimum 4 named products, sites, films, or artifacts where the style actually lives
*   At least one primary-source reference (a designer, a school, a manifesto, a book)
*   At least one current example, not just the historical origin
*   No invented examples. If you can't name it, don't claim it
### § 16. Cultural Provenance & Respect
STANDALONE SECTION. Required for every style, answered honestly.

For styles rooted in a specific living culture (Uli/Nsibidi, Sudanese Modernism, Afro Futurism, Japanese/Wabi-Sabi, Bohemian, Graffiti, Gothic):
*   The specific culture, region, and tradition. Never "African" or "Asian" as a category
*   What each borrowed element actually means in its source context
*   The named source: artists, schools, societies, or texts to credit and study
*   The appropriation line: what is homage, what is extraction, and where this style sits
*   Who should and should not be shipping this style

For styles with no specific cultural claim (Flat, Corporate, Bento Grid), state that in 2 honest sentences and note the commercial lineage instead. Don't invent heritage, but DON'T SKIP THE HEADING.
### § 17. Senior-Level Checklist
*   A ship-ready gate: every non-negotiable as a bullet
*   Minimum 8 items
*   Must cover: token completeness, contrast, focus visibility, reduced-motion, performance tier, palette discipline, component coverage, and the style's own signature constraint

* * *
## QUALITY GATES (what fails a style)
A style is NOT Built if ANY of these are true:
*   Any section says "same as \[sibling style\]" instead of real content
*   § 3 has fewer than 5 real CSS declarations with real values
*   § 7 Token Structure is incomplete or won't drop into the playground unchanged
*   § 9 covers fewer than 12 components, or describes them generically
*   § 10 Accessibility Cost is missing as a standalone heading OR folded into § 9
*   § 11 Performance Budget is missing as a standalone heading OR folded into § 3
*   § 16 Cultural Provenance is missing, or a culturally-rooted style is described as generic
*   Typography names no actual typefaces
*   Color Theory lists hex values with no palette logic
*   Real-World Reference contains an example that cannot be verified

* * *
## THREE DELIVERABLES PER STYLE
Nothing is "done" until all three exist:

1. **Reference entry** — this 17-section spec, meeting ALL requirements above
2. **Style skin in code** — the token bundle plus its CSS in `styles/<style>.css`, consumable by any component
3. **Plate in the playground** — the style rendered live across Button, Card, Field and Toggle, with copy-ready tokens

* * *
## STATUS LADDER

| Status | Definition |
| ---| --- |
| Idea | Named in the list, nothing written |
| Drafting | Sections 1-8 filled with real content, component coverage still thin |
| Built | ALL 17 sections meet ALL requirements. Token bundle shipped. Plate live in the playground. |
| Audited | Contrast, reduced-motion and performance tier verified on a real mid-range device |
| Reusable | Clears the bar, production-ready for client projects |

* * *
## HARD RULES
1. **Every style needs all 17 sections.** No exceptions. If a section is genuinely N/A (Cultural Provenance for Corporate), write 2-3 honest sentences under the heading explaining why. Don't skip the heading.
2. **"See sibling style" is not content.** Glassmorphism and Liquid Glass share mechanics. Write real, full content for BOTH. Cross-reference for context, never as a substitute.
3. **UJG Brand and Cyberpunk are the depth standard.** Every style matches their level of detail. They are not "the deepest because they're special" — they're the minimum bar.
4. **Tokens must be real and runnable.** The bundle in § 7 goes straight into the playground with no edits. If it needs massaging, it isn't done.
5. **Component coverage must be component-specific.** "Rounded and soft" is not a Card description. "The card as a puffy pillow with a 30px radius, its inner top highlight reading as light catching the near edge" is.
6. **Never flatten a culture into a category.** § 16 names the specific tradition or admits there isn't one. "Tribal," "ethnic," and "oriental" are banned words in this library.
7. **Honesty over invention.** No fabricated real-world examples, no invented performance costs, no manufactured heritage. An honest "this style has no cultural claim" beats a made-up lineage every time.

* * *
## REFERENCE ENTRIES
*   **UJG Brand (§ 11 of the Design Styles page)** — the house gold standard. Full depth on every section, complete token bundle, honest Afro-Futurist provenance.
*   **Cyberpunk (§ 15)** — the second proof. Strong signature constraint, real accessibility cost, honest performance tier.
*   **Uli / Nsibidi (§ 42)** — the provenance gold standard. How § 16 is supposed to read.
*   **Component Asset Template** — the sibling spec governing a component across styles.

* * *
## WHERE EVERYTHING LIVES
*   **Design Styles page** (`838qa-200551`): all 44 style entries, this template's output
*   **Component Asset Template** (`838qa-218971`): the component-side sibling spec
*   **44-Style Playground**: every style rendered live across four controls with copy-ready tokens
*   **GitHub** `urbanjunglegoddess/digital-library`: the code home (`styles/<style>.css` + `playground/`)
*   **ClickUp list "📚 Digital Diary"**: one task per style with status fields