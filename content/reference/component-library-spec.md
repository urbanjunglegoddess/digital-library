---
title: "Component Library Spec — Sizes, States, Viewpoints"
slug: component-library-spec
group: "Design System"
order: 14
summary: "Complete reference for building the Affinity Designer asset library. Design M (40px) default, then derive S and L."
---

## Component Library Spec — Sizes, Viewpoints, States, Relationships
Complete reference for building the Affinity Designer asset library. Design M (40px) default, then derive S and L.

* * *
## Viewpoints (Breakpoints) — Full Grid System

| Breakpoint | Width | Cols | Gutter | Margin | Max Content | Use |
| ---| ---| ---| ---| ---| ---| --- |
| Mobile S | 375px | 4 | 16px | 16px | 343px | iPhone SE/13 mini |
| Mobile L | 390–414px | 4 | 16px | 20px | 354–374px | iPhone 14/15, Pixel, Galaxy S |
| Tablet | 768px | 8 | 24px | 32px | 704px | iPad mini portrait |
| Tablet L | 1024px | 12 | 24px | 40px | 944px | iPad landscape, Surface |
| Desktop | 1280px | 12 | 32px | 64px | 1152px | Laptop (MacBook Air 13") |
| Desktop L | 1440px | 12 | 32px | 80px | 1280px | Standard monitor |
| Desktop XL | 1920px | 12 | 32px | auto (centered) | 1440px | Full HD, ultrawide |

**Responsive behavior rules:**
*   Components stack vertically below 768px unless explicitly side-by-side
*   Navigation collapses to hamburger/drawer below Tablet (768px)
*   Side panels collapse to overlays below Tablet L (1024px)
*   Multi-column grids reduce: 4-col → 2-col → 1-col as breakpoints decrease
*   Touch targets minimum 44×44px on Mobile, 40×40px on Tablet+
*   Font sizes scale down 1 step below 768px (body 16→14, H1 48→32)

* * *
## Universal States — Interaction Specifications
### Interactive States (all clickable/tappable elements)

| State | Visual Change | Timing | Notes |
| ---| ---| ---| --- |
| Default | Base appearance | — | Resting state |
| Hover | Background lighten/darken 8%, cursor: pointer | Instant (0ms) | Desktop only, not on touch |
| Active/Pressed | Scale 0.97, darken 12% | 50ms ease-out | Must feel immediate |
| Focus | 2px outline offset 2px, brand color | 0ms | Keyboard nav, a11y requirement |
| Focus-Visible | Same as Focus, only on keyboard | 0ms | Prevents ring on click |
| Disabled | Opacity 0.4, cursor: not-allowed | — | Remove pointer events |
| Loading | Content replaced with spinner/skeleton | 150ms fade-in | Prevent layout shift |

### Form/Input States

| State | Visual Indicator | Transition |
| ---| ---| --- |
| Empty/Placeholder | Muted text (60% opacity), label at top or inside | — |
| Filled | Full opacity text, label floats or stays above | 200ms ease |
| Focus | Border color → brand primary, optional glow | 150ms ease |
| Error | Border → #E53E3E, helper text in red, icon | 150ms ease |
| Success | Border → #38A169, check icon | 150ms ease |
| Read-only | No border change, muted bg, no pointer events | — |
| Disabled | Opacity 0.4, muted bg, no interaction | — |

### Navigation States
*   **Active/Current:** Bold weight or underline, brand color, aria-current
*   **Visited:** Slightly muted color variant
*   **Collapsed:** Icon-only or hidden, aria-expanded=false
*   **Expanded:** Full label visible, aria-expanded=true
### Content/Data States
*   **Skeleton/Loading:** Animated shimmer (1.5s linear infinite) matching target dimensions
*   **Empty:** Illustration + message + single CTA button, centered
*   **Populated:** Normal content display
*   **Error:** Error illustration + message + retry button
*   **Refreshing:** Subtle spinner overlay or pull-to-refresh indicator
### Motion & Animation Tokens

| Token | Duration | Easing | Use |
| ---| ---| ---| --- |
| instant | 0ms | — | Hover color changes |
| fast | 100ms | ease-out | Button press, micro-interactions |
| normal | 200ms | ease-in-out | State transitions, toggles |
| moderate | 300ms | ease-in-out | Drawer open/close, accordion |
| slow | 500ms | ease-in-out | Modal enter/exit, page transitions |
| skeleton-shimmer | 1500ms | linear (infinite) | Loading skeletons |

### Animation Choreography (Sequencing Rules)
*   **Modal open:** Backdrop fades in (200ms) → then modal scales in (200ms, starts at 50% of backdrop)
*   **Modal close:** Modal scales out (150ms) → then backdrop fades out (150ms)
*   **Drawer open:** Backdrop fades (200ms) + drawer slides (300ms) simultaneously
*   **Toast stack:** New toast slides in → existing toasts shift up (200ms stagger 50ms each)
*   **List item enter:** Fade-in + slide-up, stagger 50ms per item, max 5 items animated (rest appear instantly)
*   **Page transition:** Current content fades out (150ms) → new content fades in (200ms) after 50ms gap
*   **Skeleton → Content:** Skeleton fades out (150ms) → content fades in (200ms), no layout shift allowed
*   **prefers-reduced-motion:** Replace all transforms/slides with opacity-only transitions at 150ms. Keep skeleton shimmer but reduce to pulse

* * *
## Sizing Tokens

| Token | Height / H-Pad / Icon / Font | Radius / Use |
| ---| ---| --- |
| XS | 24–28px / 8px / 14px / 11px | 4px · Icons, badges, tight UI, inline tags |
| S | 32px / 12px / 16px / 13px | 6px · Compact inputs, small buttons, dense tables |
| M | 40px / 16px / 20px / 14px | 8px · Default/standard (design here first) |
| L | 48px / 20px / 24px / 16px | 10px · Touch-friendly, prominent CTAs, mobile |
| XL | 56px / 24px / 28px / 18px | 12px · Hero buttons, large touch targets, marketing |

### Opacity Scale

| Token | Value | Use |
| ---| ---| --- |
| opacity-hover | 0.08 | Ghost button hover fills, subtle hover backgrounds |
| opacity-focus | 0.12 | Focus ring backgrounds, secondary hover fills on dark |
| opacity-disabled | 0.4 | Disabled elements (universal) |
| opacity-overlay | 0.5 | Modal/drawer backdrops (light mode) |
| opacity-overlay-dark | 0.7 | Backdrops in dark mode (needs more coverage) |
| opacity-shadow-dark | ×0.6 | Multiply all shadow opacities by this in dark mode |
| opacity-drag-ghost | 0.5 | Dragged item clone opacity |
| opacity-placeholder | 0.6 | Placeholder text, muted content |
| opacity-lightbox | 0.9 | Lightbox backdrop (near-opaque black) |

* * *
## Spacing Scale

| Token | Value | Use |
| ---| ---| --- |
| space-1 | 4px | Icon-to-text gap, badge inset |
| space-2 | 8px | Between inline elements, small card padding |
| space-3 | 12px | Form field spacing, list item padding |
| space-4 | 16px | Card padding, section inner spacing |
| space-5 | 20px | Between form groups |
| space-6 | 24px | Between card sections, modal padding |
| space-8 | 32px | Section spacing, large card padding |
| space-10 | 40px | Between major sections |
| space-12 | 48px | Page section dividers |
| space-16 | 64px | Hero section padding, desktop vertical rhythm |
| space-20 | 80px | Large hero padding, desktop section breaks |

* * *
## Border Radius Scale

| Token | Value | Use |
| ---| ---| --- |
| radius-none | 0px | Tables, full-bleed images |
| radius-sm | 4px | Badges, tags, small chips |
| radius-md | 8px | Buttons, inputs, cards (default) |
| radius-lg | 12px | Modals, popovers, larger cards |
| radius-xl | 16px | Bottom sheets, feature cards |
| radius-2xl | 24px | Pills, rounded CTAs |
| radius-full | 9999px | Avatars, circular buttons, dots |

* * *
## Elevation & Z-Index

| Token | Shadow | Z-Index | Use |
| ---| ---| ---| --- |
| elevation-0 | none | 0 | Flat elements, inline content |
| elevation-1 | 0 1px 3px rgba(0,0,0,0.08) | 1 | Cards, raised surfaces |
| elevation-2 | 0 4px 8px rgba(0,0,0,0.12) | 10 | Dropdowns, popovers, hover cards |
| elevation-3 | 0 8px 24px rgba(0,0,0,0.16) | 100 | Modals, dialogs, command palette |
| elevation-4 | 0 16px 48px rgba(0,0,0,0.20) | 1000 | Overlays, toasts, notifications |

**Z-Index Scale:** z-base (0) → z-raised (1) → z-dropdown (10) → z-sticky (50) → z-modal (100) → z-overlay (500) → z-toast (1000) → z-tooltip (1100)

* * *
## Typography Scale
Font families: **Methanerse** (display/headers), **Urbanist** (body/UI), **Alister Signature** (accent, 25% tracking), **Mallong** (organic/Amazonia contexts). Monospace: system mono or JetBrains Mono.
### Type Ramp (Desktop L: 1440px)

| Token | Size | Weight | Line-H | Letter-Sp | Mobile Size | Use |
| ---| ---| ---| ---| ---| ---| --- |
| display-1 | 72px | 700 (Bold) | 1.1 | -0.02em | 48px | Hero headlines, landing page titles |
| display-2 | 60px | 700 | 1.15 | -0.02em | 40px | Section hero, large feature titles |
| h1 | 48px | 700 | 1.2 | -0.015em | 32px | Page titles, primary headings |
| h2 | 36px | 600 (Semi) | 1.25 | -0.01em | 28px | Section headings |
| h3 | 28px | 600 | 1.3 | -0.005em | 24px | Subsection headings, card titles |
| h4 | 24px | 600 | 1.35 | 0 | 20px | Widget titles, smaller headings |
| h5 | 20px | 600 | 1.4 | 0 | 18px | List group headers, form section titles |
| h6 | 16px | 600 | 1.5 | 0.01em | 16px | Smallest heading, table headers |
| body-lg | 18px | 400 (Regular) | 1.6 | 0 | 16px | Lead paragraphs, featured text |
| body | 16px | 400 | 1.6 | 0 | 14px | Default body text, descriptions |
| body-sm | 14px | 400 | 1.5 | 0 | 13px | Secondary text, helper text, dense UI |
| caption | 12px | 400 | 1.4 | 0.01em | 12px | Timestamps, badges, fine print |
| overline | 11px | 600 | 1.4 | 0.08em | 11px | All-caps labels, category tags, eyebrow text |
| label | 13px | 500 (Medium) | 1.3 | 0.01em | 13px | Form labels, button text, nav items |
| code | 13px | 400 | 1.6 | 0 | 13px | Inline code, code blocks, monospace |

**Scaling rules:**
*   Below 768px: headings drop one step (h1 uses h2 desktop size, etc.)
*   Body never goes below 14px on any breakpoint for readability
*   Display fonts only appear at Tablet+ breakpoints; use h1 on mobile instead
*   Line-height increases as font size decreases (tighter for display, looser for body)
*   Paragraph max-width: 65ch for body, 45ch for large display text

* * *
## Color Token Architecture
Semantic tokens mapped to brand palette. Every component references semantics, never raw hex.
### Surface & Background

| Token | Light Mode | Dark Mode | Use |
| ---| ---| ---| --- |
| bg-page | Platinum #E8E6E1 | Night #0A0A0A | Page background, body |
| bg-surface | #FFFFFF | #1A1A1A | Cards, modals, elevated containers |
| bg-surface-raised | #F7F6F4 | #242424 | Nested cards, hover states on surface |
| bg-surface-sunken | #EEEDEA | #111111 | Input fields, code blocks, inset areas |
| bg-overlay | rgba(10,10,10,0.5) | rgba(10,10,10,0.7) | Modal backdrops, overlays |
| bg-brand | Dark Green #042D1D | Dark Green #042D1D | Brand-colored surfaces, CTAs |
| bg-accent | Eminence #5F2C82 | Eminence #5F2C82 | Accent surfaces, highlights |

### Text & Foreground

| Token | Light Mode | Dark Mode | Use |
| ---| ---| ---| --- |
| text-primary | Night #0A0A0A | Platinum #E8E6E1 | Headings, body text, primary content |
| text-secondary | #4A4A4A | #A3A3A3 | Descriptions, helper text, metadata |
| text-muted | #7A7A7A | #6B6B6B | Placeholders, disabled, timestamps |
| text-on-brand | #FFFFFF | #FFFFFF | Text on bg-brand or bg-accent surfaces |
| text-link | Eminence #5F2C82 | Goldenrod #DCA424 | Hyperlinks, interactive text |
| text-link-visited | #4A2066 | #B8922E | Visited link state |

### Border & Divider

| Token | Light Mode | Dark Mode | Use |
| ---| ---| ---| --- |
| border-default | #D4D2CD | #333333 | Input borders, card borders, dividers |
| border-strong | #9E9C97 | #555555 | Focused inputs, active borders |
| border-brand | Dark Green #042D1D | Goldenrod #DCA424 | Selected items, active tabs, brand outlines |

### Feedback & Status

| Token | Color | Background | Use |
| ---| ---| ---| --- |
| status-success | #38A169 | #F0FFF4 | Success alerts, valid inputs, completed steps |
| status-warning | Spanish Orange #E86100 | #FFFBEB | Warnings, caution states, approaching limits |
| status-error | #E53E3E | #FFF5F5 | Errors, destructive actions, invalid inputs |
| status-info | #3182CE | #EBF8FF | Informational alerts, tips, neutral notices |

### Interactive

| Token | Light Mode | Dark Mode | Use |
| ---| ---| ---| --- |
| interactive-primary | Dark Green #042D1D | Goldenrod #DCA424 | Primary buttons, active controls, selection |
| interactive-primary-hover | #063D28 | #C4951E | Primary hover state (8% lighter/darker) |
| interactive-primary-active | #021F12 | #F0B62A | Primary pressed/active state (12% shift) |
| interactive-secondary | transparent | transparent | Ghost/outline buttons at rest |
| interactive-secondary-hover | rgba(4,45,29,0.08) | rgba(220,164,36,0.12) | Ghost button hover fill |
| interactive-disabled | #D4D2CD | #333333 | Disabled button fills, inactive controls |

**Dark mode rules:**
*   Elevation inverts: higher elevation = lighter background (not darker)
*   Shadows become more transparent (multiply opacity by 0.6)
*   Brand colors shift to Goldenrod for interactive elements (better contrast on dark)
*   Never use pure white (#FFF) text on dark; use Platinum for softer contrast
### Always-Dark Components (Mode-Locked)
These stay dark-themed regardless of light/dark mode:
*   **Tooltip:** bg Night #0A0A0A, text #FFFFFF, 12px
*   **Toast/Snackbar:** bg #1A1A1A, text Platinum
*   **Code Block:** bg #111111, text syntax-highlighted
*   **Command Palette overlay:** bg rgba(10,10,10,0.8)
*   **Lightbox backdrop:** bg rgba(0,0,0,0.9)

These components never switch to light backgrounds; they're always high-contrast floating elements.

* * *
## Icon System
### Grid & Sizing

| Token | Grid | Stroke | Padding | Corner | Use |
| ---| ---| ---| ---| ---| --- |
| icon-xs | 14×14px | 1.5px | 1px | 1px | Inside badges, inline with caption text |
| icon-sm | 16×16px | 1.5px | 1px | 1.5px | Inside S-size buttons, list item trailing |
| icon-md | 20×20px | 2px | 2px | 2px | Default: M-size buttons, inputs, nav items |
| icon-lg | 24×24px | 2px | 2px | 2.5px | L-size buttons, tab bar items, feature icons |
| icon-xl | 28×28px | 2px | 2px | 3px | XL buttons, hero sections, large touch targets |
| icon-display | 32–48px | 2.5px | 3px | 4px | Empty states, feature highlights, marketing |

### Design Specs
*   **Grid:** All icons draw on pixel grid with 1px subgrid for alignment
*   **Optical correction:** Circles/triangles extend 1px beyond grid to appear same size as squares
*   **Filled vs Outline:** Every icon has both variants. Outline = default, Filled = active/selected state
*   **Bounding box:** Content stays within padding zone; touch target is always the full grid size
*   **Color:** Icons inherit text-primary by default; override with semantic tokens when used for status
*   **Alignment:** Icons always vertically center with adjacent text (middle of cap-height, not full line)
### Category Naming
Icons are organized by category in the symbol library:
`icon/{category}/{name}/{variant}`

Categories: **navigation** (arrows, chevrons, menu, close), **action** (edit, delete, copy, share, download), **status** (check, x, alert, info, loading), **media** (play, pause, volume, mic, camera), **content** (file, folder, image, link, calendar), **social** (platforms), **commerce** (cart, card, receipt), **communication** (mail, chat, bell, phone), **user** (person, group, settings)

* * *
## Density Modes
Three density levels that shift spacing, sizing, and type simultaneously. Affects all components globally.

| Property | Compact | Default (Comfortable) | Spacious |
| ---| ---| ---| --- |
| Component height | Use S tokens (32px) | Use M tokens (40px) | Use L tokens (48px) |
| Body font size | 13px (body-sm) | 14–16px (body) | 16–18px (body-lg) |
| Internal padding | space-2 (8px) | space-3 (12px) / space-4 (16px) | space-5 (20px) / space-6 (24px) |
| Gap between items | space-1 (4px) / space-2 (8px) | space-2 (8px) / space-3 (12px) | space-3 (12px) / space-4 (16px) |
| Table row height | 32px | 40–48px | 56px |
| Icon size | icon-sm (16px) | icon-md (20px) | icon-lg (24px) |
| Border radius | radius-sm (4px) | radius-md (8px) | radius-lg (12px) |
| Best for | Data-heavy: dashboards, admin panels, tables, IDE-like UIs | General: marketing sites, standard apps, most contexts | Content-light: onboarding, landing, accessibility-focused |

**Usage rules:**
*   Default density = Default (Comfortable). Only switch when context demands it
*   Dashboard/admin views use Compact by default
*   Marketing/landing pages use Spacious
*   User can toggle density as a preference (store in localStorage)
*   Mobile always uses Default or Spacious (compact is too tight for touch)

* * *
## Component Anatomy Key
Every component follows a standardized slot structure. Use these labels consistently in all component documentation and Affinity Designer layers.
### Slot Diagram

```plain
┌─────────────────────────────────────────────────┐
│  [Container]                                     │
│  ┌──────┬────────────────────────────┬────────┐ │
│  │ Lead │        Content             │ Trail  │ │
│  │      │  ┌──────────────────────┐  │        │ │
│  │ icon │  │ Primary (label/text) │  │ icon   │ │
│  │ avtr │  │ Secondary (helper)   │  │ badge  │ │
│  │ chk  │  └──────────────────────┘  │ action │ │
│  └──────┴────────────────────────────┴────────┘ │
│  [Helper / Validation]                           │
└─────────────────────────────────────────────────┘
```

### Slot Definitions

| Slot | Contains | Rules |
| ---| ---| --- |
| Container | Wraps all slots. Defines height, padding, radius, elevation | Always present. Carries interactive states (hover, focus, active). Background + border live here |
| Leading | Icon, avatar, checkbox, radio, thumbnail, drag handle | Optional. Fixed width. Vertically centered. Gap to content: space-2 (8px) or space-3 (12px) |
| Content | Primary label/text + optional secondary/description line | Flex-grow (fills available space). Text truncates with ellipsis. Primary: text-primary. Secondary: text-secondary |
| Trailing | Icon, badge, chevron, action button, switch, metadata | Optional. Fixed width. Vertically centered. Gap from content: space-2 (8px). Can contain multiple items (8px gap between) |
| Helper | Validation message, character count, hint text | Below container, 4px gap. Font: caption (12px). Color: text-muted (default), status-error (error), status-success (valid) |
| Label | Above container: form field label, section title | Above container, 4px gap below. Font: label (13px medium). Required asterisk: status-error color |
| Adornment | Inside container edges: prefix ($), suffix (.com), inline icons | Inside container padding zone. Does not affect content area width. Color: text-muted |

### Layer Naming in Affinity Designer
Every component is structured as nested groups following this order:

1. **Container** (rectangle/shape with fills, borders, effects)
2. **Leading** (group: icon/avatar/control)
3. **Content** (group: primary text + secondary text)
4. **Trailing** (group: icon/badge/action)
5. **Helper** (text layer below)
6. **Label** (text layer above)

* * *
## Navigation Components
### Component Visibility Matrix (which components appear at which breakpoints)

| Component | Mob S | Mob L | Tablet | Tab L | Desktop+ |
| ---| ---| ---| ---| ---| --- |
| Header (hamburger) | ✓ | ✓ | — | — | — |
| Header (full nav) | — | — | ✓ | ✓ | ✓ |
| Bottom Tabs | ✓ | ✓ | — | — | — |
| Side Menu | — | — | collapsed | ✓ | ✓ |
| Breadcrumb | back ← | back ← | ✓ | ✓ | ✓ |
| Mega-menu | accordion | accordion | accordion | ✓ | ✓ |
| Table/Data Grid | h-scroll | h-scroll | ✓ | ✓ | ✓ |
| Kanban Board | 1-col | 1-col | ✓ | ✓ | ✓ |
| Calendar (Full) | agenda | agenda | ✓ | ✓ | ✓ |
| Chart/Graph | simplified | simplified | ✓ | ✓ | ✓ |
| Hover Card | — | — | — | — | ✓ |
| Context Menu | sheet | sheet | ✓ | ✓ | ✓ |
| FAB | ✓ | ✓ | optional | — | — |
| Resizable Panels | — | — | — | — | ✓ |
| Display typography | — | — | ✓ | ✓ | ✓ |

✓ = full version | — = hidden/not used | other = degraded variant shown

| Component | Sizes | Viewports | States | Notes |
| ---| ---| ---| ---| --- |
| Header | 56px (mob), 64px (tab), 72–80px (desk) | All | Default, Sticky, Collapsed (scroll), Transparent, Elevated | Hamburger below 768px. Search → icon on mobile. Logo shrinks |
| Footer | Auto H, min 200px (desk), 300px (mob stacked) | All | Default, Minimal (mobile) | Multi-col → single stack below 768px. Social icons center |
| Side Menu | W: 240–280px (exp), 64px (col), 0px (mobile) | Tablet+ | Expanded, Collapsed, Hover-reveal, Locked, Floating | Icon-only at Tablet. Overlay drawer on mobile |
| Bottom Tabs | 56–64px H + safe-area-inset | Mobile only (<768px) | Default, Active (filled icon + label), Badge-notify, Hidden (scroll) | Fixed bottom. Hides scroll-down. Max 5 items |
| Breadcrumb | 32–40px H | Tablet+ (back arrow mobile) | Default, Truncated ("..."), Overflow-menu | Mobile: back link only. Desktop: full path |
| Drawer Navigation | W: 80% vw (mob), 320–400px (desk), max 400px | All | Open, Closed, Animating (300ms ease-in-out) | Full overlay mobile. Side panel desktop. Includes backdrop |
| Navigation | 48–64px H | All | Horizontal, Vertical, Mega-menu (desk hover) | H → hamburger below 768px. Mega → accordion mobile |
| Pagination | 32px (S), 40px (M), 48px (L) | All | Default, Active page, Disabled, Truncated, First/Last | Mobile: arrows + count. Desktop: full row |
| Tab Navigation | 40px (S), 48px (M); scrollable | All | Active, Inactive, Disabled, Overflow-scroll | H-scroll mobile with fade. Fixed desktop |
| Stack Navigation | Full viewport H | Mobile primary | Push, Pop, Replace; with-back, with-close | Slide-in/out 300ms ease |

* * *
## Inputs & Controls

| Component | Sizes | States | Detail | Related |
| ---| ---| ---| ---| --- |
| Buttons | 28px (XS), 32px (S), 40px (M), 48px (L), 56px (XL) | Default, Hover, Active, Disabled, Loading (spinner) | Variants: Solid, Outline, Ghost, Link. Icon-only: square. Min-W: 2× height | Icon, Badge, Spinner |
| Split Button | Primary: 40px (M), 48px (L); Caret: 32–40px W | Primary-default, Primary-hover, Dropdown-open, Disabled | Action left, caret right, 1px divider. Dropdown below-end | Buttons, Dropdown |
| Inputs/Field | 32px (S), 40px (M), 48px (L) | Empty, Filled, Focus, Error, Success, Disabled, Read-only, Prefix, Suffix | Pad: 12/16/20px. Label above or float. Helper 12px, 4px gap below | Label, Info Label, Alert |
| Number Input | 32px (S), 40px (M), 48px (L) | Empty, Filled, Focus, Error, Disabled, Min/Max-reached | Stepper ±: 24/32/40px. Right side or split left/right | Field, Buttons |
| Password Input | 32px (S), 40px (M), 48px (L) | Hidden (dots), Visible, Focus, Error, Strength-indicator | Toggle icon 20px suffix. Strength bar: 4px H, 4 segments | Field, Icon, Progress |
| Phone Input | 40px (M), 48px (L) | Empty, Filled, Focus, Error, With-country-select | Flag 24×16px prefix. Country dropdown 280px W. Auto-format | Field, Select |
| Checkbox | 16px (S), 20px (M), 24px (L) | Unchecked, Checked, Indeterminate, Disabled, Focus, Error | Check: 12/14/18px. Label gap: 8–12px. Touch: 44×44 min | Label, Form |
| Radio Buttons | 16px (S), 20px (M), 24px (L) | Unselected, Selected, Disabled, Focus, Error | Dot: 8/10/12px. Label gap: 8–12px. Group: 12px vert | Label, Form |
| Select | 32px (S), 40px (M), 48px (L) | Closed, Open, Selected, Multi (chips), Disabled, Error, Filtering | Dropdown max-H: 320px. Items: 32/40px. Chevron 16px | Popover, List, Tag |
| Combo Box | 40px (M), 48px (L) | Closed, Open, Filtering, No results, Loading, Create-new | Typeahead + clear button. Spinner in dropdown | Select, Popover, List |
| Date Picker | Input: 40–48px; Calendar: 280–320px W | Closed, Open, Range (2 months), Single, With-time, Presets | Cells: 36×36px. Today highlight. Selected: filled brand | Field, Popover |
| Time Picker | Input: 40–48px; Panel: 200–240px W | Closed, Open, Hour, Minute, AM/PM | Scrollable columns or clock. 5-min increments. 12h/24h | Field, Popover |
| Search Bar | 36px (S), 44px (M), 52px (L) | Empty, Typing, Results, No-results, Loading, With-filters | Icon 20px left. Clear right when filled. Results max 400px H | Inputs, Popover, List |
| Rating | 16px (S), 24px (M), 32px (L) per star | Empty, Partial (half), Full, Read-only, Interactive, Hover | Gap: 4/6/8px. Half via gradient. Count label right | Icon |
| Toggle/Switch | 20×36 (S), 24×44 (M), 28×52 (L) | Off, On, Disabled, Loading (spinner in thumb) | Thumb: 16/20/24px. Track: radius-full. 200ms ease | Label, Form |
| Tag/Chip | 24px (S), 28px (M), 32px (L) | Default, Hover, Selected, Removable (X), Disabled | Pad: 4×8/6×12/8×16. Remove: 12px. Radius: full | Badge, Buttons, Form |
| Slider/Range | Track: 4–8px; Thumb: 20/24/28px | Default, Hover (1.2×), Active, Disabled, With-label, Dual | Fill: brand. Bg: neutral-200. Tooltip above on drag | Field, Tooltip |
| Textarea | 80px (S), 120px (M), 160px (L) min-H | Empty, Filled, Focus, Error, Disabled, Auto-resize, Count | Pad: 12/16px. Resize handle. Counter: 12px muted | Label, Form |
| Segmented Control | 32px (S), 40px (M), 48px (L) | Selected, Unselected, Disabled; 2–5 segments | Indicator slides 200ms. Equal-width. Container: radius-lg | Buttons, Tabs |
| OTP/Pin Input | 40px (S), 48px (M), 56px (L) per cell; 4–6 | Empty, Filling, Complete, Error, Disabled | Gap: 8/12px. Auto-advance. Backspace → prev. Paste fills | Field, Form |
| Color Picker | Swatch: 24–32px; Panel: 240–280px W | Closed, Open, Selecting, With-opacity, Hex, Presets | Spectrum: 200×200. Hue: 12px H. Swatches: 6×6 24px | Popover, Field |
| Signature Pad | 120–200px H; W: parent | Empty, Drawing, Completed, Disabled | Canvas touch/mouse. Clear top-right. Dashed → solid | Buttons, Form |

* * *
## Feedback & Overlays

| Component | Sizes | States | Behavior | Related |
| ---| ---| ---| ---| --- |
| Alert | Auto H, min 40px; W: full or max 600px | Info, Success, Warning, Error, Dismissible, With-action | Fade-in 200ms. Dismiss: fade 150ms + collapse 200ms. Icon left 20px | Buttons, Link, Icon |
| Tooltip | Auto, max 240px W | Visible, Hidden, With-arrow (8px), Multiline | 300ms open delay, 0ms close. Dark bg, white 12px. Auto-flip | Icon, Link |
| Message Bar | 40–56px H, full-width edge-to-edge | Info, Success, Warning, Error, Dismissible | Slide down 300ms. Stacks above content. Auto-dismiss 5s | Alert, Buttons, Icon |
| Modal/Dialog | S: 400px, M: 560px, L: 720px W; Mobile: 90% W | Open (scale 200ms), Closed, Scrollable, Footer-actions | Backdrop 50% black. Focus-trap. ESC. Scroll lock. radius-lg | Overlay, Buttons, Form |
| Popover | Auto, max 320px W, max 400px H | Open, Closed, Arrow-positioned (12 pos), Scrollable | Click or hover trigger. 100ms open. Flip at edge. elevation-2 | Buttons, Link, List |
| Overlay/Backdrop | Full viewport | Visible (0→0.5 opacity 200ms), Hidden | Prevents scroll. Click-dismiss optional. z-overlay (500) | Modal, Drawer, Sheet |
| Portal | Inherits container | Mounted, Unmounted | Renders outside DOM into body. Structural only | Modal, Popover, Tooltip |
| Toast/Snackbar | 48–64px H; max 400px W (desk), full (mob) | Info, Success, Warning, Error, With-action, Auto-dismiss | Slide-up 300ms. 4s dismiss (8s with action). Stack max 3 | Alert, Buttons, Icon |
| Progress Bar | 4px (S), 8px (M), 12px (L) H; W: parent | Empty, Partial, Complete, Indeterminate, With-label | Fill 300ms ease. Indeterminate: gradient 1.5s. radius-full | — |
| Spinner | 16px (S), 24px (M), 32px (L), 48px (XL) | Spinning (700ms linear); Circular, Dots, Bar | Brand primary or inherit. Centered. Variants: border, dots, bar | Buttons, Cards |
| Skeleton | Mirrors target dimensions | Shimmer (1.5s gradient) or Pulse (opacity 1.5s) | Match radius/padding. Types: line, circle, rect. Stagger 100ms | Cards, List, Avatar |
| Empty State | Auto H; max 400px W centered | First-use, No-results, No-data, Error, Permission | Illustration max 200×200. Title 20px bold. CTA: M brand | Buttons, Image, Link |
| Stepper/Wizard | 48–64px H per step; W: parent | Completed (check), Active (brand), Upcoming (outline), Error | Horizontal desk, Vertical mob. Connector 2px. Circle 24–32px | Buttons, Badge |
| Notification Center | Trigger: 40px; Panel: 320–400px W, 80vh | Unread (dot+bold), Read, Empty, Grouped, Loading | Popover desk / Sheet mob. Red dot 8px. Infinite scroll | Badge, Avatar, List |
| Countdown Timer | Digits: 24px (S), 40px (M), 56px (L) | Running, Paused, Expired, With-labels | Colon separator. Flip animation optional. 1s updates | Badge, Buttons |
| Announcement Bar | 40–48px H, full-width, above header | Visible, Dismissed (cookie), With-CTA, Animated | Slide 300ms. X dismiss right. Persists until closed | Link, Buttons, Icon |
| Cookie Banner | Auto H, min 64px; full or max 600px | Visible, Accepted, Rejected, Preferences-expanded | Fixed bottom. Accept All / Reject / Prefs. Stores choice | Buttons, Link, Toggle |

* * *
## Content & Display

| Component | Sizes | Viewports | States | Detail | Related |
| ---| ---| ---| ---| ---| --- |
| Cards | S: 200px W, M: 300px W, L: 400px W; H: auto; full-width mobile | All | Default, Hover (elevation-1→2, 200ms), Selected (border brand), Skeleton, Expanded | Grid: 3-col → 2-col → 1-col. Pad: 16/20/24px. Radius: radius-lg. Image slot: aspect 16:9 or 4:3 | Image, Buttons, Badge, Avatar, Tag |
| Carousel | H: 200–500px; W: container | All | Default, Autoplay (5s interval), Paused, Dragging, With-peek | Swipe on touch. Arrows 40px circles. Dots below. Shows 1 (mobile), 2–3 (tablet), 3–4 (desktop). Loop optional | Cards, Image, Pagination, Buttons |
| Hero Banner | 400px (mobile), 500–600px (tablet), 600–700px (desktop); full-width | All | Default, With-CTA, Video-bg, Image-bg, Gradient-overlay, Split (text+image) | Text max-w 600px. CTA: L size. Background: cover + center. Gradient: 60% dark from bottom. Content v-centered | Buttons, Heading, Image, Video |
| Avatar | 24px (XS), 32px (S), 40px (M), 56px (L), 80px (XL), 120px (2XL) | All | Image, Initials-fallback, Icon-fallback, Status-indicator (online/offline/busy), With-badge | Radius: full always. Status dot: 25% of avatar size, bottom-right. Ring: 2px white for groups. Initials font: 40% of size | Avatar Group, Badge, Popover |
| Avatar Group | Same as Avatar; max-show: 3 (mobile), 5 (desktop) then "+N" | All | Expanded, Collapsed (overlapping -8px), Overflow (+N), Hoverable (tooltip) | Overlap: -25% margin. "+N" circle same size. Hover: individual elevates. Tooltip shows name | Avatar, Popover, Tooltip |
| Image | Fluid (1:1, 4:3, 16:9, 3:2, free) | All | Loading (blurred placeholder/shimmer), Loaded (fade-in 200ms), Error (placeholder icon), Lightbox | Lazy-load below fold. Object-fit: cover (cards), contain (product). Radius: inherit parent | Cards, Carousel, Hero, Lightbox |
| Video Player | 200–500px H (16:9); W: parent | All | Loading (poster+spinner), Playing, Paused (big play center), Buffering, Ended (replay), Error, Fullscreen | Controls: 48px H, auto-hide 3s. Progress: 4px idle → 8px hover. Fullscreen: landscape lock mobile | Progress Bar, Buttons, Overlay |
| Audio Player | 48–64px H; W: 280px (compact) to 100% | All | Stopped, Playing (waveform), Paused, Buffering, Error, With-waveform, Minimal | Waveform: 32px H, brand color fill. Speed: 0.5×–2×. Skip ±15s optional | Progress Bar, Buttons, Slider |
| Badge | 16px (S), 20px (M), 24px (L) | All | Default (filled), Dot-only (8px), With-count, Overflow (99+), Outline, Pulsing | Radius: full. Min-w = height. Pad: 0 6px. Font: 10/11/12px bold white. Position: top-right, -4px offset | Avatar, Buttons, Navigation, Icon |
| Info Label | 20–28px H | All | Default, With-icon (left), Required-asterisk, Optional-tag | Font: 12/13px. Color: neutral-500. Icon: 14px. Spacing below to field: 4px | Field, Form |
| Divider | 1px H (horiz), 1px W (vert) | All | Horizontal, Vertical, With-text, Dashed, With-icon | Color: neutral-200 (light)/neutral-700 (dark). Text: 12px muted, 16px gap each side. Margin: 16/24/32px | — |
| List | Item: 40px (S), 48px (M), 56px (L) | All | Default, Selected (bg highlight), Hover, Grouped (sticky headers), Sortable (drag handle), Virtualized | Pad: 12px horiz. Dividers 1px between. Leading: avatar/icon/checkbox. Trailing: badge/chevron/action | Checkbox, Avatar, Badge, Divider, Icon |
| News Feed | Item: auto, min 80px | All | Loading (skeleton), Populated, Empty, Refreshing (pull-to-refresh mobile) | Stacked vertical. Timestamp: relative ("2h ago"). Actions below. Infinite scroll + bottom spinner | Cards, Avatar, Image, Link, Buttons |
| Table/Data Grid | Row: 40px (S), 48px (M), 56px (L); W: container min 600px | Tablet+ (h-scroll mobile) | Default, Sortable (arrows), Filtered, Loading (skeleton rows), Empty, Selected-rows, Resizable-cols | Header: sticky, bold, neutral-50 bg. Stripe: alternating. Frozen first col on mobile scroll. Bulk actions on select | Pagination, Checkbox, Buttons, Badge |
| Accordion | Header: 48px (S), 56px (M), 64px (L); Content: auto | All | Collapsed, Expanded (slide 300ms), Disabled, With-icon, Allow-multiple | Chevron rotates 180° (200ms). Content pad: 16/20/24px. Border between. First/last: radius-md | Divider, Icon, Buttons |
| Tabs | Tab: 40px (S), 48px (M); Container: auto | All | Active (2px underline + bold), Inactive, Disabled, Overflow (scrollable), With-badge, With-icon | Underline slides to active (200ms). Scrollable mobile with fade edges. Gap: 0 or 8px. Equal-width for ≤4 | Badge, Icon, Divider |
| Link | Inline (inherits text size) | All | Default (brand/underline), Hover (darken+underline), Visited (muted purple), Active, Disabled | Underline: on-hover default. External: 12px arrow suffix. Inherit line-height. Standalone: inherit size token | Icon |
| Pricing Table | Card-per-tier: 280–320px W; H: auto | All | Default, Highlighted/Recommended (brand border, "Popular"), Hover (elevate), Comparison-toggle | 3–4 tiers side-by-side → h-scroll or stacked accordion on mobile. Feature rows: check/X. CTA per tier: M button | Cards, Buttons, Badge, Divider |
| Testimonial | Auto H, min 120px; W: 300–400px (card) or full-width | All | Default (card), Carousel (rotating), With-rating, With-image, Pull-quote | Avatar: 48–64px. Quote marks: decorative 48px. Stars below/above. Name + role below quote | Avatar, Rating, Cards, Carousel |
| Stats Card | 120–200px H; W: equal columns | All | Default, Loading (skeleton), Animated-count-up, With-trend (arrow+%), With-sparkline | Grid: 2–4/row (desktop) → 2/row (mobile). Number: 32–48px bold. Label: 14px muted. Trend: green↑/red↓ | Cards, Icon, Progress Bar |
| Logo Bar | 48–80px H; W: full-width | All | Static row, Scrolling (marquee), Grayscale (hover→color), With-dividers | Logos max-h 32–48px. Gap: 40–64px. Overflow: marquee or wrap 2 rows. Grayscale → color on hover 300ms | Image, Divider |

* * *
## Forms & Composition

| Component | Sizes | Viewports | States | Detail | Related |
| ---| ---| ---| ---| ---| --- |
| Form | Auto (stacks children); max-W: 560px (single-col), 720px (2-col) | All | Default, Submitting (disabled + spinner), Success (green alert), Error-summary (red alert top) | Field gap: space-5 (20px). Section gap: space-8 (32px). 2-col → 1-col below 768px. Submit button: full-width mobile, auto desktop | All inputs, Buttons, Alert |
| Rich Text Editor | Auto H, min 200px; W: parent | All | Empty (placeholder), Editing, Preview/Read-only, With-toolbar, Minimal (inline only), Full (blocks+embeds) | Toolbar: sticky 40–48px H, icon buttons 32px. Mobile: toolbar bottom or floating bubble on select. Bold, italic, heads, lists, links, images, code | Toolbar, Buttons, Popover, Image |

* * *
## Menus & Overlays

| Component | Sizes | Viewports | States | Behavior | Related |
| ---| ---| ---| ---| ---| --- |
| Dropdown Menu | Item: 32px (S), 40px (M); Panel: 200–280px W, max 360px H | All | Open (scale-in 150ms), Closed, With-submenu, With-icons, With-shortcuts, Disabled-items, Sectioned | Click trigger. Position: below-start, auto-flip. Dividers between groups. Arrow keys navigate, Enter selects, Esc closes | Buttons, Divider, Kbd, Icon |
| Context Menu | Item: 32px (S), 40px (M); Panel: 200–280px W | Desktop (right-click); Mobile: long-press → Sheet | Open, Closed, Nested (submenu right), With-shortcuts, Disabled-items | Right-click trigger. Position: at cursor. Same keyboard nav. Nested on hover/arrow-right. Mobile: falls back to Sheet | Dropdown Menu, Kbd, Divider, Sheet |
| Sheet (Bottom Sheet) | Peek: 25% vh, Half: 50%, Full: 90%; W: 100% | Mobile primary (desktop: side-sheet 400px W) | Collapsed (peek), Half, Full, Dismissing (swipe 300ms), With-drag-handle | Drag handle: 32×4px centered, radius-full. Snap: 25/50/90%. Velocity dismiss. Backdrop behind. Top radius: radius-xl | Overlay, Buttons, List, Form |
| Command Palette | Input: 48px H; Panel: 560–640px W, max 60vh | All (Cmd+K trigger) | Empty (recents), Typing (filtered), Results (grouped), No-results, Loading | Centered, elevation-3. Input auto-focused. Results grouped by category. Fuzzy matching. Arrows navigate, Enter executes | Search Bar, List, Kbd, Icon |
| Hover Card | Auto H; W: 280–360px | Desktop only (hover) | Visible (fade-in 200ms after 500ms delay), Hidden, Loading (skeleton), With-actions | Shows on hover after delay, hides on leave. Preview: avatar, name, bio, actions. Link to full. Elevation-2 | Avatar, Popover, Link, Buttons |
| Lightbox | Full viewport (image max 90% W/H centered) | All | Open (fade 200ms), Closed, Gallery (prev/next), Zoomed, Loading | Backdrop: black 90%. Close: X + ESC + click-outside. Gallery: arrows or swipe. Pinch-zoom mobile. Counter: "3/12" | Overlay, Buttons, Image |

* * *
## Layout & Composition

| Component | Sizes | Viewports | States | Responsive / Behavior | Related |
| ---| ---| ---| ---| ---| --- |
| Toolbar | 40px (S), 48px (M), 56px (L) H; W: parent | All | Default, Overflow-menu (...), Responsive-collapse, Floating, Sticky | Collapse from right into overflow. Dividers separate groups. Border-bottom or elevation-1. Buttons: 32/40px | Buttons, Divider, Dropdown, Tooltip |
| Timeline | Item: auto H, min 64px; Connector: 2px | All | Completed (filled+check), Active (pulsing), Upcoming (outline); Vertical, Horizontal | Vertical default. Horizontal desktop-only, collapses vertical mobile. Dot: 12px. Alternating left/right optional desktop | Avatar, Badge, Cards, Divider |
| Tree View | Item: 32px (S), 40px (M); Indent: 16/20/24px per level | All | Expanded, Collapsed, Selected (bg), Hover, Drag-target, Loading-children | Chevrons: 16px. Max depth: 6 recommended. Checkbox optional multi-select. DnD reorder. Virtual scroll 100+ items | Checkbox, Icon, Link, Spinner |
| File Upload | 120px H (compact), 200px (standard); W: parent | All | Default (dashed), Drag-over (solid+bg), Uploading (progress), Complete (file list), Error, Disabled | File list: 48px/item (icon+name+size+progress+remove). Multi: stacked. Single: replace. Accepted types in helper text | Progress Bar, Buttons, List, Icon |
| Kanban Board | Column: 280–320px W; Card: auto H, min 80px | Tablet+ (single-col mobile) | Default, Dragging (elevated+placeholder), Drop-target (highlight), Empty-column (+Add), Column-editing | H-scroll columns. Drag between columns. Header sticky. "Add card" bottom. Mobile: swipe between or dropdown select | Cards, Buttons, Badge, Avatar, Dropdown |
| Calendar (Full) | 400–600px H; W: parent | Tablet+ (agenda on mobile) | Month (grid), Week (slots), Day (hourly), Agenda (list); With-events, Empty, Loading | Month cells: min 100×80px. Events: 24px color bars. Multi-day spans. Click: popover detail. Mobile: scrollable agenda list | Buttons, Badge, Popover, Dropdown |
| Chart/Graph | Min 200px H; W: parent or fixed ratio (4:3, 16:9) | Tablet+ (simplified mobile) | Loading (skeleton), Populated, No-data (empty), Hover-tooltip, With-legend, Responsive-simplified | Types: Line, Bar, Pie, Donut, Area, Scatter. Legend: below (mobile), right (desktop). Tooltip follows cursor. Animate on enter 500ms | Tooltip, Buttons, Legend |
| Map/Location | Min 300px H; W: parent | All | Loading (gray), Loaded, Error (fallback), With-pins, With-info-window, Interactive, Static | Zoom buttons 40px top-right. Pins: custom markers 32px. Info popup: 240–320px card. Pinch-zoom mobile | Buttons, Popover, Search Bar, Cards |
| Scroll Area | Auto H/W; custom scrollbar 8px W | All | Idle (scrollbar faded), Scrolling (visible), Overflowing, At-top, At-bottom | Custom scrollbar desktop; native hidden mobile. Fade indicators at edges optional. Scroll shadows: 8px gradient | — |
| Resizable Panels | Min 200px/panel; divider: 4px idle → 8px hover | Desktop primary | Default, Resizing (col-resize cursor), Collapsed, Min/Max-reached | Double-click divider: reset 50/50. Collapse button. Store in localStorage. Min-width configurable | Buttons, Divider |
| FAB | 48px (S), 56px (M), 64px (L); circle | Mobile primary | Default, Hover (elevate), Extended (with text), Mini (40px), Speed-dial (fan-out actions) | Bottom-right, 16–24px from edges. Elevation-3. Speed dial: fan upward 50ms stagger. Hides on scroll-down | Buttons, Tooltip, Icon |
| Back to Top | 40–48px circle | All (shows after 200px scroll) | Hidden (below threshold), Visible (fade 200ms), Hover | Bottom-right (desktop), bottom-center (mobile). Smooth scroll to top 500ms ease. Arrow-up icon | Buttons, Icon |
| Sortable/DnD | Inherits item dimensions | All (touch: 150ms hold) | Idle, Dragging (elevated + 50% opacity clone), Drop-target (dashed highlight), Animating (200ms reorder) | Ghost follows cursor. Drop placeholder: dashed. Handle grip icon 16px. Touch: press-and-hold to initiate | List, Cards, Icon |
| Virtualized List | Inherits item dims; renders visible + 5 buffer | All | Scrolling, Loading-more (bottom spinner), Complete, Error | Buffer: 5 above/below viewport. Placeholder height for unrendered. Scroll restoration on remount | List, Spinner, Skeleton |

* * *
## Typography & Code

| Component | Sizes | Viewports | States | Detail | Related |
| ---| ---| ---| ---| ---| --- |
| Code Block | Auto H; W: parent, max 80ch | All | Default, With-line-numbers, Copied-confirmation, With-language-label, Scrollable-H | Font: monospace 13px. Pad: 16px. Copy button top-right 32px. Dark bg default. Line-height: 1.6. Overflow-x: scroll | Buttons (copy), Kbd |
| Kbd | 20–28px H inline | All | Default, Light, Dark variants | Font: monospace 12px. Pad: 2px 6px. Border: 1px + bottom 2px (3D effect). Radius: radius-sm. Inline with text | Link, Tooltip, Dropdown Menu |
| Blockquote | Auto H; W: parent, max 65ch | All | Default, With-attribution, Nested, Pull-quote (large, decorative) | Left border: 4px brand color. Pad-left: 16px. Font: italic (default) or 24px bold (pull-quote). Attribution: 14px muted below | Link, Divider |

* * *
## Layout Pattern Templates
Reusable full-page frame compositions. Each template defines the major regions and how they adapt.

| Template | Structure (Desktop) | Mobile Adaptation |
| ---| ---| --- |
| Marketing/Landing | Header → Hero → Sections (full-width, alternating) → CTA → Footer. No sidebar. Content max-w: 1280px centered | Same stack, all sections full-width. Hero shrinks height. Multi-col sections → single col |
| Dashboard (Sidebar) | Side Menu (240px) + Main (flex). Main: Toolbar → Grid of Stats Cards → Table/Charts below. Compact density | Side Menu → hidden (drawer). Toolbar sticky. Stats 2-col. Table h-scrolls. Charts simplified |
| Auth Page | Split: Left 50% brand panel (image/illustration) + Right 50% form centered (max-w 400px). No header | Brand panel hidden. Form full-width, vertically centered, padded 20px |
| Settings/Profile | Header → Sidebar nav (200px, vertical tabs) + Main content area. Forms in main, max-w 640px | Sidebar nav → horizontal scrollable tabs at top. Form full-width below |
| Content/Blog | Header → Article body (max-w 720px centered) + optional right sidebar (TOC, 240px). Footer | Sidebar hidden (TOC → sticky floating button). Article full-width, padded |
| E-commerce PDP | Header → Breadcrumb → Split: Image gallery (50%) + Product info (50%) → Related products grid → Footer | Gallery full-width → Info below (stacked). Related: 2-col grid. Sticky "Add to Cart" bar bottom |
| Chat/Messaging | Sidebar (contacts, 320px) + Main (message thread + input bar 64px bottom). Header minimal | Stack nav: Contacts list → tap → push to thread view. Input bar sticky bottom |

* * *
## Accessibility Minimums

| Requirement | Spec |
| ---| --- |
| Touch target | 44×44px minimum on all interactive elements (mobile); 40×40px (desktop) |
| Color contrast | 4.5:1 text on background (WCAG AA); 3:1 for large text (18px+ bold or 24px+ regular) |
| Focus indicator | 2px solid, offset 2px, contrast ratio 3:1 against adjacent colors |
| Motion | Respect prefers-reduced-motion: disable animations, reduce to opacity-only transitions |
| Screen reader | All interactive elements have accessible name; states announced (expanded, selected, disabled) |
| Keyboard | Full navigation via Tab, Enter, Space, Escape, Arrow keys per ARIA patterns |

* * *
## Design Order
1. Design M (40px) default for every component at 1440px Desktop L
2. Derive S (32px) and L (48px) size variants
3. Adapt responsive: Tablet (768px) and Mobile L (390px)
4. All states per component (minimum: Default, Hover, Active, Disabled, Focus)
5. Build dark mode variant (invert elevation; swap neutral scale)
6. Export to Affinity Designer symbol library using naming convention below

* * *
## Gesture & Interaction Patterns
### Touch Gestures

| Gesture | Threshold | Behavior |
| ---| ---| --- |
| Tap | <300ms, <10px move | Primary action. Equivalent to click. Visual feedback: Active/Pressed state on touch-start |
| Double-tap | <300ms between taps | Zoom image, select word in text, like/heart (contextual). Avoid as primary interaction |
| Long-press | 500ms hold, <10px move | Context menu (Sheet), enter selection mode, preview (peek). Haptic feedback on trigger. Visual: scale-down 0.97 during hold |
| Swipe (horizontal) | >30px, velocity >0.3px/ms | Carousel navigation, dismiss toast, reveal swipe actions (delete/archive). Threshold direction must exceed perpendicular by 2:1 ratio |
| Swipe (vertical) | >30px, velocity >0.3px/ms | Scroll, dismiss bottom sheet, pull-to-refresh. Same 2:1 directional lock as horizontal |
| Pinch | 2 fingers, >10px spread | Zoom images/maps (0.5×–4× range). Centered on midpoint between fingers. Spring-back at min/max limits |
| Pull-to-refresh | >64px overscroll at top | Triggers content refresh. Spinner appears after threshold. Resistance curve: distance × 0.4 past 64px. Snap back on release |
| Drag | 150ms hold + >10px move | Reorder items, move between columns (Kanban), slider thumb. Ghost at 50% opacity follows finger |

### Keyboard Patterns

| Key | Context | Behavior |
| ---| ---| --- |
| Tab | Global | Move focus to next interactive element in DOM order. Shift+Tab: reverse. Skip non-interactive |
| Enter | Buttons, links, menu items | Activate/click the focused element. In forms: submit if focus is on input (not textarea) |
| Space | Buttons, checkboxes, toggles | Activate button, toggle checkbox/switch state. Does NOT activate links (only Enter does) |
| Escape | Modals, popovers, menus, dialogs | Close/dismiss the topmost overlay. Return focus to trigger element. Cascade: innermost first |
| Arrow keys | Menus, tabs, radio groups, sliders | Navigate between options. Loops at boundaries (first↔last). Vertical in menus/lists, Horizontal in tabs/segmented |
| Home / End | Lists, menus, sliders | Jump to first/last item. In slider: set to min/max value |
| Cmd/Ctrl + K | Global | Open Command Palette. Focus search input. Esc to close |

### Scroll Behavior
*   **Smooth scroll:** All programmatic scrolls use 500ms ease (e.g., Back to Top, anchor links)
*   **Scroll snap:** Carousel items, full-page sections (optional), bottom sheet snap points
*   **Inertia:** Native momentum scrolling on all scroll containers (iOS: -webkit-overflow-scrolling: touch)
*   **Scroll lock:** Body scroll locked when any overlay is open (modal, drawer, sheet, lightbox)
*   **Infinite scroll:** Trigger next-page fetch when user reaches 200px from bottom; show spinner; disable if error
### Hover vs Touch Decision Matrix
*   **Desktop (pointer: fine):** Use hover states, tooltips on hover, hover cards, mega-menu on hover
*   **Mobile (pointer: coarse):** No hover states; tooltips on long-press; hover cards disabled; mega-menu → accordion
*   **Hybrid (touch laptop):** Treat as desktop but add 44px min touch targets; hover states still apply

* * *
## Naming Convention — Affinity Designer Symbol Library
### Taxonomy Structure
`{category}/{component}/{size}/{state}/{viewport}`

**Examples:**
*   `nav/header/M/default/desktop-l`
*   `nav/header/M/sticky/mobile-l`
*   `input/button/L/hover/all`
*   `input/button/XS/disabled/all`
*   `feedback/modal/M/open/desktop-l`
*   `feedback/modal/M/open/mobile-l`
*   `content/card/M/skeleton/all`
*   `layout/kanban/M/dragging/tablet-l`
### Category Prefixes

| Prefix | Contains | Examples |
| ---| ---| --- |
| nav/ | Navigation components | header, footer, side-menu, breadcrumb, pagination, bottom-tabs, drawer |
| input/ | All inputs, controls, and form elements | button, field, checkbox, radio, select, combo-box, date-picker, slider, toggle |
| feedback/ | Overlays, alerts, status indicators | alert, tooltip, modal, popover, toast, progress, spinner, skeleton, stepper |
| content/ | Display and data components | card, carousel, hero, avatar, badge, list, table, tabs, accordion, image, video |
| menu/ | Menus and contextual overlays | dropdown, context-menu, sheet, command-palette, hover-card, lightbox |
| layout/ | Composition and structural components | toolbar, timeline, tree-view, file-upload, kanban, calendar, chart, map, fab |
| type/ | Typography and code components | code-block, kbd, blockquote, heading-set, body-text |
| icon/ | Icon library by category | icon/navigation/arrow-left/outline, icon/action/edit/filled |
| token/ | Design token swatches and references | token/color/brand, token/spacing/scale, token/radius/md |

### Size Values
*   Use size token names: `XS`, `S`, `M`, `L`, `XL`
*   If a component has no size variants (e.g., Overlay), use `_` as placeholder
### State Values
*   Use lowercase, hyphenated: `default`, `hover`, `active`, `disabled`, `focus`, `loading`, `error`, `open`, `closed`, `selected`, `skeleton`
*   Compound states use double-hyphen: `hover--selected`, `disabled--checked`
### Viewport Values
*   `all` = single artboard works at all breakpoints (most atomic components)
*   `mobile-s`, `mobile-l`, `tablet`, `tablet-l`, `desktop`, `desktop-l`, `desktop-xl`
*   Only create viewport-specific artboards when layout/size genuinely changes (not for every component)
### Artboard Organization
*   **One artboard per unique visual state** (not per interaction frame)
*   Group related artboards in named sections on canvas
*   Page structure in Affinity: 1 page per category prefix
*   Within each page: components arranged top-to-bottom, sizes left-to-right, states in rows
### File Structure

```plain
📄 01-tokens (color swatches, type samples, spacing, radius, elevation)
📄 02-icons (full icon library, all categories)
📄 03-nav (all navigation components)
📄 04-input (all inputs and controls)
📄 05-feedback (all feedback and overlay components)
📄 06-content (all content and display components)
📄 07-menu (all menus and contextual overlays)
📄 08-layout (all layout and composition components)
📄 09-type (typography and code components)
📄 10-patterns (full-page compositions, templates)
```
