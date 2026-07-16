# Button

The reference component of the Digital Library. Every other component follows this shape.

**Status:** Audited / Reusable.

## Files

- `Button.tsx` — the React + TypeScript component (forwardRef, native prop pass-through, `loading` implies disabled).
- `button.css` — structure, sizing, states, and the six variants' color intent. Imports the shared style layer.

## Variants

`primary` · `secondary` · `ghost` · `gold` · `destructive` · `text`

## Sizes

`xs` · `sm` · `md` (default) · `lg` · `xl` — tap target stays ≥ 44px at every size.

## Styling across the 11 skins

The button's structure is fixed; its skin comes from an ancestor `[data-style]` wrapper defined in `styles/tokens.css`:

```html
<div data-style="liquid">
  <button class="btn btn--primary btn--md">Save changes</button>
</div>
```

Swap `data-style` to any of: `ujg`, `flat`, `material`, `glass`, `liquid`, `neu`, `skeu`, `brut`, `clay`, `aurora`, `swiss`.

## Usage

```tsx
import { Button } from "@urbanjunglegoddess/digital-library/button";

<Button variant="primary" size="lg" onClick={save}>Save changes</Button>
<Button variant="destructive" loading={deleting}>Delete account</Button>
```

## Accessibility

- Real `<button>` element; Enter/Space and focus come free.
- `type="button"` by default so it never accidentally submits a form.
- Visible `:focus-visible` ring; 44px minimum tap target.
- `loading` sets `aria-busy` and disables to prevent double-submit.
- Icon-only usage must pass an `aria-label`.

## The full matrix

See the interactive playground for every **variant × style × language** combination (6 × 11 × 12) with copy-paste code.
