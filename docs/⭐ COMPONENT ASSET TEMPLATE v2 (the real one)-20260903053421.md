# ⭐ COMPONENT ASSET TEMPLATE v2 (the real one)

# ⭐ COMPONENT ASSET TEMPLATE
The single source of truth for what every component page in the Digital Asset Library must contain. Button is the gold-standard reference. Every page must match Button's depth, not just its heading m

* * *
## DEFINITION OF "BUILT"
A component page is Built when it contains ALL 17 sections below with the minimum requirements met in each. No shortcuts, no "see sibling doc," no one-liner sections. Each section earns its place with real content.

* * *
## THE 17 REQUIRED SECTIONS
### § 1. What It Actually Is
*   Plain definition in one paragraph
*   The 2-4 things people confuse it with, named and distinguished
*   A clear "rule of thumb" for when it IS this component vs. something else
### § 2. Why It Matters
*   Minimum 3 stakes: conversion, accessibility, trust, performance, or legal
*   Specific to this component, not generic "accessibility matters"
### § 3. Anatomy
*   Every named part of the component listed and described
*   Minimum 5 parts for interactive components, 3 for display-only
### § 4. Sizes / Scale / Density
*   A real table with tokens, pixel values, and use cases
*   Minimum 3 size tiers
*   Rules that matter (target size, spacing tokens, responsive behavior)
### § 5. States
*   Every state listed AND described (not "same as X")
*   Minimum states for interactive components: default, hover, focus, active, disabled, loading, error
*   Component-specific states beyond the generic set
### § 6. Types / Variants
*   Every functional variant named and described
*   Minimum 4 variants for interactive components
### § 7. When to Use (and When Not To)
*   "Use when" list with concrete scenarios
*   "Don't use / use something else when" list naming the alternative component
*   Placement heuristics
### § 8. Across Design Systems + § 8b. Visual Styles / Trends
*   How Material, Apple HIG, Fluent, Ant Design, Tailwind, shadcn/Radix, and Bootstrap treat it (minimum 6 systems)
*   § 8b: a "What's trending in 2026" subsection OR inline visual style coverage
*   If Visual Styles are fully covered here with all 11 skins, § 17 can be a brief reference back. If not, § 17 must be the full version.
### § 9. The Code
This is the biggest section. MINIMUM required subsections (17 total):

1. HTML (semantic foundation with ARIA)
2. CSS (states, layout, reduced-motion)
3. React + TypeScript (full reusable component)
4. Vanilla JavaScript (no framework, full keyboard)
5. Tailwind CSS
6. Next.js (App Router pattern)
7. shadcn/ui or Radix pattern
8. Vue 3 (SFC)
9. Svelte
10. Angular (standalone)
11. Bootstrap 5
12. Web Component (custom element)
13. Python (Jinja2 rendering + FastAPI/Express endpoint if the component reaches a server)
14. SwiftUI (iOS)
15. Jetpack Compose (Android)
16. Flutter (Dart)
17. Testing (Vitest/RTL unit tests + jest-axe + Playwright E2E)

Every code block must be real, runnable, production-shaped. No pseudocode, no "// implement here" stubs. Real imports, real types, real error handling.
### § 10. Accessibility
STANDALONE SECTION. Never folded into § 9. Must include:
*   The correct ARIA roles and attributes for this component
*   A keyboard map table (Key → Action) for interactive components
*   Focus management rules (where focus goes on open/close/change)
*   Contrast requirements (text and non-text elements)
*   Target size requirements (44px minimum)
*   What changes under `prefers-reduced-motion`
*   Common accessibility failures specific to this component
### § 11. Innovative / Emerging Ideas
*   Minimum 4 forward-looking ideas
*   At least one referencing 2026-era APIs or platform changes
### § 12. Conversion / UX Killers
*   Minimum 5 silent mistakes that cost money or trust
*   Each is a specific, fixable failure (not vague "bad UX")
*   Each explains WHY it fails and implies the fix
### § 13. Advanced Patterns
*   Minimum 3 senior-level techniques
*   At least one TypeScript-enforced a11y pattern (discriminated unions, required props)
*   At least one design-token pattern (CSS custom properties, token tiers)
### § 14. Performance & Bundle Cost
*   Minimum 4 specific performance considerations
*   At least one about animation (compositor-only properties)
*   At least one about tree-shaking / import discipline
*   At least one about what to virtualize or lazy-load
### § 15. Security
STANDALONE SECTION. Never folded into § 9. Must include:
*   The component's actual attack surface (even if minimal)
*   XSS considerations if it renders user content
*   Server-side validation if it reaches an endpoint
*   Authorization considerations if it gates content
*   If the component has genuinely zero security surface, state that in 2-3 honest sentences — don't invent threats, but DON'T SKIP THE HEADING
### § 16. Senior-Level Checklist
*   A ship-ready gate: every non-negotiable as a bullet
*   Minimum 8 items
*   Must cover: semantics, keyboard, focus, contrast, target size, states, performance, and component-specific requirements
### § 17. Visual Styles
The component rendered across the 11 core visual languages (minimum):

1. Flat
2. Material
3. Glassmorphism
4. Liquid Glass (2026 — Apple iOS 26 / macOS Tahoe)
5. Neumorphism
6. Skeuomorphism
7. Neo-Brutalism
8. Claymorphism
9. Aurora / Gradient
10. Minimal / Swiss
11. UJG Brand (Goldenrod on Eminence/Night, the house default)

Each skin gets 1-2 sentences describing how it applies to THIS component specifically. Not generic descriptions — how does THIS component look in that style?

End with the "rule that never changes" statement: style is skin, behavior is the skeleton. Semantics, keyboard, focus ring, and target size are identical across all skins.

For the full 31 styles (adding Retro/Pixel, Art Deco, Organic, Cyberpunk, Memphis, Isometric, Y2K, Editorial, Corporate, High Contrast, Bauhaus, Scandinavian, Japanese/Wabi-Sabi, Grunge, Bento Grid, Kinetic, Monochrome, Paper Cut, Hand-drawn, Futurism/HUD), see the Design Styles page. The doc covers 11 minimum; the playground covers all 31.

* * *
## QUALITY GATES (what fails a page)
A page is NOT Built if ANY of these are true:
*   Any section says "same as \[sibling component\]" instead of real content
*   § 9 The Code has fewer than 10 code subsections with real code
*   § 10 Accessibility is missing as a standalone heading OR is folded into § 9
*   § 15 Security is missing as a standalone heading OR is folded into § 9
*   § 17 Visual Styles has fewer than 11 skins described with component-specific language
*   Any code block is pseudocode, a stub, or contains "// implement here"
*   The keyboard map table is missing for an interactive component
*   States are listed without descriptions (just names)
*   Anatomy is one sentence saying "same as X"
*   Sizes section has no table with real pixel values

* * *
## THREE DELIVERABLES PER COMPONENT
Nothing is "done" until all three exist:

1. **Reference doc** — this 17-section page, meeting ALL requirements above
2. **Playground** — self-contained HTML file with live preview, controls (variant/size/state/style toggles), and copy-paste code output across targets
3. **Audit tool** — heuristic checker for interactive components (a11y + code validity + wiring); checklist baked into § 16 for static/display components

* * *
## STATUS LADDER

| Status | Definition |
| ---| --- |
| Idea | Task exists, nothing built |
| Drafting | Sections 1-7 filled with real content, code section has stubs |
| Built | ALL 17 sections meet ALL requirements above. Playground live. |
| Audited | Audit pass logged in the task, all issues resolved |
| Reusable | Clears the bar, production-ready for client projects |

* * *
## HARD RULES
1. **Every page needs all 17 sections.** No exceptions. If a section is genuinely N/A (Security for a pure CSS divider), write 2-3 honest sentences under the heading explaining why. Don't skip the heading.
2. **"See sibling doc" is not content.** If two components share mechanics (Context Menu and Dropdown Menu), write real, full content for BOTH. Cross-reference for additional context, never as a substitute for real content on this page.
3. **Button is the depth standard.** Every page matches Button's level of detail, code coverage, and thoroughness. Button is not "the deepest because it's special" — it's the minimum bar every component must hit.
4. **Code must be production-shaped.** Real imports, real types, real error handling. Not a teaching example — a thing you could drop into a project and ship.
5. **No lazy one-liners for sections.** "Same as Dropdown Menu: item height 32-48px" is NOT a valid Sizes section. Write the real table, the real rules, the real values for THIS component.
6. **Visual Styles must be component-specific.** "Solid fill, no shadow" is not enough. "The play button as a soft extruded circle on a same-color surface, the timeline track as an inset groove" — that's component-specific.

* * *
## REFERENCE PAGES
*   **Button** — the gold standard. Every section at full depth with 20+ code subsections, a full keyboard table, real security content, and all 11 visual styles described per-component.
*   **Cards** — the second proof.
*   **Design Styles (visual languages)** — the 31 styles defined with when-to-use and accessibility notes.

* * *
## WHERE EVERYTHING LIVES
*   **Component library doc** (this doc's parent): the catalog of all component pages
*   **ClickUp list "📚 Digital Diary"**: one task per component with status fields
*   **GitHub** **`urbanjunglegoddess/digital-library`**: the code home (`styles/` + `components/<name>/` + `playground/` + `docs/`)
*   **Playground files**: `playground/[component].html`
*   **Audit tools**: shared engine with component-specific rules