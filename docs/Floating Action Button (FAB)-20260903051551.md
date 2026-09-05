# Floating Action Button (FAB)

# Floating Action Button (FAB)

A circular, elevated button pinned to a fixed corner of the viewport that carries the single most important action on a screen — and, in its speed-dial form, fans open into a small menu of related actions. Material Design's signature affordance. This page builds it to full Button depth: real focus management, a real menu pattern, and code you can ship.
* * *

## 1\. What It Actually Is

A Floating Action Button is a real `<button>` element that floats above page content in a fixed position (classically bottom-right), visually raised with elevation/shadow, holding the one action a user is most likely to want on this screen — compose, add, create, new. It does not scroll with the page; it stays reachable. In its richer form (the **speed dial** or **FAB menu**) pressing it expands a small set of sub-actions and behaves like a menu: `aria-expanded`, focus moves into the list, Escape closes, arrows move between items.

The critical truth juniors miss: **a FAB is a button, not a decoration.** It needs an accessible name. An icon-only FAB (just a `+` glyph) has no name to a screen reader — the icon is a picture, not text — so it requires `aria-label="Create new document"`. The glyph alone announces as "button," full stop.

The 3 things people confuse it with, named and distinguished:

*   **A normal Button.** A regular button lives inline in the document flow, next to the content it acts on, and you can have many per screen. A FAB is fixed-position, floats over content, and there should be **exactly one primary FAB per screen** (Material's own guidance). If you're stacking three FABs, you don't have a FAB — you have a toolbar that should live in a bar.
*   **Back to Top.** This is the sharpest confusion because both are small round fixed-corner buttons that appear over content. But **Back to Top is a utility** — it scrolls the viewport, it's a convenience, it appears only after you've scrolled down, and losing it costs nothing. A **FAB is the primary action** — the reason the screen exists (compose the email, add the record). They can even coexist on one screen, which is exactly why they must look and sit differently: the FAB is the emphatic branded action; Back to Top is a quieter, secondary chip, and it must never sit on top of the FAB.
*   **A speed dial / menu trigger vs. a Menu Button.** A FAB with speed dial _is_ a menu button, but it's a specific flavor: the trigger is the primary action's affordance and the expanded items are shortcuts to related creates ("New doc," "New folder," "Upload"). A generic Menu Button opens options about existing content; a speed dial FAB launches new things.
*   **A Snackbar action / toast button.** Transient buttons inside a snackbar also float near the bottom, but they're tied to a temporary message and disappear with it. The FAB is persistent. Critically, when a snackbar appears the FAB must **reflow upward** so the snackbar doesn't cover it (and vice versa).

**Rule of thumb:** If it's fixed to a corner, floats over content, is the _single most important create/primary action_ on the screen, and there's only one of it — it's a FAB. If it scrolls the page, it's Back to Top. If it sits inline next to its content, it's a Button. If there's more than one "primary," you've mis-scoped the screen.
* * *

## 2\. Why It Matters

Five concrete stakes, specific to the FAB:

*   **Conversion / task completion.** The FAB exists to make the money action unmissable. On mobile, the primary CTA is frequently scrolled off-screen inside long feeds; a fixed FAB keeps "Compose," "Add to cart list," "New booking" one thumb-tap away at all times. Bury the primary action in a scrolling header and completion rates for that action drop measurably. The FAB is a deliberate bet that _one_ action deserves permanent real estate.
*   **Accessibility & legal exposure.** An icon-only FAB with no `aria-label` is a WCAG **4.1.2 Name, Role, Value** failure — the most common FAB defect in the wild. A speed dial that traps focus, or that a keyboard user can't open/close, fails **2.1.1 Keyboard** and **2.4.3 Focus Order**. In the US (ADA/Section 508) and EU (EN 301 549 / European Accessibility Act, in force 2025) these are the kinds of defects that show up in demand letters. The FAB is small, high-traffic, and easy to get wrong — a disproportionate share of audit findings.
*   **Trust & thumb ergonomics.** A FAB parked in the bottom-right corner sits inside the natural thumb arc of a right-handed one-handed grip — that's _why_ Material put it there. But if it covers content, overlaps a bottom nav bar, or sits under the home-indicator on a notched phone (ignoring `safe-area-inset`), it reads as broken and users mis-tap. A FAB that obscures the very list item someone is trying to read erodes trust in the whole product.
*   **Performance & perceived quality.** The FAB animates — press ripple, speed-dial fan-out, hide-on-scroll. Animate the wrong properties (`top`/`height`/`box-shadow` on scroll) and you get jank on exactly the interaction users touch most. Compositor-only transforms keep it at 60fps; the difference is the gap between "premium app" and "cheap app."
*   **Focus & wayfinding for the menu form.** The moment a FAB becomes a speed dial, it inherits every menu-widget obligation: `aria-expanded`, focus into the first item on open, focus back to the trigger on close, Escape to dismiss, arrow keys to traverse. Skip these and keyboard/AT users simply cannot use your primary action. That's not a nice-to-have; it's the difference between the action being _available_ and being _decorative for half your users_.
* * *

## 3\. Anatomy

An interactive component — here are the named parts:

*   **The button element** — a real `<button type="button">`. Circular (regular/mini) or pill (extended). Carries the accessible name, the elevation, the tap target. This is the skeleton; everything else is attached to it.
*   **Container / surface** — the filled circle or pill. Default Material spec is a 56px circle with a tonal/primary fill and elevation-3 shadow. The surface is what "floats."
*   **Leading icon** — centered glyph (typically `+`, pencil, or a domain icon). Marked `aria-hidden="true"` because it is decorative _relative to the label_; the name comes from `aria-label` or the visible text, never from the icon.
*   **Extended label** — optional visible text next to the icon that turns the circle into a pill ("Compose," "New event"). When present, the visible text _is_ the accessible name and no `aria-label` is needed (don't double-name).
*   **Elevation / shadow layer** — the drop shadow (resting elevation) that lifts on hover/press. Signals "this floats above content." In flat/Material-you styles it may be a tonal container instead of a shadow.
*   **State layer** — the translucent overlay for hover/focus/press (Material's ripple lives here). A pseudo-element over the surface, not a change to the fill itself, so it composites cleanly.
*   **Positioning wrapper** — the fixed-position container that owns `position: fixed`, the corner offsets, `env(safe-area-inset-*)`, and the `z-index`. Separating this from the button lets you reflow the whole FAB when a snackbar/bottom-sheet appears without touching button internals.
*   **Speed-dial trigger role** — in menu form, the FAB gains `aria-haspopup` / `aria-expanded` and owns open/close state.
*   **Speed-dial list** — the fan of sub-action buttons (`role="menu"` with `role="menuitem"` children, or a labeled group of buttons). Each item is its own button with its own name.
*   **Speed-dial item labels** — persistent text tags beside each sub-action ("New doc," "Upload") so the fanned icons aren't a guessing game.
*   **Scrim / backdrop** (speed-dial open) — an optional dimming layer behind the open menu that closes it on outside click and focuses attention on the choices.
* * *

## 4\. Sizes / Scale / Density

Material's canonical FAB is 56dp; mini is 40dp. But **40px is below the 44px minimum touch target** — so a "mini" FAB must either be padded to a 44px hit area or reserved for pointer-first surfaces. Never ship a 40px live tap target on touch.

| Tier | Container (px) | Icon (px) | Radius | Tap target | Token | Use case |
| ---| ---| ---| ---| ---| ---| --- |
| Mini | 40 | 24 | 12 (M3) / 50% | Pad to ≥44 | `--fab-size-mini: 40px` | Secondary screens, dense/pointer UIs, maps — only with expanded hit area |
| Regular (default) | 56 | 24 | 16 (M3) / 50% | 56 (native) | `--fab-size-md: 56px` | The standard mobile FAB. Meets target size outright |
| Large | 96 | 36 | 28 (M3) | 96 | `--fab-size-lg: 96px` | Camera/creative apps, low-density hero action, tablets |
| Extended | auto width, 56 tall | 24 | 16 / 28 (pill) | 56 tall, ≥48 wide | `--fab-size-ext-h: 56px` | Icon + visible label; first-run or when the action needs words |

Rules that matter:

*   **Target size:** regular (56) and large (96) pass 44px inherently. Mini (40) does **not** — either enlarge the invisible hit area (`::before` overlay padding the box to 44px) or don't use it on touch.
*   **Corner offset token:** default `--fab-offset: 16px` from each screen edge on phones, `24px` on tablets/desktop. This offset must be added _on top of_ `env(safe-area-inset-bottom)`, not instead of it.
*   **Icon optical sizing:** icon is ~24px inside a 56 circle (43%). Keep the icon optically centered; a `+` sits centered, but an asymmetric glyph (send/arrow) may need a 1px nudge.
*   **Extended min width:** an extended FAB should never be narrower than ~48px of content; below that, use the circular form. Label uses Urbanist/body token, never truncated with an ellipsis — if it doesn't fit, it's the wrong variant.
*   **Speed-dial item size:** sub-actions are typically mini (40) with the same ≥44 hit-area rule, spaced by a `--fab-gap: 16px` vertical rhythm.
* * *

## 5\. States

Every state, described — not just named:

*   **Default (resting):** filled surface, resting elevation (Material elevation-3, ~6px blur shadow). Icon centered. The stable, always-visible baseline.
*   **Hover (pointer):** elevation lifts (to elevation-4) and a subtle state-layer overlay (~8% on-color) appears. Signals interactivity on desktop; irrelevant on pure touch but must not break there.
*   **Focus-visible:** a clearly visible focus ring — a 2–3px outline with a 2px offset, in a color meeting 3:1 against both the FAB surface and the page behind it. Because a FAB floats over arbitrary content, the ring needs a contrasting halo (double-ring: light + dark) so it survives on any backdrop. This is _the_ state juniors forget on FABs specifically because the button sits over unpredictable content.
*   **Active / pressed:** elevation drops slightly, state layer deepens (~12%), and a press animation fires (scale to ~0.96 or a Material ripple from the touch point). Under `prefers-reduced-motion` the scale/ripple is replaced by an instant state-layer change.
*   **Disabled:** rare for a true FAB (its whole point is to always be available) but valid when the primary action is contextually impossible (e.g., "Send" with an empty draft). Reduced-contrast surface, `disabled` attribute (not just `aria-disabled` unless you need it focusable), no elevation, no pointer events. Prefer _hiding_ the FAB over disabling it if the action is simply irrelevant on this screen.
*   **Loading / busy:** the action is in flight (creating the record, uploading). Icon swaps to a spinner, `aria-busy="true"`, button disabled to prevent double-submit. Keep the surface — don't collapse the button — so layout doesn't jump.
*   **Error:** the primary action failed. The FAB itself usually returns to default; the _failure_ is announced via a snackbar/`aria-live` region, not by recoloring the FAB red (a red FAB reads as destructive). Optionally a brief shake under non-reduced-motion.
*   **Extended (labeled):** the pill form with visible text. Can be a persistent variant or a scroll-driven state (extended when at top, collapses to a circle on scroll down — Material's "collapse on scroll").
*   **Collapsed / hidden on scroll:** FAB shrinks or slides off-screen when the user scrolls down (content-forward) and returns on scroll up. Must remain in the DOM and keyboard-reachable if it slides — never `display:none` it out from under a Tab sequence mid-interaction; use `translateY` off-screen with focus handling, or better, keep it reachable.
*   **Speed-dial closed:** `aria-expanded="false"`, menu list not rendered/`hidden`, only the trigger shown.
*   **Speed-dial open:** `aria-expanded="true"`, sub-actions fanned out with staggered entrance, optional scrim behind, focus moved to the first item, main icon often rotates (`+` → `×`) to signal "press again to close."
*   **Reflowed (snackbar/bottom-sheet present):** FAB translates upward by the height of the transient surface so nothing overlaps. A distinct positional state driven by the layout layer, not the button.
* * *

## 6\. Types / Variants

*   **Regular circular FAB (icon-only).** The default: a 56px circle with one icon and an `aria-label`. One primary action. This is the reference implementation.
*   **Mini FAB.** 40px circle for denser or secondary surfaces (a map overlay, a secondary screen). Only with an expanded ≥44px hit area on touch. Used for speed-dial sub-actions too.
*   **Extended FAB.** Pill with icon + visible label. Best when the action benefits from words ("Compose," "Add event") or on first-run before users learn the icon. Its visible text is its name.
*   **Speed-dial / FAB menu.** The FAB expands into 2–5 sub-actions. This is a full menu widget: `aria-haspopup`, `aria-expanded`, focus management, Escape, arrow-key traversal, outside-click/scrim to close, and the main icon morphing to a close affordance. Keep it to ~5 items max — beyond that it's a bottom sheet, not a speed dial.
*   **Collapse-on-scroll FAB.** An extended FAB that collapses to a circle as the user scrolls the content down and re-expands at the top — Material 3's scroll-linked behavior. A behavioral variant layered on regular/extended.
*   **Morphing / transforming FAB.** The FAB animates into another surface (a bottom sheet, a full-screen compose view, a toolbar) rather than just fanning items — the FAB becomes the container it opens. Powerful, motion-heavy, and must respect reduced-motion by cross-fading instead of morphing.
* * *

## 7\. When to Use (and When Not To)

**Use a FAB when:**

*   There is exactly **one** clearly dominant, constructive, forward action per screen — compose, create, add, new, start.
*   That action is **constructive** (creating something), not destructive or navigational.
*   You're on a **mobile or touch-first** surface where the primary CTA would otherwise scroll out of reach.
*   The action is **relevant across the whole screen**, not tied to one specific list row (row-level actions belong on the row).
*   A speed dial makes sense only when 2–5 sub-actions are all variations of "create something new."

**Don't use a FAB (use the alternative) when:**

*   **There's no single dominant action** → use inline buttons or a toolbar. A FAB with an arbitrary action teaches users to ignore it.
*   **The action is destructive** (delete, remove, archive-forever) → never a FAB. Use an inline button with confirmation. A giant floating delete is an accident magnet.
*   **You're on desktop/wide viewports** → prefer a header CTA or inline primary button. A lone bottom-right FAB on a 1440px canvas looks lost and wastes the emphasis.
*   **It's really "scroll to top"** → use a dedicated **Back to Top** utility chip, styled and placed so it never competes with or covers a FAB.
*   **You need more than ~5 actions** → use a **bottom sheet** or menu, not an ever-growing speed dial.
*   **The screen already has a bottom navigation bar or bottom toolbar** → either dock the FAB into/above the bar (Material's docked/center-FAB pattern) or reconsider; a FAB floating over a bottom nav that it overlaps is a classic collision.
*   **The action is transient/contextual** (undo, "action" on a snackbar) → that's a snackbar action button, not a FAB.

**Placement heuristics:** default bottom-right, `16px` (phone) / `24px` (tablet) inset plus `env(safe-area-inset-*)`. Keep clear of bottom nav, snackbars, home indicators, and any Back-to-Top. Reflow up when a snackbar appears. One FAB per screen. RTL locales: mirror to bottom-_left_.
* * *

## 8\. Across Design Systems

*   **Material Design (Google) — the originator.** M3 defines FAB, small FAB, large FAB, extended FAB, and the FAB menu. 56dp regular, tonal or primary containers, elevation and state layers, collapse-on-scroll, docked/center FABs with bottom app bars. One FAB per screen is Google's own rule. This is the canonical source and the depth reference for this page.
*   **Apple HIG.** Apple has **no "FAB" primitive** — this is a genuine philosophical difference, not an oversight. iOS puts primary actions in the navigation bar (top-right), toolbars (bottom), or a `.borderedProminent` button. Floating round buttons appear in specific apps (Maps, Photos) but Apple steers you toward toolbars and the tab bar. On iOS 26, any such floating control wears **Liquid Glass**. Porting a Material FAB to iOS should be a deliberate choice, not a default.
*   **Fluent (Microsoft).** No dedicated FAB primitive either; Fluent leans on `CommandBar`, command bar buttons, and `SplitButton`. A FAB-like affordance is built from a `Button` with `appearance="primary"` positioned by the app. Microsoft's mobile surfaces (Outlook, To Do) do use floating compose buttons, effectively Material FABs.
*   **Ant Design.** Ships **`FloatButton`** and **`FloatButton.Group`** — a direct FAB implementation with `shape` (circle/square), `type` (default/primary), badges, a built-in `FloatButton.BackTop`, and menu-style groups. Ant explicitly separates FloatButton (primary action) from BackTop (utility), which is exactly the FAB-vs-Back-to-Top distinction this page draws.
*   **Tailwind CSS.** No component — Tailwind is utilities. A FAB is `fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg ...` plus your own state and a11y wiring. You own the accessible name, focus ring, and menu logic entirely.
*   **shadcn/ui + Radix.** No `FAB` component, but the speed-dial form is best built on **Radix** **`DropdownMenu`** or `Popover` (which give you `aria-expanded`, focus management, Escape, and arrow keys for free), with a positioned `Button` as the trigger. The plain FAB is just a styled `Button` with `fixed` positioning.
*   **Bootstrap 5.** No FAB component. Built from `.btn.btn-primary.rounded-circle` plus `position-fixed bottom-0 end-0 m-3` utilities; the menu form uses a `.dropdown` with `dropup` direction. All ARIA/keyboard is on you beyond what the dropdown plugin provides.

### 8b. What's trending in 2026

*   **Liquid Glass FABs on Apple platforms.** iOS 26 / macOS Tahoe render floating controls as translucent, refracting glass with a specular rim and motion-reactive sheen — glassmorphism grown up. The web approximates with `backdrop-filter`, layered highlights, and emerging refraction proposals. A FAB on deep, saturated backdrops (UJG's Eminence/Night) is the ideal candidate — the dark surface sells the light-bending.
*   **Material 3 Expressive.** Google's springier motion and bolder shape-morphing lands squarely on the FAB: the speed-dial fan and the `+`→`×` morph get more emotional, physics-based motion — still gated behind `prefers-reduced-motion`.
*   **FAB menus over speed dials.** M3 formalized the "FAB menu" (a labeled, accessible list) over the old bare icon fan — persistent labels, proper menu semantics. The industry is following.
*   **AI-native primary actions.** The FAB is becoming the "do it for me" entry point — an agentic compose/summarize action with streaming/generative busy states rendered right in the button.
*   **Docked & morphing FABs.** More apps morph the FAB into the surface it opens (bottom sheet, compose view) rather than just fanning icons — the button _becomes_ the container, with a shared-element transition.
* * *

## 9\. The Code

Real, runnable, production-shaped targets. The circular FAB is a styled button; the speed dial is a menu widget — both are shown honestly.

### 9.1 HTML (semantic foundation with ARIA)

```html
<!-- Icon-only FAB: the icon is NOT a name, so aria-label is mandatory -->
<div class="fab-root">
  <button type="button" class="fab" aria-label="Create new document">
    <svg class="fab__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" fill="none" />
    </svg>
  </button>
</div>

<!-- Extended FAB: visible text IS the accessible name, no aria-label needed -->
<button type="button" class="fab fab--extended">
  <svg class="fab__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" />
  </svg>
  <span class="fab__label">Compose</span>
</button>

<!-- Speed-dial FAB: it's a menu. Trigger owns expanded state; each item is its own button. -->
<div class="fab-root" data-speed-dial>
  <ul class="fab-menu" id="fab-menu" role="menu" aria-label="Create" hidden>
    <li role="none">
      <button role="menuitem" type="button" class="fab fab--mini" aria-label="New document">
        <svg viewBox="0 0 24 24" aria-hidden="true"><!-- doc icon --></svg>
      </button>
    </li>
    <li role="none">
      <button role="menuitem" type="button" class="fab fab--mini" aria-label="New folder">
        <svg viewBox="0 0 24 24" aria-hidden="true"><!-- folder icon --></svg>
      </button>
    </li>
  </ul>
  <button type="button" class="fab" id="fab-trigger"
          aria-haspopup="menu" aria-expanded="false" aria-controls="fab-menu"
          aria-label="Create">
    <svg class="fab__icon" viewBox="0 0 24 24" aria-hidden="true"><!-- plus --></svg>
  </button>
</div>
```

### 9.2 CSS (states, positioning, safe-area, reduced-motion)

```css
:root {
  --fab-size-md: 56px;
  --fab-size-mini: 40px;
  --fab-icon: 24px;
  --fab-offset: 16px;
  --fab-bg: #DCA424;          /* Goldenrod */
  --fab-fg: #0A0A0A;          /* Night */
  --fab-z: 1000;
  --fab-gap: 16px;
  --fab-shadow-rest: 0 4px 8px rgba(0,0,0,.28), 0 1px 3px rgba(0,0,0,.4);
  --fab-shadow-hover: 0 8px 16px rgba(0,0,0,.32), 0 2px 4px rgba(0,0,0,.4);
}

.fab-root {
  position: fixed;
  right: max(var(--fab-offset), env(safe-area-inset-right));
  bottom: calc(var(--fab-offset) + env(safe-area-inset-bottom));
  z-index: var(--fab-z);
  /* Reflow hook: layout layer sets --fab-lift when a snackbar is present */
  transform: translateY(calc(-1 * var(--fab-lift, 0px)));
  transition: transform .2s ease;
}
[dir="rtl"] .fab-root { right: auto; left: max(var(--fab-offset), env(safe-area-inset-left)); }

.fab {
  inline-size: var(--fab-size-md);
  block-size: var(--fab-size-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 16px;              /* M3 rounded; use 50% for fully circular */
  background: var(--fab-bg);
  color: var(--fab-fg);
  box-shadow: var(--fab-shadow-rest);
  cursor: pointer;
  transition: box-shadow .2s ease, transform .12s ease;
}
.fab__icon { inline-size: var(--fab-icon); block-size: var(--fab-icon); }

.fab--mini { inline-size: var(--fab-size-mini); block-size: var(--fab-size-mini); }
/* Mini is 40px < 44px target: expand the hit area invisibly */
.fab--mini::before {
  content: ""; position: absolute; inset: -2px; border-radius: inherit;
}
.fab--extended {
  inline-size: auto; padding-inline: 20px; gap: 8px; border-radius: 28px;
}
.fab__label { font: 500 0.95rem/1 Urbanist, system-ui, sans-serif; }

.fab:hover { box-shadow: var(--fab-shadow-hover); }
.fab:active { transform: scale(.96); }
.fab:focus-visible {
  outline: 3px solid #E8E6E1;                 /* Platinum halo survives any backdrop */
  outline-offset: 2px;
  box-shadow: var(--fab-shadow-hover), 0 0 0 6px rgba(95,44,130,.5); /* Eminence ring */
}
.fab[disabled] { opacity: .5; box-shadow: none; cursor: not-allowed; }
.fab[aria-busy="true"] { pointer-events: none; }

/* Speed-dial fan */
.fab-menu { list-style: none; margin: 0; padding: 0 0 var(--fab-gap);
  display: flex; flex-direction: column; align-items: center; gap: var(--fab-gap); }
.fab-menu[hidden] { display: none; }
#fab-trigger[aria-expanded="true"] .fab__icon { transform: rotate(45deg); } /* + -> x */
.fab__icon { transition: transform .2s ease; }

@media (prefers-reduced-motion: reduce) {
  .fab, .fab-root, .fab__icon { transition: none; }
  .fab:active { transform: none; }
}
```

### 9.3 React + TypeScript (reusable FAB + speed dial with full a11y)

```tsx
import { forwardRef, useId, useRef, useState, useEffect, useCallback } from "react";
import type { ButtonHTMLAttributes, ReactNode, KeyboardEvent } from "react";

type FabSize = "mini" | "regular" | "large";

interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: FabSize;
  icon: ReactNode;
  /** Visible label -> extended FAB. If omitted you MUST pass aria-label. */
  label?: string;
  loading?: boolean;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { size = "regular", icon, label, loading = false, disabled, className = "", ...rest },
  ref
) {
  if (!label && !rest["aria-label"]) {
    // Fail loud in dev: an icon-only FAB with no name is a real bug.
    console.error("Fab: icon-only FAB requires an `aria-label` (or a visible `label`).");
  }
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`fab fab--${size} ${label ? "fab--extended" : ""} ${className}`}
      {...rest}
    >
      {loading ? <Spinner /> : <span className="fab__icon" aria-hidden>{icon}</span>}
      {label && <span className="fab__label">{label}</span>}
    </button>
  );
});

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

interface SpeedDialAction { id: string; label: string; icon: ReactNode; onSelect: () => void; }

export function SpeedDialFab({ actions, triggerLabel = "Create" }:
  { actions: SpeedDialAction[]; triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  // Focus first item on open.
  useEffect(() => { if (open) itemRefs.current[0]?.focus(); }, [open]);

  // Outside click closes.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-speed-dial]")) close(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  const onMenuKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
  };

  return (
    <div className="fab-root" data-speed-dial>
      <ul className="fab-menu" id={menuId} role="menu" aria-label={triggerLabel}
          hidden={!open} onKeyDown={onMenuKey}>
        {actions.map((a, i) => (
          <li role="none" key={a.id}>
            <button
              ref={(el) => { itemRefs.current[i] = el; }}
              role="menuitem" type="button" className="fab fab--mini" aria-label={a.label}
              onClick={() => { a.onSelect(); close(); }}
            >
              <span className="fab__icon" aria-hidden>{a.icon}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        ref={triggerRef}
        type="button" className="fab" id={`${menuId}-trigger`}
        aria-haspopup="menu" aria-expanded={open} aria-controls={menuId}
        aria-label={triggerLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !open) {
            e.preventDefault(); setOpen(true);
          } else if (e.key === "Escape" && open) { close(); }
        }}
      >
        <span className="fab__icon" aria-hidden>+</span>
      </button>
    </div>
  );
}
```

### 9.4 Vanilla JavaScript (no framework, full keyboard)

```js
class SpeedDial {
  constructor(root) {
    this.root = root;
    this.trigger = root.querySelector("#fab-trigger");
    this.menu = root.querySelector('[role="menu"]');
    this.items = [...this.menu.querySelectorAll('[role="menuitem"]')];
    this.open = false;

    this.trigger.addEventListener("click", () => this.toggle());
    this.trigger.addEventListener("keydown", (e) => {
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !this.open) {
        e.preventDefault(); this.show(); this.items[0]?.focus();
      }
    });
    this.menu.addEventListener("keydown", (e) => this.onMenuKey(e));
    document.addEventListener("mousedown", (e) => {
      if (this.open && !this.root.contains(e.target)) this.hide(false);
    });
  }
  toggle() { this.open ? this.hide() : (this.show(), this.items[0]?.focus()); }
  show() {
    this.open = true; this.menu.hidden = false;
    this.trigger.setAttribute("aria-expanded", "true");
  }
  hide(focusTrigger = true) {
    this.open = false; this.menu.hidden = true;
    this.trigger.setAttribute("aria-expanded", "false");
    if (focusTrigger) this.trigger.focus();
  }
  onMenuKey(e) {
    const i = this.items.indexOf(document.activeElement);
    const map = {
      Escape: () => this.hide(),
      ArrowUp: () => this.items[(i - 1 + this.items.length) % this.items.length].focus(),
      ArrowDown: () => this.items[(i + 1) % this.items.length].focus(),
      Home: () => this.items[0].focus(),
      End: () => this.items[this.items.length - 1].focus(),
    };
    if (map[e.key]) { e.preventDefault(); map[e.key](); }
  }
}
document.querySelectorAll("[data-speed-dial]").forEach((el) => new SpeedDial(el));
```

### 9.5 Tailwind CSS

```html
<div class="fixed z-50 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))]
            motion-safe:transition-transform">
  <button type="button" aria-label="Create new document"
    class="flex h-14 w-14 items-center justify-center rounded-2xl
           bg-amber-500 text-neutral-950 shadow-lg
           hover:shadow-xl active:scale-95 motion-reduce:active:scale-100
           focus-visible:outline focus-visible:outline-[3px]
           focus-visible:outline-offset-2 focus-visible:outline-stone-200
           disabled:opacity-50 disabled:shadow-none">
    <svg class="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" fill="none"/>
    </svg>
  </button>
</div>
```

### 9.6 Next.js (App Router: server page, client FAB)

```tsx
// app/(app)/documents/page.tsx  — Server Component
import { NewDocFab } from "@/components/new-doc-fab";

export default async function DocumentsPage() {
  const docs = await getDocuments(); // server data fetch
  return (
    <main>
      <h1>Documents</h1>
      <DocList docs={docs} />
      <NewDocFab />   {/* interactivity lives in the client island */}
    </main>
  );
}
```

```tsx
// components/new-doc-fab.tsx  — Client Component
"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Fab } from "@/components/fab";
import { createDocument } from "@/app/actions";

export function NewDocFab() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="fab-root">
      <Fab
        aria-label="Create new document"
        loading={pending}
        icon={<PlusIcon />}
        onClick={() =>
          startTransition(async () => {
            const doc = await createDocument();   // server action
            router.push(`/documents/${doc.id}`);
          })
        }
      />
    </div>
  );
}
```

### 9.7 shadcn/ui + Radix (speed dial via DropdownMenu)

```tsx
"use client";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FolderPlus, Upload } from "lucide-react";

// Radix supplies aria-expanded, focus mgmt, Escape, arrow keys, and typeahead.
export function SpeedDialFab() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" aria-label="Create"
            className="h-14 w-14 rounded-2xl shadow-lg data-[state=open]:rotate-45 transition-transform">
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" sideOffset={12}>
          <DropdownMenuItem onSelect={() => createDoc()}>
            <FileText className="mr-2 h-4 w-4" /> New document
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => createFolder()}>
            <FolderPlus className="mr-2 h-4 w-4" /> New folder
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openUpload()}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

### 9.8 Vue 3 (SFC)

```vue
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
const props = defineProps<{ actions: { id: string; label: string }[]; triggerLabel?: string }>();
const emit = defineEmits<{ select: [id: string] }>();
const open = ref(false);
const trigger = ref<HTMLButtonElement>();
const items = ref<HTMLButtonElement[]>([]);

function close(focusTrigger = true) { open.value = false; if (focusTrigger) trigger.value?.focus(); }
watch(open, (v) => { if (v) requestAnimationFrame(() => items.value[0]?.focus()); });

function onKey(e: KeyboardEvent) {
  const i = items.value.indexOf(document.activeElement as HTMLButtonElement);
  const n = items.value.length;
  if (e.key === "Escape") { e.preventDefault(); close(); }
  else if (e.key === "ArrowDown") { e.preventDefault(); items.value[(i + 1) % n]?.focus(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); items.value[(i - 1 + n) % n]?.focus(); }
}
function onDoc(e: MouseEvent) {
  if (open.value && !(e.target as Element).closest("[data-speed-dial]")) close(false);
}
onMounted(() => document.addEventListener("mousedown", onDoc));
onUnmounted(() => document.removeEventListener("mousedown", onDoc));
</script>

<template>
  <div class="fab-root" data-speed-dial>
    <ul v-show="open" class="fab-menu" role="menu" :aria-label="triggerLabel ?? 'Create'" @keydown="onKey">
      <li v-for="(a, i) in actions" :key="a.id" role="none">
        <button :ref="el => (items[i] = el as HTMLButtonElement)" role="menuitem" type="button"
          class="fab fab--mini" :aria-label="a.label" @click="emit('select', a.id); close()">
          <slot :name="a.id" />
        </button>
      </li>
    </ul>
    <button ref="trigger" type="button" class="fab" aria-haspopup="menu"
      :aria-expanded="open" :aria-label="triggerLabel ?? 'Create'" @click="open = !open">
      <span class="fab__icon" aria-hidden="true">+</span>
    </button>
  </div>
</template>
```

### 9.9 Svelte

```svelte
<script lang="ts">
  export let actions: { id: string; label: string }[] = [];
  export let triggerLabel = "Create";
  let open = false;
  let trigger: HTMLButtonElement;
  let items: HTMLButtonElement[] = [];

  function close(focusTrigger = true) { open = false; if (focusTrigger) trigger?.focus(); }
  $: if (open) queueMicrotask(() => items[0]?.focus());

  function onKey(e: KeyboardEvent) {
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
  }
</script>

<svelte:window on:mousedown={(e) => { if (open && !(e.target as Element).closest('[data-speed-dial]')) close(false); }} />

<div class="fab-root" data-speed-dial>
  {#if open}
    <ul class="fab-menu" role="menu" aria-label={triggerLabel} on:keydown={onKey}>
      {#each actions as a, i}
        <li role="none">
          <button bind:this={items[i]} role="menuitem" type="button" class="fab fab--mini"
            aria-label={a.label} on:click={() => { dispatchEvent(new CustomEvent('select', { detail: a.id })); close(); }}>+</button>
        </li>
      {/each}
    </ul>
  {/if}
  <button bind:this={trigger} type="button" class="fab" aria-haspopup="menu"
    aria-expanded={open} aria-label={triggerLabel} on:click={() => (open = !open)}>+</button>
</div>
```

### 9.10 Angular (standalone component)

```typescript
import { Component, ElementRef, HostListener, ViewChildren, QueryList, input, signal } from "@angular/core";

@Component({
  selector: "ujg-speed-dial-fab",
  standalone: true,
  template: `
    <div class="fab-root" data-speed-dial>
      <ul class="fab-menu" role="menu" [attr.aria-label]="triggerLabel()" *ngIf="open()"
          (keydown)="onKey($event)">
        <li role="none" *ngFor="let a of actions(); let i = index">
          <button #item role="menuitem" type="button" class="fab fab--mini"
            [attr.aria-label]="a.label" (click)="select.emit(a.id); close()">+</button>
        </li>
      </ul>
      <button #trigger type="button" class="fab" aria-haspopup="menu"
        [attr.aria-expanded]="open()" [attr.aria-label]="triggerLabel()" (click)="toggle()">+</button>
    </div>`,
})
export class SpeedDialFabComponent {
  actions = input<{ id: string; label: string }[]>([]);
  triggerLabel = input("Create");
  open = signal(false);
  @ViewChildren("item") items!: QueryList<ElementRef<HTMLButtonElement>>;
  constructor(private host: ElementRef) {}

  toggle() { this.open.update((v) => !v); if (this.open()) queueMicrotask(() => this.focusAt(0)); }
  close(focusTrigger = true) {
    this.open.set(false);
    if (focusTrigger) this.host.nativeElement.querySelector("[aria-haspopup]")?.focus();
  }
  focusAt(i: number) { this.items.get(i)?.nativeElement.focus(); }
  onKey(e: KeyboardEvent) {
    const els = this.items.map((r) => r.nativeElement);
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") { e.preventDefault(); this.close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); els[(i + 1) % els.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); els[(i - 1 + els.length) % els.length].focus(); }
  }
  @HostListener("document:mousedown", ["$event"])
  onDoc(e: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(e.target)) this.close(false);
  }
}
```

### 9.11 Bootstrap 5

```html
<div class="dropup position-fixed bottom-0 end-0 m-3" style="z-index:1030">
  <button type="button" class="btn btn-warning rounded-circle d-flex align-items-center
          justify-content-center shadow" style="width:56px;height:56px"
          data-bs-toggle="dropdown" aria-expanded="false" aria-label="Create">
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>
  </button>
  <ul class="dropdown-menu dropdown-menu-end mb-2">
    <li><button class="dropdown-item" type="button">New document</button></li>
    <li><button class="dropdown-item" type="button">New folder</button></li>
    <li><button class="dropdown-item" type="button">Upload</button></li>
  </ul>
</div>
```

### 9.12 Web Component (custom element)

```js
class UjgFab extends HTMLElement {
  static observedAttributes = ["label", "loading"];
  connectedCallback() {
    const label = this.getAttribute("label") ?? "";
    if (!label) console.error("<ujg-fab> requires a `label` attribute for its accessible name.");
    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        button { inline-size:56px; block-size:56px; border:0; border-radius:16px;
          background:#DCA424; color:#0A0A0A; box-shadow:0 4px 8px rgba(0,0,0,.3); cursor:pointer; }
        button:focus-visible { outline:3px solid #E8E6E1; outline-offset:2px; }
        @media (prefers-reduced-motion: no-preference){ button:active{ transform:scale(.96);} }
      </style>
      <button type="button" part="button" aria-label="${label}"
        aria-busy="${this.hasAttribute("loading")}"><slot></slot></button>`;
    this.shadowRoot.querySelector("button")
      .addEventListener("click", () => this.dispatchEvent(new CustomEvent("fab-activate", { bubbles: true })));
  }
  attributeChangedCallback() {
    const btn = this.shadowRoot?.querySelector("button");
    if (!btn) return;
    btn.setAttribute("aria-label", this.getAttribute("label") ?? "");
    btn.setAttribute("aria-busy", String(this.hasAttribute("loading")));
  }
}
customElements.define("ujg-fab", UjgFab);
```

### 9.13 Python (Jinja2 template + FastAPI endpoint the FAB reaches)

```python
# app.py — the FAB's "Create document" action hits a real endpoint
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/documents", response_class=HTMLResponse)
def documents(request: Request, user=Depends(get_current_user)):
    docs = list_documents(owner_id=user.id)
    return templates.TemplateResponse("documents.html", {"request": request, "docs": docs})

@app.post("/documents")           # <-- the FAB's action endpoint
def create_document(user=Depends(get_current_user)):
    # Authorization is enforced HERE, at the endpoint — the FAB is not the boundary.
    if not user.can_create_documents:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed to create documents")
    doc = Document.create(owner_id=user.id, title="Untitled")
    return RedirectResponse(f"/documents/{doc.id}", status_code=status.HTTP_303_SEE_OTHER)
```

```html
{# templates/documents.html #}
<form action="/documents" method="post" class="fab-root">
  <button type="submit" class="fab" aria-label="Create new document">
    <svg class="fab__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none"/>
    </svg>
  </button>
</form>
```

### 9.14 SwiftUI (iOS — a floating overlay button)

```swift
import SwiftUI

struct FloatingActionButton: View {
    let action: () -> Void
    var body: some View {
        VStack { Spacer()
            HStack { Spacer()
                Button(action: action) {
                    Image(systemName: "plus")
                        .font(.title2.weight(.semibold))
                        .frame(width: 56, height: 56)
                }
                .background(Color("Goldenrod"), in: RoundedRectangle(cornerRadius: 16))
                .foregroundStyle(Color("Night"))
                .shadow(radius: 6, y: 3)
                .accessibilityLabel("Create new document")   // icon needs a name
                .padding(16)
            }
        }
        .ignoresSafeArea(.keyboard)   // respects safe-area insets by default
    }
}

struct DocumentsScreen: View {
    var body: some View {
        NavigationStack { DocumentList() }
            .overlay(alignment: .bottomTrailing) {
                FloatingActionButton { create() }
            }
    }
}
```

### 9.15 Jetpack Compose (Android)

```kotlin
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.runtime.*
import androidx.compose.ui.semantics.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DocumentsScreen(onCreate: () -> Unit) {
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = onCreate,
                containerColor = Goldenrod,
                contentColor = Night,
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Create new document")
            }
        }
    ) { padding -> DocumentList(Modifier.padding(padding)) }
}
```

### 9.16 Flutter (Dart)

```dart
import 'package:flutter/material.dart';

class DocumentsPage extends StatelessWidget {
  const DocumentsPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: const DocumentList(),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _createDocument(context),
        backgroundColor: const Color(0xFFDCA424),
        foregroundColor: const Color(0xFF0A0A0A),
        tooltip: 'Create new document', // becomes the semantics label for a11y
        child: const Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}
```

### 9.17 Testing (Vitest + RTL + jest-axe + Playwright)

```tsx
// speed-dial.test.tsx — unit + a11y
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SpeedDialFab } from "./speed-dial-fab";

const actions = [
  { id: "doc", label: "New document", icon: <span />, onSelect: vi.fn() },
  { id: "dir", label: "New folder", icon: <span />, onSelect: vi.fn() },
];

test("trigger has an accessible name and correct expanded state", async () => {
  render(<SpeedDialFab actions={actions} triggerLabel="Create" />);
  const trigger = screen.getByRole("button", { name: "Create" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("Escape closes and returns focus to the trigger", async () => {
  render(<SpeedDialFab actions={actions} triggerLabel="Create" />);
  const trigger = screen.getByRole("button", { name: "Create" });
  await userEvent.click(trigger);
  expect(screen.getByRole("menuitem", { name: "New document" })).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
});

test("arrow keys traverse the menu items", async () => {
  render(<SpeedDialFab actions={actions} triggerLabel="Create" />);
  await userEvent.click(screen.getByRole("button", { name: "Create" }));
  await userEvent.keyboard("{ArrowDown}");
  expect(screen.getByRole("menuitem", { name: "New folder" })).toHaveFocus();
});

test("no axe violations when open", async () => {
  const { container } = render(<SpeedDialFab actions={actions} triggerLabel="Create" />);
  await userEvent.click(screen.getByRole("button", { name: "Create" }));
  expect(await axe(container)).toHaveNoViolations();
});
```

```ts
// fab.e2e.ts — Playwright
import { test, expect } from "@playwright/test";

test("FAB stays visible and reflows above a snackbar", async ({ page }) => {
  await page.goto("/documents");
  const fab = page.getByRole("button", { name: "Create new document" });
  await expect(fab).toBeVisible();
  const before = (await fab.boundingBox())!;
  await page.getByRole("button", { name: "Trigger snackbar" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  const after = (await fab.boundingBox())!;
  expect(after.y).toBeLessThan(before.y); // FAB lifted, not covered
});

test("FAB is keyboard reachable and activates", async ({ page }) => {
  await page.goto("/documents");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Create new document" })).toBeFocused();
});
```

* * *

## 10\. Accessibility

Standalone. The FAB is a button first; the speed dial is a menu widget. Both sets of obligations apply.

**Roles & ARIA:**

*   The FAB is a native `<button type="button">` (role `button`). Never a `<div>` with a click handler.
*   **Icon-only FAB requires a name:** `aria-label` (or `aria-labelledby`). The SVG/glyph gets `aria-hidden="true"` and `focusable="false"`. The icon is not a name — a screen reader announces only "button" without the label.
*   **Extended FAB:** the visible `<span>` text _is_ the name. Don't also add an `aria-label` (that overrides and can desync).
*   **Speed-dial trigger:** `aria-haspopup="menu"`, `aria-expanded` reflecting open state, `aria-controls` pointing at the menu id.
*   **Speed-dial list:** `role="menu"` with `role="menuitem"` children (or a `group` of plain buttons with an accessible group name). Each item has its own name.
*   **Busy:** `aria-busy="true"` while the action is in flight; announce success/failure via an `aria-live` region (or `role="status"`), not by mutating the FAB's label.

**Keyboard map (interactive):**

| Key | Context | Action |
| ---| ---| --- |
| Tab | Anywhere | Moves focus to the FAB in DOM order; Tab again leaves it |
| Enter / Space | FAB focused | Activates the primary action (or toggles the speed dial) |
| Enter / Space | Menu item focused | Invokes that sub-action and closes the menu |
| ArrowDown / ArrowUp | Trigger focused (speed dial) | Opens the menu and moves focus to first/last item |
| ArrowDown / ArrowUp | Menu open | Moves focus between items (wraps) |
| Home / End | Menu open | Focus first / last item |
| Escape | Menu open | Closes the menu, returns focus to the trigger |
| Esc / Tab | Menu open | Tab closes and moves on; focus must not be trapped |

**Focus management:**

*   On speed-dial **open**, move focus to the first menu item.
*   On **close** (Escape, selection, outside click via keyboard), return focus to the trigger.
*   Never trap focus in a persistent FAB; it's not a modal. A speed-dial menu manages focus among its items but Tab must still be able to leave.
*   If the FAB hides on scroll, it must not yank focus away while focused — keep it reachable; don't `display:none` a focused element.

**Contrast:**

*   FAB surface vs. its icon/label: text/icon contrast ≥ **4.5:1** (or 3:1 for large/bold icon ≥ 24px). Goldenrod `#DCA424` + Night `#0A0A0A` passes comfortably.
*   Because the FAB floats over arbitrary content, its **container-vs-background** boundary needs a non-text contrast of **3:1** (WCAG 1.4.11) — the elevation shadow or a subtle border provides it so the button doesn't vanish on a same-color backdrop.
*   Focus indicator ≥ **3:1** against adjacent colors; use a double-ring (light halo + dark ring) so it survives on any content behind it.

**Target size:** 44px minimum (WCAG 2.5.8). Regular (56) and large (96) pass. Mini (40) does **not** — pad the hit area to ≥44 or don't ship it on touch. Speed-dial items follow the same rule.

**Reduced motion:** under `prefers-reduced-motion: reduce`, drop the press-scale, the ripple, the speed-dial fan stagger, and the `+`→`×` rotation — swap for instant show/hide and a plain state-layer change. Never make comprehension depend on the animation.

**Common FAB-specific failures:**

*   Icon-only FAB with **no accessible name** (the #1 defect — "button" announced with no purpose).
*   Speed dial built without `aria-expanded` / focus return — keyboard users can't tell it opened or get stuck.
*   FAB covering content, a bottom nav, or a snackbar — obscures information and mis-targets taps.
*   40px mini FAB shipped as a live touch target — below the 44px floor.
*   Focus ring invisible against the content behind the FAB (single-color ring on a matching backdrop).
*   `<div role="button">` without keyboard handling — no Enter/Space, no focusability.
*   Hiding the FAB with `display:none` on scroll while it (or its menu) holds focus.
* * *

## 11\. Innovative / Emerging Ideas

*   **Liquid Glass FAB (2026-era).** Render the FAB as Apple iOS 26 / macOS Tahoe translucent glass — `backdrop-filter` refraction, specular rim, motion-reactive sheen over a deep Eminence/Night backdrop. The emerging CSS refraction/`background-filter` proposals push this closer to native on the web. Honor reduced-motion by freezing the sheen.
*   **Agentic / AI FAB.** The FAB as the "do it for me" entry point — press to summarize, draft, or generate. It carries a _streaming_ busy state (progressive fill or shimmer) driven by a server-sent-events response, with `aria-live` narrating progress for AT.
*   **View Transitions API morphing.** Use the native `startViewTransition()` / `view-transition-name` to morph the FAB into the sheet or compose surface it opens as a true shared-element transition — no hand-rolled FLIP, and it degrades gracefully where unsupported.
*   **Scroll-driven collapse via CSS** **`scroll-timeline`****.** Drive the extended-FAB collapse-on-scroll purely in CSS with animation-timeline, off the main thread — no scroll-event JS, buttery on low-end devices, and it simply doesn't animate where unsupported (progressive enhancement).
*   **Anchor-positioned speed dial.** The CSS Anchor Positioning API lets the fanned menu tether to the FAB without JS position math, staying correctly placed as the FAB reflows for a snackbar or rotates the device.
*   **Haptic + spatial cues.** On supporting devices, a subtle haptic on press and depth-aware parallax (carried over from visionOS spatial UI) make the float feel physical without extra pixels.
* * *

## 12\. Conversion / UX Killers

*   **Icon-only FAB with an ambiguous glyph and no label.** A bare `+`, star, or lightning bolt makes users guess what "the action" is; hesitation kills the tap. WHY it fails: the FAB spends its emphasis on mystery. FIX: use an unambiguous icon _and_ consider the extended (labeled) form, especially on first-run.
*   **Stacking multiple FABs / multiple primaries.** Two or three floating buttons destroy the "one most-important action" contract; users can't tell what matters. WHY: emphasis is zero-sum — three primaries means none. FIX: one FAB per screen; demote the rest to inline buttons or a toolbar.
*   **FAB covering the content or the last list item.** Parked over the very row the user needs (or over a bottom nav / pagination), it blocks the task and eats taps meant for content beneath it. WHY: fixed elevation without reflow. FIX: add bottom padding to the scroll container equal to the FAB's footprint; reflow up for snackbars/bottom sheets.
*   **Ignoring** **`safe-area-inset`** **on notched/gesture phones.** The FAB sits under the home indicator or gets clipped by rounded corners. WHY: `bottom: 16px` alone ignores the inset. FIX: `calc(16px + env(safe-area-inset-bottom))`.
*   **FAB for a destructive action.** A big, always-present, easy-to-hit floating Delete/Discard is an accident generator, and the accidents are irreversible. WHY: the FAB's whole design maximizes tap probability — the opposite of what destructive actions need. FIX: never FAB a destructive action; use a guarded inline button.
*   **Speed dial with no labels and too many items.** Six unlabeled fanned icons force a memory game and overflow the thumb zone. WHY: cognitive load spikes past ~5 unlabeled choices. FIX: persistent text labels, cap at ~5, or promote to a bottom sheet.
*   **No busy state → double submission.** Tapping the FAB fires the create twice (two draft documents, two orders) because nothing disables it mid-request. WHY: no `aria-busy`/disabled during the async action. FIX: disable + spinner on press, re-enable in `finally`.
*   **Colliding with Back to Top / snackbars.** A Back-to-Top chip and the FAB overlap in the same corner, or a snackbar covers the FAB. WHY: shared real estate, no layout coordination. FIX: distinct positions, and reflow the FAB above transient surfaces.
* * *

## 13\. Advanced Patterns

*   **TypeScript-enforced accessible naming (discriminated union).** Make it _impossible_ to ship a nameless icon-only FAB: the type requires either a visible `label` or an `aria-label`.

```typescript
type Named =
  | { label: string; "aria-label"?: never }        // extended: visible text names it
  | { label?: never; "aria-label": string };       // icon-only: aria-label required
type FabProps = { icon: React.ReactNode; size?: "mini" | "regular" | "large" } & Named;
// <Fab icon={<Plus/>} />                 -> compile error (no name)
// <Fab icon={<Plus/>} aria-label="Add"/> -> ok
// <Fab icon={<Plus/>} label="Compose"/>  -> ok
```

*   **Design-token tiering for the float layer.** Drive size, offset, elevation, z-index, and safe-area from token tiers so the FAB re-skins per brand/platform without touching logic:

```css
/* tier 1: primitives */ :root { --elevation-3: 0 4px 8px rgba(0,0,0,.28); --gold: #DCA424; }
/* tier 2: semantic  */  :root { --fab-surface: var(--gold); --fab-elevation: var(--elevation-3);
                                  --fab-z: 1000; --fab-inset: 16px; }
/* tier 3: component */  .fab { background: var(--fab-surface); box-shadow: var(--fab-elevation); }
.fab-root { z-index: var(--fab-z);
  inset-block-end: calc(var(--fab-inset) + env(safe-area-inset-bottom)); }
```

*   **Layout-coordinated reflow (the snackbar problem, solved once).** A tiny layout store publishes the height of any transient bottom surface; the FAB subscribes and lifts. No component reaches into another.

```typescript
// bottomLayer.ts — single source of truth for "what's occupying the bottom"
import { create } from "zustand";
export const useBottomLayer = create<{ lift: number; setLift: (n: number) => void }>((set) => ({
  lift: 0, setLift: (lift) => set({ lift }),
}));
// FAB reads it: style={{ "--fab-lift": `${useBottomLayer(s => s.lift)}px` }}
// Snackbar sets it on mount/unmount: setLift(snackbarHeight); ... setLift(0);
```

*   **Roving-tabindex speed dial** as an alternative to `role="menu"`: keep items as a toolbar (`role="toolbar"`) with one tabbable item and arrow-key roving — better when items are frequently-used toggles rather than one-shot menu commands.
* * *

## 14\. Performance & Bundle Cost

*   **Animate compositor-only properties.** Press feedback, hide-on-scroll, and the speed-dial fan must animate `transform` and `opacity` only — never `top`/`bottom`/`height`/`box-shadow`/`width`, which trigger layout/paint on every frame. The FAB is one of the most-touched controls; jank here is jank users feel. Use `will-change: transform` sparingly and remove it after the transition.
*   **Prefer CSS** **`scroll-timeline`** **over scroll-event JS** for collapse-on-scroll and hide-on-scroll. A `scroll` listener firing at 60Hz on a long feed is a classic main-thread hog; the CSS scroll-driven-animation runs off-thread and can't drop frames the same way.
*   **Tree-shake icons and menu machinery.** Import icons individually (`import { Plus } from "lucide-react"`), never the whole set. If the speed dial rides on Radix `DropdownMenu`, that pulls in focus-management and positioning code (~a few KB gzipped) — worth it for the a11y, but don't ship it on screens that only use a plain circular FAB. Load the menu logic only where a speed dial exists.
*   **Lazy-load / defer the speed-dial contents.** Render the menu list only when `open` (or behind `hidden`), and lazy-load any heavy sub-action surfaces (an upload dialog, a rich compose view) on first open — not on page load. The resting FAB should cost almost nothing.
*   **Avoid layout thrash on reflow.** Batch the snackbar-reflow through a CSS custom property (`--fab-lift`) and a single `transform` transition rather than reading/writing layout in a scroll or resize handler. One style write, GPU-composited, no forced reflow.
*   **Keep the resting FAB paint cheap.** A static shadow is fine; an animated glow/aurora or Liquid-Glass `backdrop-filter` is expensive to composite continuously — pause it when idle and always gate it behind `prefers-reduced-motion`.
* * *

## 15\. Security

The FAB is a **standard button surface** — a `<button>` that fires a client-side handler or submits a form. On its own it renders no user-supplied content, so it has essentially **no XSS surface of its own**; the usual rule applies to whatever _label_ you feed it (never inject unescaped user HTML into the FAB's text or `aria-label`).

The honest boundary point: **the FAB is not the authorization boundary — its endpoint is.** A FAB that triggers a privileged action ("Create document," "Publish," "Invite user") gives no security by being hidden, disabled, or styled a certain way. Hiding the FAB from a user who lacks permission is a UX nicety, not a control; anyone can call `POST /documents` directly. **Authorization must be enforced server-side at the action's endpoint** (see §9.13 — the `can_create_documents` check lives in the handler, returning 403, not in the button). Likewise, if the action mutates state, protect the endpoint against CSRF (same-site cookies / CSRF token) and rate-limit it, because a floating "create" is easy to script against. The button is the trigger; the server is the gate.
* * *

## 16\. Senior-Level Checklist

Ship-ready gate — every item non-negotiable:

*   **Semantics:** a real `<button type="button">` (or `type="submit"` inside a form), never a `<div>`/`<a>` with a click handler.
*   **Accessible name:** icon-only FAB has `aria-label`; extended FAB's visible text is its name (no double-naming); the icon is `aria-hidden`.
*   **One primary per screen:** exactly one FAB; it carries a single constructive action, never destructive.
*   **Keyboard:** Tab reaches it; Enter/Space activates; speed dial supports arrows, Home/End, Escape, and does not trap focus.
*   **Focus management:** speed dial moves focus to the first item on open and back to the trigger on close; focus ring visible on any backdrop (double-ring).
*   **Contrast:** icon/label ≥ 4.5:1 on the surface; container edge ≥ 3:1 vs. background (shadow/border); focus ring ≥ 3:1.
*   **Target size:** ≥ 44px live hit area (mini 40px padded up or not shipped on touch).
*   **Positioning:** `position: fixed` with `env(safe-area-inset-*)`, correct `z-index`, RTL-mirrored, and it does not cover content, bottom nav, snackbars, or Back-to-Top.
*   **Reflow:** lifts above snackbars/bottom sheets; scroll container has bottom padding so nothing hides under it.
*   **States:** default/hover/focus/active/disabled/loading all styled; busy state disables to prevent double-submit; async errors announced via `aria-live`, not a red FAB.
*   **Motion:** press, fan, and hide-on-scroll use transform/opacity only and are fully disabled under `prefers-reduced-motion`.
*   **Security:** the action's endpoint enforces authz server-side (the FAB is not the boundary); mutating endpoints are CSRF-protected and rate-limited.
*   **Distinct from Back to Top:** if both exist, they occupy different positions and read as different things (primary action vs. utility).
* * *

## 17\. Visual Styles

The same FAB — same button, same name, same keyboard behavior — wearing eleven skins. Each note is FAB-specific.

*   **Flat:** a solid Goldenrod circle with a crisp edge and _no_ shadow — the "float" is implied by fixed position and a hairline ring rather than elevation. The `+` is a flat stroke; the speed-dial items are identical flat circles.
*   **Material:** the canonical FAB — 56dp tonal/primary container, layered elevation-3 shadow lifting on press, a ripple emanating from the touch point, and the `+`→`×` icon morph on speed-dial open. This is home turf.
*   **Glassmorphism:** a translucent frosted circle with `backdrop-filter: blur()` over the content behind it, a 1px light inner border, and the icon in high-contrast white — watch that the blurred content never drops icon contrast below 4.5:1.
*   **Liquid Glass (2026):** Apple iOS 26 / Tahoe — the FAB is a refracting glass pill that bends the content beneath it, with a specular highlight rim and a sheen that shifts as the device moves; the speed-dial items emerge as smaller glass beads. Deep Eminence/Night backdrops make the refraction sing.
*   **Neumorphism:** the FAB as a soft extruded circle on a same-color surface — dual light/dark shadows make it look pressed _out_ of the page, inverting to an inset well on press. Contrast-poor by nature: reserve for a low-stakes secondary FAB, never the primary money action.
*   **Skeuomorphism:** a glossy physical button — beveled edge, top inner highlight, gradient fill, drop shadow — that looks like a real molded key you could press; the `+` gets a subtle engraved emboss.
*   **Neo-Brutalism:** a hard-edged circle (or square) with a thick black border, a chunky offset shadow (no blur), and a clashing Spanish-Orange fill; the speed dial snaps open with zero easing and the labels are raw monospace tags.
*   **Claymorphism:** a puffy, rounded Goldenrod blob with a big radius, inner top-light and bottom-shadow, and a soft outer glow — friendly and toy-like; speed-dial items are matching clay pebbles that squish on press.
*   **Aurora / Gradient:** the FAB carries a slow animated multi-hue gradient (Eminence→Spanish-Orange→Goldenrod) on a dark surface, glowing gently; premium and eye-catching — freeze the animation under `prefers-reduced-motion`.
*   **Minimal / Swiss:** a restrained circle, near-zero decoration, the icon doing all the work on a precise grid; the extended form uses tight Urbanist type and a single hairline — typography and spacing carry it, not effects.
*   **UJG Brand (house default):** Goldenrod `#DCA424` surface, Night `#0A0A0A` icon, a confident 16px radius, and a warm elevation glow over deep Eminence `#5F2C82`; the focus ring is a Platinum halo so it survives on any content; speed-dial items are mini Goldenrod circles with Urbanist labels.

**The rule that never changes:** the style is skin; the behavior is the skeleton. Across all eleven skins the FAB stays a real `<button>` with an accessible name, the same keyboard and focus contract, a visible focus ring, and a ≥44px target. Change the paint, never the bones.