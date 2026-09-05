# Drawer Navigation

# The Drawer: A Senior Engineer's Complete Breakdown
The panel that slides in from an edge, covers what you were doing, and slides back out. Simple to look at, deceptively deep to build right — here's everything from first principles to production code.

**Try it live:** every placement, mode, and gesture in this doc will be wired up in the companion **Drawer playground** (built in a later pass). It'll let you tune the edge (left/right/top/bottom), toggle modal vs non-modal, flip the scrim on and off, drag the bottom sheet between snap points, and watch the focus-trap and scroll-lock behavior in real time — with a one-click copy for all the code targets below.

**Audit a drawer:** the companion **Drawer a11y audit** (later pass) will paste in your drawer markup and run live checks — is there a focus trap, does Escape close it, does focus return to the trigger, is `aria-modal` set, does the trigger carry `aria-expanded`/`aria-controls`, is the background inert, is the scrim reachable — then export a client-ready report.

This doc is part of the UJG Digital Asset Library. Its closest siblings: the **Side menu** (the persistent, always-there cousin), the **Modal** (same overlay engine, different shape), the **Overlay** (the scrim + focus-trap + scroll-lock engine both of them borrow), and **Bottom Tabs** (the other primary mobile-nav pattern). Foundational references: [Button](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200231), [Cards](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200471), the [Component Asset Template](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531), and the [Design Styles (visual languages)](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200551).
* * *

## 1\. What a Drawer Actually Is
A drawer is a **container that slides in from an edge of the viewport, overlays the current content, and is dismissable**. It's temporary surface: you open it, you do a thing (navigate, adjust a setting, review a cart), you close it, and you're back where you were. That "slides from an edge + overlays + dismissable" trio is the whole definition. Miss any leg of it and you've built something else.

The word gets lumped together with three neighbors people constantly confuse:

*   **Drawer vs. Side menu.** This is the distinction juniors get wrong most. A **Side menu** (a.k.a. sidebar, rail, persistent navigation) _lives in the layout_ — it takes up a real column, pushes content over, and is always there on desktop. A **Drawer** is _temporary and overlaid_ — it's absent until summoned and it sits on top of content rather than reserving space for it. The same nav list can be a persistent Side menu at ≥1024px and collapse into a Drawer behind a hamburger below that. They share content; they do not share behavior. When you find yourself asking "does this take a focus trap and an Escape key?" the answer is yes for a Drawer, no for a Side menu. See the **Side menu** doc for the persistent pattern.
*   **Drawer vs. Modal.** A **Modal** (dialog) is centered, roughly symmetric, and grabs you for a focused decision — confirm, edit, alert. A **Drawer** is edge-anchored and usually holds _navigation or a secondary surface_ (settings, filters, cart, details). Mechanically they're siblings: a modal drawer and a modal dialog run the **exact same overlay engine** — scrim, focus trap, background inert, Escape to close, return focus on close. The difference is shape and intent, not plumbing. That's why this doc and the **Modal** doc cross-reference the same **Overlay** engine — build it once, skin it twice.
*   **Drawer vs. Popover/Menu.** A popover or dropdown menu is _anchored to a trigger_ and is light-dismiss (click outside closes it, no scrim, no trap). A drawer is _anchored to the viewport edge_, is heavier, and — when modal — traps focus. If it points at a button, it's a popover; if it slides from the screen edge, it's a drawer.

Rule of thumb: **if it's always in the layout, it's a Side menu; if it's centered and decision-focused, it's a Modal; if it's anchored to a button, it's a popover; if it slides in from an edge and overlays, it's a Drawer.**
* * *

## 2\. Why It Matters
The drawer is where **navigation and secondary flows go to live on small screens** — which, for most products, is the majority of traffic. That makes it load-bearing in ways that are easy to underappreciate:

*   **It's the mobile nav's home.** On phones there's no room for a persistent sidebar, so your entire information architecture collapses into a drawer behind a hamburger. If the drawer is janky, mis-labeled, or traps people, your _whole navigation_ is janky. The drawer is the front door on mobile.
*   **Cart and checkout conversion runs through it.** The right-side cart drawer ("slide-out cart," "mini-cart") is one of the most revenue-sensitive components in e-commerce. It lets users add to cart without losing their place on the product page. A cart drawer that loses scroll position, doesn't trap focus, or fails to restore the page underneath quietly bleeds checkouts.
*   **It's an accessibility cliff.** A modal drawer that doesn't trap focus lets keyboard and screen-reader users tab straight out into the page behind it — they're now interacting with content they can't see, with no way to know the drawer is even open. No focus return means they're dumped at the top of the document after closing. This is one of the most common serious a11y failures in the wild, and it's invisible to anyone testing with only a mouse.
*   **It sets the "does this app feel native" bar.** Swipe-to-open, drag-to-dismiss bottom sheets with snap points, momentum, and a scrim that fades with the drag — these are the interactions that make a web app feel like a real app. Get them right and the product feels premium; get them wrong (or skip them) and it feels like a website pretending.
* * *

## 3\. Anatomy of a Drawer
Every well-built drawer is composed of predictable parts:

*   **Trigger:** the control that opens it — usually a **hamburger button** for nav drawers, a cart icon for the cart drawer, a "Filters" button for a filter drawer. Carries `aria-expanded` and `aria-controls` (see §10). It is a real `<button>`, never a bare icon `<div>`.
*   **Scrim / backdrop / overlay:** the dimmed layer between the drawer and the page. Present on **modal** drawers, absent on **non-modal** ones. Clicking it is the standard "dismiss" gesture. This is the shared **Overlay** primitive.
*   **Panel (the drawer surface itself):** the sliding container. Has a fixed or max width (side drawers) or height (bottom/top sheets), its own scroll region, elevation/shadow, and a border-radius on the interior corners.
*   **Header:** optional — title, close affordance. The title is what `aria-labelledby` points at.
*   **Grabber / drag handle:** the little pill at the top of a **bottom sheet** signaling "drag me." Decorative to screen readers (`aria-hidden`), functional to touch.
*   **Body / content region:** the scrollable payload — nav list, form, cart lines, filter controls.
*   **Close button:** an explicit dismiss control (`aria-label="Close"`), in addition to scrim-click and Escape. Redundancy is correct here: never make Escape the _only_ way out.
*   **Focus sentinels / trap boundary:** invisible machinery (or a library) that keeps Tab focus cycling inside the panel while it's open.
*   **The trigger's remembered focus:** not a DOM node you render, but a variable you _must_ hold — the element to return focus to on close.
* * *

## 4\. Sizes, Placement & Density
Two axes: **which edge** it comes from, and **how big** it is.

**Placement — the edge dictates the meaning.**

| Edge | Common name | Typical use | Sizing |
| ---| ---| ---| --- |
| Left | Nav drawer | Primary navigation on mobile; app menu | 75–85vw, max ~320–360px |
| Right | Settings / cart drawer | Cart, filters, details, settings, notifications | 320–420px; 90vw on mobile |
| Bottom | Bottom sheet | Mobile actions, pickers, share menus, contextual detail | Auto height + snap points; up to ~90vh |
| Top | Notification / search drawer | Global search, notification shade, banners | Auto height, ≤60vh |

Placement conventions worth knowing: **left = "where am I / where can I go"** (navigation), **right = "what about this / adjust this"** (cart, settings, filters — the secondary surface pattern), **bottom = touch-reachable actions** (thumbs live at the bottom of the screen), **top = system/global** (search, notifications).

**Width/height scale.**

| Token | Side drawer width | Bottom sheet height | Use |
| ---| ---| ---| --- |
| Compact | 280px | 40vh (peek) | Dense nav, quick pickers |
| Default | 320px | 60vh (half) | Standard mobile nav, cart |
| Wide | 400–480px | 90vh (full) | Settings, forms, rich detail |
| Full | 100vw | 100vh | Mobile takeover, fullscreen sheet |

Rules that matter:

*   **Never make a side drawer 100vw on desktop** — a drawer that covers everything is just a modal that forgot to center. Cap it (`max-inline-size`) and keep a sliver of scrim visible so users see there's a "behind" to return to.
*   **On mobile, leave a scrim gutter.** A left nav drawer at ~85vw with the remaining ~15% as tappable scrim tells the user "tap here to close" without instruction.
*   **Bottom sheets use snap points, not a single height** (see §5 and §9). A picker peeks at 40vh, expands to 90vh on drag.
*   **Height is driven by content up to a max, then the body scrolls** — the panel never exceeds the viewport, and the _body_ scrolls, not the page behind it (scroll-lock, §10).
* * *

## 5\. States (the part juniors forget)
A drawer has more states than a button because it has a _lifecycle_ and it owns a chunk of the environment while open. Missing states is the #1 tell of an amateur build.

1. **Closed (rest)** — not in the DOM, or present but `hidden`/`inert` and translated off-screen. The trigger shows `aria-expanded="false"`.
2. **Opening (transition-in)** — sliding in via `transform`. Scrim fades up. Focus is _about_ to move into the panel.
3. **Open (active)** — fully in. Focus is trapped inside, background is inert, page scroll is locked. Trigger shows `aria-expanded="true"`.
4. **Closing (transition-out)** — sliding back out. Focus is _returning_ to the trigger. The panel must stay in the DOM until the animation finishes (don't yank it mid-transition).
5. **Dragging (bottom sheet / swipe)** — the user's finger owns the panel position; the scrim opacity tracks the drag distance. Momentum and snap decisions happen on release.
6. **Snapped (bottom sheet)** — resting at one of its defined snap points (peek / half / full).
7. **Loading** — content not ready yet (cart fetching, filters loading). Show skeletons _inside_ the panel, keep the panel open and stable.
8. **Empty** — the drawer opened but has nothing (empty cart, no notifications). Needs a real empty state, not a blank panel.
9. **Error** — content failed to load. Retry affordance inside the panel; don't silently close.
10. **Focus (within)** — an item inside has keyboard focus; the trap keeps it circulating.

Two states people forget entirely: **the closing state** (ripping the node out before the animation ends causes a flash and breaks focus return) and **the dragging state** (the sheet must follow the finger 1:1, not animate to a target — animation is only for the _release_).
* * *

## 6\. Types & Variants
Two independent dimensions: **modality** and **placement/behavior**. Get modality right first — it decides the entire accessibility contract.

### Modal vs. Non-modal — the decision that changes everything
*   **Modal drawer** — has a **scrim**, **traps focus**, makes the **background inert**, **locks scroll**, and **closes on Escape**. The user must deal with it before returning to the page. This is the default for mobile nav, cart, and anything that demands attention. It runs the full **Overlay** engine (shared with **Modal**). `role="dialog"` + `aria-modal="true"`.
*   **Non-modal drawer** — **no scrim** (or a light, non-blocking one), background stays **interactive**, focus is **not trapped**, Escape is optional, scroll is **not locked**. The classic case is a **push drawer** that shoves the main content aside instead of covering it — desktop side panels, a persistent-ish filter rail, an inspector panel you keep open while working in the canvas. Here you do **not** set `aria-modal="true"` (it would lie to screen readers), and you must ensure the drawer is reachable in the normal tab order. When a "drawer" pushes content and stays open while you work, it's edging toward being a **Side menu** — decide deliberately which one you're building.

The single most common modality bug: shipping a drawer with a scrim (so it _looks_ modal) but **no focus trap and no** **`aria-modal`** — the worst of both worlds. It looks like it should trap you, screen readers aren't told it's modal, and keyboard focus escapes behind the scrim into content the user can't see.

### By placement/behavior
*   **Left nav drawer** — the hamburger menu. Primary IA on mobile.
*   **Right settings/cart drawer** — the secondary-surface pattern. Cart, filters, notifications, details, settings.
*   **Bottom sheet** — mobile-first, thumb-reachable. Two flavors: **modal bottom sheet** (scrim, blocks) and **non-modal/standard bottom sheet** (persistent peek, content still usable). Supports **drag-to-dismiss** and **snap points**.
*   **Top drawer / shade** — global search or notification shade pulled from the top.
*   **Push drawer** (non-modal) — reflows main content rather than covering it. Desktop inspectors, side-by-side editing.
*   **Persistent/permanent drawer** — always visible at wide breakpoints; this is functionally the **Side menu** — see that doc.
*   **Fullscreen sheet** — a bottom sheet expanded to cover the viewport on mobile; a takeover that's still dismissable by dragging down.
* * *

## 7\. When to Use One (and When Not To)
Use a drawer when you need a **temporary surface anchored to an edge** — navigation, secondary tasks, or contextual detail that shouldn't take you off the page. Reach for something else when:

*   **The content is a focused decision** → use a **Modal** (centered, symmetric) instead of forcing nav-shaped chrome onto a yes/no.
*   **The navigation should always be visible** (desktop app with room) → use a **Side menu**, not a drawer you keep re-opening.
*   **You have ≤5 primary destinations on mobile** → **Bottom Tabs** usually beat a hamburger drawer. Tabs keep destinations one tap away and visible; a drawer hides them behind a click and out of sight ("the hamburger costs discoverability"). Use a drawer for _secondary_ or _overflow_ nav, tabs for the top-level few. See the **Bottom Tabs** doc.
*   **It's anchored to a specific control** (a "more" button, a field) → use a **popover/menu**, not a full-height drawer.
*   **The action is a single quick pick on desktop** → a dropdown is lighter than sliding a whole panel.

Placement heuristics:

*   **Nav from the left, secondary surfaces from the right** (Western LTR convention). Cart, filters, settings, details → right. Flip for RTL (§9).
*   **Actions and pickers from the bottom on mobile** — that's where thumbs are.
*   **The trigger and the drawer edge should agree** — a hamburger on the top-left opens a left drawer; a cart icon top-right opens a right drawer. Opening from the opposite edge disorients.
*   **Never stack drawers.** A drawer that opens another drawer is a navigation smell. Replace the content in place or step down a level.
* * *

## 8\. Drawers Across Design Systems
Same component, different philosophies and even different _names_ — which is half the confusion.

*   **Material Design (Google):** The reference vocabulary. **Navigation drawer** (standard = non-modal/push, modal = scrim + trap, permanent = persistent) and **Bottom sheet** (standard vs. modal, with drag + expand). Material 3 formalizes side sheets too. Elevation, scrim at ~32% black, and a specified motion spec. This is where "modal vs standard vs permanent drawer" terminology comes from.
*   **Apple HIG (iOS/macOS):** The **sheet** is the native idiom — sheets slide up from the bottom, support **detents** (`.medium`, `.large` — Apple's word for snap points), and a grabber. `.sheet` and `.presentationDetents` in SwiftUI. macOS uses **sidebars** (persistent) and the `NSDrawer` is deprecated in favor of split views. Right-edge "inspector" panels are the settings-drawer analog.
*   **Fluent (Microsoft):** The **Panel** (a.k.a. Drawer) slides from the right by default, sizes are tokenized (small → full), and it's used heavily for detail/edit surfaces in data-dense admin UIs. Dismiss + light-dismiss options built in.
*   **Ant Design / enterprise:** `Drawer` component with a `placement` prop (`left`/`right`/`top`/`bottom`), `mask` (scrim) toggle, `push`/`nested` support, and sizes. Built for admin panels — edit-in-drawer instead of navigating away is a core Ant pattern.
*   **Tailwind / utility-first:** No prescribed drawer; you compose it (fixed positioning, translate transforms, a scrim div) or drop in **Headless UI** **`Dialog`** for the a11y. Freedom + the responsibility to wire the trap yourself.
*   **Radix / shadcn (2024+ web standard):** shadcn's `Sheet` = Radix `Dialog` skinned as an edge drawer (accessibility, focus trap, Escape all inherited from Radix Dialog). shadcn's `Drawer` wraps **Vaul** for the draggable bottom-sheet feel. This is the modern default: **a drawer is a Dialog with a side animation.**
*   **Vaul (Emil Kowalski):** The library that nailed the iOS-quality draggable bottom sheet for React — snap points, velocity-based dismiss, scaled-background effect. Now the de-facto web bottom sheet.

The through-line: **almost every mature system implements the drawer as a specialized Dialog/Overlay** — which is exactly why the focus-trap engine is shared with **Modal**.
* * *

## 9\. The Code
The heart of the doc. A drawer is a Dialog with an edge animation, a scrim, and (sometimes) a drag gesture. Build the overlay engine once; reuse it everywhere.

### 9.1 HTML (the foundation — and the native `<dialog>`)
The honest baseline. Modern browsers give you a real modal primitive: `<dialog>`. `showModal()` gives you focus trap, `::backdrop`, Escape-to-close, and background inert **for free** — you only add the slide animation.

```plain
<!-- Trigger: a real button, wired to the drawer -->
<button type="button" id="navTrigger"
        aria-expanded="false" aria-controls="navDrawer" aria-haspopup="dialog">
  <svg aria-hidden="true" width="24" height="24"><!-- hamburger --></svg>
  <span class="sr-only">Open menu</span>
</button>

<!-- The drawer as a native dialog, anchored to the left edge -->
<dialog id="navDrawer" class="drawer drawer--left" aria-labelledby="navTitle">
  <div class="drawer__header">
    <h2 id="navTitle">Menu</h2>
    <button type="button" class="drawer__close" aria-label="Close menu" data-close>
      <svg aria-hidden="true"><!-- X --></svg>
    </button>
  </div>
  <nav class="drawer__body" aria-label="Main">
    <ul>
      <li><a href="/home">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li><a href="/account">Account</a></li>
    </ul>
  </nav>
</dialog>
```

Key HTML rules:

*   **The trigger is a** **`<button>`**, with `aria-expanded` (reflecting open state), `aria-controls` pointing at the drawer's `id`, and `aria-haspopup="dialog"`. Icon-only triggers need an accessible name (`sr-only` span or `aria-label`).
*   **`<dialog>`** **+** **`showModal()`** **is the cheat code**: native focus trap, native Escape, native `::backdrop` scrim, native inert background. You are _only_ responsible for the slide animation and returning focus (the browser handles most of it — it even restores focus to the trigger on `close` in modern engines).
*   **The** **`<h2>`** **in the header is the** **`aria-labelledby`** **target** — that's how the dialog announces itself.
*   Always ship a visible **close button** _and_ rely on Escape _and_ scrim-click. Three ways out, never one.

### 9.2 CSS (the slide, the scrim, states done right)
The #1 animation mistake: animating `width`/`left`. **Animate** **`transform`****\*\*\*\*, never layout.** `transform` and `opacity` are compositor-only (no reflow); `width`/`left` reflow every frame and stutter.

```css
.drawer {
  position: fixed;
  inset-block: 0;               /* top:0; bottom:0 */
  inline-size: min(85vw, 360px);
  margin: 0;                    /* reset <dialog> centering */
  border: none;
  background: #0A0A0A;
  color: #E8E6E1;
  display: flex;
  flex-direction: column;
  /* GPU-friendly: transform, not left/width */
  transition: transform .3s cubic-bezier(.32, .72, 0, 1);
  will-change: transform;
}

/* Left drawer: parked off-screen to the left, slides to 0 */
.drawer--left  { inset-inline-start: 0; transform: translateX(-100%); }
.drawer--right { inset-inline-end: 0;  transform: translateX(100%); }
.drawer--bottom {
  inset-inline: 0; inset-block-end: 0; inline-size: 100%;
  block-size: min(90vh, 640px); transform: translateY(100%);
  border-start-start-radius: 16px; border-start-end-radius: 16px;
}

/* Open state (native <dialog> sets [open]; custom impls toggle a class) */
.drawer[open] { transform: none; }

/* The scrim: native ::backdrop for <dialog>, or a sibling div otherwise */
.drawer::backdrop {
  background: rgb(10 10 10 / .55);
  backdrop-filter: blur(2px);
  animation: scrim-in .3s ease both;
}
@keyframes scrim-in { from { opacity: 0 } to { opacity: 1 } }

/* Body scrolls, panel doesn't */
.drawer__body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }

/* Focus ring on interactive children — never removed */
.drawer :where(a, button):focus-visible {
  outline: 2px solid #DCA424; outline-offset: 2px;
}

/* Grabber for bottom sheets */
.drawer--bottom::before {
  content: ""; inline-size: 36px; block-size: 4px; border-radius: 2px;
  background: #5F2C82; margin: 8px auto; flex: none;
}

/* Reduced motion: no slide, just appear */
@media (prefers-reduced-motion: reduce) {
  .drawer { transition: none; }
  .drawer::backdrop { animation: none; }
}
```

Why `overscroll-behavior: contain` on the body: it stops **scroll chaining** — scrolling to the bottom of the drawer's list won't start scrolling the page behind it. Pair with the JS scroll-lock (§10) for a full fix.

### 9.3 Vanilla JS (the overlay engine, by hand)
This is the machine that **Modal** and **Drawer** share. If you learn one thing from this doc, learn this: open → move focus in → trap → lock scroll → on close, restore scroll and **return focus to the trigger**.

```javascript
const trigger = document.querySelector("#navTrigger");
const drawer  = document.querySelector("#navDrawer");
let lastFocused = null;

function openDrawer() {
  lastFocused = document.activeElement;          // remember who opened it
  drawer.showModal();                            // native: trap + backdrop + Esc + inert
  trigger.setAttribute("aria-expanded", "true");
  lockScroll();
  // Move focus to the first focusable inside (or the close button)
  drawer.querySelector("[data-close], a, button")?.focus();
}

function closeDrawer() {
  drawer.close();                                // fires the 'close' event
}

drawer.addEventListener("close", () => {         // covers Esc, .close(), backdrop
  trigger.setAttribute("aria-expanded", "false");
  unlockScroll();
  lastFocused?.focus();                          // RETURN FOCUS — the step people skip
});

// Scrim (backdrop) click: dialog's backdrop clicks land on the dialog element itself
drawer.addEventListener("click", (e) => {
  if (e.target === drawer) closeDrawer();        // clicked the ::backdrop, not the panel
});
drawer.querySelector("[data-close]")?.addEventListener("click", closeDrawer);
trigger.addEventListener("click", openDrawer);

// Scroll lock without layout shift (compensate for the scrollbar)
function lockScroll() {
  const sw = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = sw + "px";  // no content jump
}
function unlockScroll() {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}
```

If you are **not** using `<dialog>`, you must hand-roll the trap. Here's the boundary logic every framework re-implements:

```javascript
// Manual focus trap for a <div role="dialog"> drawer
function trapFocus(panel, e) {
  if (e.key !== "Tab") return;
  const f = panel.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
  else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
}
// Also: set the rest of the page inert -> document.querySelector("#app").inert = true;
```

Modern shortcut: instead of the manual trap, toggle the `inert` attribute on everything _except_ the drawer. `main.inert = true` while open removes the entire background from tab order, focus, and the accessibility tree in one line — the cleanest non-`<dialog>` approach.

### 9.4 React + TypeScript (a proper, reusable Drawer)
The production component. Handles placement, modality, Escape, scrim, scroll-lock, focus-in, and **focus-return**. Uses a portal so the drawer isn't trapped inside a `overflow:hidden`/`transform` ancestor (a classic bug).

```typescript
import {
  forwardRef, useEffect, useRef, useCallback, type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Placement = "left" | "right" | "top" | "bottom";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  placement?: Placement;
  modal?: boolean;               // scrim + trap + scroll-lock (default true)
  labelledBy?: string;           // id of the heading
  children: ReactNode;
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { open, onClose, placement = "left", modal = true, labelledBy, children },
  _ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Escape to close (only for modal drawers)
  useEffect(() => {
    if (!open || !modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, modal, onClose]);

  // Focus management: capture opener, move focus in, restore on close.
  // Return-focus lives in the cleanup so it fires on close AND on unmount —
  // an `else` branch would silently skip a drawer that unmounts while still
  // open (e.g. the intercepting-route drawer in §9.8, whose `open` is always true).
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement;
    // wait a frame so the panel is in the DOM
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(
        "[data-autofocus], button, a, input, [tabindex]"
      )?.focus();
    });
    return () => {
      lastFocused.current?.focus();   // RETURN FOCUS to the trigger (close + unmount)
    };
  }, [open]);

  // Scroll-lock while a modal drawer is open
  useEffect(() => {
    if (!open || !modal) return;
    const prev = document.body.style.overflow;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${sw}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = "";
    };
  }, [open, modal]);

  // Background inert while a modal drawer is open: removes the rest of the page
  // from Tab order AND the a11y tree (aria-modal alone is unevenly honored).
  // Everything under <body> except our own portal root is inerted; restored on
  // close AND unmount, so the page is never left frozen-inert.
  useEffect(() => {
    if (!open || !modal) return;
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== rootRef.current
    ) as HTMLElement[];
    const prev = siblings.map((el) => el.inert);
    siblings.forEach((el) => { el.inert = true; });
    return () => siblings.forEach((el, i) => { el.inert = prev[i]; });
  }, [open, modal]);

  // Focus trap (Tab cycling) — reused overlay logic
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const f = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }, []);

  if (!open) return null;

  const tree = (
    <div ref={rootRef} className="drawer-root" data-placement={placement}>
      {modal && <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />}
      <div
        ref={panelRef}
        className={`drawer drawer--${placement}`}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={labelledBy}
        onKeyDown={onKeyDown}
        data-open="true"
      >
        {children}
      </div>
    </div>
  );

  return createPortal(tree, document.body);
});
```

Why this is the senior version, not the junior one:

*   **Portaled to** **`document.body`** so no ancestor's `overflow:hidden` or `transform` clips or mis-positions it — the single most common "why is my drawer cut off" bug.
*   **`aria-modal={modal || undefined}`** is _conditional_ — a non-modal push drawer **omits** the attribute entirely (never `aria-modal="false"`), so it never claims the page is unavailable.
*   **Focus is captured on open and restored in the effect cleanup** — so it returns to the trigger both on close _and_ when the drawer unmounts while still open (the §9.8 route case). Restoring in an `else` branch would silently skip the unmount path.
*   **Background is made** **`inert`** **while modal** — the rest of the page leaves Tab order and the a11y tree, and the state is restored on close and unmount so the page is never left frozen-inert.
*   **Escape, scroll-lock, and inert are gated on** **`modal`** — non-modal drawers leave the page usable, as they should.
*   **`return null`** **when closed** keeps it out of the tree; a real app animates the exit with `data-open` + a transition and delays unmount (see the AnimatePresence note in §11).

Usage:

```typescript
function AppHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button aria-expanded={open} aria-controls="nav" aria-haspopup="dialog"
              onClick={() => setOpen(true)}>Menu</button>
      <Drawer open={open} onClose={() => setOpen(false)} placement="left" labelledBy="navTitle">
        <header className="drawer__header">
          <h2 id="navTitle">Menu</h2>
          <button data-autofocus aria-label="Close" onClick={() => setOpen(false)}>×</button>
        </header>
        <nav aria-label="Main">…</nav>
      </Drawer>
    </>
  );
}
```

### 9.5 The native `<dialog>` as a drawer (the low-JS path)
The leanest accessible drawer in 2026. `<dialog>` gives you the trap, the backdrop, Escape, and inert background natively — you supply CSS for the slide and one line to open.

```typescript
"use client";
import { useRef } from "react";

export function DialogDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button onClick={() => ref.current?.showModal()}
              aria-haspopup="dialog">Filters</button>
      <dialog ref={ref} className="drawer drawer--right" aria-labelledby="fTitle"
              onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <h2 id="fTitle">Filters</h2>
        <form method="dialog">   {/* method="dialog" submit closes + returns focus */}
          {/* filter controls */}
          <button value="apply">Apply</button>
        </form>
      </dialog>
    </>
  );
}
```

`method="dialog"` on a form is the elegant part: the submit button closes the dialog _and_ the browser returns focus to the opener automatically — no `lastFocused` bookkeeping. The remaining work is purely the slide animation (§9.2) and, if you want an exit transition, `@starting-style` + `transition-behavior: allow-discrete` so the closing slide plays before `display:none`.

### 9.6 Vaul & Radix (the shadcn `Sheet` and `Drawer`)
The 2024+ web standard. Two shadcn components, two engines:

**`Sheet`** **\= Radix Dialog skinned as an edge drawer.** You get Radix's battle-tested focus trap, Escape, scroll-lock, and `aria-modal` for free; you only pick the side.

```typescript
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

export function CartSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Open cart">🛒</button>
      </SheetTrigger>
      {/* side = "left" | "right" | "top" | "bottom" */}
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader><SheetTitle>Your cart</SheetTitle></SheetHeader>
        {/* cart lines */}
      </SheetContent>
    </Sheet>
  );
}
```

`SheetContent` already wires `role="dialog"`, `aria-modal`, focus trap, Escape, return-focus, and the portal. **Do not** rebuild those — that's the whole point of standing on Radix.

**`Drawer`** **\= Vaul, for the draggable bottom sheet.** When you want the iOS-quality drag, momentum, and scaled background:

```typescript
import { Drawer } from "vaul";

export function MobileSheet() {
  return (
    <Drawer.Root snapPoints={[0.4, 0.9]} shouldScaleBackground>
      <Drawer.Trigger asChild><button>Open</button></Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/55" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 rounded-t-2xl bg-neutral-950">
          <div aria-hidden className="mx-auto my-2 h-1 w-9 rounded-full bg-purple-800" />
          <Drawer.Title className="px-4">Options</Drawer.Title>
          {/* content */}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Vaul handles velocity-based dismiss, snap-point physics, and the drag handle affordance while inheriting Dialog accessibility. This is the honest "don't build the physics yourself" answer.

### 9.7 Bottom sheet with snap points (from scratch)
When you can't add Vaul, here's the real drag logic — the panel must **follow the finger 1:1**, and only **animate on release** toward the nearest snap point (or dismiss past a velocity/threshold).

```javascript
const sheet = document.querySelector(".drawer--bottom");
const snaps = [0.4, 0.9];                 // fractions of viewport height
let startY = 0, startTranslate = 0, dragging = false;

sheet.addEventListener("pointerdown", (e) => {
  dragging = true; startY = e.clientY;
  startTranslate = currentTranslatePx(sheet);
  sheet.style.transition = "none";        // 1:1 tracking, no lag
  sheet.setPointerCapture(e.pointerId);
});

sheet.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dy = Math.max(0, e.clientY - startY);          // down-only
  sheet.style.transform = `translateY(${startTranslate + dy}px)`;
  // scrim tracks the drag
  scrim.style.opacity = String(1 - dy / window.innerHeight);
});

sheet.addEventListener("pointerup", (e) => {
  dragging = false;
  sheet.style.transition = "transform .3s cubic-bezier(.32,.72,0,1)";
  const posFrac = 1 - currentTranslatePx(sheet) / window.innerHeight;
  // dismiss if dragged below the smallest snap, else snap to nearest
  if (posFrac < snaps[0] * 0.6) return closeSheet();
  const nearest = snaps.reduce((a, b) =>
    Math.abs(b - posFrac) < Math.abs(a - posFrac) ? b : a);
  sheet.style.transform = `translateY(${(1 - nearest) * window.innerHeight}px)`;
});
```

The two rules that make it feel native: **`transition:none`** **during the drag** (so it tracks the finger with zero lag) and **velocity/threshold-based dismiss** (a fast flick down closes even from the full snap). Keyboard users get the same via a close button and Escape — the drag is an _enhancement_, never the only way.

### 9.8 Next.js (App Router: URL-driven drawers)
The senior Next.js move: make the drawer's open state **a URL**, not just local state — so it's shareable, back-button-closable, and server-render-friendly. Parallel + intercepting routes turn a route into a drawer while keeping the underlying page.

```typescript
// app/@drawer/(.)cart/page.tsx  — intercepts /cart, renders it as a drawer
"use client";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/Drawer";

export default function CartDrawer() {
  const router = useRouter();
  return (
    <Drawer open onClose={() => router.back()} placement="right" labelledBy="cartTitle">
      <h2 id="cartTitle">Your cart</h2>
      {/* server component data can be passed in */}
    </Drawer>
  );
}
```

Hitting `/cart` from within the app opens it as a right drawer over the current page; a hard load of `/cart` renders the full page. **Escape / back closes it** by popping the route. This is how modern apps get "the cart is a URL you can share" without losing the overlay feel. The interactive drawer must still be a Client Component (it has state + `onClick`); the content inside can be server-rendered.

### 9.9 Node.js (the endpoint behind a drawer)
Drawers frequently _contain_ actions — the cart drawer's "checkout," the filter drawer's "apply," the settings drawer's "save." Those hit the server, and the same defenses as any action apply (auth, validation, idempotency). The drawer being modal is UX, not security.

```typescript
import express from "express";
import { z } from "zod";
const router = express.Router();

const ApplyFilters = z.object({
  category: z.string().optional(),
  min: z.number().nonnegative().optional(),
  max: z.number().nonnegative().optional(),
});

// The filter drawer's "Apply" posts here (or drives a query string)
router.get("/api/products", (req, res) => {
  const parsed = ApplyFilters.safeParse({
    category: req.query.category,
    min: req.query.min ? Number(req.query.min) : undefined,
    max: req.query.max ? Number(req.query.max) : undefined,
  });
  if (!parsed.success) return res.status(422).json(parsed.error.issues);
  // ...query with validated filters
  res.json({ items: [] });
});

// The cart drawer's "Checkout" — idempotent, authorized, validated
router.post("/api/checkout", requireAuth, async (req, res) => {
  // Authorize FIRST — before any idempotency lookup — so a replayed key can
  // never short-circuit the permission check.
  if (!req.user.can("create", "order")) return res.sendStatus(403);
  const key = req.header("Idempotency-Key");
  // Scope the key to the actor so one user can't replay another user's key.
  const existing = key && await db.findByIdempotencyKey(req.user.id, key);
  if (existing) return res.status(200).json(existing);
  // ...create the order
  res.status(201).json({ ok: true });
});

export default router;
```

The point: **the drawer is a container, not a trust boundary.** Everything the Button doc says about idempotency, authorization, and validation applies to the actions a drawer holds.

### 9.10 Python (backend + a server-rendered drawer)
**Backend (FastAPI)** for a drawer that loads its content lazily (open the cart → fetch lines):

```python
from fastapi import FastAPI, Depends, HTTPException
app = FastAPI()

@app.get("/api/cart")
def get_cart(user=Depends(require_auth)):
    lines = db.cart_lines(user_id=user.id)
    if lines is None:
        raise HTTPException(404, "No cart")
    return {"lines": lines, "subtotal": sum(l["price"] for l in lines)}
```

**Rendering** a drawer server-side (Django/Jinja) — the panel ships in the HTML, JS only toggles the open class and manages focus:

```plain
<button type="button" aria-expanded="false" aria-controls="cart"
        data-drawer-trigger="cart">Cart ({{ cart.count }})</button>

<div id="cart" class="drawer drawer--right" role="dialog" aria-modal="true"
     aria-labelledby="cartTitle" hidden>
  <h2 id="cartTitle">Your cart</h2>
  {% if cart.lines %}
    <ul>{% for line in cart.lines %}<li>{{ line.name }}</li>{% endfor %}</ul>
  {% else %}
    <p>Your cart is empty.</p>   {# the empty state, not a blank panel #}
  {% endif %}
</div>
```

Python note: as always, the drawer lives in HTML/JS; Python renders it and defends the endpoints behind its actions. The `hidden` attribute + a class toggle keeps it out of the a11y tree until opened.

### 9.11 Testing (focus trap + Escape + axe)
A drawer _is_ behavior — you test the behavior, not the class names. The three assertions that matter most and that people skip: **focus moves in on open, Tab is trapped, Escape closes and focus returns.**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, it, expect } from "vitest";
import { DrawerDemo } from "./DrawerDemo";

describe("Drawer", () => {
  it("opens, moves focus inside, and exposes a dialog", async () => {
    render(<DrawerDemo />);
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // focus landed inside the panel
    expect(dialog).toContainElement(document.activeElement);
  });

  it("traps Tab focus inside the panel", async () => {
    render(<DrawerDemo />);
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    const dialog = screen.getByRole("dialog");
    // tab through every focusable + once more; focus must stay inside
    for (let i = 0; i < 8; i++) await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement);
  });

  it("closes on Escape and RETURNS focus to the trigger", async () => {
    render(<DrawerDemo />);
    const trigger = screen.getByRole("button", { name: /menu/i });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();          // the assertion people forget
  });

  it("closes on scrim click", async () => {
    render(<DrawerDemo />);
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    await userEvent.click(document.querySelector(".drawer-scrim")!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has no automatically-detectable a11y violations", async () => {
    const { container } = render(<DrawerDemo />);
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Playwright** for the real browser round-trip, including scroll-lock:

```typescript
import { test, expect } from "@playwright/test";

test("nav drawer traps focus and locks scroll", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // background scroll is locked while open
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
});
```

What to assert (and skip):

*   **Do test:** dialog role + `aria-modal`, focus moves in, Tab is trapped, Escape closes, **focus returns to the trigger**, scrim click closes, scroll is locked, axe is clean.
*   **Don't test:** exact transform values, animation timing, hex colors, class names.
*   **Bonus:** for bottom sheets, assert snap-point behavior via pointer events and that a keyboard user can still dismiss via the close button.

### 9.12 Other frameworks (Vue, Svelte, Angular, Bootstrap, Web Component)
Same overlay engine, different syntax. The `role="dialog"` + trap + return-focus never changes.

**Vue 3 (Headless UI** **`Dialog`** **as a drawer):**

```plain
<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Dialog :open="open" @close="emit('close')" class="drawer-root">
    <div class="drawer-scrim" aria-hidden="true" />
    <DialogPanel class="drawer drawer--right">
      <DialogTitle>Filters</DialogTitle>
      <slot />
    </DialogPanel>
  </Dialog>   <!-- Headless UI supplies trap + Esc + return-focus -->
</template>
```

**Svelte** (native `<dialog>`, the leanest path):

```plain
<script lang="ts">
  let dialog: HTMLDialogElement;
  export function open() { dialog.showModal(); }
</script>

<dialog bind:this={dialog} class="drawer drawer--left"
        on:click={(e) => e.target === dialog && dialog.close()}>
  <slot />
</dialog>   <!-- showModal() = trap + backdrop + Esc + return-focus, free -->
```

**Angular (CDK):** `@angular/cdk/dialog` or the `Overlay` + `cdkTrapFocus` directive is the idiomatic answer — the CDK gives you the focus trap, scroll strategy, and backdrop; you supply the slide.

```typescript
// Template: <div cdkTrapFocus class="drawer drawer--right" role="dialog" aria-modal="true">
// Open via Dialog service: this.dialog.open(FilterDrawer, { panelClass: 'drawer--right' });
```

**Bootstrap** ships this as **Offcanvas** — a ready-made drawer component:

```plain
<button class="btn btn-primary" data-bs-toggle="offcanvas"
        data-bs-target="#nav" aria-controls="nav">Menu</button>

<div class="offcanvas offcanvas-start" tabindex="-1" id="nav"
     aria-labelledby="navLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="navLabel">Menu</h5>
    <button class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body"><!-- nav --></div>
</div>
```

`offcanvas-start|end|top|bottom` picks the edge; Bootstrap's JS handles backdrop, Escape, focus trap, and scroll-lock. It's the fastest route to a correct drawer if you're already on Bootstrap. The tradeoff, as always: every Bootstrap offcanvas looks like Bootstrap until you override the Sass.

**Web Component** (framework-agnostic, wraps native `<dialog>`):

```typescript
class UIDrawer extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    // Never interpolate a raw attribute into innerHTML — clamp `side` to a known
    // allow-list so it can't break out of the class attribute (option/HTML injection).
    const sides = ["left", "right", "top", "bottom"];
    const side = sides.includes(this.getAttribute("side")!) ? this.getAttribute("side") : "left";
    this.shadowRoot!.innerHTML = `
      <style>/* scoped .drawer + slide */</style>
      <dialog part="panel" class="drawer drawer--${side}">
        <slot></slot>
      </dialog>`;
    this._dialog = this.shadowRoot!.querySelector("dialog");
  }
  open()  { this._dialog.showModal(); }
  close() { this._dialog.close(); }
}
customElements.define("ui-drawer", UIDrawer);
// <ui-drawer side="right"><nav>…</nav></ui-drawer>
```

### 9.13 Native mobile (SwiftUI, Jetpack Compose, Flutter)
Off the web, the drawer concept is first-class on every platform — usually as a **sheet/detent** (bottom) or a **navigation drawer** (side).

**SwiftUI (iOS) — sheet with detents = a bottom sheet with snap points:**

```plain
.sheet(isPresented: $showCart) {
    CartView()
        .presentationDetents([.medium, .large])   // the snap points
        .presentationDragIndicator(.visible)       // the grabber
}
// Side "drawer" on iPad/macOS = NavigationSplitView (persistent), not a sheet.
```

**Jetpack Compose (Android) — ModalNavigationDrawer + ModalBottomSheet:**

```kotlin
ModalNavigationDrawer(
    drawerState = drawerState,
    drawerContent = { ModalDrawerSheet { /* nav items */ } }
) { /* screen content */ }

// Bottom sheet with drag:
ModalBottomSheet(onDismissRequest = { open = false }) { /* content */ }
```

**Flutter (Dart) — Scaffold.drawer + showModalBottomSheet:**

```plain
Scaffold(
  drawer: Drawer(child: ListView(children: [...])),  // left nav drawer, swipe-to-open free
  endDrawer: Drawer(child: ...),                      // right drawer
);
// Bottom sheet:
showModalBottomSheet(context: context, isScrollControlled: true, builder: ...);
```

The through-line: every platform gives you a **side navigation drawer** (with swipe-to-open) and a **bottom sheet with detents/snap points and a grabber**, plus a **scrim + dismiss**. Learn the concept once — modal vs standard, edge, snap points, return focus — and remap the syntax.
* * *

## 10\. Accessibility (non-negotiable)
A drawer is one of the highest-risk components for a11y because it owns focus, scroll, and the background while open. Get these right or keyboard and screen-reader users are stranded.

*   **The trigger is a real** **`<button>`** with **`aria-expanded`** (toggles `true`/`false`), **`aria-controls`** pointing at the drawer `id`, and **`aria-haspopup="dialog"`**. Icon-only triggers (hamburger, cart) need an accessible name (`aria-label` or visually-hidden text).
*   **The panel is** **`role="dialog"`** (native `<dialog>` gives this free) with **`aria-modal="true"`** _only when it's actually modal_. A non-modal push drawer must **not** set `aria-modal` — that would falsely tell AT the rest of the page is unavailable.
*   **Label the dialog.** `aria-labelledby` pointing at the header, or `aria-label` if there's no visible title. An unlabeled dialog announces as just "dialog."
*   **Focus moves in on open** — to the first focusable element, the close button, or a `[data-autofocus]` target. Never leave focus on the trigger behind the scrim.
*   **Focus is trapped** while a modal drawer is open — Tab and Shift+Tab cycle within the panel and never reach the inert background. Use `<dialog>`, `inert` on the background, or a library trap.
*   **Focus returns to the trigger on close** — the single most-skipped requirement. On close, focus goes back to the element that opened the drawer (or a sensible nearby target if that element is gone).
*   **Escape closes modal drawers.** Always. And it's never the _only_ way out — a visible close button and scrim-click must also work.
*   **Scroll is locked** on the background while a modal drawer is open (compensate for scrollbar width to avoid layout shift); `overscroll-behavior: contain` on the panel body prevents scroll chaining.
*   **The background is inert** — not just visually dimmed. Screen-reader virtual cursor and Tab must both be prevented from reaching it (`inert`, or `aria-hidden` on the app root while open — but never `aria-hidden` on an ancestor that contains the drawer).
*   **Keyboard map:** `Tab`/`Shift+Tab` cycle inside; `Escape` closes; `Enter`/`Space` activate items; for a nav list, arrow keys are a nice-to-have. Drag gestures are **enhancements** — every drag action has a keyboard/button equivalent.
*   **Contrast & target size:** scrim + panel text ≥ 4.5:1; every interactive item ≥ 44×44px tap target; visible `:focus-visible` ring on every focusable, honoring UJG Goldenrod on the dark panel.
*   **Announce dynamic content** (cart updated, filters applied) via an `aria-live` region inside the panel so screen-reader users hear the change.

This is the same contract as **Modal** — because it's the same **Overlay** engine. Build the trap, scroll-lock, inert-background, and return-focus once, verify it with the tests in §9.11, and reuse it for both.
* * *

## 11\. Innovative & Emerging Ideas
The drawer looks solved but keeps evolving, and 2026 is a real inflection point:

*   **Native** **`<dialog>`** **+** **`@starting-style`** **+** **`allow-discrete`****\*\*\*\*:** CSS can now animate a drawer's _entry and exit_ to and from `display:none` with zero JS — `@starting-style` provides the "before-open" transform and `transition-behavior: allow-discrete` lets the closing slide finish before the element is removed. The JS-heavy AnimatePresence pattern is becoming optional.
*   **Invoker Commands (****`command`****/****`commandfor`****):** the emerging HTML attributes let a button open/close a `<dialog>` drawer _declaratively_ — `<button command="show-modal" commandfor="drawer">` — no event listener at all. Less JS, fewer bugs.
*   **URL-as-state drawers:** parallel + intercepting routes (Next.js) and the View Transitions API make "the cart/filter panel is a shareable, back-closable URL" the new default, blending SPA overlay feel with real navigation.
*   **View Transitions API:** native cross-document and same-document morphs mean a drawer can slide in as part of a route change with the browser doing the animation — smoother than JS, and it respects reduced-motion.
*   **Vaul-class physics everywhere:** velocity-aware drag-to-dismiss, snap points, and the "background scales back" depth effect are now the expected bar for mobile bottom sheets, not a luxury.
*   **Spatial / depth-aware sheets:** carried from visionOS — sheets that layer with parallax and soft 3D, reacting to device motion.
*   **AI-native side panels:** the right-side "assistant drawer" (chat/agent surface that slides in over your work, non-modal so you keep working) is becoming a standard product shell — a non-modal drawer done well.

**For UJG:** lean the cart/settings drawer into a right-side non-modal AI-assistant-style panel where it fits the product, use native `<dialog>` + `@starting-style` for the low-JS nav drawer, and reserve Vaul-grade drag physics for genuinely mobile-first surfaces. Keep the Liquid Glass accent on the panel edge over deep Eminence — the dark backdrop makes the refraction sing — but never at the cost of the ≥4.5:1 contrast on nav text.
* * *

## 12\. Conversion & UX Killers (the silent money-bleeders)
None of these throw an error. They just quietly drop your numbers or strand users — which makes them dangerous. Each is fixable in an afternoon.

*   **No focus trap on a modal drawer.** Keyboard/AT users tab straight out behind the scrim into content they can't see. Silent, serious, invisible to mouse testing.
*   **No focus return on close.** User closes the drawer and gets dumped at the top of the page, losing their place entirely. The most-skipped requirement.
*   **Animating** **`width`****/****`left`** **instead of** **`transform`****\*\*\*\*.** Janky, stuttering slide on mid-range phones. Feels broken even when it works.
*   **No scroll-lock.** Open the drawer, scroll the panel, and the _page behind it_ scrolls too (scroll chaining) — the user loses their position on the underlying page. Kills cart-drawer conversion specifically.
*   **Scrim without modality.** Looks blocking, isn't — no trap, no `aria-modal`. The worst-of-both-worlds bug from §6.
*   **Escape as the only way out.** No visible close button, no scrim-click. Touch users and anyone who doesn't know the shortcut are trapped.
*   **The hamburger tax.** Hiding primary navigation behind a hamburger drawer on a product where the top destinations should be **Bottom Tabs** — discoverability and engagement drop measurably because "out of sight is out of mind."
*   **Ripping the panel out mid-animation.** Unmounting on close before the exit transition finishes causes a flash and breaks focus return. Delay the unmount.
*   **Layout shift on open.** Locking scroll by setting `overflow:hidden` without compensating for the scrollbar width jumps the whole page sideways. Add the `padding-right` compensation.
*   **Drawer clipped by an ancestor.** A drawer rendered inside an `overflow:hidden`/`transform` parent gets cut off or mis-positioned. Portal it to `body`.
*   **Stacked drawers.** A drawer opening another drawer — users lose the trail and the back/Escape stack becomes ambiguous. Replace content in place instead.

**The through-line:** these fail _quietly_. No crash, just a lower checkout rate or a stranded keyboard user you'll never see in analytics. Audit your drawers before you audit your ad spend.
* * *

## 13\. Advanced Patterns
Senior-move versions of the patterns above.

**Responsive: Side menu ↔ Drawer at a breakpoint.** The same nav renders as a persistent **Side menu** at ≥1024px and collapses into a modal **Drawer** below it. Drive it off a media query, and _only_ attach the trap/scroll-lock/`aria-modal` when it's in drawer mode — a persistent sidebar must not trap focus.

```typescript
const isDesktop = useMediaQuery("(min-width: 1024px)");
return isDesktop
  ? <aside className="sidemenu">{nav}</aside>                 // persistent, no trap
  : <Drawer open={open} onClose={close} modal>{nav}</Drawer>; // temporary, trapped
```

**`inert`** **for the cleanest background-lock.** Instead of a manual trap, mark everything except the drawer inert: `document.getElementById("app-root").inert = true` on open, `false` on close. One property removes the background from tab order, focus, hit-testing, and the a11y tree — the modern replacement for a hand-rolled trap when you can't use `<dialog>`.

**Swipe-to-open (edge gesture).** Native apps let you swipe from the screen edge to _open_ the nav drawer, not just close it. Listen for a `pointerdown` within ~20px of the edge and track the drag; below a threshold it snaps closed, past it snaps open. Always keep the hamburger as the discoverable, keyboard-accessible equivalent — the swipe is an enhancement.

**Design tokens for the drawer.** Component tokens referencing semantic ones, so a rebrand or dark-mode is a token swap, not a rewrite:

```css
:root {
  --drawer-bg: var(--color-surface, #0A0A0A);
  --drawer-width: 360px;
  --drawer-radius: 16px;
  --scrim: rgb(10 10 10 / .55);
  --drawer-ring: var(--color-focus, #DCA424);
  --drawer-ease: cubic-bezier(.32, .72, 0, 1);
}
.drawer { inline-size: min(85vw, var(--drawer-width)); background: var(--drawer-bg); }
.drawer::backdrop { background: var(--scrim); }
```

**TS-enforced a11y for the non-modal case.** A discriminated union that _forbids_ `aria-modal` on non-modal drawers and _requires_ a label, catching the "scrim without modality" bug at compile time:

```typescript
type ModalDrawer    = { modal: true;  labelledBy: string };  // trap + scrim + aria-modal
type NonModalDrawer = { modal: false; label: string };       // push, no trap, must be labeled
type DrawerA11y = ModalDrawer | NonModalDrawer;
```

**`aria-live`** **inside the panel.** For cart/filter drawers that update in place, a polite live region announces "Item added, subtotal $48" so AT users hear the change without the visual.
* * *

## 14\. Performance & Bundle Cost
*   **Transform + opacity only.** Animate the panel's `transform` and the scrim's `opacity` — both compositor-only, no reflow. Never animate `width`, `left`, `height`, or `margin`; they reflow every frame and stutter on mid-range devices. This is the single biggest drawer perf lever.
*   **`will-change: transform`** on the panel _while animating_ hints the compositor to promote it to its own layer — but remove it at rest (a permanent `will-change` wastes memory).
*   **Lazy-mount content.** Don't render the drawer's (potentially heavy) contents until it's first opened. A cart drawer with 40 line items and images shouldn't be in the DOM on page load. Mount on first open, then keep it mounted for snappy re-opens if it's cheap.
*   **Portal once, don't recreate.** Reuse a single portal root; don't create/destroy a `document.body` child on every toggle.
*   **`contain: layout paint`** on the panel isolates its internal reflows from the page.
*   **Don't ship two engines.** If you use Radix `Sheet` for side drawers _and_ Vaul for bottom sheets, you're paying for two overlay libraries. Reasonable if both patterns are core; consolidate if one is rare.
*   **Backdrop-filter is expensive.** A blurred scrim (`backdrop-filter: blur()`) on a large viewport can drop frames on low-end GPUs. Use a plain translucent scrim as the default and reserve blur for capable devices (`@supports` + measured need).
*   **Event economy.** One delegated listener on the panel for nav items beats one-per-item, especially for long lists — the same delegation win as the Button doc.
* * *

## 15\. Security
A drawer is a container; its _actions_ are the attack surface — treat them exactly like any state-changing button (see the Button doc's security section).

*   **The modal scrim is not a security boundary.** Making the background inert is UX. The endpoints the drawer's "Checkout," "Apply," or "Save" buttons hit must independently re-check **authentication, authorization, and validation** server-side. "The drawer was closed / the button was hidden" never means "the action can't happen."
*   **Idempotency on drawer actions.** A cart drawer's "Place order" can be double-fired (double tap, drag-and-release quirks). Disable-on-click _and_ an `Idempotency-Key` on the server so a duplicate request returns the first result.
*   **CSRF on state changes.** Any form the drawer submits needs an anti-CSRF token and `SameSite` cookies, same as any form.
*   **Don't trust drawer-carried data.** `data-id`, hidden inputs, or filter values carried by the drawer are attacker-controllable. Authorize that _this_ user may act on _that_ resource server-side.
*   **Clickjacking.** A drawer with a high-stakes confirm button is iframe-jackable; defend with `Content-Security-Policy: frame-ancestors 'none'` / `X-Frame-Options: DENY` at the header level.
* * *

## 16\. Senior-Level Checklist (ship-ready)
Before a drawer is "done":

- [ ] Trigger is a real `<button>` with `aria-expanded`, `aria-controls`, `aria-haspopup="dialog"`, and an accessible name.
- [ ] Panel is `role="dialog"`; `aria-modal="true"` **only** when actually modal.
- [ ] Dialog is labeled (`aria-labelledby` header, or `aria-label`).
- [ ] Focus moves into the panel on open.
- [ ] Focus is trapped inside a modal drawer (Tab + Shift+Tab cycle).
- [ ] Focus **returns to the trigger** on close.
- [ ] Escape closes modal drawers — and it's not the _only_ way out (visible close button + scrim-click).
- [ ] Background is inert (not just dimmed); scroll is locked with scrollbar-width compensation (no layout shift).
- [ ] Animates `transform`/`opacity` only; `prefers-reduced-motion` disables the slide.
- [ ] Portaled to `body` so no ancestor clips it.
- [ ] Panel stays mounted through the exit transition (no mid-animation unmount).
- [ ] Every drag gesture (swipe-open, drag-dismiss, snap points) has a keyboard/button equivalent.
- [ ] Empty, loading, and error states designed inside the panel.
- [ ] Contrast ≥ 4.5:1; interactive items ≥ 44px; visible focus ring.
- [ ] Server re-checks auth/validation/idempotency for any action the drawer fires.
- [ ] Right pattern chosen: Drawer vs. Side menu vs. Modal vs. Bottom Tabs.
* * *

## 17\. Visual Styles (the same drawer, eleven skins)
Design systems are _whose_ rules; visual styles are _which look_. The same semantic drawer — same focus trap, same Escape, same 44px targets, same return-focus — can wear any of these skins. **Style is skin; behavior is the skeleton.** See them all in the [Design Styles (visual languages)](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200551) gallery.

*   **Flat:** solid panel fill, crisp edge, a flat translucent scrim, no shadow beyond a hairline. Reads instantly, cheapest to render.
*   **Material:** elevated panel (shadow depth ~16dp), 32% black scrim, the specified enter/exit motion curve, ripple on nav items. The reference drawer.
*   **Glassmorphism:** translucent panel with `backdrop-filter: blur()` over the page behind it. Striking, but guard nav-text contrast hard — glass panels eat legibility.
*   **Liquid Glass (the 2026 trend):** Apple's iOS 26 / macOS Tahoe language. The panel is a _refractive_ translucent material with a specular rim on the leading edge and a sheen that shifts as it slides; SwiftUI emits it natively via `.glassEffect()`, the web approximates with layered highlights + blur. Best over the deep Eminence/Night backdrop. Guard for contrast _and_ `prefers-reduced-motion` (kill the moving sheen).
*   **Neumorphism:** the panel and page share one surface color, separated only by dual light/dark shadows on the panel edge. Pretty, contrast-poor — accent use only, never for a nav drawer that needs legible text.
*   **Skeuomorphism:** a "real object" panel — beveled edge, inner highlight, subtle texture, a physical-looking grabber on the bottom sheet. The tactile look.
*   **Neo-Brutalism:** hard offset shadow on the panel, thick border, zero radius, a stark high-contrast scrim. Loud personality; actually great for contrast.
*   **Claymorphism:** big radius on the panel's inner corners, soft inner top-light + bottom-shadow, puffy grabber. Friendly, playful — good for consumer bottom sheets.
*   **Aurora / Gradient:** animated multi-hue gradient along the panel edge or header over a dark field. Premium; honor `prefers-reduced-motion` (freeze the gradient).
*   **Minimal / Swiss:** typography and a single hairline divider do the work; near-zero decoration, sharp corners, a faint scrim. Ideal for dense settings/filter drawers.
*   **UJG Brand:** Afro-Futurist house style — Goldenrod nav text and focus rings on a deep Eminence/Night panel, confident 16px inner radius, a warm glow along the leading edge, an optional Liquid Glass rim on the bottom-sheet grabber. The scrim is Night at ~55% with a whisper of blur. Warm, premium, unmistakably UJG.

**The rule that never changes:** all eleven share one skeleton. The trap, the Escape key, the return-focus, the scroll-lock, and the ≥44px targets are identical across every skin. Guard glass / liquid-glass / neumorphism for contrast, and aurora / liquid-glass for reduced motion.
* * *

**Bottom line:** a drawer is a Dialog with an edge animation — and that one sentence is the whole secret. Build the overlay engine once (scrim, focus trap, inert background, scroll-lock, **return-focus**), share it with **Modal**, skin it eleven ways, and decide modality deliberately. Get the focus contract and the `transform`\-only animation right and you've got a drawer that feels native and includes everyone; skip them and you've built a beautiful trap that strands half your users and stutters on every phone that isn't yours. The panel slides; the discipline is everything behind it.