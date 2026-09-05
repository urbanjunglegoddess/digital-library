# Sortable / Drag and Drop

# Sortable / Drag and Drop: A Senior Engineer's Complete Breakdown
Reordering by dragging is the interaction users reach for without thinking — and the one that fails hardest for keyboard and screen-reader users when built naively. This page treats accessibility as the load-bearing wall, not the trim.
* * *

## 1\. What It Actually Is
Sortable / Drag and Drop (DnD) is an interaction pattern that lets a user change the **order** of items in a list — or move an item **between containers** — by grabbing it and dropping it in a new position. It is not a component shape like a Button; it is a **behavior** layered onto Lists, Cards, Kanban columns, grids, and trees. The essential ingredients are a grabbable source, continuous visual feedback while dragging (a lifted clone, a gap/placeholder where it will land), and a committed new order on drop.

The 3-4 things people confuse it with, named and distinguished:
*   **Native HTML Drag and Drop API** (`draggable="true"` + `dragstart`/`dragover`/`drop`): the browser's built-in DnD. It is designed for _dragging data between apps/windows_ (files, text), is **mouse/touch-only with no keyboard model**, ships inconsistent drag-image behavior, and cannot be made accessible. Most production "sortable" is _pointer-based_ (Pointer Events + transforms), not native DnD. See §11 and §15 for why.
*   **Selection / multi-select then move:** selecting rows and clicking "Move up" or "Move to top" is a _different, fully keyboard-native_ pattern. It is often the correct **alternative** to DnD, not a subtype of it.
*   **Resize / pan / slider drag:** those are also "drag" gestures but they change a _value or dimension_, not _order or container_. A slider is WCAG-covered differently (it's a `slider` role). Don't conflate "I can drag it" with "it's sortable."
*   **Swipe-to-action (mobile):** dragging a row sideways to reveal Delete/Archive is a gesture, not reordering. Different affordance, different a11y story.

**Rule of thumb:** if the _position of an item relative to its siblings carries meaning_ (priority, sequence, column/status) and the user needs to change it, it's Sortable. If dragging changes a value, reveals an action, or transfers data to another application, it's a different pattern. And: **if it can be dragged, it MUST also be operable without a pointer** — a drag with no keyboard/menu equivalent is a defect, full stop.
* * *

## 2\. Why It Matters
Reordering is high-frequency and high-trust: users are imposing _their_ structure on _your_ data, so every failure is felt personally. The stakes:
*   **Accessibility & legal exposure (the headline).** Pointer-only drag-and-drop fails **two** WCAG 2.2 success criteria at once: **2.1.1 Keyboard (Level A)** — all functionality must be operable by keyboard — and **2.5.7 Dragging Movements (Level AA, new in WCAG 2.2)** — any function that uses a dragging movement must have a single-pointer alternative that isn't a drag. Ship DnD as the _only_ way to reorder and you have a documented A-level violation; in the US that is ADA Title III / Section 508 territory, in the EU it's EN 301 549 / the European Accessibility Act. This is the single most litigated interaction in modern UI after inaccessible forms.
*   **Data integrity & trust.** A reorder is a _mutation_. If the optimistic UI shows position 3 but the server rejected the write (stale order, lost race, permission denied) and you don't reconcile, the user believes they saved something they didn't. The next reload silently "loses their work" — the fastest way to make an app feel broken.
*   **Conversion / task success.** Priority lists, playlist building, Kanban triage, dashboard widget arrangement — these are core loops in productivity products. Janky, feedback-less, or mobile-hostile DnD makes the primary job of the app feel bad, and users route around it (or churn).
*   **Performance & perceived quality.** Reorder animation runs on every pointermove during a drag. Animate the wrong property (top/left, width) and you jank a 120Hz screen; animate transforms on the compositor and it's glass-smooth. On long lists, un-virtualized DnD drops frames the moment the list scrolls. Smoothness _is_ the feature here.
* * *

## 3\. Anatomy
Every well-built sortable list is composed of predictable, nameable parts. (Interactive component — 5+ parts.)
*   **Sortable container (the list/board):** the element with role `list` (or `listbox`/`application` for a managed-focus grid) that owns the ordered collection and the live announcements.
*   **Draggable item (source):** the row/card being moved. Has role `listitem`/`option`, a stable key, and — while grabbed — an elevated/lifted appearance.
*   **Drag handle (optional but recommended):** the dedicated grip affordance (commonly a 6-dot "grip" glyph). When present, only the handle initiates a drag, which frees the rest of the item for text selection, links, and buttons. The handle is the keyboard entry point: `tabindex`, `role="button"`, `aria-roledescription="sortable"`.
*   **Drag overlay / ghost:** the visual clone that follows the pointer (dnd-kit's `DragOverlay`, or a cloned node). Typically elevated (shadow), sometimes slightly rotated/scaled, often at reduced opacity. Rendering an _overlay_ instead of moving the real node avoids reflowing the list under the cursor.
*   **Drop placeholder (gap):** the reserved space — a dashed outline or an animated gap — showing exactly where the item will land. This is the single most important feedback element; without it users guess.
*   **Drop-target highlight:** container/column background or border change signaling "this is a valid drop zone" (Kanban columns, folders).
*   **Live region (visually hidden):** an `aria-live="assertive"` (grab/drop) + polite (movement) status node that narrates the drag to screen readers. **This is not optional** — it is the entire accessible experience for a non-visual user.
*   **Screen-reader instructions node:** a visually hidden element referenced by `aria-describedby` on each item, e.g. "Press Space to grab. Use arrow keys to move. Space to drop, Escape to cancel."
*   **Sensors (behavioral, not visual):** the input adapters — Pointer/Mouse/Touch sensor (with an activation constraint) and the **Keyboard sensor** — that translate raw events into grab/move/drop intents.
* * *

## 4\. Sizes / Scale / Density
Sortable inherits the dimensions of the items it reorders, so "size" here means **item row density, handle target, and the drag-activation thresholds** — the numbers that actually make or break the interaction. Tokens use the UJG scale.

| Tier | Item height | Handle target | Gap between items | Activation distance | Use case |
| ---| ---| ---| ---| ---| --- |
| Compact | 32px (`--space-8`) | 24×24px visual / 44×44 hit | 2px (`--space-0-5`) | 6px pointer / long-press 250ms | Dense admin tables, settings rows |
| Default | 44px (`--space-11`) | 24×24 visual / 44×44 hit | 8px (`--space-2`) | 8px pointer / 200ms touch | Task lists, playlist rows, menu builders |
| Comfortable | 56px (`--space-14`) | 32×32 visual / 44 hit | 12px (`--space-3`) | 10px pointer / 200ms | Mobile-first lists, media items |
| Card | 88–140px (auto) | whole card or 32px grip | 12–16px (`--space-3/4`) | 8px pointer | Kanban cards, dashboard widgets |

Rules that matter:
*   **The handle's** **_hit_** **area is ≥44×44px even when the grip glyph is 16–24px** (WCAG 2.5.8 Target Size AA, and 2.5.5 AAA). Expand with padding/pseudo-element; never ship a 16px tap target.
*   **Activation distance / delay is a real setting, not a detail.** A pointer drag should require ~6–10px of movement before it "activates" so clicks and text selection still work. A _touch_ drag should require a **long-press (200–250ms) OR a movement threshold**, so vertical finger-scroll is never hijacked (see §12).
*   **Gap = the placeholder size.** The animated gap that opens where the item will drop should equal the item height so the layout doesn't jump on commit.
*   **Responsive:** on narrow viewports, prefer whole-item drag with a visible handle over hover-revealed handles (there is no hover on touch), and consider swapping DnD for a "Move to…" menu entirely.
* * *

## 5\. States
Every state listed and described (interactive component — full set plus component-specific).
*   **Idle / rest:** normal list. Handles visible (or hover-revealed on pointer devices, always-visible on touch). Nothing lifted.
*   **Hover (item/handle):** pointer over the handle raises its contrast and shows `cursor: grab`. Pure enhancement — never the only cue.
*   **Focus (handle/item):** keyboard focus lands on the handle (or item under roving tabindex) with a visible `:focus-visible` ring. This is the entry point to keyboard dragging.
*   **Grabbed / dragging (keyboard or pointer):** the item is "picked up." Pointer: a drag overlay follows the cursor, `cursor: grabbing`, source node dimmed or hidden. Keyboard: the item gets a pronounced lifted style (shadow + outline) and `aria-pressed`/`data-dragging`; the live region announces "Grabbed item 2 of 5. Use arrow keys to move."
*   **Over valid target:** a placeholder gap opens at the insertion point; in multi-container mode the target column highlights. Announced: "Moved to position 3 of 5" (or "Moved to column In Progress").
*   **Over invalid target:** no gap opens, cursor shows `no-drop`, target may flash a subtle reject state. Dropping here returns the item to origin.
*   **Dropping / committing (animating):** on release/Space, the item animates into its slot (transform-based, ~180–220ms). The order is written optimistically and persisted (§9.4).
*   **Cancelled:** Escape (keyboard) or drop-outside/invalid (pointer) returns the item to its original index with a reverse animation; live region announces "Cancelled. Item returned to position 2."
*   **Saving / pending (optimistic):** the reordered list is shown immediately while the PATCH is in flight; a subtle inline indicator (or `aria-busy` on the list) marks unconfirmed order.
*   **Error / rollback:** the server rejected (stale, conflict, unauthorized). The list animates **back** to the server's canonical order and surfaces a non-blocking message: "Couldn't save the new order — reverted." Announced assertively.
*   **Disabled item:** a locked/pinned row that cannot be moved (or cannot be a drop target). Non-draggable, handle removed or `aria-disabled`, other items skip over it.
* * *

## 6\. Types / Variants
Every functional variant named and described (interactive — 4+).
*   **Single-list reorder (1-D):** move items up/down within one list. The 80% case (task lists, playlists, form-field builders).
*   **Multi-container transfer (Kanban):** move an item between lists/columns, each of which is also internally sortable. Introduces cross-container announcements, per-column validation, and empty-column drop zones.
*   **Grid / 2-D reorder:** items flow in a wrapping grid (image gallery, app icons); dragging computes a target _cell_, and the rest reflow. Keyboard model needs 4-way arrows, not just up/down.
*   **Tree / nested reorder (re-parenting):** drag to change both order _and_ depth/parent (file trees, nav builders, outline editors). Hardest a11y case: you must announce depth changes ("Moved under Marketing, level 2") and expose indent via keyboard (e.g., Left/Right to outdent/indent).
*   **Handle-only vs. whole-item draggable:** with a handle, the rest of the item stays interactive (links, inline edit); whole-item drag is simpler but conflicts with text selection and nested controls.
*   **Sortable + virtualized:** reorder over a windowed list (thousands of rows). Requires reconciling drag indices with the virtual range and auto-scrolling the window (see §14).
*   **Swap vs. insert semantics:** _insert_ shifts everything between origin and target (default, list-like); _swap_ exchanges only two items (seat maps, comparison slots). Different placeholder behavior.
* * *

## 7\. When to Use (and When Not To)
**Use drag-and-drop reordering when:**
*   Order is meaningful and user-owned: priority/triage lists, playlists, Kanban status, image/file sequence, dashboard widget arrangement, nav/menu builders, form-field builders.
*   The list is short-to-medium and mostly visible at once, so the drop target is on-screen.
*   You can afford to also ship the keyboard + menu alternatives (you always must).

**Don't use it / use something else when:**
*   **Order doesn't matter** — then there's nothing to sort; don't add drag affordances that imply meaning that isn't there.
*   **It would be the** **_only_** **way to reorder** — always pair with a keyboard model _and_ a non-drag pointer alternative (a **"Move to…" menu** or up/down/ top/bottom buttons). Per WCAG 2.5.7 the non-drag pointer path is mandatory, not a nicety.
*   **The list is very long and unvirtualized** — reorder-on-every-move plus reflow will jank; virtualize, or switch to a numeric "position" input or "Move to top/position N" menu.
*   **Precise, frequent, or bulk reordering** — dragging item 400 to position 12 is miserable; offer "move to position…", multi-select move, or sort controls instead.
*   **Touch-primary with small rows and scrollable content** — if you can't guarantee a clean long-press handle that doesn't fight scroll, prefer explicit reorder controls.

Placement heuristics: put the handle on the **leading edge** (left in LTR) so the eye finds the grab point first; keep destructive/edit actions on the trailing edge away from the grip; on Kanban, make **empty columns** a visible, labeled drop zone so users can move the last card out.
* * *

## 8\. Across Design Systems
Same behavior, very different house rules and primitives. Knowing these makes you fluent in any codebase (7 systems).
*   **Material Design 3 (Google):** the "drag" state raises elevation (a lift shadow) and the item follows the finger; MD spec explicitly calls for a settle animation on drop. Android's Compose provides reorderable affordances; MD guidance stresses a visible handle and accessible reorder actions.
*   **Apple HIG (iOS/macOS):** `List` with `.onMove` gives reorder handles automatically in Edit mode, _and_ VoiceOver ships a built-in "Actions" rotor with Move Up/Move Down — Apple's platform makes the accessible alternative free. Reorder handles are the trailing "≡" grip.
*   **Fluent (Microsoft):** Fluent UI's `DetailsList`/`List` reordering is subtle, keyboard-considered, and enterprise-dense; Microsoft's a11y guidance mandates the keyboard model and announcements for any drag surface.
*   **Ant Design:** ships a `Table` with drag-sortable rows and `List` sorting, historically wired through `react-dnd`/`dnd-kit`; provides a drag handle prop and expects you to supply the reorder callback and persistence.
*   **Tailwind / utility-first:** no prescribed behavior — you compose the look and bring a behavior library (dnd-kit, SortableJS). Freedom plus the responsibility to add the entire a11y layer yourself.
*   **shadcn/Radix:** **Radix Primitives does NOT ship a Sortable** (an important fact — don't claim it does). The community-standard is shadcn styling wrapped around **dnd-kit**, which is the accessible reference implementation (keyboard sensor + announcements built in). This is the 2024+ web default.
*   **Bootstrap 5:** no native sortable; the classic pairing is **SortableJS** over Bootstrap list-group/card markup. SortableJS is pointer-first and needs a keyboard/menu alternative bolted on.

### 8b. What's trending in 2026
*   **dnd-kit as the accessible default.** The ecosystem has largely converged on dnd-kit precisely because its `KeyboardSensor` + `announcements` API make the WCAG 2.5.7 / 2.1.1 story a solved problem out of the box; new work that hand-rolls native DnD is now treated as a red flag in review.
*   **The CSS toolbox is closing the gap.** `scroll-driven animations`, the shipping **View Transitions API** (including cross-document and list-reorder transitions), and broad `:has()` support let reorder settle-animations and placeholder morphs run with far less JS. Chromium's list View Transitions make "animate to new position" nearly declarative.
*   **Interaction primitives maturing:** universal **Pointer Events** + `touch-action: none` scoped to the handle (never the scroll axis) is the settled cross-device pattern; `element.setPointerCapture()` replaces the old mouse/touch dual-listener mess.
*   **AI-assisted ordering:** "sort this for me" / semantic auto-arrange buttons sitting _next to_ manual DnD — the manual drag becomes the override, not the only path. Pairs naturally with the mandatory "Move to…" menu.
*   **Reduced-motion as a first-class branch**, not an afterthought: 2026 systems ship a no-animation reorder path (instant snap + stronger live-region narration) by default when `prefers-reduced-motion: reduce`.
* * *

## 9\. The Code
Real, runnable, production-shaped targets for THIS component. Accessibility (keyboard sensor + live announcements) and persistence (optimistic + validated server write) are threaded through, not bolted on.

### 9.1 HTML (semantic foundation: handle, roving focus, SR instructions, live region)

```plain
<!-- Screen-reader instructions, referenced by each item -->
<p id="dnd-instructions" class="sr-only">
  Press Space or Enter on a drag handle to pick up the item.
  Use the Arrow Up and Arrow Down keys to move it. Press Space to drop,
  or Escape to cancel.
</p>

<ul id="sortable" class="sortable" role="list" aria-describedby="dnd-instructions">
  <li class="sortable__item" role="listitem" data-id="a1" aria-roledescription="Sortable item">
    <button type="button" class="sortable__handle"
            aria-label="Reorder: Draft brand brief. Position 1 of 3"
            aria-describedby="dnd-instructions">
      <svg aria-hidden="true" width="16" height="16"><!-- 6-dot grip --></svg>
    </button>
    <span class="sortable__label">Draft brand brief</span>
    <!-- Non-drag pointer alternative (WCAG 2.5.7) -->
    <button type="button" class="sortable__menu" aria-label="Move Draft brand brief to…"
            aria-haspopup="menu">⋯</button>
  </li>
  <li class="sortable__item" role="listitem" data-id="a2" aria-roledescription="Sortable item">
    <button type="button" class="sortable__handle"
            aria-label="Reorder: Record portfolio Looms. Position 2 of 3"
            aria-describedby="dnd-instructions">
      <svg aria-hidden="true" width="16" height="16"></svg>
    </button>
    <span class="sortable__label">Record portfolio Looms</span>
    <button type="button" class="sortable__menu" aria-label="Move Record portfolio Looms to…"
            aria-haspopup="menu">⋯</button>
  </li>
  <li class="sortable__item" role="listitem" data-id="a3" aria-roledescription="Sortable item">
    <button type="button" class="sortable__handle"
            aria-label="Reorder: Send MSA to Bonsai. Position 3 of 3"
            aria-describedby="dnd-instructions">
      <svg aria-hidden="true" width="16" height="16"></svg>
    </button>
    <span class="sortable__label">Send MSA to Bonsai</span>
    <button type="button" class="sortable__menu" aria-label="Move Send MSA to Bonsai to…"
            aria-haspopup="menu">⋯</button>
  </li>
</ul>

<!-- The accessible core: nothing here is optional -->
<div class="sr-only" role="status" aria-live="assertive" aria-atomic="true" id="dnd-live"></div>
```

Key rules: the handle is a real `<button>` (focusable, Space/Enter activates for free); each item carries `aria-roledescription="Sortable item"` so AT says "Sortable item" not just "list item"; the `role="status"` live region is `assertive` for grab/drop and you swap to polite for interim moves; the `⋯` menu is the non-drag pointer path that satisfies 2.5.7. Note there is **no** `draggable="true"` — we use pointer/keyboard, not native DnD.

### 9.2 CSS (states, placeholder, touch-action, reduced-motion)

```css
.sortable { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2, 8px); }

.sortable__item {
  display: flex; align-items: center; gap: 8px;
  min-height: 44px; padding: 8px 12px;
  background: var(--surface, #E8E6E1); color: var(--night, #0A0A0A);
  border: 1px solid transparent; border-radius: 10px;
  /* Only the transform is animated on the compositor */
  transition: box-shadow .15s ease, transform .18s cubic-bezier(.2,.8,.2,1);
  touch-action: manipulation; /* item still scrolls; handle overrides below */
}

.sortable__handle {
  display: grid; place-items: center;
  inline-size: 24px; block-size: 24px; padding: 10px; margin: -10px; /* 44px hit area */
  border: 0; background: none; color: currentColor;
  cursor: grab; border-radius: 6px;
  touch-action: none; /* the handle owns the gesture; page scroll is not hijacked */
}
.sortable__handle:hover { background: rgba(0,0,0,.06); }
.sortable__handle:focus-visible { outline: 2px solid var(--goldenrod, #DCA424); outline-offset: 2px; }

/* Grabbed / dragging */
.sortable__item[data-dragging="true"] {
  cursor: grabbing;
  box-shadow: 0 8px 24px rgba(10,10,10,.28);
  transform: scale(1.02);
  z-index: 2;
}
/* The gap where the item will land */
.sortable__placeholder {
  border: 2px dashed var(--eminence, #5F2C82);
  border-radius: 10px; background: rgba(95,44,130,.08);
  min-height: 44px;
}
/* Invalid target */
.sortable__item[data-invalid="true"] { cursor: no-drop; }
/* Disabled/pinned row */
.sortable__item[aria-disabled="true"] .sortable__handle { display: none; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sortable__item { transition: none; transform: none !important; }
}
```

### 9.3 React + TypeScript (dnd-kit — the accessible reference: keyboard sensor + announcements + optimistic persist)

```tsx
import { useId, useState } from "react";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor,
  closestCenter, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type Announcements,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  arrayMove, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface Task { id: string; label: string }

function SortableRow({ task, index, total }: { task: Task; index: number; total: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li ref={setNodeRef} style={style} className="sortable__item"
        data-dragging={isDragging || undefined} aria-roledescription="Sortable item">
      <button ref={setActivatorNodeRef} className="sortable__handle"
              aria-label={`Reorder: ${task.label}. Position ${index + 1} of ${total}`}
              {...attributes} {...listeners}>
        <svg aria-hidden width="16" height="16" />
      </button>
      <span className="sortable__label">{task.label}</span>
    </li>
  );
}

export function SortableList({
  initial, onPersist,
}: {
  initial: Task[];
  onPersist: (orderedIds: string[]) => Promise<void>;
}) {
  const [items, setItems] = useState<Task[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const liveId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Grabbed ${label(active.id)}. Use arrow keys to move, Space to drop, Escape to cancel.`,
    onDragOver: ({ active, over }) =>
      over ? `${label(active.id)} moved to position ${indexOf(over.id) + 1} of ${items.length}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over ? `${label(active.id)} dropped at position ${indexOf(over.id) + 1} of ${items.length}.`
           : `${label(active.id)} returned to its original position.`,
    onDragCancel: ({ active }) => `Reordering cancelled. ${label(active.id)} returned.`,
  };
  const label = (id: string | number) => items.find(i => i.id === id)?.label ?? "item";
  const indexOf = (id: string | number) => items.findIndex(i => i.id === id);

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const from = indexOf(active.id), to = indexOf(over.id);
    const prev = items;
    const next = arrayMove(items, from, to);
    setItems(next);                          // optimistic
    try {
      await onPersist(next.map(i => i.id));   // server write (§9.4)
    } catch {
      setItems(prev);                         // rollback on failure
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      accessibility={{ announcements, screenReaderInstructions: {
        draggable: "Press Space or Enter to pick up. Arrow keys to move. Space to drop, Escape to cancel." } }}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="sortable" role="list" id={liveId}>
          {items.map((t, i) => <SortableRow key={t.id} task={t} index={i} total={items.length} />)}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeId ? <div className="sortable__item" data-dragging>{label(activeId)}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### 9.4 The Backend Side (the reorder reaches the server — validation + authorization + optimistic contract)
A reorder is a mutation. The client sends the **full ordered set of IDs** (or a compact `{id, position}` diff); the server must validate the set, authorize the actor, and persist atomically. **Never trust the client's positions blindly.** Node/Express + a transactional write:

```ts
// PATCH /api/lists/:listId/order   body: { orderedIds: string[] }
import { Router } from "express";
import { z } from "zod";
import { db } from "./db"; // your query builder / ORM

const router = Router();
const Body = z.object({ orderedIds: z.array(z.string().uuid()).min(1).max(1000) });

router.patch("/api/lists/:listId/order", async (req, res) => {
  const parse = Body.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "invalid_payload" });
  const { orderedIds } = parse.data;
  const { listId } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "unauthenticated" });

  try {
    await db.transaction(async (tx) => {
      // Authorization: the actor must own / have write access to THIS list
      const list = await tx.list.findFirst({ where: { id: listId, ownerId: userId } });
      if (!list) { const e: any = new Error("forbidden"); e.status = 403; throw e; }

      // Integrity: the submitted set must be EXACTLY the list's current members —
      // no injected foreign IDs, no dropped IDs, no duplicates.
      const rows = await tx.item.findMany({ where: { listId }, select: { id: true } });
      const current = new Set(rows.map(r => r.id));
      const submitted = new Set(orderedIds);
      if (submitted.size !== orderedIds.length) { const e: any = new Error("dupes"); e.status = 422; throw e; }
      if (current.size !== submitted.size || [...submitted].some(id => !current.has(id))) {
        const e: any = new Error("set_mismatch"); e.status = 409; throw e; // stale client
      }

      // Persist positions atomically (fractional or integer indexing)
      await Promise.all(orderedIds.map((id, position) =>
        tx.item.update({ where: { id }, data: { position } })));
    });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(err.status ?? 500).json({ error: err.message ?? "server_error" });
  }
});
export default router;
```

The `set_mismatch` → `409` is what powers the client's rollback in §9.3: if another device reordered/added/removed items since this client loaded, the write is rejected and the UI reverts to canonical order. For hot lists, prefer **fractional indexing** (LexoRank / `position` as a rank string) so a single move updates one row instead of renumbering the whole list.

### 9.5 Vanilla JavaScript (no framework — full pointer AND keyboard, live announcements)

```js
export function makeSortable(list, { onPersist } = {}) {
  const live = document.getElementById("dnd-live");
  const items = () => [...list.querySelectorAll(".sortable__item")];
  const say = (msg, assertive = false) => {
    live.setAttribute("aria-live", assertive ? "assertive" : "polite");
    live.textContent = msg;
  };
  const total = () => items().length;
  const indexOf = (el) => items().indexOf(el);
  const commit = () => onPersist?.(items().map(el => el.dataset.id));

  // ---- Keyboard model (WCAG 2.1.1) ----
  list.addEventListener("keydown", (e) => {
    const handle = e.target.closest(".sortable__handle");
    if (!handle) return;
    const item = handle.closest(".sortable__item");
    const grabbed = item.dataset.dragging === "true";
    if ((e.key === " " || e.key === "Enter") && !grabbed) {
      e.preventDefault(); item.dataset.dragging = "true";
      say(`Grabbed ${label(item)}. Use arrow keys to move, Space to drop, Escape to cancel.`, true);
    } else if (grabbed && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const i = indexOf(item), dir = e.key === "ArrowDown" ? 1 : -1;
      const j = Math.max(0, Math.min(total() - 1, i + dir));
      if (i !== j) {
        dir === 1 ? item.after(items()[j]) : item.before(items()[j]);
        say(`${label(item)} moved to position ${indexOf(item) + 1} of ${total()}.`);
      }
      handle.focus();
    } else if (grabbed && (e.key === " " || e.key === "Enter")) {
      e.preventDefault(); item.dataset.dragging = "false";
      say(`${label(item)} dropped at position ${indexOf(item) + 1} of ${total()}.`, true);
      commit();
    } else if (grabbed && e.key === "Escape") {
      e.preventDefault(); item.dataset.dragging = "false";
      say(`Cancelled. ${label(item)} returned.`, true);
      // (restore original index if you snapshotted it on grab)
    }
  });

  // ---- Pointer model (WCAG 2.5.7 satisfied by the ⋯ menu, not this) ----
  let dragging = null, startY = 0;
  list.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".sortable__handle");
    if (!handle) return;
    dragging = handle.closest(".sortable__item");
    startY = e.clientY; dragging.dataset.dragging = "true";
    handle.setPointerCapture(e.pointerId);
  });
  list.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const after = [...items()].find(el => el !== dragging &&
      e.clientY < el.getBoundingClientRect().top + el.offsetHeight / 2);
    after ? list.insertBefore(dragging, after) : list.appendChild(dragging);
  });
  const end = () => { if (!dragging) return; dragging.dataset.dragging = "false"; dragging = null; commit(); };
  list.addEventListener("pointerup", end);
  list.addEventListener("pointercancel", end);

  const label = (el) => el.querySelector(".sortable__label")?.textContent ?? "item";
}
```

### 9.6 Tailwind CSS (utility-first)

```html
<ul role="list" class="flex flex-col gap-2" aria-describedby="dnd-instructions">
  <li data-dragging="false"
      class="group flex items-center gap-2 min-h-11 px-3 rounded-xl border border-transparent
             bg-stone-200 text-neutral-900 transition-[transform,box-shadow] duration-150
             data-[dragging=true]:scale-[1.02] data-[dragging=true]:shadow-xl data-[dragging=true]:z-10
             motion-reduce:transition-none motion-reduce:transform-none">
    <button type="button" aria-label="Reorder: Draft brand brief. Position 1 of 3"
            class="grid place-items-center size-6 p-2.5 -m-2.5 rounded-md cursor-grab
                   touch-none hover:bg-black/5 focus-visible:outline-2
                   focus-visible:outline-amber-500 focus-visible:outline-offset-2 active:cursor-grabbing">
      <svg aria-hidden="true" class="size-4"><!-- grip --></svg>
    </button>
    <span class="flex-1">Draft brand brief</span>
    <button type="button" aria-haspopup="menu" aria-label="Move Draft brand brief to…"
            class="opacity-0 group-hover:opacity-100 focus:opacity-100 px-2">⋯</button>
  </li>
</ul>
```

Note `touch-none` (`touch-action: none`) is scoped to the handle only, and `motion-reduce:*` gives the reduced-motion branch for free.

### 9.7 shadcn/ui + dnd-kit (Radix ships no Sortable — this is the community standard)

```tsx
// components/sortable-list.tsx — shadcn styling over dnd-kit (Radix has no sortable primitive)
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates,
         verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function Row({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <Card ref={setNodeRef} aria-roledescription="Sortable item"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 p-3", isDragging && "shadow-xl scale-[1.02] z-10")}>
      <Button ref={setActivatorNodeRef} variant="ghost" size="icon"
        aria-label="Drag to reorder" className="cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVertical className="size-4" aria-hidden />
      </Button>
      {children}
    </Card>
  );
}

export function SortableList({ items: initial }: { items: { id: string; label: string }[] }) {
  const [items, setItems] = useState(initial);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id)
          setItems((it) => arrayMove(it, it.findIndex(i => i.id === active.id), it.findIndex(i => i.id === over.id)));
      }}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map(i => <Row key={i.id} id={i.id}>{i.label}</Row>)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

### 9.8 Next.js (App Router: client sortable + server action persistence + revalidate)

```tsx
// app/lists/[id]/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const Schema = z.object({ listId: z.string().uuid(), orderedIds: z.array(z.string().uuid()).min(1) });

export async function reorderList(input: unknown) {
  const { listId, orderedIds } = Schema.parse(input);
  const session = await auth();
  if (!session?.user) throw new Error("unauthenticated");

  await db.$transaction(async (tx) => {
    const list = await tx.list.findFirst({ where: { id: listId, ownerId: session.user.id } });
    if (!list) throw new Error("forbidden");
    const current = new Set((await tx.item.findMany({ where: { listId }, select: { id: true } })).map(r => r.id));
    if (current.size !== orderedIds.length || orderedIds.some(id => !current.has(id)))
      throw new Error("set_mismatch");
    await Promise.all(orderedIds.map((id, position) => tx.item.update({ where: { id }, data: { position } })));
  });
  revalidatePath(`/lists/${listId}`);
}
// app/lists/[id]/list.client.tsx
"use client";
import { useTransition } from "react";
import { reorderList } from "./actions";
import { SortableList } from "@/components/sortable-list"; // §9.3

export function ClientList({ listId, initial }: { listId: string; initial: { id: string; label: string }[] }) {
  const [, startTransition] = useTransition();
  return (
    <SortableList initial={initial}
      onPersist={(orderedIds) =>
        new Promise<void>((resolve, reject) =>
          startTransition(async () => {
            try { await reorderList({ listId, orderedIds }); resolve(); } catch (e) { reject(e); }
          }))} />
  );
}
```

### 9.9 Python (FastAPI validated endpoint + Jinja2-rendered list)

```python
# app.py — FastAPI: server-authoritative reorder with validation + authorization
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, conlist
from sqlalchemy import update
from db import get_session, Item, List_, current_user  # your models/deps

app = FastAPI()
templates = Jinja2Templates(directory="templates")

class ReorderBody(BaseModel):
    ordered_ids: conlist(str, min_length=1, max_length=1000)

@app.patch("/api/lists/{list_id}/order")
async def reorder(list_id: str, body: ReorderBody, user=Depends(current_user), db=Depends(get_session)):
    lst = await db.get(List_, list_id)
    if lst is None or lst.owner_id != user.id:          # authorization
        raise HTTPException(status_code=403, detail="forbidden")
    rows = (await db.execute(Item.select_ids(list_id))).scalars().all()
    current, submitted = set(rows), set(body.ordered_ids)
    if len(submitted) != len(body.ordered_ids):
        raise HTTPException(status_code=422, detail="duplicate_ids")
    if current != submitted:                            # stale client / injected id
        raise HTTPException(status_code=409, detail="set_mismatch")
    async with db.begin():                              # atomic
        for position, item_id in enumerate(body.ordered_ids):
            await db.execute(update(Item).where(Item.id == item_id).values(position=position))
    return {"ok": True}

@app.get("/lists/{list_id}")
async def render(list_id: str, request: Request, db=Depends(get_session)):
    items = (await db.execute(Item.ordered(list_id))).scalars().all()
    return templates.TemplateResponse("list.html", {"request": request, "items": items})
```

```html
{# templates/list.html #}
<ul class="sortable" role="list" aria-describedby="dnd-instructions">
  {% for it in items %}
  <li class="sortable__item" role="listitem" data-id="{{ it.id }}" aria-roledescription="Sortable item">
    <button type="button" class="sortable__handle"
      aria-label="Reorder: {{ it.label|e }}. Position {{ loop.index }} of {{ items|length }}"
      aria-describedby="dnd-instructions"><svg aria-hidden="true" width="16" height="16"></svg></button>
    <span class="sortable__label">{{ it.label|e }}</span>
  </li>
  {% endfor %}
</ul>
```

### 9.10 Vue 3 (SFC — native pointer + keyboard, no heavy dep)

```vue
<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ initial: { id: string; label: string }[] }>();
const emit = defineEmits<{ persist: [ids: string[]] }>();
const items = ref([...props.initial]);
const grabbed = ref<string | null>(null);
const live = ref("");

function announce(m: string) { live.value = m; }
function move(i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= items.value.length) return;
  [items.value[i], items.value[j]] = [items.value[j], items.value[i]];
  announce(`${items.value[j].label} moved to position ${j + 1} of ${items.value.length}.`);
}
function onKey(e: KeyboardEvent, i: number, id: string) {
  if ((e.key === " " || e.key === "Enter") && grabbed.value !== id) { e.preventDefault(); grabbed.value = id;
    announce(`Grabbed ${items.value[i].label}. Arrow keys to move, Space to drop, Escape to cancel.`); }
  else if (grabbed.value === id && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    e.preventDefault(); move(i, e.key === "ArrowDown" ? 1 : -1); }
  else if (grabbed.value === id && (e.key === " " || e.key === "Enter")) {
    e.preventDefault(); grabbed.value = null; emit("persist", items.value.map(x => x.id)); announce("Dropped."); }
  else if (grabbed.value === id && e.key === "Escape") { e.preventDefault(); grabbed.value = null; announce("Cancelled."); }
}
</script>
<template>
  <ul class="sortable" role="list">
    <li v-for="(it, i) in items" :key="it.id" class="sortable__item"
        :data-dragging="grabbed === it.id" aria-roledescription="Sortable item">
      <button type="button" class="sortable__handle"
        :aria-label="`Reorder: ${it.label}. Position ${i + 1} of ${items.length}`"
        @keydown="onKey($event, i, it.id)"><svg aria-hidden width="16" height="16" /></button>
      <span>{{ it.label }}</span>
    </li>
  </ul>
  <div class="sr-only" role="status" aria-live="assertive">{{ live }}</div>
</template>
```

### 9.11 Svelte (svelte-dnd-action — keyboard + announcements built in)

```svelte
<script lang="ts">
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  export let items: { id: string; label: string }[];
  export let onPersist: (ids: string[]) => Promise<void>;
  const flipDurationMs = 180;
  let saving = false;

  function handleSort(e: CustomEvent<DndEvent<{ id: string; label: string }>>) {
    items = e.detail.items;
  }
  async function handleFinalize(e: CustomEvent<DndEvent<{ id: string; label: string }>>) {
    items = e.detail.items;
    const prev = items;
    saving = true;
    try { await onPersist(items.map(i => i.id)); }
    catch { items = prev; } finally { saving = false; }
  }
</script>

<ul class="sortable" role="list" aria-busy={saving}
    use:dndzone={{ items, flipDurationMs, dropTargetStyle: {} }}
    on:consider={handleSort} on:finalize={handleFinalize}>
  {#each items as it (it.id)}
    <li class="sortable__item" aria-roledescription="Sortable item">
      <span class="sortable__handle" tabindex="0" role="button"
            aria-label={`Reorder ${it.label}`}>⠿</span>
      <span>{it.label}</span>
    </li>
  {/each}
</ul>
```

`svelte-dnd-action` ships a keyboard model (Space to lift, arrows to move, Space/Escape) and its own ARIA live announcements — one of the few libraries accessible by default.

### 9.12 Angular (standalone + CDK DragDrop)

```ts
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { LiveAnnouncer } from "@angular/cdk/a11y";

@Component({
  selector: "app-sortable-list",
  standalone: true,
  imports: [DragDropModule],
  template: `
    <ul class="sortable" role="list" cdkDropList (cdkDropListDropped)="drop($event)">
      <li class="sortable__item" *ngFor="let it of items; let i = index"
          cdkDrag [cdkDragData]="it" aria-roledescription="Sortable item">
        <button class="sortable__handle" cdkDragHandle type="button"
          [attr.aria-label]="'Reorder: ' + it.label + '. Position ' + (i + 1) + ' of ' + items.length">
          <svg aria-hidden="true" width="16" height="16"></svg>
        </button>
        <span>{{ it.label }}</span>
      </li>
    </ul>`,
})
export class SortableListComponent {
  @Input() items: { id: string; label: string }[] = [];
  @Output() persist = new EventEmitter<string[]>();
  constructor(private announcer: LiveAnnouncer) {}

  drop(event: CdkDragDrop<{ id: string; label: string }[]>) {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    this.announcer.announce(
      `${this.items[event.currentIndex].label} moved to position ${event.currentIndex + 1} of ${this.items.length}.`,
      "assertive");
    this.persist.emit(this.items.map(i => i.id));
  }
}
```

Angular CDK's `cdkDrag` provides a keyboard drag mode out of the box and `LiveAnnouncer` handles the SR narration.

### 9.13 Bootstrap 5 + SortableJS (the classic pairing — with a11y bolted on)

```html
<ul id="bs-sortable" class="list-group" role="list" aria-describedby="dnd-instructions">
  <li class="list-group-item d-flex align-items-center gap-2" role="listitem"
      data-id="a1" aria-roledescription="Sortable item">
    <button type="button" class="btn btn-sm btn-light sortable-handle"
      style="min-width:44px;min-height:44px" aria-label="Reorder: Draft brand brief. Position 1 of 3">⠿</button>
    <span class="flex-grow-1">Draft brand brief</span>
  </li>
</ul>
<div class="visually-hidden" role="status" aria-live="assertive" id="bs-live"></div>

<script type="module">
  import Sortable from "https://cdn.jsdelivr.net/npm/sortablejs/+esm";
  const el = document.getElementById("bs-sortable");
  const live = document.getElementById("bs-live");
  Sortable.create(el, {
    handle: ".sortable-handle",
    animation: 180,
    delay: 220, delayOnTouchOnly: true,     // long-press on touch, no scroll hijack
    onEnd: (evt) => {
      const ids = [...el.children].map(li => li.dataset.id);
      live.textContent = `Moved to position ${evt.newIndex + 1} of ${el.children.length}.`;
      fetch(`/api/lists/L1/order`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: ids }) });
    },
  });
  // SortableJS is pointer-only; add the keyboard model from §9.5 for WCAG 2.1.1.
</script>
```

### 9.14 Web Component (framework-agnostic custom element, full keyboard)

```js
class SortableList extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "list");
    this._live = document.createElement("div");
    this._live.className = "sr-only"; this._live.setAttribute("role", "status");
    this._live.setAttribute("aria-live", "assertive");
    this.appendChild(this._live);
    this.addEventListener("keydown", this._onKey);
    this.addEventListener("pointerdown", this._onDown);
  }
  disconnectedCallback() {
    this.removeEventListener("keydown", this._onKey);
    this.removeEventListener("pointerdown", this._onDown);
  }
  get _items() { return [...this.querySelectorAll('[role="listitem"]')]; }
  _label = (el) => el.querySelector("[data-label]")?.textContent ?? "item";
  _say = (m) => { this._live.textContent = m; };

  _onKey = (e) => {
    const handle = e.target.closest("[data-handle]"); if (!handle) return;
    const item = handle.closest('[role="listitem"]');
    const grabbed = item.getAttribute("data-dragging") === "true";
    const items = this._items, i = items.indexOf(item);
    if ((e.key === " " || e.key === "Enter") && !grabbed) {
      e.preventDefault(); item.setAttribute("data-dragging", "true");
      this._say(`Grabbed ${this._label(item)}. Arrow keys to move, Space to drop, Escape to cancel.`);
    } else if (grabbed && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const j = Math.max(0, Math.min(items.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)));
      if (i !== j) { e.key === "ArrowDown" ? item.after(items[j]) : item.before(items[j]);
        this._say(`Moved to position ${this._items.indexOf(item) + 1} of ${items.length}.`); }
      handle.focus();
    } else if (grabbed && (e.key === " " || e.key === "Enter")) {
      e.preventDefault(); item.setAttribute("data-dragging", "false");
      this.dispatchEvent(new CustomEvent("reorder", { detail: this._items.map(el => el.dataset.id) }));
      this._say("Dropped.");
    } else if (grabbed && e.key === "Escape") {
      e.preventDefault(); item.setAttribute("data-dragging", "false"); this._say("Cancelled.");
    }
  };
  _onDown = (e) => {/* pointer drag identical to §9.5, using setPointerCapture */};
}
customElements.define("sortable-list", SortableList);
```

### 9.15 SwiftUI (iOS — List .onMove gives keyboard/VoiceOver reorder free)

```swift
import SwiftUI

struct Task: Identifiable, Equatable { let id: String; var label: String }

struct SortableListView: View {
    @State private var tasks: [Task]
    let persist: ([String]) async throws -> Void
    init(tasks: [Task], persist: @escaping ([String]) async throws -> Void) {
        _tasks = State(initialValue: tasks); self.persist = persist
    }
    var body: some View {
        List {
            ForEach(tasks) { task in Text(task.label) }
                .onMove { indices, newOffset in
                    let snapshot = tasks
                    tasks.move(fromOffsets: indices, toOffset: newOffset)  // optimistic
                    Task {
                        do { try await persist(tasks.map(\.id)) }
                        catch { tasks = snapshot }                          // rollback
                    }
                }
        }
        .toolbar { EditButton() } // enables drag handles; VoiceOver adds Move Up/Down automatically
    }
}
```

Apple's platform makes the accessible reorder path automatic: `.onMove` yields drag handles in Edit mode _and_ a VoiceOver custom-actions rotor with Move Up / Move Down — no manual live region needed.

### 9.16 Jetpack Compose (Android — reorderable lazy list)

```kotlin
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.*
import sh.calvin.reorderable.*   // reorderable-compose
import kotlinx.coroutines.launch

@Composable
fun SortableList(initial: List<Task>, onPersist: suspend (List<String>) -> Unit) {
    var items by remember { mutableStateOf(initial) }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val reorderState = rememberReorderableLazyListState(listState) { from, to ->
        items = items.toMutableList().apply { add(to.index, removeAt(from.index)) }
    }
    LazyColumn(state = listState) {
        items(items, key = { it.id }) { task ->
            ReorderableItem(reorderState, key = task.id) { isDragging ->
                Row(Modifier.longPressDraggableHandle(
                    onDragStopped = { scope.launch { onPersist(items.map { it.id }) } }
                ).semantics { contentDescription = "Reorder ${task.label}" }) {
                    Icon(Icons.Default.DragHandle, contentDescription = null)
                    Text(task.label)
                }
            }
        }
    }
}
```

### 9.17 Flutter (Dart — ReorderableListView)

```dart
import 'package:flutter/material.dart';

class SortableList extends StatefulWidget {
  const SortableList({super.key, required this.initial, required this.onPersist});
  final List<({String id, String label})> initial;
  final Future<void> Function(List<String>) onPersist;
  @override
  State<SortableList> createState() => _SortableListState();
}

class _SortableListState extends State<SortableList> {
  late List<({String id, String label})> _items = List.of(widget.initial);

  Future<void> _onReorder(int oldIndex, int newIndex) async {
    final snapshot = List.of(_items);
    setState(() {
      if (newIndex > oldIndex) newIndex -= 1;
      _items.insert(newIndex, _items.removeAt(oldIndex)); // optimistic
    });
    try {
      await widget.onPersist(_items.map((e) => e.id).toList());
    } catch (_) {
      setState(() => _items = snapshot);                  // rollback
    }
  }

  @override
  Widget build(BuildContext context) => ReorderableListView.builder(
        itemCount: _items.length,
        onReorder: _onReorder,
        itemBuilder: (context, i) => ListTile(
          key: ValueKey(_items[i].id),
          leading: ReorderableDragStartListener(
            index: i,
            child: const Icon(Icons.drag_handle, semanticLabel: 'Drag to reorder'),
          ),
          title: Text(_items[i].label),
        ),
      );
}
```

`ReorderableListView` exposes a semantics "custom action" for move up/down to TalkBack automatically.

### 9.18 Testing (Vitest + RTL keyboard reorder, jest-axe, Playwright E2E)

```ts
// sortable.test.tsx — unit + a11y
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { SortableList } from "./SortableList";

expect.extend(toHaveNoViolations);
const items = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }, { id: "c", label: "Gamma" }];

test("has no axe violations", async () => {
  const { container } = render(<SortableList initial={items} onPersist={vi.fn()} />);
  expect(await axe(container)).toHaveNoViolations();
});

test("keyboard reorder: Space to grab, ArrowDown, Space to drop persists new order", async () => {
  const persist = vi.fn().mockResolvedValue(undefined);
  render(<SortableList initial={items} onPersist={persist} />);
  const firstHandle = screen.getByRole("button", { name: /Reorder: Alpha/i });
  firstHandle.focus();
  await userEvent.keyboard("{ }");            // grab
  await userEvent.keyboard("{ArrowDown}");    // move down
  await userEvent.keyboard("{ }");            // drop
  expect(persist).toHaveBeenCalledWith(["b", "a", "c"]);
});

test("rollback: order reverts when persist rejects", async () => {
  const persist = vi.fn().mockRejectedValue(new Error("set_mismatch"));
  render(<SortableList initial={items} onPersist={persist} />);
  const h = screen.getByRole("button", { name: /Reorder: Alpha/i });
  h.focus();
  await userEvent.keyboard("{ }{ArrowDown}{ }");
  const rows = screen.getAllByRole("listitem");
  expect(within(rows[0]).getByText("Alpha")).toBeInTheDocument(); // back to original
});
// e2e/sortable.spec.ts — Playwright: verify the live-region announcement fires
import { test, expect } from "@playwright/test";

test("announces grab and move to screen readers", async ({ page }) => {
  await page.goto("/lists/demo");
  const live = page.locator("#dnd-live");
  const handle = page.getByRole("button", { name: /Reorder: Draft brand brief/i });
  await handle.focus();
  await page.keyboard.press("Space");
  await expect(live).toHaveText(/Grabbed .*Draft brand brief.*arrow keys/i);
  await page.keyboard.press("ArrowDown");
  await expect(live).toHaveText(/moved to position 2 of/i);
  await page.keyboard.press("Escape");
  await expect(live).toHaveText(/Cancelled/i);
});
```

* * *

## 10\. Accessibility
Standalone. For drag-and-drop, accessibility is not a checklist item — it is the whole engineering problem. Pointer-only DnD fails **WCAG 2.1.1 Keyboard (A)** and **WCAG 2.5.7 Dragging Movements (AA)** simultaneously. You must ship three operable paths: pointer drag, full keyboard drag, and a non-drag pointer alternative.

**Roles & ARIA**
*   Container: `role="list"` (or `listbox` if items are selectable, or `application`/`grid` for a managed 2-D board). Each item: `role="listitem"` + `aria-roledescription="Sortable item"` so AT announces the affordance.
*   The drag initiator is a real `<button>` (handle) — free focus, free Space/Enter. Give it a descriptive `aria-label` that **includes current position**: "Reorder: Draft brand brief. Position 1 of 3."
*   Reference the shared instructions node with `aria-describedby`.
*   A visually-hidden `role="status"` live region: **assertive** for grab/drop/cancel, **polite** for interim position changes. This is how a blind user perceives every move. `aria-grabbed`/`aria-dropeffect` are **deprecated in ARIA 1.1+** — do not rely on them; use live announcements instead.
*   `aria-busy="true"` on the list while an optimistic reorder is being persisted.

**Keyboard map (mandatory for an interactive component):**

| Key | Action |
| ---| --- |
| `Tab` / `Shift+Tab` | Move focus between drag handles (roving tabindex optional) |
| `Space` / `Enter` (not grabbed) | Grab the focused item — enters drag mode, announces "Grabbed … Use arrow keys to move" |
| `Arrow Down` / `Arrow Up` | Move grabbed item one position (1-D); announces new position |
| `Arrow Left` / `Arrow Right` | 2-D grid: move across; Tree: outdent / indent (re-parent) |
| `Space` / `Enter` (grabbed) | Drop at current position; persists; announces final position |
| `Escape` | Cancel — return item to original position; announces cancellation |
| `Home` / `End` (optional) | Jump grabbed item to first / last position |

**Focus management:** focus stays on the handle throughout the keyboard drag (it must not get lost when the DOM reorders — re-focus the handle after each move). On drop, focus remains on the moved item's handle. On cancel, focus returns to the handle at the original position. Never let a reorder dump focus to `<body>`.

**Contrast:** the drag handle glyph and the placeholder outline are **non-text UI** → need **3:1** contrast against their background (WCAG 1.4.11). Label text needs 4.5:1. The dashed placeholder must not rely on a low-contrast color alone.

**Target size:** handle hit area **≥44×44px** (2.5.8 AA; 2.5.5 AAA prefers 44). Never ship a 16px grip as the only tap target.

**Reduced motion:** under `prefers-reduced-motion: reduce`, disable the reorder/settle transitions and the overlay's rotate/scale; snap instantly to the new position and lean harder on the live-region narration so the change is still perceivable.

**Common failures specific to this component:**
*   Pointer drag with **no keyboard model** — the canonical failure; instant A-level violation.
*   No live region → a screen-reader user has _zero_ feedback that anything moved.
*   `touch-action` not scoped to the handle → the drag hijacks page scroll on mobile (a 2.5.7-adjacent nightmare and a scroll-trap).
*   Handle as a `<div onClick>` → not focusable, not Space/Enter operable.
*   Focus lost on DOM reorder → keyboard user is ejected mid-drag.
*   Announcing "item moved" without the **position numbers** ("2 of 5") → the user can't build a mental model.
*   No non-drag pointer alternative (menu / up-down buttons) → fails 2.5.7 even if keyboard works.
* * *

## 11\. Innovative / Emerging Ideas
*   **List reorder via the View Transitions API (2026-era).** Chromium's View Transitions now animate list re-ordering and even cross-document transitions; you can drive the "settle into new slot" animation declaratively with `view-transition-name` per item and let the browser interpolate positions, shedding most of the JS FLIP bookkeeping. Pair with `@media (prefers-reduced-motion)` to auto-skip.
*   **Fractional indexing / CRDT-native ordering.** Instead of renumbering rows on every move, store a rank string (LexoRank / fractional index) so a single reorder is a one-row write and multi-user concurrent reorders merge without conflict — the backbone of real-time collaborative sortables (Linear, Figma-style).
*   **AI "arrange for me" alongside manual drag.** A generative button that proposes an order (by priority, due date, semantic cluster) and drops it in as a _reviewable_ optimistic change the user can then hand-tune by dragging. The manual drag becomes the override layer.
*   **Scroll-driven +** **`touch-action`** **refinements for buttery mobile auto-scroll.** New scroll-driven animation primitives plus universal Pointer Events let auto-scroll-during-drag run off the main thread, killing the classic janky edge-scroll.
*   **Spatial / motion-aware overlays.** Carrying visionOS depth cues into the drag overlay (parallax lift, soft 3D shadow that reacts to device tilt) for a more physical grab metaphor — gated behind reduced-motion.
* * *

## 12\. Conversion / UX Killers
*   **Drag hijacks scroll on touch.** If `touch-action: none` is on the whole item (not just the handle) or the activation has no long-press delay, every attempt to scroll the list grabs a row instead. Users can't scroll, rage-quit. **Fix:** scope `touch-action: none` to the handle; require a 200–250ms long-press or a movement threshold before activating a touch drag.
*   **No drop placeholder.** Without a visible gap showing where the item lands, users drop blind and get it wrong, then have to redo it. **Fix:** always open an animated placeholder equal to the item height at the insertion point.
*   **Optimistic update with no reconciliation.** UI shows the new order, the server write silently failed, next reload "loses" the change. Destroys trust instantly. **Fix:** await the persist, roll back visibly on error, and surface a non-blocking "couldn't save — reverted" message.
*   **Tiny or hover-only handles.** A 16px grip, or a handle that only appears on hover, is unusable on touch and barely hittable on desktop. **Fix:** 44px hit area, and always-visible handles on touch.
*   **DnD as the only reorder path.** Excludes keyboard users, switch users, and anyone who finds dragging item 200 to position 5 miserable — and it's a WCAG violation. **Fix:** ship the keyboard model _and_ a "Move to…" menu / up-down buttons.
*   **Janky reorder animation.** Animating `top`/`left`/`height` reflows every frame and drops to single-digit FPS on a long list. **Fix:** animate `transform` only (compositor), keep transitions ≤220ms, virtualize long lists.
*   **Losing focus / selection after a drop.** Keyboard user drops an item and focus vanishes to `<body>`; they've lost their place. **Fix:** keep focus on the moved item's handle post-drop.
* * *

## 13\. Advanced Patterns
*   **TypeScript-enforced a11y via discriminated unions.** Make it _impossible_ to construct a sortable that lacks its accessible payload. A handle-less whole-item drag must still require a label; a handled drag requires a handle label. The union forces the caller to supply the right announcement props at compile time:

```ts
type Announce = { announce: (msg: string) => void }; // live-region setter, required
type SortableConfig =
  | ({ mode: "handle"; handleLabel: (item: Item, pos: number, total: number) => string } & Announce)
  | ({ mode: "whole"; itemLabel: (item: Item, pos: number, total: number) => string } & Announce);
// Omitting `announce`, or `handleLabel` in handle mode, is a compile error.
function createSortable(config: SortableConfig) { /* ... */ }
```

*   **Design-token tiering for the drag surface.** Express every drag-specific value as a token so themes (and the 11 skins in §17) reskin without touching logic:

```css
:root {
  --dnd-lift-shadow: 0 8px 24px rgba(10,10,10,.28);
  --dnd-lift-scale: 1.02;
  --dnd-placeholder-border: 2px dashed var(--eminence, #5F2C82);
  --dnd-settle-duration: 180ms;
  --dnd-handle-hit: 44px;
}
.sortable__item[data-dragging="true"] { box-shadow: var(--dnd-lift-shadow); transform: scale(var(--dnd-lift-scale)); }
.sortable__placeholder { border: var(--dnd-placeholder-border); }
[data-reduce-motion] { --dnd-settle-duration: 0ms; --dnd-lift-scale: 1; }
```

*   **FLIP + fractional indexing for O(1) collaborative reorder.** Compute First/Last positions, invert the delta, and play the transition on `transform`; persist only the single moved row's new rank string. Concurrent edits from other users merge because ranks are independent — no full-list renumber, no lost-update race.
*   **Auto-scroll during drag with a velocity ramp.** When the pointer nears a scroll boundary, scroll the container with `requestAnimationFrame` at a velocity proportional to edge proximity, and recompute the drop index against the virtualized range — the pattern that makes long-list Kanban usable.
* * *

## 14\. Performance & Bundle Cost
*   **Animate compositor-only properties.** Reorder and settle animations must use `transform` (and `opacity`), never `top`/`left`/`width`/`height`, which force layout on every frame. A DnD interaction fires `pointermove` continuously — layout thrash here is the #1 source of drag jank.
*   **Virtualize long lists.** Past ~100–200 rows, render only the visible window (TanStack Virtual, react-window) and reconcile drag indices against the virtual range; otherwise reorder-plus-reflow tanks frame rate and the DOM node count balloons.
*   **Tree-shaking / import discipline.** dnd-kit is modular — import from `@dnd-kit/core` and `@dnd-kit/sortable` and pull only the sensors you use; don't barrel-import a whole DnD suite. SortableJS is ~10KB gz but pointer-only (you still add the keyboard layer). Prefer the platform (`List.onMove`, CDK, `ReorderableListView`) on native to ship zero extra JS.
*   **Throttle the hit-testing, not the render.** Collision detection on every `pointermove` is expensive; use dnd-kit's `closestCenter`/`rectIntersection` (already optimized) or throttle custom hit-tests to animation frames. Use `setPointerCapture` so you're not re-attaching listeners.
*   **Lazy-load the drag engine.** DnD is an interaction, not initial paint. Code-split the sortable behavior and hydrate/attach it after first paint (or on first pointerdown/focus of a handle) so the library never blocks the critical path.
*   **Batch the persist.** Debounce rapid successive reorders into a single PATCH, and send a compact `{id, position}` diff (or one fractional-rank update) rather than the entire list every keystroke.
* * *

## 15\. Security
Standalone. Reordering _is_ a state-changing server mutation, so the attack surface is real — larger than most "display" components.
*   **Broken object-level authorization (BOLA/IDOR) is the primary risk.** `PATCH /lists/:id/order` must verify the authenticated user owns or has write access to **that** list _and_ that every submitted item ID belongs to it. Without the ownership check (§9.4/9.8/9.9), a user can reorder — or, if you update by ID without scoping to the list, corrupt — someone else's data. Authorize on the server, every request, never on the client.
*   **Set-integrity validation.** Treat the client's `orderedIds` as hostile: reject if it contains duplicates, foreign IDs, missing IDs, or a different membership than the list currently has (`409 set_mismatch`). This blocks both malicious injection and stale-client corruption, and it's what powers legitimate optimistic-rollback.
*   **Mass-assignment / payload bounds.** Validate with a schema (Zod/Pydantic), cap array length (`max(1000)`), and only accept the `orderedIds` field — never let a "reorder" body smuggle in `ownerId`, `price`, or `status` writes.
*   **CSRF & method safety.** The reorder is a non-idempotent mutation over `PATCH`/`POST`; protect it with CSRF tokens (cookie-auth) or rely on bearer tokens, and never expose it over `GET`.
*   **XSS surface.** DnD itself doesn't inject markup, but reordered items usually render **user-authored labels** (task names, playlist titles). Escape on render (Jinja2 `|e`, framework auto-escaping) — a sortable list is a common place unescaped user content sneaks into the DOM.
*   **Rate limiting.** Auto-scroll drags and rapid keyboard moves can generate many PATCHes; debounce client-side and rate-limit server-side so reorder can't be used to hammer the DB.
* * *

## 16\. Senior-Level Checklist
Ship-ready gate — every item non-negotiable.
- [ ] **Semantics:** `role="list"`/`listitem` (or listbox/grid), `aria-roledescription="Sortable item"`, handle is a real `<button>` — no `<div onClick>`.
- [ ] **Keyboard:** full model works — Space/Enter grab, arrows move, Space drop, Escape cancel — with focus preserved on the handle through every DOM reorder (WCAG 2.1.1).
- [ ] **Non-drag pointer alternative** shipped (Move to… menu or up/down buttons) so WCAG 2.5.7 passes without a drag.
- [ ] **Live announcements:** assertive grab/drop/cancel, polite interim moves, always including "position N of M."
- [ ] **Focus management:** never lost to `<body>`; returns to origin handle on cancel, stays on item on drop.
- [ ] **Contrast:** handle glyph & placeholder ≥3:1 (non-text), labels ≥4.5:1.
- [ ] **Target size:** handle hit area ≥44×44px.
- [ ] **Touch:** `touch-action: none` scoped to the handle only; long-press/threshold activation; page scroll never hijacked.
- [ ] **States:** placeholder gap, lifted overlay, invalid-target, saving/`aria-busy`, and visible error/rollback all implemented.
- [ ] **Reduced motion:** `prefers-reduced-motion` branch snaps instantly and narrates via live region.
- [ ] **Persistence:** optimistic update + awaited server write + visible rollback on failure.
- [ ] **Server:** authorization (ownership) + set-integrity validation + schema + rate limit on the reorder endpoint.
- [ ] **Performance:** transform-only animation, long lists virtualized, drag engine code-split/lazy, persist debounced.
* * *

## 17\. Visual Styles
The same sortable behavior wearing eleven skins. Each describes how THIS component — its handle, lifted item, and drop placeholder — looks in that language.
*   **Flat:** the handle is a plain 2-tone grip glyph, the lifted item gets a flat solid-color raise (a slightly darker fill, no blur), and the placeholder is a simple dashed outline in the accent color. Reads instantly, scales fast.
*   **Material:** dragging elevates the item along Material's elevation ladder (a real key/ambient shadow that grows on lift), a ripple emanates from the handle on grab, and the drop settles with an emphasized-decelerate curve; the placeholder is a tonal surface tint.
*   **Glassmorphism:** the drag overlay is a translucent frosted card with `backdrop-filter: blur()` floating over the list, the handle a semi-opaque pill; watch placeholder contrast against the blurred backdrop.
*   **Liquid Glass (2026, Apple iOS 26 / macOS Tahoe):** the lifted item becomes a pill of refracting glass with a specular highlight rim and a sheen that shifts as it moves, casting a soft caustic on the rows beneath; the placeholder ripples like liquid closing a gap. Honor reduced-motion — the refraction/sheen must be disable-able.
*   **Neumorphism:** the handle is a softly extruded grip on a same-color surface; on grab the item "pops" via a dual light/dark shadow and the vacated slot becomes an inset pressed groove as the placeholder. Contrast-poor — accent use only, never the whole list.
*   **Skeuomorphism:** the handle is a real ridged rubber grip with beveled highlights, the dragged item lifts like a physical card with a gradient face and a cast drop-shadow, and the placeholder is a routed inset slot the card will seat into.
*   **Neo-Brutalism:** thick black-bordered rows with a hard offset shadow that jumps larger on lift, zero radius, a chunky monospace grip; the placeholder is a bold dashed black rectangle. High personality, high contrast.
*   **Claymorphism:** puffy big-radius rows with inner top-light and bottom-shadow; the lifted item inflates slightly with a soft glow, and the placeholder is a squishy indented clay well. Friendly and tactile.
*   **Aurora / Gradient:** the lifted item carries an animated multi-hue gradient glow on a dark surface, the handle glyph picks up the gradient, and the placeholder is a soft luminous band; gate the animation behind `prefers-reduced-motion`.
*   **Minimal / Swiss:** near-zero decoration — a thin hairline grip, the lift signaled only by a 1px key line and a subtle position shift, the placeholder a single accent rule. Typography and grid do the work.
*   **UJG Brand:** Goldenrod (`#DCA424`) grip glyph and focus ring on deep Eminence (`#5F2C82`) / Night (`#0A0A0A`) rows; the lifted card gains a warm goldenrod glow and confident radius, the placeholder a dashed Eminence-tinted well. The house default.

**The rule that never changes:** the style is skin; the behavior is the skeleton. Semantics (`role`/`aria-roledescription`), the full keyboard model, live-region announcements, the focus ring, and the 44px handle target are **identical across all eleven skins**. For the full 31 styles, see the 🎨 Design Styles page.