---
title: "Layout Styles — Structural Languages"
slug: layout-styles
group: "Design System"
order: 12
summary: "The structural languages you arrange components in. Where Design Styles is the skin (surface, color, texture), Layout Styles is the skeleton (how space is divided and…"
---

The structural languages you arrange components in. Where Design Styles is the _skin_ (surface, color, texture), Layout Styles is the _skeleton_ (how space is divided and how the eye moves). Same components, same visual style — a different layout changes the whole product. This is library-wide reference: it applies to every screen, not just one page.

Layout is independent of surface. A Bento Grid can hold Glassmorphism cells, Flat cells, or Aurora cells. An Editorial layout can carry Swiss surfaces or Art Deco surfaces. Pick the layout for the job, then dress it in a Design Style.
* * *

## How to choose

**Content-density first.** Sparse marketing content wants generous, single-focus layouts (Hero-led, Editorial, Split Screen). Dense application content wants structured, scannable layouts (Sidebar App Shell, Dashboard Grid, Master-Detail).

**Reading pattern.** Text-heavy pages follow the F-pattern (users scan left edge, then across headings). Visual/marketing pages follow the Z-pattern (top-left → top-right → diagonal → bottom-right). Design the layout around the pattern the content actually creates.

**Navigation depth.** Shallow sites (5-8 destinations) do fine with a top bar + single column. Deep apps (dozens of destinations, persistent context) need a Sidebar App Shell or Master-Detail so the user never loses their place.

**Device reality.** Every layout has to survive 320px width and reflow to 400% zoom (WCAG 1.4.10). Multi-column and sidebar layouts must collapse to a single column or an off-canvas drawer on mobile. Design the mobile stack first, then expand.

**Layout-by-context guide:**

*   Marketing / landing → Hero-led, Z-pattern Zig-zag, Split Screen, Full-bleed
*   SaaS / web app → Sidebar App Shell, Dashboard Grid, Master-Detail
*   Content / publishing → Editorial multi-column, Single Column, Magazine
*   E-commerce → Card Grid / Gallery, Sidebar-filter + Grid, Bento feature blocks
*   Dashboard / analytics → Dashboard Widget Grid, Bento Grid
*   Productivity / project tools → Kanban Column Board, Master-Detail, Sidebar App Shell
*   Social / feed → Single-stream Feed, Three-column (nav / feed / aside)
*   Portfolio / gallery → Masonry, Card Grid, Full-bleed, Asymmetric/Broken Grid
*   Docs / reference → Sidebar App Shell (nav + content + on-this-page), Single Column
*   Mobile-first / PWA → Off-canvas Drawer, Bottom-tab + single column, Feed
* * *

## The layout patterns

### 1. Single Column / Centered
One centered content column (max-width ~60-75ch for text), everything stacked vertically. The default for readability. Structure: header → stacked sections → footer. Use for articles, blog posts, forms, onboarding, checkout, docs pages. Responsive: already mobile-shaped; just widen padding on large screens. Pairs with: Editorial, Swiss, Minimal, UJG Brand. Pitfall: line length over ~75 characters kills readability; don't let the column stretch full-width on desktop.

### 2. Sidebar + Content (App Shell)
Persistent vertical nav rail on one side, main content area beside it, optional top bar. The workhorse of web apps. Structure: fixed sidebar (collapsible) + scrollable content + optional right context panel. Use for SaaS dashboards, admin panels, docs, settings. Responsive: sidebar collapses to icon-rail, then to an off-canvas drawer under ~768px. Pairs with: Corporate, Flat, Material, Swiss. Pitfall: the sidebar must have a real `<nav>` landmark and current-page `aria-current`; on mobile the drawer must trap focus and return it on close.

### 3. Holy Grail (Header / Footer / Three-Column)
Header on top, footer on bottom, three columns between: left nav, center content, right aside. The classic full-page frame. Structure: `header` / `nav` / `main` / `aside` / `footer` as real landmarks. Use for portals, news homepages, documentation with a right "on this page" rail. Responsive: the two side columns drop below the main content in source order on mobile. Pairs with: Editorial, Corporate, Swiss. Pitfall: DOM order must put `main` early enough that keyboard/screen-reader users reach content without tabbing through both rails — use CSS order, not source order, to place rails visually.

### 4. Split Screen / 50-50
The viewport divided into two equal (or weighted) halves — often media on one side, content/form on the other. Structure: two full-height panes, each independently scrollable if needed. Use for login/signup, product intros, before/after, dual-CTA landing. Responsive: panes stack vertically on mobile (media first or content first per priority). Pairs with: Minimal, Editorial, Aurora, UJG Brand. Pitfall: on short viewports a 50vh media pane can push the form below the fold — set a min-height on the content pane.

### 5. Bento Grid
A grid of mixed-size rectangular cells (like a bento box), each a self-contained module. Trend-forward, great for feature showcases. Structure: CSS Grid with spanning cells (`grid-column: span 2`, etc.), varied cell sizes creating rhythm. Use for feature sections, product overviews, dashboards, "everything at a glance" pages. Responsive: cells collapse to fewer columns, then to a single stack; preserve the priority order. Pairs with: any surface — Bento is layout-only. Pitfall: reading order can scramble on reflow; set explicit source order so the collapse is logical, and give each cell a heading so it's a real landmark/region.

### 6. Masonry
Variable-height items packed into columns with no fixed row alignment (Pinterest-style). Structure: CSS columns or a masonry grid; items flow to the shortest column. Use for image galleries, portfolios, mixed-media feeds. Responsive: reduce column count down to one. Pairs with: Full-bleed imagery, Hand-drawn, Y2K, Editorial. Pitfall: CSS `columns` reorders content top-to-bottom-per-column (breaks reading order for AT); if order matters, use a real masonry grid, not `columns`. Lazy-load images or the first paint stalls.

### 7. Card Grid / Gallery
Uniform cards in a regular grid. The most predictable, scannable layout for collections. Structure: equal-size cards, consistent gutters, 2-4 columns. Use for product listings, blog indexes, team pages, search results. Responsive: 4 → 3 → 2 → 1 columns across breakpoints. Pairs with: Flat, Material, Scandinavian, Corporate. Pitfall: cards with uneven content length break the grid rhythm — set a consistent card height strategy or use `align-items: start` intentionally.

### 7b. Sidebar-Filter + Grid
A card grid with a persistent filter/facet rail. The e-commerce and search-results standard. Structure: left filter panel + results grid, count + sort controls above the grid. Responsive: filters collapse into a drawer/modal on mobile with an "apply" action. Pairs with: Flat, Corporate, Material. Pitfall: applying a filter must update an `aria-live` count and not steal focus; the drawer on mobile must be dismissible and remember state.

### 8. Dashboard / Widget Grid
A grid of data widgets (charts, stat tiles, tables) the user scans at a glance, sometimes rearrangeable. Structure: responsive grid of cards, each a titled region; often a 12-column base. Use for analytics, monitoring, admin overviews, home screens. Responsive: widgets reflow to fewer columns; keep the most important widget first. Pairs with: Corporate, Flat, Bento, UJG Brand. Pitfall: every widget needs a heading and each chart a text alternative; don't gate the key number behind a chart only.

### 9. Magazine / Editorial (Multi-Column)
Asymmetric, typographic, print-inspired layouts with varied column widths, pull quotes, and intentional whitespace. Structure: a grid broken deliberately — big headline, lead image, multi-column body, sidebars. Use for long-form journalism, brand storytelling, case studies, lookbooks. Responsive: collapse multi-column body to single column; preserve the typographic hierarchy. Pairs with: Editorial, Swiss, Art Deco, Japanese. Pitfall: multi-column CSS (`column-count`) forces top-to-bottom reading per column and breaks on reflow — reserve it for short callouts, not primary body flow.

### 10. Hero-Led Landing (F-Pattern Stack)
A tall stacked page opening with a full-width hero, then alternating content sections down the scroll. The marketing-site default. Structure: hero (headline + CTA + visual) → feature blocks → social proof → pricing → footer CTA. Use for product landing pages, campaigns, launches. Responsive: everything stacks naturally; hero text scales down. Pairs with: Aurora, Neo-Brutalism, UJG Brand, Gradient surfaces. Pitfall: too many competing CTAs dilutes the one action that matters; one primary CTA per section.

### 11. Z-Pattern / Zig-Zag Alternating
Content blocks alternate image-left/text-right, then image-right/text-left down the page, guiding the eye in a Z. Structure: repeating two-column rows with flipped order. Use for feature tours, "how it works," benefit walkthroughs. Responsive: each row collapses to a single column (image-then-text consistently). Pairs with: Minimal, Scandinavian, Editorial. Pitfall: on mobile, don't let the flip put the image before text on odd rows and after on even rows — normalize the stack order.

### 12. Full-Bleed / Edge-to-Edge
Content (usually media) spans the entire viewport width, no side margins. Immersive and cinematic. Structure: full-width sections breaking out of the content container, often 100vw. Use for photography, hero videos, immersive storytelling, art/fashion. Responsive: stays full-width; watch text overlay contrast on varied imagery. Pairs with: Full-bleed imagery, Cyberpunk, Aurora, Grunge. Pitfall: text over imagery must clear 4.5:1 at the worst pixel, not the average — use a scrim/overlay.

### 13. Asymmetric / Broken Grid
Intentionally off-balance placement — overlapping elements, uneven columns, negative space as a design element. High-personality. Structure: a grid used as a canvas, elements placed with deliberate imbalance and overlap (`grid-area`, negative margins, z-index). Use for portfolios, agencies, fashion, art, campaign microsites. Responsive: the "break" usually has to resolve into a clean stack on mobile. Pairs with: Memphis, Neo-Brutalism, Y2K, Hand-drawn. Pitfall: overlap can wreck reading order and tap targets; verify DOM order and 44px targets survive the artistry.

### 14. Master-Detail (List-Detail / Multi-Pane)
A list pane and a detail pane side by side; selecting an item in the list updates the detail. Structure: scrollable list column + detail column, often with a third context pane. Use for email, chat, file browsers, CRMs, settings. Responsive: collapses to a single pane with drill-in navigation (list → detail → back) on mobile. Pairs with: Corporate, Flat, Material. Pitfall: selection must move focus predictably and announce the detail change; on mobile the back affordance must be obvious and restore scroll position.

### 15. Kanban / Column Board
Horizontal columns of stacked cards, usually drag-and-drop between columns. Structure: horizontally scrolling columns, each a titled list of cards. Use for task boards, pipelines, workflows, CRM stages. Responsive: columns scroll horizontally or collapse to a single column with a column switcher on mobile. Pairs with: Flat, Corporate, Material. Pitfall: drag-and-drop needs a full keyboard alternative (move-to-column menu) and live-region announcements — pointer-only DnD fails accessibility.

### 16. Single-Stream Feed
One vertical column of chronologically or algorithmically ordered items, infinite-scrolling. Structure: a `feed` region of article cards, load-more or infinite scroll. Use for social timelines, activity streams, news feeds, notifications. Responsive: already single-column; widen padding on desktop, often with side rails (see Three-Column). Pairs with: Flat, Material, UJG Brand. Pitfall: infinite scroll must not trap focus or lose the user's place; provide `aria-busy`, stable scroll on prepend, and a keyboard path.

### 17. Three-Column (Nav / Feed / Aside)
A center feed flanked by a left nav rail and a right contextual aside (trends, suggestions, ads). The social-network standard. Structure: three columns, center is primary and widest. Responsive: asides drop first, then nav becomes a bottom bar or drawer, leaving the feed. Pairs with: Flat, Material. Pitfall: keep `main`/feed early in DOM order; the rails are supplementary and should come after for AT users.

### 18. Tabbed / Sectioned
One frame whose main region swaps content via tabs or segmented sections. Structure: a tab list controlling panels, or stacked collapsible sections. Use for settings, product detail (overview/specs/reviews), profiles. Responsive: tabs become a scrollable strip, an accordion, or a select on mobile. Pairs with: any surface. Pitfall: tabs need the full APG keyboard model (arrow keys, `aria-selected`, roving tabindex); don't fake tabs with anchors that lose state.

### 19. Off-Canvas / Drawer-Driven (Mobile-First)
Primary content full-width; navigation and secondary panels slide in from an edge on demand. Structure: content + hamburger-triggered drawer(s). Use for mobile apps, PWAs, responsive collapses of Sidebar/Three-Column layouts. Responsive: this IS the mobile form of denser layouts. Pairs with: any surface. Pitfall: the drawer must trap focus while open, close on Escape and scrim tap, and return focus to the trigger.

### 20. Sticky / Scroll-Driven Sections
Full-viewport sections that pin, reveal, or transform as the user scrolls (scrollytelling). Structure: sticky positioning + scroll-linked animation, one "scene" at a time. Use for product stories, data narratives, launches. Responsive: must degrade to a plain stacked scroll on mobile and under `prefers-reduced-motion`. Pairs with: Kinetic, Aurora, Full-bleed. Pitfall: never gate content behind scroll animation completing; the page must be fully readable with zero motion.
* * *

## The grid underneath (mechanics)

*   **12-column responsive grid** is the default substrate; most layouts above are arrangements on it. Use CSS Grid for two-dimensional layouts, Flexbox for one-dimensional rows/columns.
*   **Container queries** over viewport media queries where a component must adapt to its container, not the screen (a card that's full-width in one column but tight in a sidebar).
*   **Spacing scale** stays fixed across layouts (4/8px-based tokens); layout changes arrangement, not the spacing system.
*   **Breakpoints:** design mobile-first, expand up. Common tiers ~640 / 768 / 1024 / 1280px, but set them to the content's natural break, not fixed device sizes.
*   **Max-width discipline:** text columns cap at ~60-75ch; full-width layouts still usually cap their inner content and only let backgrounds/media go edge-to-edge.
* * *

## Combining & nesting layouts

Real products nest layouts inside layouts. Rules:

1. **One shell, many regions.** The outer layout (usually Sidebar App Shell or Single Column) is the shell; individual regions can run their own pattern — a Dashboard Grid inside the content area of an App Shell, a Card Grid inside one Bento cell.
2. **One primary reading path per screen.** Nesting is fine; competing primary paths are not. Decide what the eye should do first and subordinate everything else.
3. **Collapse from the outside in.** On shrink, resolve the outer layout first (sidebar → drawer), then let inner grids reflow. Test the whole chain at 320px.
4. **Layout is independent of surface.** Any Design Style skins any layout. Don't pick a layout because of how a style looks — pick structure for the content, then skin it.
5. **Keep semantics constant.** Landmarks (`header`/`nav`/`main`/`aside`/`footer`), heading order, and DOM reading order stay correct no matter how the visual grid rearranges. Use CSS `order`/`grid-area` for visual placement, never by scrambling source order.

**Common successful nests:**

*   Sidebar App Shell (shell) + Dashboard Widget Grid (content) + Master-Detail (one widget expands)
*   Single Column (shell) + Bento Grid (feature section) + Card Grid (inside one bento cell)
*   Three-Column (shell) + Single-Stream Feed (center) + sticky aside (right)
*   Hero-Led Landing (shell) + Z-Pattern Zig-Zag (features) + Split Screen (final CTA)
* * *

## Accessibility notes per layout

*   **Reading / DOM order:** the biggest layout a11y risk. Any layout that visually reorders content (Holy Grail rails, Bento, Masonry via `columns`, Asymmetric overlap, Three-Column) must keep `main` reachable early and DOM order matching the logical reading order. Screen readers and keyboard users follow the DOM, not the grid.
*   **Landmarks:** every layout region maps to a landmark — one `main`, `nav` for navigation, `aside` for supplementary, `header`/`footer` for banner/contentinfo. Multi-region layouts (Dashboard, Bento) give each region a heading so it's navigable.
*   **Reflow (WCAG 1.4.10):** every layout must work at 320px width and 400% zoom with no horizontal scrolling of content. Multi-column and side-by-side layouts must collapse; horizontal-scroll layouts (Kanban) are the documented exception but still need a keyboard path.
*   **Focus order:** must follow the visual order after layout. Off-canvas drawers and Master-Detail must trap and restore focus correctly. Sticky headers must not cover the focused element (scroll-margin).
*   **Skip links:** any layout with nav before content (Sidebar, Holy Grail, Three-Column) needs a "skip to content" link so keyboard users bypass the rails.
*   **Target size:** 44px minimum survives every layout; dense grids and asymmetric overlaps are where this quietly breaks.
* * *

## Performance notes per layout

*   **Grid vs. columns:** CSS Grid and Flexbox are cheap. CSS `columns` (Masonry) can be expensive to reflow and breaks reading order — prefer a real grid for masonry when order matters.
*   **Virtualize long collections:** Feeds, Card Grids, Kanban columns, and Master-Detail lists with many rows should virtualize (render only what's visible) past a few hundred items.
*   **Lazy-load below the fold:** Hero-Led, Masonry, and Card Grid pages are image-heavy; lazy-load and set explicit dimensions to avoid layout shift (CLS).
*   **Sticky / scroll-driven:** scroll-linked animation (pattern 20) is the heaviest — use compositor-only properties (`transform`/`opacity`), `content-visibility` for offscreen sections, and a static fallback under `prefers-reduced-motion`.
*   **Avoid layout thrash:** don't animate width/height/top/left to move panels; transform them. Reserve space for async content so grids don't jump.
* * *

**Rule:** The layout serves the content and the reading path, never the reverse. Structure is the skeleton; Design Style is the skin. Semantics, landmarks, reading order, focus order, and 44px targets are identical no matter which layout — and no matter which style skins it. When in doubt, default to Single Column for content and Sidebar App Shell for applications, and add personality through the Design Style, not by breaking the structure.
* * *

_Companion page: 🎨 Design Styles (Visual Languages) — the surface layer. Layout Styles is the structural layer. A finished screen is one Layout Style skinned in one Design Style (plus at most one accent), with behavioral styles (Kinetic, High Contrast) layered on top._
