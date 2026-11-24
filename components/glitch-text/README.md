# Glitch Text Reveal

A one-shot distortion that resolves a headline into place. Three variants, one
contract: **the real text is in the DOM and in the accessibility tree from the first
frame, the noise is `aria-hidden`, and the settle state lives in base CSS** — so a
stalled, stripped, throttled, or printed render still shows a correct headline.

**Status:** Built. Audit pending.

Reference doc: `content/docs/glitch-text-reveal.mdx` (17 sections, 17 code targets).
Playground: `playground/glitch-text-reveal.html`.

## Files

- `GlitchText.tsx` — the React + TypeScript component plus the headless `useGlitch`
  hook and `usePrefersReducedMotion`. `children` is typed `string`, not `ReactNode`.
- `glitch-text.css` — settle state, the four variants, scanline, replay control,
  scroll-driven variant, reduced-motion branch, and print rules.

## Variants

| Variant | Mechanic | JS? | Notes |
| --- | --- | --- | --- |
| `scramble` | Characters resolve left-to-right out of a restricted glyph pool, under an RGB split | Yes | House default on the UJG hero. The only variant whose visible characters differ from the real string, so the only one needing the two-node markup. |
| `slice` | Horizontal bands tear sideways via `clip-path` keyframes, then snap flush | No | Cheapest to ship and the only one that survives a platform without scripting. The most aggressive. |
| `signal` | Blur and contrast fight until the feed locks | No | The restrained option. Closest to a conventional blur-in. Watch `filter: blur()` cost on large type. |
| `chroma` | Short RGB-split jitter on pointer-enter | No | Hover micro-variant for nav links. Pointer-only, never `:focus-visible`. |

## Sizes

`inline` · `sm` · `md` · `lg` (default) · `xl` — amplitude scales at roughly 0.18em,
capped at 12px. Any replay control keeps a ≥44px target at every size.

## Usage

```tsx
import { GlitchText } from "@/components/glitch-text/GlitchText";
import "@/components/glitch-text/glitch-text.css";

<GlitchText as="h1" variant="scramble" size="lg" trigger="in-view" duration={1100}>
  Built like you.
</GlitchText>
```

CSS-only variants need no JavaScript at all — one node, one class:

```html
<h1 class="glitch" data-glitch="slice" data-glitch-size="xl">
  <span class="glitch__truth">Built like you.</span>
</h1>
```

Headless, if you want your own markup:

```tsx
const { hostRef, state, noise, enhanced, replay } = useGlitch({
  text: "Built like you.",
  variant: "scramble",
  trigger: "in-view",
});
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `string` | — | Required. Typed as string so arbitrary nodes are a compile error. |
| `as` | `ElementType` | `"span"` | The semantic host. A glitched `h1` is still an `h1`. |
| `variant` | `GlitchVariant` | `"scramble"` | See the table above. |
| `size` | `GlitchSize` | `"lg"` | Drives amplitude, chroma offset and duration tokens. |
| `trigger` | `GlitchTrigger` | `"in-view"` | `mount` · `in-view` · `hover` · `manual`. |
| `duration` | `number` | `900` | Milliseconds. Ceiling is 1200 — past that it reads as a broken page. |
| `once` | `boolean` | `true` | Keeps the headline from re-glitching on every scroll-by. |
| `charset` | `string` | `DEFAULT_CHARSET` | Scramble only. Restrict to glyphs in the shipped font subset. |
| `scanline` | `boolean` | `true` | Decorative band; removed entirely under reduced motion. |

## Styling across the 11 skins

Structure is fixed; the skin comes from an ancestor `[data-style]` wrapper defined in
`styles/tokens.css`:

```html
<div data-style="brut">
  <h1 class="glitch" data-glitch="slice" data-glitch-size="xl">
    <span class="glitch__truth">Built like you.</span>
  </h1>
</div>
```

Swap `data-style` to any of: `ujg`, `flat`, `material`, `glass`, `liquid`, `neu`,
`skeu`, `brut`, `clay`, `aurora`, `swiss`.

## Non-negotiables

- Never scramble `textContent` on the host element — that makes the heading's
  accessible name garbage for the length of the pass. Write to a leaf noise node.
- Never `aria-live` on or around a glitching element.
- Never animate from `opacity: 0`. The settle state is the base state.
- Reduced motion is a branch, not a softening: nothing schedules, nothing animates.
- `textContent`, never `innerHTML` — the headline may come from a CMS.
- Display type only (≥32px for the default tier). Never on prices, labels, errors,
  form text, or anything a user has to trust.
