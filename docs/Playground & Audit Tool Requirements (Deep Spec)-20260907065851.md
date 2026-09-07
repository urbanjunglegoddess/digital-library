# Playground & Audit Tool Requirements (Deep Spec)

# Playground & Audit Tool Requirements (Deep Spec)
The exhaustive specification for building each component's interactive playground and audit tool. The Button playground and Button Auditor are the reference implementations. Every subsequent component matches their structure, quality, and UX exactly.

* * *
## Part 1: Playground Deep Specification
### 1.1 Purpose & Audience
A single self-contained HTML file that lets the user configure every combination of variant, size, state, style, and language, see it rendered live on a dotted-grid stage, and copy production-ready code for any variant × style × language triple.

**Who uses it:**
*   Developers copying code into projects (need correct, paste-ready output)
*   Designers previewing how styles look at different sizes/states (need visual fidelity)
*   Consultants (UJG) showing clients live options during calls (needs to feel polished)
*   QA/Auditors verifying states render correctly (need all states exercisable)

* * *
### 1.2 Grid Layout (exact CSS)

```css
.playground {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

**Header:** grid-column 1/-1. Padding 16px 24px. Flex row with gap 16px. Border-bottom 1px solid `var(--border)`. Background surface-1.

**Controls:** grid-column 1. Padding 20px. Border-right 1px solid border. Background surface-1. Overflow-y auto. Flex column with gap 24px.

**Stage:** grid-column 2. Flex centered (align + justify center). Padding 48px 64px. Background surface-2. Dotted grid: `radial-gradient(circle, oklch(30% 0.01 305) 1px, transparent 1px)` background-size 24px 24px.

**Code panel:** grid-column 1/-1. Border-top 1px solid border. Background surface-1. Max-height 280px. Flex column.

* * *
### 1.3 Header Specification
*   `<h1>`: font-size 1.1rem, weight 600, letter-spacing -0.01em
*   Badge: font-size 0.7rem, weight 500, padding 3px 8px, border-radius 100px, background Eminence, color text-primary, text-transform uppercase, letter-spacing 0.06em
*   No description or subtitle (clean, minimal)

* * *
### 1.4 Controls Panel (Left Sidebar)
#### Visual Spec Per Control Group

```css
.control-group h3 {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.control-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.control-btn {
  font-family: inherit;
  font-size: 0.78rem;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s var(--ease-out);
}

.control-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.control-btn.active {
  background: var(--eminence);
  border-color: var(--eminence-light);
  color: var(--text-primary);
}
```

#### Required Control Groups (in order)
**1\. Variant/Type** (single-select)
The component's functional modes. Component-specific. First option pre-selected.

**2\. Size** (single-select)
XS, SM, MD (default), LG, XL. Use whatever subset the component defines.

**3\. State** (single-select)
Default (pre-selected), Hover, Focus, Active, Disabled, Loading, Error, Success. Only include states that produce a visible change.

**4\. Features** (MULTI-select, toggle independently)
Optional boolean props. Each button toggles on/off without affecting siblings. Uses the same `.active` visual but multiple can be active simultaneously.

**5\. Style** (single-select, ALWAYS all 11, ALWAYS this order)
1. Flat (default)
2. Material
3. Glass
4. Liquid
5. Neu
6. Skeu
7. Brutal
8. Clay
9. Aurora
10. Swiss
11. UJG

**6\. Language** (single-select, all applicable targets)
HTML, CSS, React, Vue, Svelte, Tailwind, Next.js, shadcn, Angular, Bootstrap, Web Components, Python, SwiftUI, Compose, Flutter

* * *
### 1.5 Stage (Center Panel)
#### Critical Requirement: The preview MUST be interactive

| Component | Required Interaction |
| ---| --- |
| Slider | Thumb draggable. Value updates live. Range: both thumbs independent, can't cross. |
| Textarea | Actually typeable. Char count updates. Auto-resize works if enabled. |
| Chip | Click to select. Dismiss button removes with animation. |
| Dropdown Menu | Click trigger opens real menu. Items clickable. Escape closes. |
| Stepper | Steps clickable (if variant allows). States update visually. |
| Segmented Control | Click switches selection. Indicator animates between segments. |
| OTP Input | Actually typeable. Auto-advance between cells. Paste fills all. |
| File Upload | Drag-over state on real drag. Visual feedback on drop. |
| Command Palette | Type to filter. Arrow keys navigate. Enter selects. |
| Bottom Sheet | Draggable up/down. Snap points work. |
| Toggle/Switch | Click toggles. Animation plays. |
| Toolbar | Buttons clickable. Toggles toggle. |

If a state (hover, focus) requires user interaction that can't be triggered programmatically, the State control should force it visually (add a class that shows the hover/focus appearance).
#### Stage Inner Container

```css
.stage-inner {
  width: 100%;
  max-width: [component-appropriate, e.g. 400px for slider, 300px for chips];
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}
```

* * *
### 1.6 Code Panel (Bottom)
#### Code Tabs
If the component has multiple output sections (e.g., HTML + CSS paired), use tabs. Otherwise just "Output" tab.

```css
.code-tab {
  font-size: 0.75rem;
  padding: 10px 16px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.code-tab.active {
  color: var(--goldenrod);
  border-bottom-color: var(--goldenrod);
}
```

#### Code Output

```css
.code-output pre {
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre;
  tab-size: 2;
}
```

The code MUST change when ANY control changes. The output represents the exact combination of variant × style × language currently selected.
#### Copy Button Behavior
1. Click copies the `<pre>` textContent to clipboard via `navigator.clipboard.writeText()`
2. Button text changes to "Copied!"
3. Background changes to green tint: `oklch(40% 0.12 145)`
4. After 1500ms, reverts to "Copy" with original styling
5. Fallback: `document.execCommand('copy')` for older browsers

* * *
### 1.7 The Full Matrix: Variant × Style × Language
#### Architecture: Token-Driven Generation
DO NOT hand-write code for every combination. That's (V variants × 11 styles × 15 languages) = hundreds of snippets.

**Instead:**

```javascript
// 1. Style tokens (one object per style)
const STYLE_TOKENS = {
  flat: {
    track: 'oklch(30% 0.02 305)',
    fill: 'oklch(42% 0.14 305)',
    thumb: '#fff',
    thumbShadow: '0 1px 4px oklch(0% 0 0 / 0.3)',
    radius: '100px',
    border: 'none',
  },
  brutal: {
    track: 'oklch(78% 0.13 82)',
    fill: 'oklch(55% 0.2 305)',
    thumb: '#fff',
    thumbShadow: '3px 3px 0 oklch(15% 0.01 305)',
    radius: '0',
    border: '2px solid oklch(15% 0.01 305)',
  },
  ujg: {
    track: 'oklch(25% 0.04 305)',
    fill: 'oklch(78% 0.135 82)',
    thumb: '#fff',
    thumbShadow: '0 0 12px oklch(78% 0.12 82 / 0.3)',
    radius: '100px',
    border: 'none',
  },
  // ... all 11
};

// 2. Language generators (one function per language)
const generators = {
  html: (tokens, variant, size, state, features) => {
    // Returns HTML string using token values
    return `<input type="range" ...>`;
  },
  react: (tokens, variant, size, state, features) => {
    return `<Slider
  style={{ '--fill': '${tokens.fill}' }}
  ...`;
  },
  css: (tokens) => {
    return `.slider__track { background: ${tokens.track}; }
...`;
  },
  swift: (tokens) => {
    return `Slider(value: $value, in: 0...100)
  .tint(Color(...))
...`;
  },
  // ... all targets
};

// 3. Render calls the active generator with the active tokens
function renderCode() {
  const tokens = STYLE_TOKENS[state.style];
  const code = generators[state.language](tokens, state.variant, state.size, state.state, state.features);
  document.getElementById('codeOutput').textContent = code;
}
```

**For the preview:** CSS classes per style applied to a wrapper.

```css
.style-flat .slider-track { background: oklch(30% 0.02 305); }
.style-flat .slider-fill { background: oklch(42% 0.14 305); }
.style-brutal .slider-track { background: oklch(78% 0.13 82); border: 2px solid oklch(15% 0.01 305); border-radius: 0; }
```

Changing the style control swaps the container class. Zero DOM manipulation for visual style changes.

* * *
### 1.8 Design System Tokens (shared across ALL playgrounds)

```css
:root {
  --eminence: oklch(42% 0.145 305);
  --eminence-light: oklch(52% 0.12 305);
  --goldenrod: oklch(78% 0.135 82);
  --goldenrod-dim: oklch(68% 0.1 82);
  --night: oklch(12% 0.01 305);
  --surface-1: oklch(16% 0.015 305);
  --surface-2: oklch(20% 0.015 305);
  --surface-3: oklch(24% 0.018 305);
  --surface-4: oklch(28% 0.02 305);
  --text-primary: oklch(92% 0.01 305);
  --text-secondary: oklch(70% 0.015 305);
  --text-muted: oklch(55% 0.01 305);
  --border: oklch(30% 0.02 305);
  --border-hover: oklch(40% 0.03 305);
  --radius-sm: 6px;
  --radius-md: 10px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Font: `'Inter', system-ui, sans-serif` (Google Fonts link in head)
Code font: `'SF Mono', 'Fira Code', 'JetBrains Mono', monospace` (system, no load)

* * *
### 1.9 Responsive Behavior

```css
@media (max-width: 768px) {
  .playground { grid-template-columns: 1fr; }
  .controls {
    grid-column: 1;
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 220px;
    overflow-y: auto;
  }
  .stage { grid-column: 1; padding: 32px 16px; }
  .code-panel { grid-column: 1; }
}
```

* * *
### 1.10 Technical Constraints
*   Single HTML file, all CSS + JS inline
*   Only external resource: Google Fonts Inter
*   No framework, no build tools, vanilla JS
*   Works in Chrome, Firefox, Safari, Edge (latest)
*   File size target: < 50KB
*   `prefers-reduced-motion`: disable Aurora animation, any loading spinners
*   All interactive controls: focus-visible ring (Goldenrod, 2px, offset 2px)
*   All interactive controls: min 44px touch target
*   No console errors

* * *
### 1.11 Acceptance Criteria
- [ ] Grid layout matches Button playground exactly
- [ ] All variant options update the preview instantly
- [ ] All 11 visual styles visibly change the preview
- [ ] The component in the stage is actually interactive
- [ ] Every language option emits valid, production-shaped code
- [ ] Code output changes for every combination (V × S × L)
- [ ] Copy button works with green confirmation
- [ ] Responsive: usable on mobile
- [ ] UJG design system applied consistently
- [ ] reduced-motion respected
- [ ] Focus rings on all controls
- [ ] No console errors
- [ ] File < 50KB
- [ ] Passes AI slop test

* * *
## Part 2: Audit Tool Deep Specification
### 2.1 Purpose & Audience
A consulting deliverable tool. The user pastes markup, gets an instant categorized audit, and exports a client-ready Markdown report. This tool IS a UJG service product.

**Who uses it:**
*   UJG (Omegea) auditing client implementations
*   Developers self-checking before shipping
*   QA teams running accessibility reviews

* * *
### 2.2 Layout
Single-column, vertically stacked (not a sidebar layout):

1. Header (component name + "Auditor" badge)
2. Meta fields row (Client, Auditor, Date)
3. Paste area (monospace textarea, 200px min-height)
4. Run Audit button (Eminence primary, centered or full-width)
5. Score banner (appears after audit runs)
6. Results sections (collapsible categories)
7. Export button (bottom)

Max-width: 720px, centered. Generous vertical spacing (32-48px between sections).

* * *
### 2.3 Meta Fields
Three inline fields above the paste area:
*   **Client:** text input, placeholder "Client name", saved to localStorage
*   **Auditor:** text input, defaults to "UJG Digital Library", saved to localStorage
*   **Date:** auto-filled with today's date, read-only display

These populate the exported report header.

* * *
### 2.4 Paste Area

```css
.paste-area {
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  padding: 16px 20px;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
  resize: vertical;
  tab-size: 2;
}
.paste-area:focus {
  border-color: var(--eminence);
  outline: 2px solid var(--goldenrod);
  outline-offset: 2px;
}
.paste-area::placeholder {
  color: var(--text-muted);
}
```

Placeholder text: "Paste your \[component name\] HTML or JSX markup here..."

* * *
### 2.5 Run Audit Button
Same styling as a primary button in the playground system. After clicking:
1. Parse the pasted markup
2. Run all checks
3. Render score banner + results
4. Scroll to results

If paste area is empty: show inline error "Paste markup first" (don't run).

* * *
### 2.6 Score Banner
Appears after audit runs. Shows:
*   **Count:** "14/18 checks passed"
*   **Percentage:** "(78%)"
*   **Grade:** letter grade (A/B/C/F) with color
*   **Visual bar:** colored progress bar showing the ratio

```plain
┌──────────────────────────────────────────────────┐
│  14/18 checks passed (78%)            Grade: B   │
│  █████████████████████████████░░░░░░░░░          │
│  2 critical • 2 warnings                         │
└──────────────────────────────────────────────────┘
```

Grade scale:
*   100%: Perfect (solid green)
*   80-99%: A (green)
*   60-79%: B (amber)
*   40-59%: C (red)
*   < 40%: F (dark red)

* * *
### 2.7 Results Display
Three collapsible sections, one per category. Each section header shows category name + pass count.
#### Each Check Result

```plain
┌────────────────────────────────────────────────┐
│ ✓  Has accessible name                            │
│    Found: aria-label="Volume"                     │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ ✗  Missing aria-valuetext                          │
│    Expected: human-readable value like "50%"      │
│    Fix: Add aria-valuetext="50%" to the slider    │
│    Severity: Serious                              │
└────────────────────────────────────────────────┘
```

Pass results: compact (one line: icon + label + found value)
Fail results: expanded (icon + label + expected + fix suggestion + severity)
Warn results: expanded (icon + label + observation + recommendation)

* * *
### 2.8 Three Audit Categories
#### Category 1: Accessibility
Can people with disabilities use this component?

**Universal checks (every component):**
1. Has accessible name (aria-label, aria-labelledby, label, or text content)
2. Focus ring visible (`:focus-visible` or custom focus style)
3. Touch target ≥ 44px on interactive elements
4. Color not sole meaning indicator
5. `prefers-reduced-motion` handled (if animations present)

**Component-specific checks** add 3-8 more per component (see registry).
#### Category 2: Code Validity
Is the markup structurally correct?

**Universal checks:**
1. Correct semantic element (not div-with-onclick)
2. No nested interactive elements
3. No invalid ARIA (roles used correctly per spec)
4. Required attributes present
#### Category 3: Wiring
Is it actually functional?

**Universal checks:**
1. Has event handler (onclick, onchange, addEventListener, framework binding)
2. Not a dead link (href isn't #, empty, or javascript:void)
3. Loading/pending state handled (if applicable)
4. Error state handled (if applicable)

* * *
### 2.9 Check Result Data Model

```javascript
{
  id: "a11y-accessible-name",
  category: "accessibility",     // "accessibility" | "validity" | "wiring"
  label: "Has accessible name",
  status: "pass",                // "pass" | "fail" | "warn" | "skip"
  found: "aria-label=\"Volume\"", // what was actually detected in the markup
  expected: "An accessible name", // what should be there
  fix: null,                     // suggested fix (string, null if passed)
  severity: "critical",          // "critical" | "serious" | "moderate" | "minor"
}
```

#### Severity Definitions

| Level | Impact | Action |
| ---| ---| --- |
| Critical | Completely blocks AT users or is a legal liability | Must fix before shipping |
| Serious | Significant usability barrier for some users | Fix in current sprint |
| Moderate | Degraded experience but workaround exists | Fix when possible |
| Minor | Best practice recommendation, not a barrier | Nice to have |

* * *
### 2.10 Parsing Strategy

```javascript
function parseMarkup(input) {
  // 1. Try parsing as HTML
  const doc = new DOMParser().parseFromString(input, 'text/html');
  const root = doc.body;

  // 2. Detect framework syntax for additional checks
  const isJSX = /className=|onClick=|\{.*\}/.test(input);
  const isVue = /v-if|v-for|:class|@click/.test(input);
  const isSvelte = /on:click|bind:|\{#if/.test(input);
  const isAngular = /\[class\]|\(click\)|\*ngIf/.test(input);

  return { root, isJSX, isVue, isSvelte, isAngular, raw: input };
}
```

The DOM tree is used for structural checks (querySelector for roles, attributes, nesting). The raw string + framework detection is used for wiring checks (detecting event handlers in framework syntax).

* * *
### 2.11 Report Export
The "Export Report" button:
1. Generates a Markdown string from the results
2. Creates a Blob: `new Blob([markdown], { type: 'text/markdown' })`
3. Creates an object URL: `URL.createObjectURL(blob)`
4. Creates a temporary `<a download="[component]-audit-[date].md" href="...">` and clicks it
5. Revokes the URL after download

The Markdown format includes: header with meta fields, summary table, critical issues list, detailed results per category (table format), and recommendations section.

* * *
### 2.12 Technical Constraints
*   Single HTML file, all inline
*   No external dependencies except Google Fonts
*   No server needed (everything client-side)
*   DOMParser for HTML analysis
*   Regex for framework syntax detection
*   localStorage for persisting meta fields
*   File download via Blob + object URL
*   Same UJG design system as playgrounds
*   Max-width 720px centered layout
*   File size target: < 40KB

* * *
### 2.13 Acceptance Criteria
- [ ] Paste area accepts arbitrary markup
- [ ] "Run Audit" parses and runs all checks without errors
- [ ] Results categorized with icons and colors
- [ ] Each failed check shows: what was found, what was expected, suggested fix, severity
- [ ] Score banner shows count + percentage + grade
- [ ] Export downloads a .md file
- [ ] Report is client-ready (professional, no raw code leaking)
- [ ] Meta fields persist between sessions
- [ ] Handles empty/invalid input gracefully
- [ ] Works for HTML and detects React/Vue/Svelte/Angular patterns
- [ ] No false positives on well-written markup
- [ ] UJG design system applied
- [ ] File < 40KB

* * *
## Part 3: Component-Specific Check Registry
Copy universal checks + add these per component. See the original template page for the full registry per component (Slider, Tag/Chip, Dropdown Menu, Textarea, and template for adding more).