# Resizable Panels

# Resizable Panels
Split panes divided by a draggable gutter — the thing that lets you widen the code pane and shrink the file tree in VS Code. Deceptively simple to fake with a mouse, genuinely hard to build correctly: the whole component lives or dies on whether the separator is operable from the keyboard. A pointer-only drag handle is a WCAG failure, full stop.
* * *

## 1\. What It Actually Is
A resizable panel group is a layout container that divides space between two or more child panels, with a draggable **separator** (a "gutter," "splitter," or "resize handle") between each pair. Dragging the separator reallocates space from one panel to its neighbor; the panels flex to fill. Sizes are usually expressed as percentages or flex ratios so the layout stays fluid, and they are commonly persisted so the split survives a reload.

Four things people constantly confuse it with, named and distinguished:
*   **Scroll Area:** a Scroll Area gives a _fixed-size_ box a scrollbar so overflowing content can be reached. The box never changes size; you move the _content_ inside it. A Resizable Panel changes the _box's_ size and the content reflows. If the user is revealing hidden content, that's a Scroll Area. If the user is reallocating space between two regions, that's a Resizable Panel. They frequently nest — a resizable panel that contains a scroll area — but they are not the same control.
*   **Drawer / Sidebar:** a Drawer slides a panel _in and out_ over or beside content, usually to two discrete states (open/closed) via a toggle button, often as an overlay with a scrim. A Resizable Panel is always present and lives on a _continuum_ of sizes set by dragging. A Drawer answers "is the panel showing?"; a Resizable Panel answers "how much room does it get?" (Collapse-to-zero blurs the line, but the collapse is a corner case of a continuous control, not the primary interaction.)
*   **Split View / Window tiling:** OS-level window managers (macOS Split View, Windows snap) tile _application windows_. Same mental model, different layer — you're building the in-app version of it.
*   **Data-grid column resize:** dragging a column border resizes one column of a table. It's the same separator mechanic scoped to table columns; a full panel group is the general case.

**Rule of thumb:** if a user drags a line to trade space between two regions that are both always visible, it's a Resizable Panel. If they toggle a region on and off, it's a Drawer. If they scroll to reach clipped content in a fixed box, it's a Scroll Area.
* * *

## 2\. Why It Matters
The separator is a tiny target with an outsized responsibility, and getting it wrong has concrete costs:
*   **Accessibility (this is the big one).** The separator is an interactive widget. If the only way to move it is a mouse drag, keyboard users, switch-device users, and voice users are locked out of controlling their own layout — a direct **WCAG 2.1.1 (Keyboard)** failure, and usually **2.5.1 (Pointer Gestures)** too since a drag is a path-based gesture. A resizable panel done wrong isn't "less polished," it's non-conformant. Done right (`role="separator"`, `aria-valuenow`, a full arrow-key model), it's one of the more satisfying keyboard experiences in an app.
*   **Trust and perceived quality.** A splitter that jumps, selects text while you drag, forgets your layout on reload, or lets you drag a panel down to 3px of unusable slivers reads as a broken app. Power users (developers, analysts, designers — exactly the audience that uses resizable layouts) notice immediately. Persisted, well-bounded sizes signal that the app respects how they work.
*   **Productivity / conversion for pro tools.** For IDEs, email clients, dashboards, and design tools, the layout _is_ the product surface. Letting a user give the diff view 70% and the file tree 15% is the difference between a tool they configure once and live in, versus one they fight every session. Fixed layouts force every user into the median layout, which fits no one.
*   **Performance and input correctness.** A naive implementation that animates `width` or re-renders the whole tree on every `pointermove` janks visibly during the exact interaction the user is watching most closely. And a drag that loses the pointer (mouse leaves the window, pointer cancelled) without cleanup leaves the app stuck "dragging" — a state bug users can't explain but definitely feel.
* * *

## 3\. Anatomy
Every named part of a resizable panel group:
*   **Panel group (container):** the flex or grid parent that owns the total space and the layout direction (horizontal = side-by-side, vertical = stacked). Holds the orientation and the list of child sizes.
*   **Panel:** a content region with a current size (percent/flex), a **min size**, an optional **max size**, an optional **collapsed size** (often 0), and an optional **default size**. Panels flex to fill; their sum is always 100%.
*   **Separator / gutter / handle:** the draggable divider between two adjacent panels. This is the interactive element — `role="separator"`, `tabindex="0"`, `aria-valuenow/min/max`, `aria-orientation`, `aria-controls` pointing at the panel it primarily sizes.
*   **Hit area (touch target):** the _invisible_ interactive zone around the visible line. The line may render as 1–2px, but the pointer/touch target must be ≥24px CSS (WCAG 2.5.8) and ideally ~44px for touch — usually achieved with padding or a `::before` pseudo-element that overflows the visible line.
*   **Grip indicator:** the optional visual affordance on the handle — a cluster of dots, a short bar, or a subtle line thickening on hover — telling the user "this is draggable."
*   **Collapse / expand affordance:** an optional button or double-click behavior on the separator that snaps a panel to its collapsed size (0 or a min "rail") and back to its last size.
*   **Resize cursor:** `col-resize` (horizontal group) or `row-resize` (vertical group) shown over the hit area to signal draggability.
*   **Drag overlay guard (optional):** a transparent full-window layer added during an active drag that captures pointer events and sets `cursor`/`user-select`, so the drag doesn't get stolen by iframes or selectable text under the pointer.
* * *

## 4\. Sizes / Scale / Density
Two distinct measurements matter here: the **visible line width** and the **interactive hit area**. Keep them separate — the line can be hairline-thin while the target stays large.

| Tier | Visible line | Hit area (target) | Grip | Panel min | Use case |
| ---| ---| ---| ---| ---| --- |
| Hairline | 1px | 16–24px | none | 15% / 180px | Dense dashboards, editorial reading panes where the divider should nearly disappear |
| Standard | 2–4px | 24px (`--gutter-hit: 24px`) | dots on hover | 20% / 240px | Default for IDE-style app layouts, email list + reading pane |
| Comfortable | 6–8px | 44px | always-visible grip | 25% / 320px | Touch-capable / hybrid devices, design tools, accessibility-forward products |

Rules that matter:
*   **Hit area ≥ 24px CSS px is a WCAG 2.5.8 (Target Size, Minimum) requirement**; 44px is the comfortable/touch bar. Never let the _visible_ thinness dictate the _target_ thinness — expand the target with padding or an overflowing pseudo-element.
*   **Drive sizes from tokens, not magic numbers:** `--gutter-line`, `--gutter-hit`, `--panel-min`, `--panel-radius`. The whole system rescales from one place.
*   **Store sizes as percentages (or flex ratios), not pixels,** so the layout survives window resizes gracefully. Convert to px only when enforcing a pixel min/max against the container's measured width.
*   **Min sizes prevent unusable slivers.** A panel with no min can be dragged to 2px, which is worse than useless. Every panel gets a min; content that can't survive its min should collapse, not shrink.
*   **Responsive collapse:** below a breakpoint, a horizontal group should stop being resizable and stack (or switch to a Drawer/tabbed pattern). Resizing a 320px-wide phone screen between two panels helps no one.
* * *

## 5\. States
Every state, described (not "same as X"):
*   **Default (rest):** panels at their persisted or default split (e.g. 50/50), separator idle — a thin line, cursor is default until the pointer enters the hit area.
*   **Hover (on hit area):** cursor becomes `col-resize`/`row-resize`, the line thickens or brightens, the grip indicator appears. Signals "grab me." Absent on touch, so never the _only_ affordance.
*   **Focus:** separator has keyboard focus via Tab. Must show a visible focus ring on the _hit area_, not a 1px line no one can see. This is the state that proves the component is keyboard-reachable.
*   **Dragging / active:** a pointer drag (or arrow-key press) is live. `user-select: none` on the whole group so text under the pointer isn't selected, pointer is captured to the handle, an optional overlay guards against iframe/selection theft, and `aria-valuenow` updates continuously.
*   **Min-reached:** the panel being shrunk hit its min size; the separator visually stops even though the pointer keeps moving. Often paired with a subtle resistance or an edge highlight so the stop feels intentional, not broken.
*   **Max-reached:** the neighboring panel hit _its_ min (i.e. this panel hit its effective max); same visual stop on the other side.
*   **Collapsed:** a panel is at its collapsed size (0 or a rail). The separator may reposition to the container edge; the collapse control flips to "expand," `aria-expanded="false"` on that control, and `aria-valuenow` reads the collapsed value.
*   **Disabled / locked:** resizing is turned off (e.g. a layout the product locks). Separator loses `tabindex`, shows a default cursor, `aria-disabled="true"`, no grip.
*   **Snapping (transient):** when a drag is released near a snap point (a preset ratio or the collapse threshold), the panel eases to the snapped value. Under `prefers-reduced-motion`, the snap is instant, not animated.
* * *

## 6\. Types / Variants
*   **Two-panel horizontal (side-by-side):** the canonical case — list + detail, sidebar + main, before/after. One separator.
*   **Two-panel vertical (stacked):** top/bottom, e.g. editor over terminal. `aria-orientation="horizontal"` on the separator (the separator line is horizontal even though it resizes vertical space — orientation describes the _separator_, and by ARIA convention a separator that moves vertically is `horizontal`; be deliberate here).
*   **Multi-panel group (3+):** file tree + editor + preview. N panels, N−1 separators; each separator trades space between its two immediate neighbors while the rest hold.
*   **Nested groups:** a horizontal group whose middle panel is itself a vertical group (editor + terminal stacked inside the center column). Each group manages its own axis and its own persisted sizes.
*   **Collapsible panel:** a panel that can snap to zero/rail and back, via a button, double-click, or drag-past-threshold. The most common "extra" on top of a basic group.
*   **Auto-save / persisted group:** identified by a stable `autoSaveId`/storage key; reads its layout from storage on mount and writes on change (debounced).
*   **Imperative / controlled group:** sizes are owned by app state (React state, a store) so other UI — a "reset layout" button, a preset switcher — can drive them programmatically via a ref/API.
* * *

## 7\. When to Use (and When Not To)
**Use a resizable panel group when:**
*   Two or more always-visible regions compete for space and different users want different splits: IDE (tree/editor/preview), email (folders/list/message), design tools (layers/canvas/inspector), admin dashboards (nav/content), SQL tools (schema/query/results), diff and comparison views.
*   The optimal ratio genuinely varies by user, task, or monitor — you can't pick one split that's right for everyone.
*   The audience is desktop-first / pointer-and-keyboard heavy (developers, analysts, ops).

**Don't use one — reach for something else — when:**
*   **The panel just needs to appear and disappear.** That's a **Drawer/Sidebar** with a toggle, not a continuous splitter.
*   **The content overflows a fixed box.** That's a **Scroll Area**; give the box a scrollbar, don't make it resizable.
*   **You're on a narrow mobile viewport.** Resizing two columns on a phone is fiddly and low-value — **stack them**, or use **Tabs / a segmented control / an Accordion** to switch between regions.
*   **The proportions are part of the design and shouldn't move.** Use a fixed **CSS Grid** layout; don't add drag affordances to decoration.
*   **There's only ever one meaningful layout.** Configurability the user never wants is just surface area for bugs.

**Placement heuristics:** put the separator exactly on the visual seam between regions; keep the most-resized panel (usually a sidebar) against the window edge; give collapse affordances to the _secondary_ panel (tree, inspector), not the primary work area; and remember the seam between resizable panels is the one line users will hunt for — make its hit area forgiving.
* * *

## 8\. Across Design Systems
Same idea, different treatment and different amounts of "batteries included."
*   **Material Design (Google):** No first-class "resizable panel" in the core spec — Material leans on the **navigation drawer** and fixed responsive **layout grid** for space allocation. When Android/Flutter teams need true drag-resize they build on `Draggable`/gesture primitives or adopt the two-pane (list-detail) canonical layout, which is size-class driven rather than user-draggable. Signal: Material treats space as _system-decided_ far more than _user-decided_.
*   **Apple HIG (iOS/macOS):** First-class. macOS has `NSSplitView`; SwiftUI ships **`NavigationSplitView`** (two/three-column, collapsible sidebars with system chrome) and `HSplitView`/`VSplitView` for manual splits. The divider, its hit area, and keyboard/full-keyboard-access behavior are handled by the system. Strong, opinionated defaults; less custom styling.
*   **Fluent (Microsoft):** No dedicated splitter in Fluent UI React; teams compose it or use community/`react-resizable-panels`. Windows itself (Explorer, VS Code — Electron) leans heavily on the pattern, so it's culturally central to MS even without a formal token.
*   **Ant Design:** Ships **`Splitter`** (added in Ant 5.x) — a real panel group with `Splitter.Panel`, `min`/`max`/`defaultSize`, `collapsible`, and `onResize`/`onResizeEnd`. Enterprise-grade defaults, good for the data-dense admin UIs Ant targets.
*   **Tailwind:** No component — Tailwind is utilities. You bring behavior (headless lib or your own JS) and use Tailwind for the gutter/hit-area/cursor classes. Almost everyone pairs it with **react-resizable-panels**.
*   **shadcn/ui + Radix:** shadcn ships a **`Resizable`** component that wraps **`react-resizable-panels`** (`ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`), styled with Tailwind, accessibility and persistence handled by the underlying lib. This is the de-facto modern-web standard.
*   **Bootstrap:** No native resizable panel; Bootstrap gives you the **grid** and **offcanvas** (a Drawer). Resizable behavior is DIY on top of Bootstrap's layout — see §9.11.
*   **react-resizable-panels (the reference implementation):** worth naming on its own because shadcn, many Fluent/Tailwind apps, and others delegate to it. Its model — a `PanelGroup` with an `autoSaveId`, `Panel`s with `minSize`/`maxSize`/`collapsible`, and a `PanelResizeHandle` that's a real keyboard-operable `separator` — is the pattern the rest of §9 mirrors.

### § 8b. Visual Styles / What's Trending in 2026
The separator is where style shows up most, and 2026 trends push it in two directions at once:
*   **Liquid Glass (Apple, iOS 26 / macOS Tahoe):** the gutter as a translucent, refractive strip — a specular-rim highlight that catches light as it moves, the panels' edges softly bending what's behind the seam. Gorgeous on the dark, saturated surfaces UJG favors; watch that the focus ring still reads against the shimmer.
*   **Invisible-until-needed handles:** the strongest 2026 pattern for pro tools — a 1px seam that widens, brightens, and grows a grip _only_ on hover/focus, keeping dense layouts calm while staying discoverable. (The hit area stays large the whole time; only the _paint_ hides.)
*   **Spatial / depth-aware seams:** carrying over from visionOS, a subtle shadow or parallax at the seam so panels read as layered planes, not a flat cut.
*   **Motion-forward, restrained:** springy snap-to-collapse and eased min-stops — always gated behind `prefers-reduced-motion`.

Full per-skin coverage is in §17; the eleven core skins are all described there specifically for this component.
* * *

## 9\. The Code
### 9.1 HTML (semantic foundation with ARIA)
The separator is the load-bearing element. It is a real focusable widget with a value model, not a styled `<div>` you attach a mousedown to.

```html
<div class="panel-group" data-orientation="horizontal" id="editor-layout">
  <section class="panel" id="panel-tree" style="flex-basis: 25%;" aria-label="File tree">
    <!-- sidebar content -->
  </section>

  <!-- The separator: a real widget with a value model -->
  <div
    class="separator"
    role="separator"
    tabindex="0"
    aria-orientation="vertical"
    aria-label="Resize file tree"
    aria-controls="panel-tree"
    aria-valuemin="15"
    aria-valuemax="60"
    aria-valuenow="25"
  >
    <span class="separator__grip" aria-hidden="true"></span>
  </div>

  <section class="panel" id="panel-editor" style="flex-basis: 75%;" aria-label="Editor">
    <!-- main content -->
  </section>
</div>
```

Key HTML rules:
*   `role="separator"` **plus** `tabindex="0"` is what makes it a _focusable_ separator (a plain separator is not focusable; a resizable one must be). `aria-valuenow/min/max` give screen readers the size as a number.
*   `aria-orientation` describes the **separator's** orientation. A separator in a side-by-side (horizontal) group is a vertical line → `aria-orientation="vertical"`. Get this backwards and SR users are told the wrong axis.
*   `aria-controls` points at the panel whose size this handle primarily reports, so `aria-valuenow` has a referent.
*   The visible line is `.separator`; the grip is decorative (`aria-hidden`). The _hit area_ is created in CSS, not by fattening the line.

### 9.2 CSS (states, layout, hit area, reduced-motion)
Flex `flex-basis` percentages are the fluid model; the hit area overflows the hairline line via a pseudo-element.

```css
.panel-group {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.panel-group[data-orientation="vertical"] { flex-direction: column; }

.panel {
  overflow: auto;            /* each panel scrolls its own content */
  min-width: 0;              /* let flex children actually shrink */
  min-height: 0;
}

.separator {
  position: relative;
  flex: 0 0 2px;             /* the VISIBLE line: 2px */
  background: var(--sep-line, #2a2a2a);
  cursor: col-resize;
  touch-action: none;       /* we handle the gesture; don't let the browser pan/zoom */
}
.panel-group[data-orientation="vertical"] .separator { cursor: row-resize; flex-basis: 2px; }

/* The HIT AREA: a 24px transparent overlay centered on the 2px line. */
.separator::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline: -11px;       /* 2px line + 11px each side ≈ 24px target */
  z-index: 1;
}
.panel-group[data-orientation="vertical"] .separator::before {
  inset-inline: 0;
  inset-block: -11px;
}

.separator:hover,
.separator[data-dragging="true"] { background: var(--sep-line-active, #DCA424); }

.separator:focus-visible {
  outline: 2px solid var(--focus, #DCA424);
  outline-offset: 2px;      /* ring the whole hit area, not the hairline */
}

.separator__grip {
  position: absolute;
  inset: 50% auto auto 50%;
  translate: -50% -50%;
  width: 2px; height: 24px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0;
  transition: opacity .15s ease;
}
.separator:hover .separator__grip,
.separator:focus-visible .separator__grip { opacity: .6; }

/* Kill text selection + set the cursor globally WHILE dragging */
.panel-group[data-dragging="true"] {
  user-select: none;
  cursor: col-resize;
}

@media (prefers-reduced-motion: reduce) {
  .separator__grip { transition: none; }
  .panel { scroll-behavior: auto; }
  /* snap-to-collapse eases become instant; see JS */
}
```

### 9.3 React + TypeScript (full reusable component)
A from-scratch two-panel group with pointer drag, pointer capture, min/max clamping, and the complete keyboard model. No library.

```tsx
import {
  forwardRef, useCallback, useEffect, useId, useRef, useState,
  type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent,
} from "react";

type Orientation = "horizontal" | "vertical";

interface ResizableProps {
  orientation?: Orientation;
  /** initial size of the FIRST panel, as a percent 0–100 */
  defaultSize?: number;
  min?: number;             // percent
  max?: number;             // percent
  step?: number;            // percent per arrow key
  storageKey?: string;      // persist to localStorage when set
  firstLabel: string;
  secondLabel: string;
  children: [React.ReactNode, React.ReactNode];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const Resizable = forwardRef<HTMLDivElement, ResizableProps>(function Resizable(
  { orientation = "horizontal", defaultSize = 50, min = 15, max = 85,
    step = 2, storageKey, firstLabel, secondLabel, children }, ref,
) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(() => {
    if (storageKey && typeof window !== "undefined") {
      const saved = window.localStorage.getItem(storageKey);
      if (saved != null) { const n = Number(saved); if (!Number.isNaN(n)) return clamp(n, min, max); }
    }
    return clamp(defaultSize, min, max);
  });
  const [dragging, setDragging] = useState(false);
  const sepId = useId();
  const horizontal = orientation === "horizontal";

  // Persist (debounced via rAF so a drag doesn't thrash storage)
  const rafRef = useRef<number>();
  useEffect(() => {
    if (!storageKey) return;
    cancelAnimationFrame(rafRef.current!);
    rafRef.current = requestAnimationFrame(() =>
      window.localStorage.setItem(storageKey, String(size)),
    );
    return () => cancelAnimationFrame(rafRef.current!);
  }, [size, storageKey]);

  const sizeFromPointer = useCallback((clientPos: number) => {
    const el = groupRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const total = horizontal ? rect.width : rect.height;
    const offset = horizontal ? clientPos - rect.left : clientPos - rect.top;
    if (total <= 0) return null;
    return clamp((offset / total) * 100, min, max);
  }, [horizontal, min, max]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId); // keep events even off-element
    setDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const next = sizeFromPointer(horizontal ? e.clientX : e.clientY);
    if (next != null) setSize(next);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* already released */ }
    setDragging(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    const dec = horizontal ? "ArrowLeft" : "ArrowUp";
    const inc = horizontal ? "ArrowRight" : "ArrowDown";
    switch (e.key) {
      case dec: next = size - step; break;
      case inc: next = size + step; break;
      case "Home": next = min; break;
      case "End": next = max; break;
      case "Enter": next = size <= min + 0.5 ? clamp(defaultSize, min, max) : min; break; // toggle collapse
      case "Escape": next = clamp(defaultSize, min, max); break;                          // reset
      default: return;
    }
    e.preventDefault();
    if (next != null) setSize(clamp(next, min, max));
  };

  return (
    <div
      ref={(n) => { groupRef.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; }}
      className="panel-group"
      data-orientation={orientation}
      data-dragging={dragging || undefined}
      style={{ display: "flex", flexDirection: horizontal ? "row" : "column", width: "100%", height: "100%" }}
    >
      <section className="panel" aria-label={firstLabel} style={{ flexBasis: `${size}%`, flexGrow: 0, flexShrink: 0, minInlineSize: 0, overflow: "auto" }}>
        {children[0]}
      </section>

      <div
        id={sepId}
        role="separator"
        tabIndex={0}
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-label={`Resize ${firstLabel}`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(size)}
        className="separator"
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => setDragging(false)}
        onKeyDown={onKeyDown}
        onDoubleClick={() => setSize(clamp(defaultSize, min, max))}
      >
        <span className="separator__grip" aria-hidden="true" />
      </div>

      <section className="panel" aria-label={secondLabel} style={{ flexBasis: `${100 - size}%`, flexGrow: 1, flexShrink: 1, minInlineSize: 0, overflow: "auto" }}>
        {children[1]}
      </section>
    </div>
  );
});
```

Why this is the senior version: pointer capture means the drag survives the pointer leaving the handle; `data-dragging` drives the global `user-select: none`; the keyboard model is complete (arrows, Home/End, Enter to collapse-toggle, Escape/double-click to reset); sizes clamp to min/max on _every_ path; persistence is rAF-debounced so a drag doesn't hammer `localStorage`.

### 9.4 Vanilla JavaScript (no framework, full keyboard + pointer)
The primitive everything else abstracts. Handles pointer capture, `user-select`, cancel cleanup, and the whole key map.

```js
function initResizable(group) {
  const sep = group.querySelector('[role="separator"]');
  const [first, second] = group.querySelectorAll('.panel');
  const horizontal = group.dataset.orientation !== 'vertical';
  const min = Number(sep.getAttribute('aria-valuemin')) || 15;
  const max = Number(sep.getAttribute('aria-valuemax')) || 85;
  const key = group.dataset.storageKey;
  const step = 2;
  const def = Number(sep.dataset.default) || 50;
  const clamp = (v) => Math.min(max, Math.max(min, v));

  let size = clamp(Number(key && localStorage.getItem(key)) || def);
  apply(size);

  function apply(v) {
    size = clamp(v);
    first.style.flexBasis = size + '%';
    second.style.flexBasis = (100 - size) + '%';
    sep.setAttribute('aria-valuenow', Math.round(size));
    if (key) localStorage.setItem(key, String(size));
  }

  function fromPointer(e) {
    const r = group.getBoundingClientRect();
    const total = horizontal ? r.width : r.height;
    const off = horizontal ? e.clientX - r.left : e.clientY - r.top;
    if (total > 0) apply((off / total) * 100);
  }

  function onMove(e) { fromPointer(e); }
  function onUp(e) {
    group.removeAttribute('data-dragging');
    sep.releasePointerCapture?.(e.pointerId);
    sep.removeEventListener('pointermove', onMove);
    sep.removeEventListener('pointerup', onUp);
    sep.removeEventListener('pointercancel', onUp);
  }

  sep.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    sep.setPointerCapture(e.pointerId);
    group.setAttribute('data-dragging', 'true'); // triggers user-select:none in CSS
    sep.addEventListener('pointermove', onMove);
    sep.addEventListener('pointerup', onUp);
    sep.addEventListener('pointercancel', onUp); // e.g. pointer stolen / window blur
  });

  sep.addEventListener('keydown', (e) => {
    const dec = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const inc = horizontal ? 'ArrowRight' : 'ArrowDown';
    let next = null;
    if (e.key === dec) next = size - step;
    else if (e.key === inc) next = size + step;
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    else if (e.key === 'Enter') next = size <= min + 0.5 ? def : min; // collapse toggle
    else if (e.key === 'Escape') next = def;
    else return;
    e.preventDefault();
    apply(next);
  });

  sep.addEventListener('dblclick', () => apply(def));
}

document.querySelectorAll('.panel-group').forEach(initResizable);
```

### 9.5 Tailwind CSS
Utilities for the gutter and the overflowing hit area; behavior comes from the JS/lib above.

```html
<div class="flex h-full w-full overflow-hidden" data-orientation="horizontal" id="grp">
  <section class="basis-1/4 shrink-0 grow-0 min-w-0 overflow-auto" aria-label="Sidebar">…</section>

  <div
    role="separator" tabindex="0" aria-orientation="vertical"
    aria-label="Resize sidebar" aria-valuemin="15" aria-valuemax="60" aria-valuenow="25"
    class="group relative shrink-0 grow-0 basis-0.5 cursor-col-resize touch-none
           bg-neutral-800 hover:bg-amber-400 data-[dragging=true]:bg-amber-400
           before:absolute before:inset-y-0 before:-inset-x-2.5 before:content-['']
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2">
    <span class="pointer-events-none absolute left-1/2 top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2
                 rounded bg-current opacity-0 transition-opacity
                 group-hover:opacity-60 group-focus-visible:opacity-60" aria-hidden="true"></span>
  </div>

  <section class="grow min-w-0 overflow-auto" aria-label="Main">…</section>
</div>
```

The `before:-inset-x-2.5` is the ≈24px hit area over the `basis-0.5` (2px) line — the Tailwind expression of §9.2's pseudo-element trick.

### 9.6 Next.js (App Router, SSR-safe persistence)
The persistence gotcha in Next: `localStorage` doesn't exist on the server, so reading it in render causes a hydration mismatch. Persist to a **cookie** so the server can read the saved layout and render the correct split with zero flash.

```tsx
// app/layout-panels/actions.ts
"use server";
import { cookies } from "next/headers";

export async function saveLayout(size: number) {
  const clamped = Math.min(85, Math.max(15, size));
  (await cookies()).set("panel.size", String(clamped), {
    path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax",
  });
}
```

```tsx
// app/dashboard/page.tsx  (Server Component reads the cookie → no flash)
import { cookies } from "next/headers";
import { PanelsClient } from "./panels-client";

export default async function Page() {
  const raw = (await cookies()).get("panel.size")?.value;
  const initial = raw ? Math.min(85, Math.max(15, Number(raw))) : 30;
  return <PanelsClient initialSize={Number.isFinite(initial) ? initial : 30} />;
}
```

```tsx
// app/dashboard/panels-client.tsx
"use client";
import { useState, useTransition } from "react";
import { Resizable } from "@/components/resizable"; // the §9.3 component
import { saveLayout } from "../layout-panels/actions";

export function PanelsClient({ initialSize }: { initialSize: number }) {
  const [size, setSize] = useState(initialSize);
  const [, start] = useTransition();
  return (
    <div className="h-dvh">
      <Resizable
        defaultSize={size} min={15} max={60}
        firstLabel="Navigation" secondLabel="Content"
        // fire-and-forget persist to cookie on settle
        onSettle={(s: number) => { setSize(s); start(() => saveLayout(s)); }}
      >
        <nav>…</nav>
        <main>…</main>
      </Resizable>
    </div>
  );
}
```

### 9.7 shadcn/ui + Radix (react-resizable-panels)
The de-facto standard. shadcn's `Resizable` wraps `react-resizable-panels`; you get the keyboard-operable separator, `minSize`/`maxSize`, `collapsible`, and persistence for free.

```tsx
"use client";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "@/components/ui/resizable"; // shadcn wrapper over react-resizable-panels

export function EditorLayout() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="editor-layout"        // persists to localStorage automatically
      className="h-full rounded-lg border"
    >
      <ResizablePanel defaultSize={22} minSize={15} maxSize={40} collapsible collapsedSize={0}>
        <FileTree />
      </ResizablePanel>

      <ResizableHandle withHandle />     {/* renders a visible grip; already role=separator, keyboard-ready */}

      <ResizablePanel defaultSize={55} minSize={30}>
        <Editor />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={23} minSize={0} collapsible>
        <Preview />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

Under the hood the handle is `role="separator" tabIndex={0}` with the full `aria-value*` set and arrow/Home/End/Enter keys wired — the library implements exactly the model §9.3 builds by hand. Reach for the library in real apps; build by hand to understand it.

### 9.8 Vue 3 (SFC)

```vue
<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";

const props = withDefaults(defineProps<{
  orientation?: "horizontal" | "vertical";
  min?: number; max?: number; step?: number; storageKey?: string; defaultSize?: number;
}>(), { orientation: "horizontal", min: 15, max: 85, step: 2, defaultSize: 50 });

const horizontal = computed(() => props.orientation === "horizontal");
const clamp = (v: number) => Math.min(props.max, Math.max(props.min, v));
const group = ref<HTMLElement | null>(null);
const dragging = ref(false);

const saved = props.storageKey ? Number(localStorage.getItem(props.storageKey)) : NaN;
const size = ref(clamp(Number.isNaN(saved) ? props.defaultSize : saved));

function persist() { if (props.storageKey) localStorage.setItem(props.storageKey, String(size.value)); }
function fromPointer(e: PointerEvent) {
  const el = group.value; if (!el) return;
  const r = el.getBoundingClientRect();
  const total = horizontal.value ? r.width : r.height;
  const off = horizontal.value ? e.clientX - r.left : e.clientY - r.top;
  if (total > 0) { size.value = clamp((off / total) * 100); persist(); }
}
function onDown(e: PointerEvent) {
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  dragging.value = true;
  window.addEventListener("pointermove", fromPointer);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
}
function onUp() {
  dragging.value = false;
  window.removeEventListener("pointermove", fromPointer);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("pointercancel", onUp);
}
onBeforeUnmount(onUp);
function onKey(e: KeyboardEvent) {
  const dec = horizontal.value ? "ArrowLeft" : "ArrowUp";
  const inc = horizontal.value ? "ArrowRight" : "ArrowDown";
  let n: number | null = null;
  if (e.key === dec) n = size.value - props.step;
  else if (e.key === inc) n = size.value + props.step;
  else if (e.key === "Home") n = props.min;
  else if (e.key === "End") n = props.max;
  else if (e.key === "Escape") n = props.defaultSize;
  else if (e.key === "Enter") n = size.value <= props.min + 0.5 ? props.defaultSize : props.min;
  else return;
  e.preventDefault(); size.value = clamp(n!); persist();
}
</script>

<template>
  <div ref="group" class="panel-group" :data-orientation="orientation" :data-dragging="dragging || undefined"
       :style="{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', height: '100%' }">
    <section class="panel" :style="{ flexBasis: size + '%', flexGrow: 0, flexShrink: 0, minWidth: 0, overflow: 'auto' }">
      <slot name="first" />
    </section>
    <div class="separator" role="separator" tabindex="0"
         :aria-orientation="horizontal ? 'vertical' : 'horizontal'"
         :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="Math.round(size)"
         aria-label="Resize panel" :data-dragging="dragging || undefined"
         @pointerdown.prevent="onDown" @keydown="onKey" @dblclick="size = clamp(defaultSize); persist()">
      <span class="separator__grip" aria-hidden="true" />
    </div>
    <section class="panel" :style="{ flexBasis: (100 - size) + '%', flexGrow: 1, minWidth: 0, overflow: 'auto' }">
      <slot name="second" />
    </section>
  </div>
</template>
```

### 9.9 Svelte

```svelte
<script lang="ts">
  export let orientation: "horizontal" | "vertical" = "horizontal";
  export let min = 15, max = 85, step = 2, defaultSize = 50, storageKey = "";

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const horizontal = orientation === "horizontal";
  let group: HTMLDivElement;
  let dragging = false;
  const saved = storageKey ? Number(localStorage.getItem(storageKey)) : NaN;
  let size = clamp(Number.isNaN(saved) ? defaultSize : saved);

  $: if (storageKey) localStorage.setItem(storageKey, String(size));

  function fromPointer(e: PointerEvent) {
    const r = group.getBoundingClientRect();
    const total = horizontal ? r.width : r.height;
    const off = horizontal ? e.clientX - r.left : e.clientY - r.top;
    if (total > 0) size = clamp((off / total) * 100);
  }
  function down(e: PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging = true;
    window.addEventListener("pointermove", fromPointer);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }
  function up() {
    dragging = false;
    window.removeEventListener("pointermove", fromPointer);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
  }
  function key(e: KeyboardEvent) {
    const dec = horizontal ? "ArrowLeft" : "ArrowUp";
    const inc = horizontal ? "ArrowRight" : "ArrowDown";
    let n: number | null = null;
    if (e.key === dec) n = size - step; else if (e.key === inc) n = size + step;
    else if (e.key === "Home") n = min; else if (e.key === "End") n = max;
    else if (e.key === "Escape") n = defaultSize;
    else if (e.key === "Enter") n = size <= min + 0.5 ? defaultSize : min;
    else return;
    e.preventDefault(); size = clamp(n);
  }
</script>

<div bind:this={group} class="panel-group" data-orientation={orientation} data-dragging={dragging || undefined}
     style="display:flex; flex-direction:{horizontal ? 'row' : 'column'}; height:100%">
  <section class="panel" style="flex-basis:{size}%; flex-grow:0; flex-shrink:0; min-width:0; overflow:auto">
    <slot name="first" />
  </section>
  <div class="separator" role="separator" tabindex="0"
       aria-orientation={horizontal ? "vertical" : "horizontal"}
       aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(size)}
       aria-label="Resize panel" data-dragging={dragging || undefined}
       on:pointerdown|preventDefault={down} on:keydown={key} on:dblclick={() => (size = clamp(defaultSize))}>
    <span class="separator__grip" aria-hidden="true"></span>
  </div>
  <section class="panel" style="flex-basis:{100 - size}%; flex-grow:1; min-width:0; overflow:auto">
    <slot name="second" />
  </section>
</div>
```

### 9.10 Angular (standalone component)

```typescript
import { Component, ElementRef, Input, ViewChild, HostBinding } from "@angular/core";

@Component({
  selector: "app-resizable",
  standalone: true,
  template: `
    <div #group class="panel-group" [attr.data-orientation]="orientation"
         [attr.data-dragging]="dragging || null"
         [style.display]="'flex'" [style.flexDirection]="horizontal ? 'row' : 'column'" [style.height]="'100%'">
      <section class="panel" [style.flexBasis]="size + '%'" style="flex-grow:0;flex-shrink:0;min-width:0;overflow:auto">
        <ng-content select="[first]"></ng-content>
      </section>
      <div class="separator" role="separator" tabindex="0"
           [attr.aria-orientation]="horizontal ? 'vertical' : 'horizontal'"
           [attr.aria-valuemin]="min" [attr.aria-valuemax]="max" [attr.aria-valuenow]="round(size)"
           aria-label="Resize panel" [attr.data-dragging]="dragging || null"
           (pointerdown)="down($event)" (keydown)="key($event)" (dblclick)="apply(defaultSize)">
        <span class="separator__grip" aria-hidden="true"></span>
      </div>
      <section class="panel" [style.flexBasis]="(100 - size) + '%'" style="flex-grow:1;min-width:0;overflow:auto">
        <ng-content select="[second]"></ng-content>
      </section>
    </div>`,
})
export class ResizableComponent {
  @Input() orientation: "horizontal" | "vertical" = "horizontal";
  @Input() min = 15; @Input() max = 85; @Input() step = 2; @Input() defaultSize = 50;
  @Input() storageKey?: string;
  @ViewChild("group", { static: true }) group!: ElementRef<HTMLElement>;
  dragging = false;
  size = 50;
  get horizontal() { return this.orientation === "horizontal"; }
  round = Math.round;

  ngOnInit() {
    const saved = this.storageKey ? Number(localStorage.getItem(this.storageKey)) : NaN;
    this.size = this.clamp(Number.isNaN(saved) ? this.defaultSize : saved);
  }
  private clamp(v: number) { return Math.min(this.max, Math.max(this.min, v)); }
  apply(v: number) {
    this.size = this.clamp(v);
    if (this.storageKey) localStorage.setItem(this.storageKey, String(this.size));
  }
  private move = (e: PointerEvent) => {
    const r = this.group.nativeElement.getBoundingClientRect();
    const total = this.horizontal ? r.width : r.height;
    const off = this.horizontal ? e.clientX - r.left : e.clientY - r.top;
    if (total > 0) this.apply((off / total) * 100);
  };
  private end = () => {
    this.dragging = false;
    window.removeEventListener("pointermove", this.move);
    window.removeEventListener("pointerup", this.end);
    window.removeEventListener("pointercancel", this.end);
  };
  down(e: PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this.dragging = true;
    window.addEventListener("pointermove", this.move);
    window.addEventListener("pointerup", this.end);
    window.addEventListener("pointercancel", this.end);
  }
  key(e: KeyboardEvent) {
    const dec = this.horizontal ? "ArrowLeft" : "ArrowUp";
    const inc = this.horizontal ? "ArrowRight" : "ArrowDown";
    let n: number | null = null;
    if (e.key === dec) n = this.size - this.step; else if (e.key === inc) n = this.size + this.step;
    else if (e.key === "Home") n = this.min; else if (e.key === "End") n = this.max;
    else if (e.key === "Escape") n = this.defaultSize;
    else if (e.key === "Enter") n = this.size <= this.min + 0.5 ? this.defaultSize : this.min;
    else return;
    e.preventDefault(); this.apply(n);
  }
}
```

### 9.11 Bootstrap 5
Bootstrap has no splitter, so you use its grid/utilities for structure and add the minimal drag script. Bootstrap classes handle layout and the visible seam; the `separator` semantics are still yours.

```html
<div class="d-flex vh-100 overflow-hidden" id="bsGroup" data-orientation="horizontal">
  <div class="panel bg-body-tertiary p-3 overflow-auto" style="flex-basis:25%;flex-grow:0;flex-shrink:0;min-width:0" aria-label="Sidebar">
    Sidebar
  </div>
  <div class="separator position-relative bg-secondary"
       role="separator" tabindex="0" aria-orientation="vertical"
       aria-label="Resize sidebar" aria-valuemin="15" aria-valuemax="60" aria-valuenow="25"
       style="flex:0 0 2px;cursor:col-resize;touch-action:none">
    <span class="position-absolute top-0 bottom-0" style="left:-11px;right:-11px" aria-hidden="true"></span>
  </div>
  <div class="panel p-3 overflow-auto" style="flex-grow:1;min-width:0" aria-label="Main">Main content</div>
</div>

<script>
  // reuse initResizable() from §9.4 — Bootstrap only supplies the styling
  document.querySelectorAll('#bsGroup').forEach(initResizable);
</script>
```

Bootstrap's `.offcanvas` is a Drawer, not a splitter — don't reach for it here; it answers the wrong question (open/closed vs. how-much-space).

### 9.12 Web Component (custom element)
Framework-agnostic, Shadow DOM-scoped, full keyboard + pointer, reflects `size` as an attribute.

```js
class ResizablePanels extends HTMLElement {
  static observedAttributes = ["orientation", "min", "max", "size"];
  #dragging = false;
  #group; #sep; #first; #second;

  connectedCallback() {
    const horizontal = (this.getAttribute("orientation") ?? "horizontal") !== "vertical";
    const min = Number(this.getAttribute("min") ?? 15);
    const max = Number(this.getAttribute("max") ?? 85);
    let size = this.#clamp(Number(this.getAttribute("size") ?? 50), min, max);

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .group{display:flex;flex-direction:${horizontal ? "row" : "column"};height:100%;width:100%;overflow:hidden}
        .group[data-dragging]{user-select:none;cursor:${horizontal ? "col-resize" : "row-resize"}}
        .panel{overflow:auto;min-width:0;min-height:0}
        .sep{position:relative;flex:0 0 2px;background:#2a2a2a;cursor:${horizontal ? "col-resize" : "row-resize"};touch-action:none}
        .sep::before{content:"";position:absolute;${horizontal ? "inset-block:0;inset-inline:-11px" : "inset-inline:0;inset-block:-11px"}}
        .sep:focus-visible{outline:2px solid #DCA424;outline-offset:2px}
        .sep:hover{background:#DCA424}
      </style>
      <div class="group" part="group">
        <div class="panel" part="panel"><slot name="first"></slot></div>
        <div class="sep" part="separator" role="separator" tabindex="0"
             aria-orientation="${horizontal ? "vertical" : "horizontal"}"
             aria-label="Resize panel" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${Math.round(size)}"></div>
        <div class="panel" part="panel"><slot name="second"></slot></div>
      </div>`;

    this.#group = this.shadowRoot.querySelector(".group");
    this.#sep = this.shadowRoot.querySelector(".sep");
    [this.#first, this.#second] = this.shadowRoot.querySelectorAll(".panel");
    const apply = (v) => {
      size = this.#clamp(v, min, max);
      this.#first.style.flexBasis = size + "%"; this.#first.style.flexGrow = "0"; this.#first.style.flexShrink = "0";
      this.#second.style.flexBasis = (100 - size) + "%"; this.#second.style.flexGrow = "1";
      this.#sep.setAttribute("aria-valuenow", Math.round(size));
      this.setAttribute("size", String(Math.round(size)));
      this.dispatchEvent(new CustomEvent("resize", { detail: { size } }));
    };
    apply(size);

    const move = (e) => {
      const r = this.#group.getBoundingClientRect();
      const total = horizontal ? r.width : r.height;
      const off = horizontal ? e.clientX - r.left : e.clientY - r.top;
      if (total > 0) apply((off / total) * 100);
    };
    const end = (e) => {
      this.#dragging = false; this.#group.removeAttribute("data-dragging");
      this.#sep.releasePointerCapture?.(e.pointerId);
      this.#sep.removeEventListener("pointermove", move);
      this.#sep.removeEventListener("pointerup", end);
      this.#sep.removeEventListener("pointercancel", end);
    };
    this.#sep.addEventListener("pointerdown", (e) => {
      e.preventDefault(); this.#sep.setPointerCapture(e.pointerId);
      this.#dragging = true; this.#group.setAttribute("data-dragging", "");
      this.#sep.addEventListener("pointermove", move);
      this.#sep.addEventListener("pointerup", end);
      this.#sep.addEventListener("pointercancel", end);
    });
    this.#sep.addEventListener("keydown", (e) => {
      const dec = horizontal ? "ArrowLeft" : "ArrowUp", inc = horizontal ? "ArrowRight" : "ArrowDown";
      let n = null;
      if (e.key === dec) n = size - 2; else if (e.key === inc) n = size + 2;
      else if (e.key === "Home") n = min; else if (e.key === "End") n = max;
      else if (e.key === "Escape") n = 50; else if (e.key === "Enter") n = size <= min + 0.5 ? 50 : min;
      else return;
      e.preventDefault(); apply(n);
    });
  }
  #clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
}
customElements.define("resizable-panels", ResizablePanels);
// <resizable-panels min="15" max="60" size="25"><div slot="first">…</div><div slot="second">…</div></resizable-panels>
```

### 9.13 Python (Jinja2 render + FastAPI persistence endpoint)
The layout renders server-side from a saved value, and a small endpoint persists per-user layout so it follows the account across devices (not just one browser's localStorage).

```python
# app.py — FastAPI
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, field_validator
from starlette.requests import Request

app = FastAPI()
templates = Jinja2Templates(directory="templates")
_layouts: dict[str, float] = {}  # real app: DB keyed by user id

class LayoutIn(BaseModel):
    size: float
    @field_validator("size")
    @classmethod
    def bounded(cls, v: float) -> float:
        if not (0 <= v <= 100):
            raise ValueError("size must be a percentage 0–100")
        return round(v, 2)

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, user=Depends(require_auth)):
    size = _layouts.get(user.id, 30.0)  # server decides initial split → no flash
    return templates.TemplateResponse("dashboard.html", {"request": request, "panel_size": size})

@app.put("/api/layout")
def save_layout(body: LayoutIn, user=Depends(require_auth)):
    # clamp server-side too; never trust the client's bounds
    _layouts[user.id] = min(60.0, max(15.0, body.size))
    return {"size": _layouts[user.id]}
```

```html
<!-- templates/dashboard.html — Jinja2 renders the persisted split inline -->
<div class="panel-group" data-orientation="horizontal" data-storage-key="dashboard"
     id="grp" data-remote="/api/layout">
  <section class="panel" style="flex-basis: {{ panel_size }}%; flex-grow:0; flex-shrink:0;" aria-label="Navigation">…</section>
  <div class="separator" role="separator" tabindex="0" aria-orientation="vertical"
       aria-label="Resize navigation" aria-valuemin="15" aria-valuemax="60"
       aria-valuenow="{{ panel_size | round }}" data-default="30"><span class="separator__grip" aria-hidden="true"></span></div>
  <section class="panel" style="flex-basis: {{ 100 - panel_size }}%; flex-grow:1;" aria-label="Content">…</section>
</div>
<!-- initResizable() (§9.4) reads data-remote and PUTs {size} on settle -->
```

### 9.14 SwiftUI (iOS / macOS)
On Apple platforms the system split view handles the divider, hit area, and keyboard for you.

```swift
import SwiftUI

struct EditorLayout: View {
    @State private var visibility: NavigationSplitViewVisibility = .all
    @SceneStorage("editor.sidebarWidth") private var sidebarWidth: Double = 260

    var body: some View {
        NavigationSplitView(columnVisibility: $visibility) {
            FileTreeView()
                .navigationSplitViewColumnWidth(min: 180, ideal: sidebarWidth, max: 420)
        } detail: {
            EditorView()
        }
        .navigationSplitViewStyle(.balanced)
    }
}

// Manual, draggable split on macOS with a custom gutter:
struct ManualSplit: View {
    @State private var fraction: CGFloat = 0.25
    var body: some View {
        GeometryReader { geo in
            HStack(spacing: 0) {
                SidebarView().frame(width: geo.size.width * fraction)
                Divider()
                    .frame(width: 8).contentShape(Rectangle())  // enlarge the hit area
                    .gesture(DragGesture().onChanged { v in
                        fraction = min(0.6, max(0.15, (geo.size.width * fraction + v.translation.width) / geo.size.width))
                    })
                    .accessibilityElement()
                    .accessibilityLabel("Resize sidebar")
                    .accessibilityValue("\(Int(fraction * 100)) percent")
                    .accessibilityAdjustableAction { dir in
                        fraction = dir == .increment ? min(0.6, fraction + 0.05) : max(0.15, fraction - 0.05)
                    }
                MainView().frame(maxWidth: .infinity)
            }
        }
    }
}
```

`accessibilityAdjustableAction` is the SwiftUI equivalent of the arrow-key model — VoiceOver users swipe up/down to resize, exactly matching web's arrow keys.

### 9.15 Jetpack Compose (Android / Kotlin)

```kotlin
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp

@Composable
fun ResizablePanels(modifier: Modifier = Modifier) {
    val density = LocalDensity.current
    var totalWidthPx by remember { mutableStateOf(1f) }
    var fraction by rememberSaveable { mutableStateOf(0.25f) }   // survives rotation
    val min = 0.15f; val max = 0.60f

    Row(modifier.fillMaxSize().onSizeChanged { totalWidthPx = it.width.toFloat().coerceAtLeast(1f) }) {
        Sidebar(Modifier.fillMaxHeight().weight(fraction))
        Box(
            Modifier
                .fillMaxHeight()
                .width(24.dp)                                   // 24dp hit area over a thin visual line
                .pointerInput(Unit) {
                    detectDragGestures { change, drag ->
                        change.consume()
                        fraction = ((fraction * totalWidthPx + drag.x) / totalWidthPx).coerceIn(min, max)
                    }
                }
                .semantics {
                    contentDescription = "Resize sidebar"
                    progressBarRangeInfo = ProgressBarRangeInfo(fraction, min..max)
                    // arrow-key equivalent for switch/keyboard/TalkBack:
                    setProgress { target -> fraction = target.coerceIn(min, max); true }
                }
        ) { VerticalDividerLine() }
        Main(Modifier.fillMaxHeight().weight(1f - fraction))
    }
}
```

### 9.16 Flutter (Dart)

```dart
import 'package:flutter/material.dart';

class ResizablePanels extends StatefulWidget {
  const ResizablePanels({super.key, this.min = 0.15, this.max = 0.60, this.initial = 0.25});
  final double min, max, initial;
  @override
  State<ResizablePanels> createState() => _ResizablePanelsState();
}

class _ResizablePanelsState extends State<ResizablePanels> {
  late double _fraction = widget.initial;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      final total = constraints.maxWidth;
      return Row(children: [
        SizedBox(width: total * _fraction, child: const _Sidebar()),
        MouseRegion(
          cursor: SystemMouseCursors.resizeColumn,
          child: GestureDetector(
            behavior: HitTestBehavior.translucent,
            onHorizontalDragUpdate: (d) => setState(() {
              _fraction = ((_fraction * total + d.delta.dx) / total).clamp(widget.min, widget.max);
            }),
            child: Semantics(
              label: 'Resize sidebar',
              value: '${(_fraction * 100).round()} percent',
              slider: true,
              onIncrease: () => setState(() => _fraction = (_fraction + 0.05).clamp(widget.min, widget.max)),
              onDecrease: () => setState(() => _fraction = (_fraction - 0.05).clamp(widget.min, widget.max)),
              child: const SizedBox(width: 24, child: Center(child: VerticalDivider(width: 2))),
            ),
          ),
        ),
        Expanded(child: const _Main()),
      ]);
    });
  }
}
```

The 24px-wide `GestureDetector` with `HitTestBehavior.translucent` is Flutter's version of the overflowing hit area; `Semantics(slider: true, onIncrease/onDecrease)` is the arrow-key model for TalkBack/switch access.

### 9.17 Testing (Vitest/RTL + jest-axe + Playwright)
A resizable panel is behavior. Test the keyboard model (the part most likely to regress), the ARIA value, no-axe-violations, and the real drag in a browser.

```tsx
// resizable.test.tsx — Vitest + React Testing Library + jest-axe
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, it, expect } from "vitest";
import { Resizable } from "./resizable";

const setup = () =>
  render(
    <div style={{ width: 1000, height: 400 }}>
      <Resizable defaultSize={50} min={20} max={80} firstLabel="Tree" secondLabel="Editor">
        <div>tree</div><div>editor</div>
      </Resizable>
    </div>,
  );

describe("Resizable separator", () => {
  it("exposes a separator with a value model", () => {
    setup();
    const sep = screen.getByRole("separator", { name: /resize tree/i });
    expect(sep).toHaveAttribute("aria-valuenow", "50");
    expect(sep).toHaveAttribute("aria-valuemin", "20");
    expect(sep).toHaveAttribute("aria-valuemax", "80");
    expect(sep).toHaveAttribute("tabindex", "0");
  });

  it("resizes with arrow keys and clamps at min/max", async () => {
    const user = userEvent.setup();
    setup();
    const sep = screen.getByRole("separator");
    await user.tab();                                  // focus reaches the separator
    expect(sep).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");     // shrink first panel by 2*step
    expect(Number(sep.getAttribute("aria-valuenow"))).toBeLessThan(50);
    await user.keyboard("{Home}");                     // jump to min
    expect(sep).toHaveAttribute("aria-valuenow", "20");
    await user.keyboard("{End}");                      // jump to max
    expect(sep).toHaveAttribute("aria-valuenow", "80");
    await user.keyboard("{Escape}");                   // reset to default
    expect(sep).toHaveAttribute("aria-valuenow", "50");
  });

  it("has no axe violations", async () => {
    const { container } = setup();
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

```ts
// resizable.e2e.ts — Playwright: the real pointer drag + persistence
import { test, expect } from "@playwright/test";

test("drag resizes and text is not selected mid-drag", async ({ page }) => {
  await page.goto("/dashboard");
  const sep = page.getByRole("separator", { name: /resize navigation/i });
  const before = await sep.getAttribute("aria-valuenow");

  const box = (await sep.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + box.height / 2, { steps: 12 });
  // during the drag the group must suppress selection
  await expect(page.locator(".panel-group")).toHaveAttribute("data-dragging", "true");
  await page.mouse.up();

  const after = await sep.getAttribute("aria-valuenow");
  expect(Number(after)).toBeGreaterThan(Number(before));

  // persistence: reload keeps the new split
  await page.reload();
  await expect(page.getByRole("separator", { name: /resize navigation/i }))
    .toHaveAttribute("aria-valuenow", String(after));
});

test("keyboard-only user can resize without a mouse", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("separator", { name: /resize navigation/i }).focus();
  await page.keyboard.press("End");   // max
  await expect(page.getByRole("separator", { name: /resize navigation/i }))
    .toHaveAttribute("aria-valuenow", "60");
});
```

Assert the value model and keyboard, not pixel widths (brittle). The "text is not selected mid-drag" and "keyboard-only" tests guard the two failures that most often ship: `user-select` leaking and a pointer-only handle.
* * *

## 10\. Accessibility
Standalone, because the separator is the entire accessibility story for this component.

**Roles & ARIA (the separator):**
*   `role="separator"` on the handle. A _focusable_ separator (one you can move) must also have `tabindex="0"`; a static separator would not.
*   `aria-valuenow`, `aria-valuemin`, `aria-valuemax` — the current/min/max size as numbers (percent is fine and readable). Update `aria-valuenow` on every change, pointer or keyboard.
*   `aria-orientation` — describes the **separator line's** orientation. Side-by-side (horizontal) group → vertical line → `aria-orientation="vertical"`. Stacked (vertical) group → horizontal line → `aria-orientation="horizontal"`. This trips everyone; verify against a screen reader.
*   `aria-label` (or `aria-labelledby`) naming what it resizes ("Resize file tree"), plus `aria-controls` pointing at the primary panel.
*   For a collapse control, `aria-expanded` reflects whether the panel is open; `aria-disabled="true"` when resizing is locked.

**Keyboard map (required — pointer-only is a WCAG 2.1.1 failure):**

| Key | Action |
| ---| --- |
| Tab / Shift+Tab | Move focus to / from the separator |
| Arrow Left / Right | Resize a horizontal group (Left shrinks first panel) |
| Arrow Up / Down | Resize a vertical group (Up shrinks first panel) |
| Home | Snap to minimum size |
| End | Snap to maximum size |
| Enter | Toggle collapse (collapse if expanded, restore last size if collapsed) |
| Escape | Reset to default size / cancel an in-progress keyboard resize |
| F6 / Ctrl+Tab (optional) | Move focus between panels in a multi-panel group |

**Focus management:**
*   Focus lives on the separator; it does **not** move when you resize. After a collapse, if the collapsed panel contained the focused element, move focus to the collapse/expand control so focus is never lost inside a zero-width region.
*   Each panel is a landmark/region with its own label; content inside keeps normal tab order. Collapsed (0-width) panel content should be `inert` or removed from the tab order so Tab doesn't land in an invisible panel.

**Contrast & target size:**
*   The separator is a **non-text UI element**: it needs **≥3:1** contrast against both adjacent panels so a low-vision user can find the seam.
*   The focus ring needs ≥3:1 against its background and must ring the _hit area_, not the hairline.
*   Hit area **≥24×24 CSS px (WCAG 2.5.8, minimum)**; target 44px for touch. The visible line may be 1–2px — the target is not.

**`prefers-reduced-motion`****:** disable snap-to-collapse easing and any momentum; the size jump is instant. Never gate the ability to resize behind an animation completing.

**Common failures specific to this component:**
*   `<div>` with a `mousedown` handler and no `role`/keyboard → invisible to AT, unusable by keyboard. The #1 failure.
*   `aria-valuenow` set once and never updated → screen reader announces a stale size forever.
*   `aria-orientation` set to the panel-arrangement axis instead of the separator-line axis → users told the wrong direction.
*   Hit area equal to the 1–2px line → practically impossible to grab for motor-impaired and touch users, and fails 2.5.8.
*   Collapsed panel left in the tab order → keyboard focus disappears into a 0-width void.
*   Drag without `user-select: none` → the screen reader / low-vision user who leans on text selection gets a garbled selection every resize.
* * *

## 11\. Innovative / Emerging Ideas
*   **Container-query-aware panels (2026-era):** panels that restyle their _own_ contents based on their current width via CSS `@container`, so a sidebar dragged narrow swaps to an icons-only rail automatically — the resize drives responsive design _inside_ the panel, not just at the viewport.
*   **View Transitions API for collapse/expand:** use the native `document.startViewTransition()` to morph a panel to/from its collapsed rail smoothly with zero animation library, automatically skipped under `prefers-reduced-motion`.
*   **Pointer-pressure & precision modes:** on pressure-capable devices, a firmer press engages a fine-resize mode (1px steps) for pixel-exact splits; a light drag stays coarse. Pairs with a Shift-modifier fallback on the keyboard for fine steps.
*   **AI/agentic layout presets:** a "arrange for debugging" / "arrange for writing" command that an agent maps to named panel presets, animating the group to a saved ratio set — resizable layout as a first-class, addressable app state.
*   **Cross-device layout sync:** persist the layout to the account (see §9.13), so a user's split follows them from laptop to tablet, reconciled against each device's min sizes.
*   **`interactivity: inert`** **+** **`content-visibility`** **on collapsed panels:** skip rendering and interaction cost of a collapsed panel entirely until it's expanded.
* * *

## 12\. Conversion / UX Killers
Silent failures that make a pro tool feel broken:
*   **Pointer-only handle (no keyboard).** Fails WCAG, and locks out power users who live on the keyboard — the exact audience for resizable layouts. _Fix:_ the full arrow/Home/End/Enter model from §10, always.
*   **Text selects while dragging.** The user drags the gutter and accidentally highlights half the file tree; feels janky and broken. _Fix:_ `user-select: none` on the group for the duration of the drag (via a `data-dragging` attribute), removed on release/cancel.
*   **No minimum size.** A panel dragged to 3px becomes an unusable sliver the user then can't grab to fix. _Fix:_ every panel gets a sensible `min`, and the separator visibly stops there.
*   **Layout not persisted.** The user carefully sets 70/30, reloads, and it's back to 50/50 every single time. Death by a thousand papercuts. _Fix:_ persist to localStorage (single device) or cookie/account (SSR + cross-device), rAF-debounced.
*   **Hit area equals the visible line.** A 1–2px grab target is a rage-inducing game of pixel-hunting, especially on touch or a trackpad. _Fix:_ overflow the target with padding/pseudo-element to ≥24px (44px for touch).
*   **Drag that gets stuck.** Pointer leaves the window or gets cancelled mid-drag and the app stays in "dragging" forever, selecting text and ignoring clicks. _Fix:_ pointer capture + `pointercancel`/`lostpointercapture`/blur cleanup that always resets state.
*   **Animating** **`width`****/****`flex-basis`** **on every pointer move.** Janks visibly during the one interaction the user is staring at. _Fix:_ set sizes directly (no transition) during drag; only ease on discrete snap/collapse.
*   **Resizable on mobile.** Two draggable columns on a 360px screen is precious space wasted on a gesture that barely works. _Fix:_ below a breakpoint, stop resizing and stack, or switch to Tabs/Drawer.
* * *

## 13\. Advanced Patterns
*   **TypeScript-enforced a11y — the labeled-handle discriminated union.** A resize handle must be labeled (visible text is rare here, so `aria-label`/`aria-labelledby` is effectively mandatory). Encode it in the type so an unlabeled handle won't compile:

```typescript
type Labelled =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-labelledby": string; "aria-label"?: never };

type HandleProps = {
  min: number; max: number; value: number;
  orientation: "horizontal" | "vertical";
} & Labelled;

// <ResizeHandle min={15} max={60} value={25} orientation="horizontal" />
//   → compile error: an accessible name is required.
// <ResizeHandle ... aria-label="Resize sidebar" /> → ok
```

*   **Design-token tiers for the gutter.** Separate the _visible_ line from the _hit_ area at the token layer so density themes rescale predictably:

```css
:root {
  /* primitive */
  --space-0-5: 2px;  --space-3: 12px;  --gold-500: #DCA424;
  /* semantic */
  --focus: var(--gold-500);
  /* component */
  --gutter-line: var(--space-0-5);   /* what you SEE */
  --gutter-hit: 24px;                /* what you GRAB (≥ WCAG 2.5.8) */
  --gutter-line-active: var(--gold-500);
  --panel-min: 240px;
}
.separator { flex-basis: var(--gutter-line); }
.separator::before { inset-inline: calc((var(--gutter-hit) - var(--gutter-line)) / -2); }
[data-density="comfortable"] { --gutter-line: 6px; --gutter-hit: 44px; }
```

*   **Imperative handle API for presets & reset.** Expose an imperative ref so external UI ("Reset layout," preset switcher, "focus mode") can drive the group without prop-drilling:

```typescript
export interface PanelGroupHandle {
  getLayout(): number[];
  setLayout(sizes: number[]): void;       // clamps each to its panel min/max
  collapse(index: number): void;
  expand(index: number): void;
  reset(): void;                           // back to defaults
}
// const ref = useRef<PanelGroupHandle>(null);
// <button onClick={() => ref.current?.reset()}>Reset layout</button>
```

*   **Constraint solver for multi-panel groups.** With 3+ panels, dragging one separator must redistribute against every neighbor's min/max, not just the immediate one — clamp the dragged delta to the _available slack_ across the group so a drag can never push a downstream panel below its min. This is the core of what `react-resizable-panels` does internally, and the reason to lean on it once you go past two panels.
* * *

## 14\. Performance & Bundle Cost
*   **Never transition** **`flex-basis`****/****`width`** **during a drag.** Layout-triggering properties reflow every panel each frame; on a busy IDE tree that's visible jank. Set sizes synchronously during the drag with no transition; reserve easing for discrete snap/collapse only.
*   **Throttle work to the frame, not the event.** `pointermove` can fire far more often than 60fps. Coalesce updates into a single `requestAnimationFrame` write per frame (and in React, avoid re-rendering the whole tree — update via a CSS custom property or a ref-driven style write where possible).
*   **Don't re-render panel** **_contents_** **on resize.** Memoize panel children (`React.memo`, stable props) so dragging the gutter re-lays-out the boxes without re-rendering a thousand tree rows. The size lives on the group; the content shouldn't care that a sibling got wider.
*   **Virtualize long panel contents.** A file tree or message list inside a panel should be windowed (react-window / TanStack Virtual), independent of the resize — otherwise every resize competes with thousands of live DOM nodes for the frame budget.
*   **Tree-shake the library.** Import the specific pieces (`import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"`), never a namespace import. The core lib is small (~a few KB); keep it that way and lazy-load whole secondary panels (preview, terminal) that aren't visible on first paint.
*   **`contain: layout`** **+** **`content-visibility: auto`** on panels isolates each panel's reflow from its siblings and lets the browser skip rendering off-screen/collapsed panel content.
* * *

## 15\. Security
Standalone heading — the surface is small but real, and it's not zero.

The resizable panel is a layout control; its primary function moves no data and touches no server, so most of the component has **no security surface** — dragging a gutter is a purely client-side geometry change. Two real considerations remain. **First, the persisted layout is untrusted input on the way back in.** A size read from `localStorage`, a cookie, or the account is attacker- or corruption-influenceable; always clamp it to the panel's real min/max on load (a saved `size: 100000` or `size: -5` or `"NaN"` must not blow out the layout or throw). The Next.js and FastAPI examples clamp on _both_ write and read for exactly this reason — never trust the stored number. **Second, if you persist layout server-side (§9.13), that endpoint is a normal write endpoint:** authenticate it, authorize that the user may write _their own_ layout key (not another user's), validate the body (a bounded percentage, correct shape) with a schema, and don't reflect the stored value into HTML unescaped — a layout name or preset label rendered into the page without escaping is a stored-XSS vector like any other user string. The gutter itself renders no user content, so it has no direct XSS surface; the risk lives entirely in the persistence layer, not the drag.
* * *

## 16\. Senior-Level Checklist
Ship-ready gate — every item non-negotiable:
- [ ] Separator is a real `role="separator"` with `tabindex="0"`, `aria-valuenow/min/max`, `aria-orientation`, and an accessible name — never a bare `<div onmousedown>`.
- [ ] Full keyboard model works with no mouse: Arrows resize, Home/End to min/max, Enter collapse-toggle, Escape reset. Verified with the mouse unplugged.
- [ ] `aria-valuenow` updates on **every** change, pointer and keyboard alike.
- [ ] Hit area ≥24px CSS (44px touch) via overflow, independent of the visible line thickness; focus ring rings the hit area.
- [ ] Separator has ≥3:1 non-text contrast against both panels; focus ring ≥3:1.
- [ ] Every panel has a `min` (and where relevant a `max`); the separator visibly stops at limits — no unusable slivers.
- [ ] `user-select: none` applied during drag and removed on release **and** cancel; pointer capture set and released; `pointercancel`/blur cleanup resets state.
- [ ] Sizes stored as percentages/ratios, persisted (localStorage / cookie / account), rAF-debounced, and **clamped on load**.
- [ ] No transition on size during drag; snap/collapse eases respect `prefers-reduced-motion`.
- [ ] Collapsed panels are `inert` / out of tab order; focus never lands in a 0-width region.
- [ ] Responsive fallback: stacks or switches to Tabs/Drawer below a breakpoint instead of staying draggable on mobile.
- [ ] Multi-panel groups clamp the dragged delta against the whole group's slack, not just the neighbor.
* * *

## 17\. Visual Styles
Each core skin, specifically for the gutter and panels of this component:
*   **Flat:** a 2px solid seam (Dark Green or neutral) between flat-fill panels; on hover it swaps to Spanish Orange, no shadow, no gradient. Reads instantly, costs nothing.
*   **Material:** the panels sit as elevated surfaces; the gutter is a 1dp divider that raises a thin shadow and shows a Material ripple/state-layer on the grip when focused. Collapse animates with a standard-easing transition.
*   **Glassmorphism:** panels are translucent `backdrop-filter: blur()` cards over a vivid backdrop; the gutter is a frosted strip. Watch the focus ring — the blur swallows it, so keep a solid-color ring and a solid fallback.
*   **Liquid Glass (2026, Apple iOS 26 / macOS Tahoe):** the gutter is a refractive glass rail with a specular-highlight rim that catches light as it moves, softly bending the panel edges behind the seam. Stunning over deep Eminence; verify the ring survives the shimmer.
*   **Neumorphism:** the gutter as a subtly inset groove pressed into a same-color surface, the grip as two faint extruded dots. Pretty but contrast-poor — add a real border on the handle or it fails AA.
*   **Skeuomorphism:** the divider looks like a physical drag bar — a beveled ridge with an inner highlight and a machined dot-grip, like a real window splitter from a desktop OS of old.
*   **Neo-Brutalism:** a thick 3–4px black gutter with a hard offset shadow, zero radius, the grip a blunt black bar; panels get heavy black borders. Loud, unmistakable, high-contrast by nature.
*   **Claymorphism:** panels are puffy rounded slabs with soft inner top-light and bottom-shadow; the gutter is a rounded, chunky Goldenrod grip that looks squeezable. Friendly, playful.
*   **Aurora / Gradient:** the seam glows with an animated multi-hue gradient that intensifies on drag; panels sit on a dark field. Premium — honor `prefers-reduced-motion` by freezing the gradient.
*   **Minimal / Swiss:** a 1px hairline (or no visible line at all until hover), grid and whitespace do the work; the grip appears only on hover/focus. The invisible-until-needed pattern in its purest form.
*   **UJG Brand:** the house default — a thin Dark Green (`#042D1D`) seam on Night (`#0A0A0A`), brightening to Goldenrod (`#DCA424`) on hover/focus with a warm glow, grip dots in Goldenrod, panels edged in a whisper of Eminence (`#5F2C82`). Confident, warm, unmistakably UJG.

**The rule that never changes:** style is skin, behavior is the skeleton. Across all eleven skins the separator stays a keyboard-operable `role="separator"` with a live `aria-valuenow`, a ≥24px hit area, a visible focus ring, `user-select:none` while dragging, and a persisted, clamped size. Change the paint freely; the semantics, keyboard model, focus, and target size are identical every time.