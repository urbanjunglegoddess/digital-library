# Segmented Control/Toggle Group (Full Build)

# The Segmented Control: A Senior Engineer's Complete Breakdown
The button-group picker for switching between mutually exclusive options. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle segment count, size, icon/label variants, and all 11 visual styles, then output code for every target.

**Audit a segmented control:** the companion audit checks radiogroup semantics, roving tabindex, selection announcement, and contrast, then exports a client-ready report.

This doc follows the Private ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).

* * *
## 1\. What a Segmented Control Actually Is
A **segmented control** (toggle group, button group selector, pill selector) is a set of 2-5 mutually exclusive options presented as visually connected buttons. Selecting one deselects the others. It's a visual radio group.

The distinctions:

**Segmented Control (this doc):** exclusive selection from 2-5 visible options in a connected button strip. All options always visible.
**Tabs:** also switch views, but tabs are connected to content panels and have tab/tabpanel semantics. A segmented control can switch anything: views, filters, modes.
**Radio buttons:** same logic (single select) but different visual. Radio buttons are form-native circles with labels; segmented controls are compact button strips.
**Toggle/Switch:** binary on/off. A segmented control with exactly 2 options is functionally similar but visually and semantically distinct.
**Button Group:** visually grouped buttons that can be independently pressed (not mutually exclusive). Different behavior.

The key value: **all options are visible simultaneously**, so users can compare choices at a glance without opening a dropdown. This is why segmented controls are limited to 2-5 options. More than 5, and the strip becomes too wide or the segments too small.

* * *
## 2\. Why It Matters
**View switching is everywhere.** Grid/List/Map views, Day/Week/Month calendars, Light/Dark/System themes, Sort by Price/Rating/Distance. The segmented control is the compact, scannable way to present these choices.

**Faster than a dropdown.** For 2-5 options, a segmented control shows all choices immediately. A dropdown requires open → scan → select (3 actions vs. 1).

**Clarity of current state.** The selected segment is always visible. With a dropdown, the current selection is just text in a closed box. With a segmented control, the active segment is visually highlighted in context with its alternatives.

* * *
## 3\. Anatomy
**Container:** the enclosing bar/pill that groups all segments. Has a background and border that unifies the options as a single control.

**Segments:** individual option buttons within the container. Each segment can contain text, an icon, or both.

**Active indicator:** the visual highlight showing which segment is selected. This is often a "sliding pill" background that animates between segments, or a filled background/border change on the active segment.

**Labels:** text in each segment. Should be short (1-2 words max).

**Icons (optional):** leading icons or icon-only segments for maximum density.

**Dividers (optional):** thin vertical lines between segments (disappear adjacent to the active segment).

* * *
## 4\. Sizes / Scale

| Token | Height | Padding (per segment) | Font | Icon | Use |
| ---| ---| ---| ---| ---| --- |
| S | 28-32px | 8px 12px | 12px | 14px | Dense toolbars, secondary controls |
| M | 36-40px | 10px 16px | 13px | 16px | Default |
| L | 44-48px | 12px 20px | 14px | 20px | Touch-primary, mobile, prominent |

Segment width: either equal-width (each segment takes 1/N of the container) or auto-width (each segment sizes to its content + padding). Equal-width looks cleaner; auto-width saves space when labels vary greatly.

Container width: fluid (100% parent) or fit-content (shrink to segments).

* * *
## 5\. States
**Selected (active):** one segment is always selected. Visually filled/highlighted. `aria-checked="true"`.

**Unselected:** all non-active segments. Muted/transparent background. `aria-checked="false"`.

**Hover (on unselected):** subtle background tint on hover, indicating interactability.

**Focus:** visible focus ring on the currently-focused segment (keyboard navigation). With roving tabindex, only one segment is in the tab order.

**Disabled (per-segment):** an individual option is unavailable. Grayed out, `aria-disabled="true"`, skipped by arrow keys.

**Disabled (whole control):** the entire segmented control is non-interactive. All segments muted.

**Animated transition:** when selection changes, the active indicator slides/morphs from the previous segment to the new one. Uses `transform: translateX()` for compositor-only animation.

* * *
## 6\. Types / Variants
**Text-only:** labels in each segment. The most common.
**Icon-only:** just icons (grid icon, list icon, map icon). Needs accessible labels on each.
**Icon + text:** leading icon with label text. Wider but more discoverable.
**Equal-width:** all segments same width regardless of content.
**Auto-width:** each segment sizes to its content.
**Pill/Rounded:** fully-rounded container and sliding indicator.
**Squared:** sharp corners, no radius. For dense/technical UIs.
**With sliding indicator:** the active background is a separate element that animates between positions.
**Without animation:** instant swap (for `prefers-reduced-motion`).
**Multi-row (rare):** for 6+ options that wrap. Usually means you should use a different component.

* * *
## 7\. When to Use (and When Not To)
**Use a segmented control when:**
*   2-5 mutually exclusive options
*   All options should be visible simultaneously (no hidden choices)
*   The selection switches a view, filter, or mode (not submitting a form value)
*   You need a compact, inline control

**Use something else when:**
*   More than 5 options → Dropdown/Select or Tabs
*   Options aren't mutually exclusive (can select multiple) → Checkbox group or multi-select chips
*   It's a form value being submitted → Radio buttons (more form-native)
*   The options switch content panels with their own labels → Tabs (with tab/tabpanel semantics)
*   Binary on/off → Toggle/Switch
*   The options have long labels (> 3 words each) → Radio buttons or Select

* * *
## 8\. Across Design Systems
**Apple HIG:** `UISegmentedControl` (iOS) is the canonical example. Native, accessible, and ubiquitous in iOS apps. Fixed set of 2-5 segments. In SwiftUI: `Picker` with `.pickerStyle(.segmented)`.

**Material Design:** "Segmented button" in M3. Supports single-select and multi-select (though multi-select is a different component pattern). Uses icon + label variants.

**Radix:** `ToggleGroup` with `type="single"` provides the primitive. Full keyboard support, roving tabindex, `aria-pressed` per item. Note: Radix uses `aria-pressed` rather than radiogroup semantics.

**shadcn:** `<ToggleGroup>` built on Radix. Styled with Tailwind.

**Ant Design:** `<Segmented>` component with `options`, `value`, and `onChange`. Supports icons, disabled options, and block (full-width) mode.

**Chakra:** No dedicated component. Teams compose from `ButtonGroup` + custom styling.

**Fluent:** `ToggleButton` group or `Toolbar` with toggle items.

* * *
## 9\. The Code
### 9.1 HTML + ARIA (radiogroup pattern)

```plain
<div role="radiogroup" aria-label="View mode" class="segmented">
  <button role="radio" aria-checked="true" tabindex="0" class="segmented__item segmented__item--active">
    <svg aria-hidden="true"><!-- grid icon --></svg>
    <span>Grid</span>
  </button>
  <button role="radio" aria-checked="false" tabindex="-1" class="segmented__item">
    <svg aria-hidden="true"><!-- list icon --></svg>
    <span>List</span>
  </button>
  <button role="radio" aria-checked="false" tabindex="-1" class="segmented__item">
    <svg aria-hidden="true"><!-- map icon --></svg>
    <span>Map</span>
  </button>
  <!-- Sliding indicator (positioned absolutely, animated) -->
  <div class="segmented__indicator" aria-hidden="true" style="transform: translateX(0)"></div>
</div>
```

Why `role="radiogroup"` + `role="radio"`:
*   Communicates mutual exclusivity to AT ("1 of 3 selected").
*   `aria-checked="true"` on the active item. AT announces "Grid, radio button, checked, 1 of 3."
*   Alternative: `role="toolbar"` with `aria-pressed` on each button. Both patterns are valid. Radiogroup better communicates that only one can be active.
### 9.2 CSS (with sliding indicator)

```css
.segmented {
  display: inline-flex;
  align-items: center;
  position: relative;
  background: var(--seg-bg, oklch(20% 0.015 305));
  border: 1px solid var(--seg-border, oklch(30% 0.02 305));
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.segmented__item {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--seg-fg, oklch(70% 0.01 305));
  font: 500 13px/1 system-ui, sans-serif;
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
}

.segmented__item:hover:not(.segmented__item--active) {
  color: var(--seg-fg-hover, oklch(85% 0.01 305));
}

.segmented__item--active {
  color: var(--seg-active-fg, oklch(95% 0.01 305));
}

.segmented__item:focus-visible {
  outline: 2px solid var(--seg-ring, oklch(78% 0.135 82));
  outline-offset: 2px;
}

.segmented__item[aria-disabled="true"] {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Sliding indicator */
.segmented__indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(100% / var(--segment-count, 3) - 2px);
  border-radius: 7px;
  background: var(--seg-indicator, oklch(42% 0.12 305));
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}

@media (prefers-reduced-motion: reduce) {
  .segmented__indicator { transition: none; }
}

/* Icon-only variant */
.segmented--icon-only .segmented__item {
  padding: 8px 12px;
}

/* Full-width variant */
.segmented--block {
  display: flex;
  width: 100%;
}
.segmented--block .segmented__item {
  flex: 1;
}
```

### 9.3 JavaScript (keyboard + indicator position)

```javascript
class SegmentedControl {
  constructor(el) {
    this.el = el;
    this.items = [...el.querySelectorAll('[role="radio"]')];
    this.indicator = el.querySelector('.segmented__indicator');
    this.activeIndex = this.items.findIndex(i => i.getAttribute('aria-checked') === 'true');

    el.style.setProperty('--segment-count', this.items.length);
    this.updateIndicator();

    el.addEventListener('click', this.handleClick.bind(this));
    el.addEventListener('keydown', this.handleKey.bind(this));
  }

  select(index) {
    if (this.items[index].getAttribute('aria-disabled') === 'true') return;

    this.items[this.activeIndex].setAttribute('aria-checked', 'false');
    this.items[this.activeIndex].setAttribute('tabindex', '-1');
    this.items[this.activeIndex].classList.remove('segmented__item--active');

    this.activeIndex = index;
    this.items[index].setAttribute('aria-checked', 'true');
    this.items[index].setAttribute('tabindex', '0');
    this.items[index].classList.add('segmented__item--active');
    this.items[index].focus();

    this.updateIndicator();
    this.el.dispatchEvent(new CustomEvent('change', { detail: { index, value: this.items[index].dataset.value } }));
  }

  updateIndicator() {
    if (!this.indicator) return;
    this.indicator.style.transform = `translateX(${this.activeIndex * 100}%)`;
  }

  handleClick(e) {
    const item = e.target.closest('[role="radio"]');
    if (!item) return;
    const index = this.items.indexOf(item);
    if (index !== -1) this.select(index);
  }

  handleKey(e) {
    let newIndex = this.activeIndex;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown':
        e.preventDefault();
        newIndex = (this.activeIndex + 1) % this.items.length;
        while (this.items[newIndex].getAttribute('aria-disabled') === 'true') {
          newIndex = (newIndex + 1) % this.items.length;
        }
        break;
      case 'ArrowLeft': case 'ArrowUp':
        e.preventDefault();
        newIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
        while (this.items[newIndex].getAttribute('aria-disabled') === 'true') {
          newIndex = (newIndex - 1 + this.items.length) % this.items.length;
        }
        break;
      case 'Home': e.preventDefault(); newIndex = 0; break;
      case 'End': e.preventDefault(); newIndex = this.items.length - 1; break;
      default: return;
    }
    this.select(newIndex);
  }
}
```

### 9.4 React + TypeScript

```typescript
import { useState, useRef, useEffect, ReactNode, KeyboardEvent } from "react";

interface Segment {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function SegmentedControl({ segments, value, onChange, label, size = "md", fullWidth }: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndex = segments.findIndex(s => s.value === value);

  const select = (index: number) => {
    if (segments[index].disabled) return;
    onChange(segments[index].value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    let newIndex = activeIndex;
    const enabledIndices = segments.map((s, i) => s.disabled ? -1 : i).filter(i => i !== -1);

    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': {
        e.preventDefault();
        const currentPos = enabledIndices.indexOf(activeIndex);
        newIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
        break;
      }
      case 'ArrowLeft': case 'ArrowUp': {
        e.preventDefault();
        const currentPos = enabledIndices.indexOf(activeIndex);
        newIndex = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
        break;
      }
      default: return;
    }
    select(newIndex);
  };

  return (
    <div ref={containerRef} role="radiogroup" aria-label={label}
         className={`segmented segmented--${size} ${fullWidth ? 'segmented--block' : ''}`}
         style={{ '--segment-count': segments.length } as React.CSSProperties}
         onKeyDown={handleKeyDown}>
      {segments.map((seg, i) => (
        <button key={seg.value} role="radio" aria-checked={i === activeIndex}
                aria-disabled={seg.disabled || undefined}
                tabIndex={i === activeIndex ? 0 : -1}
                className={`segmented__item ${i === activeIndex ? 'segmented__item--active' : ''}`}
                onClick={() => select(i)}>
          {seg.icon && <span aria-hidden="true">{seg.icon}</span>}
          <span>{seg.label}</span>
        </button>
      ))}
      <div className="segmented__indicator" aria-hidden="true"
           style={{ transform: `translateX(${activeIndex * 100}%)` }} />
    </div>
  );
}
```

### 9.5 Vue 3

```plain
<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  segments: Array<{ value: string; label: string; icon?: any; disabled?: boolean }>;
  modelValue: string;
  label: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const activeIndex = computed(() => props.segments.findIndex(s => s.value === props.modelValue));

function select(index: number) {
  if (props.segments[index].disabled) return;
  emit('update:modelValue', props.segments[index].value);
}
</script>

<template>
  <div role="radiogroup" :aria-label="label" class="segmented"
       :style="{ '--segment-count': segments.length }">
    <button v-for="(seg, i) in segments" :key="seg.value"
            role="radio" :aria-checked="i === activeIndex"
            :aria-disabled="seg.disabled || undefined"
            :tabindex="i === activeIndex ? 0 : -1"
            :class="['segmented__item', { 'segmented__item--active': i === activeIndex }]"
            @click="select(i)">
      <component v-if="seg.icon" :is="seg.icon" aria-hidden="true" />
      <span>{{ seg.label }}</span>
    </button>
    <div class="segmented__indicator" aria-hidden="true"
         :style="{ transform: `translateX(${activeIndex * 100}%)` }" />
  </div>
</template>
```

### 9.6 SwiftUI (native)

```swift
struct ViewModePicker: View {
    @Binding var mode: ViewMode
    enum ViewMode: String, CaseIterable { case grid, list, map }

    var body: some View {
        Picker("View", selection: $mode) {
            ForEach(ViewMode.allCases, id: \.self) { mode in
                Label(mode.rawValue.capitalized, systemImage: mode.icon)
                    .tag(mode)
            }
        }
        .pickerStyle(.segmented)
        // Native accessibility: fully handled by the system
    }
}
```

### 9.7 Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SegmentedControl } from "./SegmentedControl";

const segments = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'map', label: 'Map' },
];

describe("SegmentedControl", () => {
  it("renders as radiogroup with label", () => {
    render(<SegmentedControl segments={segments} value="grid" onChange={() => {}} label="View mode" />);
    expect(screen.getByRole("radiogroup", { name: /view mode/i })).toBeInTheDocument();
  });

  it("active segment has aria-checked=true", () => {
    render(<SegmentedControl segments={segments} value="list" onChange={() => {}} label="View" />);
    expect(screen.getByRole("radio", { name: /list/i })).toHaveAttribute("aria-checked", "true");
  });

  it("only active segment has tabindex=0", () => {
    render(<SegmentedControl segments={segments} value="grid" onChange={() => {}} label="View" />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
  });

  it("ArrowRight moves selection to next", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl segments={segments} value="grid" onChange={onChange} label="View" />);
    screen.getByRole("radio", { name: /grid/i }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("list");
  });

  it("clicking a segment fires onChange", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl segments={segments} value="grid" onChange={onChange} label="View" />);
    await userEvent.click(screen.getByRole("radio", { name: /map/i }));
    expect(onChange).toHaveBeenCalledWith("map");
  });

  it("disabled segments are skipped by arrows", async () => {
    const segs = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }, { value: 'c', label: 'C' }];
    const onChange = vi.fn();
    render(<SegmentedControl segments={segs} value="a" onChange={onChange} label="Test" />);
    screen.getByRole("radio", { name: /a/i }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("c"); // skipped B
  });

  it("has no axe violations", async () => {
    const { container } = render(<SegmentedControl segments={segments} value="grid" onChange={() => {}} label="View" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

* * *
## 10\. Accessibility
### Semantic pattern: radiogroup
The segmented control maps to `role="radiogroup"` with `role="radio"` on each segment:
*   AT announces: "View mode, radio group. Grid, radio button, checked, 1 of 3."
*   Users understand mutual exclusivity immediately.
*   `aria-checked="true"` on the active segment.
### Keyboard

| Key | Action |
| ---| --- |
| ArrowRight / ArrowDown | Select next segment (wraps) |
| ArrowLeft / ArrowUp | Select previous segment (wraps) |
| Home | Select first segment |
| End | Select last segment |
| Tab | Move focus OUT of the control (one tab stop) |

Selection moves WITH focus in a radiogroup (unlike a toolbar where focus and activation are separate). Pressing an arrow key immediately selects.
### Roving tabindex
The active/selected segment has `tabindex="0"`. All others have `-1`. Tab enters the control on the selected segment; Tab again exits.
### Disabled segments
`aria-disabled="true"`. Skipped by arrow navigation. Visually muted.
### Icon-only segments
Each MUST have an accessible name: `aria-label="Grid view"` or visually-hidden text. An icon with no name is an empty radio to AT.
### Active state beyond color
The active segment must be distinguishable by more than just a color change. Use: filled background (vs. transparent), text weight change, or an additional visual indicator (underline, checkmark). This ensures colorblind users can identify the selection.
### Contrast
*   Active segment text vs. active background: ≥ 4.5:1.
*   Inactive segment text vs. container background: ≥ 4.5:1.
*   Container border vs. page background: ≥ 3:1 (non-text contrast).
*   Focus ring: ≥ 3:1 against adjacent colors.
### The sliding indicator
The animated pill/background that slides between segments is `aria-hidden="true"`. It's purely decorative; the `aria-checked` attribute carries the semantic state. The animation must respect `prefers-reduced-motion` (instant switch, no slide).

* * *
## 11\. Innovative / Emerging Ideas
*   **Animated sliding pill (standard now):** the active background morphs/slides to the new segment. The go-to micro-interaction for 2024-2026. Implemented with `transform: translateX()` for performance.
*   **Spring physics on slide:** instead of a linear ease, the indicator has a slight spring overshoot when moving between distant segments. Must respect reduced-motion.
*   **Responsive collapse:** on narrow screens, the segmented control collapses to a dropdown (Select component) while maintaining the same state. Progressive enhancement.
*   **Contextual segment count:** AI determines which options are relevant and hides irrelevant segments (e.g., "Map view" only appears when data has coordinates).
*   **Haptic feedback (mobile):** subtle vibration on segment change.
*   **Gesture support (mobile):** swipe left/right across the control to change selection.

* * *
## 12\. Conversion / UX Killers
*   **No clear active indicator:** users can't tell which option is selected. The active state must be visually obvious.
*   **Too many segments (6+):** the buttons become tiny, labels truncate, touch targets shrink. Cap at 5.
*   **Long labels:** "Show as grid layout" doesn't fit. Keep labels to 1-2 words.
*   **Icon-only without tooltips:** users can't identify the options. Every icon needs a tooltip AND an accessible name.
*   **Selection doesn't feel immediate:** if clicking a segment has a visible delay before the view changes, users double-click or think it's broken. Provide immediate visual feedback (indicator moves) even if the content takes time to load.
*   **No keyboard support:** a segmented control that only works with mouse click. Locks out keyboard users.
*   **Tab stops on every segment:** instead of one tab stop with arrow keys, each segment is a separate tab stop. This is wrong for radiogroup and makes keyboard navigation tedious.
*   **Vertical segmented control without clear affordance:** it looks like a list of links, not a radio selector.

* * *
## 13\. Advanced Patterns
### Indicator position calculation (for variable-width segments)
When segments have auto-width (different label lengths), the sliding indicator needs to measure each segment's actual width and offset:

```typescript
const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

useEffect(() => {
  const activeEl = itemRefs.current[activeIndex];
  if (activeEl) {
    setIndicatorStyle({
      width: activeEl.offsetWidth,
      left: activeEl.offsetLeft
    });
  }
}, [activeIndex]);

// In render:
<div className="segmented__indicator" style={{ width: indicatorStyle.width, transform: `translateX(${indicatorStyle.left}px)` }} />
```

### Controlled + uncontrolled support

```typescript
function useControllableState<T>(controlledValue: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internal;
  const setValue = (next: T) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };
  return [value, setValue] as const;
}
```

### Multi-select variant (toggle group)
When segments can have multiple active (like text formatting: Bold + Italic both active), switch from `role="radiogroup"` to individual toggle buttons with `aria-pressed`:

```plain
<div role="toolbar" aria-label="Text formatting">
  <button aria-pressed="true">Bold</button>
  <button aria-pressed="false">Italic</button>
  <button aria-pressed="true">Underline</button>
</div>
```

This is a different component semantically (a toolbar with toggle buttons, not a segmented control), but visually identical.

* * *
## 14\. Performance & Bundle Cost
*   **CSS transform for the sliding indicator.** `transform: translateX()` is compositor-only. Never animate `left` or `width` (triggers layout).
*   **Memoize segment items.** If the control is inside a frequently-re-rendering parent, wrap each segment in `React.memo`.
*   **Resize handling for variable-width:** if using measured widths for the indicator, debounce the ResizeObserver callback.
*   **Minimal bundle:** a segmented control is ~50 lines of JS + CSS. Don't import a 30KB library for it.

* * *
## 15\. Security
Minimal security surface. The segmented control is a UI selection mechanism that doesn't directly handle user input or server communication.
*   **Don't trust client-side selection.** If the selected segment determines a server-side behavior (e.g., "Admin/User" role selector), validate the value server-side. A user could submit any value regardless of what the UI shows.
*   **URL state:** if the selection is synced to a URL parameter (`?view=grid`), validate the parameter against the allowed set. Don't blindly render whatever string is in the URL.

* * *
## 16\. Senior-Level Checklist
- [ ] `role="radiogroup"` on container with `aria-label`
- [ ] `role="radio"` + `aria-checked` on each segment
- [ ] Roving tabindex (active segment = 0, others = -1)
- [ ] Arrow keys move selection (with wrap)
- [ ] Home/End jump to first/last
- [ ] Disabled segments: `aria-disabled`, skipped by arrows
- [ ] Active state distinguishable by more than color (filled bg, weight change)
- [ ] Icon-only segments have accessible names
- [ ] Sliding indicator is `aria-hidden` (decorative)
- [ ] `prefers-reduced-motion`: indicator moves instantly, no animation
- [ ] All segments ≥44px touch target
- [ ] Focus ring visible, ≥3:1 contrast
- [ ] Container contrast: border vs. background ≥ 3:1
- [ ] Active text vs. active bg ≥ 4.5:1
- [ ] One tab stop for the entire control (not per-segment)
- [ ] Selection feels instant (indicator moves before content loads)

* * *
## 17\. Visual Styles
The same segmented control rendered across eleven aesthetics. The style is skin; `role="radiogroup"`, `aria-checked`, roving tabindex, and arrow navigation never change.

**Flat:** solid container with 1px border, active segment is a solid filled pill. Clean, universal. The iOS default look.

**Material:** M3 segmented button with tonal surface, state layers on hover, and checkmark icon on the active segment. Slightly rounded.

**Glassmorphism:** translucent container over blurred content. Active indicator is a frosted pill. Guard text contrast.

**Liquid Glass (2026):** refractive sliding indicator with specular rim. Container is the liquid glass material. The macOS Sequoia/Tahoe picker feel.

**Neumorphism:** container flush with soft surface. Active indicator is pressed in (inset shadow). Inactive segments appear raised. Contrast risk.

**Skeuomorphism:** physical toggle switch aesthetic. Active segment looks depressed like a real button. Metallic container frame.

**Neo-Brutalism:** thick black border on container, hard offset shadow. Active segment has a clashing fill color (Goldenrod on black). Bold, loud.

**Claymorphism:** puffy rounded container. Active indicator is a clay pill with inner top-light. Soft, friendly.

**Aurora/Gradient:** active indicator has an animated gradient fill. Container has a subtle gradient border. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** near-invisible container (no background). Active segment has just a thin underline. Maximum typographic restraint. The Vercel/Linear aesthetic.

**UJG Brand:** Night container with Eminence border. Active indicator is Goldenrod-filled pill. Active text is Night on Goldenrod. Warm glow on hover. The house default.

Full style definitions on the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).