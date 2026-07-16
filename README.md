# Digital Library

Urban Jungle Goddess component library. A reusable, style-agnostic, multi-language catalog of UI components, each one documented, playground-previewable, and accessibility-audited.

## What this is

Every component ships three things:

1. **Reference doc** — semantics, states, variants, accessibility, code in every target language.
2. **Playground** — a live builder that crosses **variant × style × language** and emits copy-paste code for the exact combination.
3. **Audit** — a heuristic accessibility + code-validity + wiring check.

Components are rendered across **11 visual styles** (Flat, Material, Glassmorphism, Liquid Glass, Neumorphism, Skeuomorphism, Neo-Brutalism, Claymorphism, Aurora, Minimal/Swiss, and the UJG house brand). Style is skin only: a component's semantics, keyboard behavior, focus ring, and 44px target never change with the skin.

## Structure

```
digital-library/
├─ styles/
│   └─ tokens.css          # the shared 11-style token layer (every component imports this)
├─ components/
│   └─ button/             # the reference component
│       ├─ button.css
│       ├─ Button.tsx
│       └─ README.md
├─ playground/             # interactive HTML builders
└─ docs/                   # reference docs
```

## The shared style layer

`styles/tokens.css` defines all 11 styles once as CSS custom properties + `[data-style]` scoped classes. Build a component's base structure, wrap it in a `[data-style="..."]` container, and it inherits the skin for free. Never hand-code styles per component.

## Status ladder

Each component walks: **Idea → Drafting → Built → Audited → Reusable**.

- **Built** = reference doc + playground live
- **Audited** = a logged accessibility/code audit pass
- **Reusable** = clears the bar, safe to clone across client projects

## Current status

| Component | Status |
|-----------|--------|
| Button    | Audited / Reusable (reference example) |
| Cards     | Reusable |
| 51 others | Drafting |

## Accessibility is non-negotiable

Real semantic elements, visible focus, keyboard operability, 4.5:1 contrast, 44px targets. Glass / Liquid Glass / Neumorphism are guarded for contrast; Aurora / Liquid Glass honor `prefers-reduced-motion`.

## License

TBD.
