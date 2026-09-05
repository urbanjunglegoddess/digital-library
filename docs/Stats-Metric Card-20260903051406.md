# Stats/Metric Card

# Stats/Metric Card
The single most-glanced-at component in any dashboard. A tile that turns one number into an instant answer: "how are we doing right now, and is it getting better or worse?" Here's everything from first principles to production code, at the Button depth standard.
* * *

## 1\. What It Actually Is
A Stats/Metric Card (a.k.a. KPI tile, stat card, metric tile) is a compact display component that presents **one primary metric** — a single big number — with a describing **label**, and usually an optional **delta** (change vs. a comparison period) and a **sparkline** (a tiny trend line). It is the at-a-glance summary that lives at the top of a dashboard, answering a question in under a second before the user reads any real chart.

The word "stat card" hides several things people lump together and misuse:

*   **Stats/Metric Card (this component):** one metric, read-only, glanceable. "Revenue $42,500, up 12%." Its job is comprehension speed, not interaction.
*   **Badge / Pill:** a tiny inline status token ("New", "3", "Beta"). A badge decorates another element and carries almost no data; a metric card is a standalone container built around a number. If it sits _inside_ a button or nav item, it's a badge — not this.
*   **Chart / Graph:** a full data visualization with axes, ticks, legend, and multiple series you _analyze_. A metric card _summarizes_; a chart _explains_. The sparkline inside a metric card is deliberately axis-less and un-analyzable — it's a shape, not a chart.
*   **Progress / Meter:** shows completion toward a known bound (0–100%). A metric card can _contain_ a mini progress bar toward a goal, but its core is a free magnitude, not a bounded ratio.
*   **Data table cell:** also shows a number, but in a scannable grid of many values. Reach for a table when the comparison _between_ rows is the point; reach for metric cards when 3–6 headline numbers deserve spotlight.

**Rule of thumb:** if a person should absorb it in one glance and it's a _single headline number with a label_, it's a Metric Card. If it's a token glued onto something else, it's a Badge. If it has axes you'd read values off of, it's a Chart. If it's bounded 0–100%, it's a Progress/Meter.
* * *

## 2\. Why It Matters
The metric card is the _first paragraph_ of a dashboard. It carries disproportionate weight for a component that "just shows a number."

*   **Decision speed = business value.** The whole reason dashboards exist is fast situational awareness. A well-built row of metric cards lets an operator triage in one second; a poorly-built one forces them to hunt through charts. The card is where "data" becomes "a decision."
*   **Accessibility is easy to get catastrophically wrong here.** The meaning lives in _visual size_ (a 48px number) and _color_ (green up / red down). Both are invisible to a screen-reader user and a colorblind user. If you don't explicitly associate the label with the value and spell out the direction of the delta in text, the entire metric is unreadable to assistive tech — a silent, total failure for a component that looks "simple."
*   **Trust is fragile and numeric.** A metric that flickers, shows a stale value, rounds `$42,500` to `$43K` without warning, or updates silently while someone is reading it, erodes confidence in the _whole_ product. Users forgive a slow chart; they do not forgive a number they think is wrong.
*   **Formatting is a correctness surface, not a style choice.** `1234567` vs `1,234,567` vs `$1.2M` vs `1 234 567` (fr-FR) are not cosmetic — the wrong one is misread, mis-keyed into a report, or interpreted in the wrong currency/locale. Number formatting is where a "display-only" component quietly ships bugs.
*   **Real-time metrics are an ARIA-live minefield.** Live-updating tiles that announce every tick will spam a screen reader into uselessness; ones that announce nothing hide changes. Getting the live-region discipline right is the difference between "helpful" and "unusable" for AT users, and it's invisible in a visual QA pass.
* * *

## 3\. Anatomy
A metric card is small but has more named parts than people expect. Interactive-grade breakdown (a display component still earns 6+ parts here):

*   **Container** — the card surface: radius, padding, elevation/border, and a min-height that keeps a row of cards aligned even when one has a sparkline and another doesn't. Owns the grid cell.
*   **Label / caption** — the human name of the metric ("Monthly Recurring Revenue"). Typically 13–14px, muted color, often uppercase-tracked. Must be _programmatically associated_ with the value, not just visually near it.
*   **Metric value** — the headline number, 28–48px, tightest weight the type allows. This is the visual anchor. It is the _formatted_ string (grouping separators, currency, unit) — never a raw float dumped to the DOM.
*   **Unit / affix** — the currency symbol, `%`, `/mo`, `k`, or unit label attached to the value. Can be baked into the formatted string (via `Intl`) or rendered as a smaller sibling span for typographic control.
*   **Delta / trend indicator** — the change vs. a comparison: a direction (▲ up / ▼ down / — flat), a magnitude ("+12%" or "+4,200"), and a semantic tone (good/bad — _context-dependent_, see §6). Must carry sign + text, never color alone.
*   **Comparison caption** — the "vs last month" / "vs 30 days" line that gives the delta meaning. A delta without a stated baseline is noise.
*   **Sparkline** — an optional axis-less mini line/area chart (~28–40px tall) showing the recent trajectory. Decorative by default (`aria-hidden`) with a real text/table alternative, OR an accessible inline chart (see §10).
*   **Icon / category glyph** — optional leading icon signaling the metric's domain (a dollar sign, a user, a cart). Decorative unless it's the _only_ label — then it needs a text alternative.
*   **Status/loading layer** — skeleton shimmer, empty ("No data") state, or error ("Couldn't load") state that replaces value + delta + sparkline as a unit.
* * *

## 4\. Sizes / Scale / Density
Metric cards live in dashboard grids, so "size" is really _density tier_ + _value type scale_. Real tokens with pixel values:

| Tier | Container min-H | Padding | Value size | Label size | Sparkline H | Grid (desktop) | Use case |
| ---| ---| ---| ---| ---| ---| ---| --- |
| Compact | `--metric-h-sm: 88px` | `12px` | `--fs-value-sm: 24px` | `12px` | none / 20px | 4–6 per row | Dense ops dashboards, embedded widgets, mobile summary row |
| Default | `--metric-h-md: 128px` | `16px` | `--fs-value-md: 32px` | `13px` | 28px | 3–4 per row | Standard analytics overview, admin panels |
| Prominent | `--metric-h-lg: 176px` | `24px` | `--fs-value-lg: 44px` | `14px` | 40px | 2–3 per row | Executive summary, single hero KPI, landing "results" strip |

Rules that matter:

*   **Value scale ≠ container scale.** Bump the _number_ size for hierarchy before you bump the card. A hero KPI can be a Default container with a `--fs-value-lg` value.
*   **Reserve delta + sparkline space always.** If some cards in a row have a sparkline and others don't, reserve the height anyway (`min-height` on the value block) so the row's baselines align. Ragged card heights read as broken.
*   **Tabular figures.** Set `font-variant-numeric: tabular-nums` on the value so digits don't jitter width during count-up or live updates.
*   **Responsive grid, not fixed columns.** Use `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` so cards reflow 4→2→1 across breakpoints without media-query churn. On mobile default to 2-up, drop to 1-up under ~380px.
*   **Target size is a placement rule, not a value rule.** The card itself is display-only, but if the whole card is a link/drill-down, the _entire card_ is the 44×44px+ hit target — don't put a tiny "→" as the only affordance.
* * *

## 5\. States
Every state named _and_ described. A metric card has real states beyond a button's generic set because its content is asynchronous data.

*   **Default / loaded** — value, label, delta, and sparkline all present and formatted. The resting state.
*   **Loading / skeleton** — data in flight. Value and delta are replaced by shimmer blocks sized to the _expected_ content (don't collapse the card to zero height — that causes layout shift when data lands). `aria-busy="true"` on the card; a visually-hidden "Loading \[label\]" for AT.
*   **Empty / no-data** — the query succeeded but there's nothing (new account, filtered-out range). Show an explicit "No data yet" or "—", not a misleading `0`. `0` and _absence_ are different facts; conflating them is a correctness bug.
*   **Error** — the fetch failed. Show "Couldn't load" plus a retry affordance; keep the label visible so the user knows _which_ metric broke. Never show a stale number styled as current.
*   **Stale / refreshing** — value is present but a background refresh is running (common in live dashboards). Subtle indicator (dimmed value or a small spinner) so the user knows it's updating without a jarring skeleton flash.
*   **Count-up (enter animation)** — the number animates from 0 (or previous value) to target on mount/viewport-enter. Purely decorative; must snap to final value under `prefers-reduced-motion`.
*   **Value-changed (live update)** — a real-time push changed the number. Brief highlight/flash on the value, delta recomputed. Governed by strict `aria-live` discipline (§10) so AT isn't spammed.
*   **Positive / negative / neutral trend** — a _semantic_ state driven by the delta and the metric's polarity (rising revenue = positive; rising churn = negative). Drives the delta's color + icon + sr-only wording.
*   **Interactive (optional)** — if the card is a drill-down link/button: `hover` (elevation/tint), `focus-visible` (2px ring on the whole card), `active` (press). Only present when the card actually navigates or opens a detail view.
*   **Threshold/alert (optional)** — value crossed a defined bound (e.g. error rate > 1%). Adds an alert accent + an sr-only "above threshold" note; the _color_ is never the only signal.
* * *

## 6\. Types / Variants
Every functional variant named and described (well past the 4 minimum):

*   **Number only** — the simplest: value + label. For metrics with no meaningful period-comparison (e.g. "Total users: 12,480").
*   **Number + delta** — value + a change indicator vs. a stated baseline. The workhorse dashboard variant.
*   **Number + sparkline** — value + a 7–30 point trend shape. Adds trajectory ("up 12%, and steadily") without the space of a real chart.
*   **Number + delta + sparkline** — the full tile. Magnitude, direction, and shape together.
*   **Comparison variant** — shows current _and_ prior explicitly ("$42.5K / was $38K"), for when the baseline number itself matters, not just the percentage.
*   **Goal / progress variant** — value plus a mini progress bar toward a target ("$42.5K of $50K goal"). Bounds the magnitude against an objective.
*   **Multi-stat variant** — one card, one theme, 2–3 related sub-metrics (e.g. "Sessions 12k · Users 8k · Bounce 41%"). Use sparingly; it fights the "one glance = one number" principle.
*   **Polarity-aware variant (good vs. bad)** — the critical logical variant, not a visual one. The card must know whether _up is good_. For revenue, ▲ is green/positive. For **churn, error rate, latency, cost, ▲ is bad** and must render red/negative even though it "went up." A metric card that hard-codes "up = green" is wrong for half of all metrics. Model polarity explicitly (`higherIsBetter: boolean`).
*   **Live variant** — subscribes to a stream and updates in place; adds stale/refreshing states and live-region wiring.
* * *

## 7\. When to Use (and When Not To)
**Use a Metric Card when:**

*   You have **3–6 headline numbers** that deserve top-of-page spotlight (revenue, active users, conversion, churn).
*   The user needs **situational awareness before analysis** — the "am I okay?" glance above the detailed charts.
*   A number benefits from **at-a-glance trend context** (delta + sparkline) but not full interrogation.
*   You're building a dashboard header, admin overview, reporting summary, executive strip, or a "results" section on a marketing page.

**Don't use one (use something else) when:**

*   **The number needs context that won't fit a short label** → use a full **Card** with body copy, or a **callout**.
*   **Users must read exact values across many items or compare rows** → use a **Data Table**. Ten metric cards is a table wearing a costume.
*   **The value is bounded 0–100% and completion is the story** → use a **Progress bar / Meter / Gauge**.
*   **The metric only makes sense as a trend over labeled time** → use a real **Chart** (line/bar) with axes. Don't force analysis onto a sparkline.
*   **It's a tiny status token on another element** → use a **Badge/Pill**, not a standalone card.
*   **It's the** **_only_** **data on the page** → a lone metric card is thin; pair headline cards with the detailed charts they summarize.

**Placement heuristics:** metric cards belong in a single top row (or 2 rows max) of a dashboard, above the fold, left-to-right in priority order (most-important metric top-left, following reading order). This ties directly to the **Dashboard layout pattern** (see Layout Styles → Dashboard): a responsive metric strip (`auto-fit` grid) sitting above the primary chart region, with consistent card heights and gutters. Don't scatter metric cards through the page — cluster them so the eye reads the "vitals" as one unit.
* * *

## 8\. Across Design Systems
How the major systems treat the stat/metric tile (≥6 systems):

*   **Material Design 3** — no dedicated "metric card," but it's a **Card** (filled/elevated/outlined) housing a display/headline type token for the number and a body/label token beneath. Trend chips use MD3 **assist/suggestion chips** or the color roles (`error`/`primary`) with an icon. Elevation level 1, `md.sys.shape.corner.medium`.
*   **Apple HIG** — expressed as a **cell/tile** in a dashboard; on iOS/macOS, WidgetKit's "accessory/system" widgets are literally metric tiles. HIG stresses SF Symbols for the category glyph, `.rounded` numeric fonts for legibility, and Dynamic Type — the number must scale with the user's text size, not stay pinned at 44px.
*   **Fluent 2 (Microsoft)** — Power BI's **Card** and **KPI** visuals are the canonical metric cards: a big value, a trend indicator, and a target/goal comparison baked in. Fluent tokens for surface/stroke; the KPI visual formalizes "good/bad" direction as a configurable property (exactly the polarity problem in §6).
*   **Ant Design** — has a first-class **`Statistic`** component (`<Statistic title value prefix suffix />`) plus **`Statistic.Countdown`** and the **`Card`** **+** **`Statistic`** combo shown throughout its dashboard demos. Ant bakes in `precision`, `groupSeparator`, and prefix/suffix — a good model for formatting props.
*   **Tailwind (Tailwind UI / Catalyst)** — ships "Stats" sections as utility compositions: a `dl`/`dt`/`dd` semantic list of stats with `grid` layout, muted `text-sm` labels and `text-3xl font-semibold` values, delta in `text-green-600 / text-red-600` _with_ an inline arrow SVG. Notably uses the **description-list** semantics (best-practice, see §10).
*   **shadcn/ui + Radix** — no dedicated primitive; the community pattern is a `Card` (`CardHeader`/`CardContent`) with a `CardTitle` label, a large value, and a `text-muted-foreground` delta line, often with a `lucide-react` `TrendingUp/Down` icon. Radix contributes no metric primitive but its `VisuallyHidden` is used for the sr-only direction text.
*   **Bootstrap 5** — no component; built from a `.card` with `.card-body`, a `.display-6`/`.fs-*` value, `.text-muted` label, and a `.badge text-bg-success/danger` for the delta. Utility-driven, exactly like the marketing "stats" examples in their docs.

### 8b. Visual Styles / What's trending in 2026
The same semantic tile wears any skin (full per-style breakdown in §17). In 2026 the dominant shifts for metric tiles specifically:

*   **Liquid Glass (Apple iOS 26 / macOS Tahoe)** — metric widgets on the lock/home screen now render as translucent, refractive tiles: the big number sits on a material that bends the wallpaper behind it with a specular rim, and the sparkline picks up a subtle sheen. The web is approximating it with layered `backdrop-filter` + highlight gradients.
*   **Bento-grid dashboards** — the metric strip is dissolving into asymmetric "bento" layouts where a hero KPI tile spans 2×2 next to smaller unit tiles. Metric cards are the atoms of the bento trend.
*   **Live/animated deltas** — subtle number roll-up and delta pulse on real-time data, gated hard behind `prefers-reduced-motion`.
*   **AI-annotated metrics** — tiles now carry a one-line generated "why" ("↑ 12%, driven by the EU launch"), turning the card from a number into a micro-narrative. This shifts more text into the card and raises the a11y/formatting bar.
* * *

## 9\. The Code
Production-shaped targets. All formatting flows through one `Intl`\-based utility so every platform is consistent. **17 code subsections.**

### 9.1 The formatting core (Intl.NumberFormat — TypeScript)
The heart of the component. Everything else consumes this.

```typescript
// format.ts — one source of truth for number → string
export type MetricFormat =
  | { kind: "number"; compact?: boolean; maxFrac?: number }
  | { kind: "currency"; currency: string; compact?: boolean }
  | { kind: "percent"; maxFrac?: number };

export function formatMetric(
  value: number,
  fmt: MetricFormat,
  locale: string = typeof navigator !== "undefined" ? navigator.language : "en-US",
): string {
  if (!Number.isFinite(value)) return "—";
  switch (fmt.kind) {
    case "currency":
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: fmt.currency,
        notation: fmt.compact ? "compact" : "standard",
        maximumFractionDigits: fmt.compact ? 1 : 2,
      }).format(value);
    case "percent":
      // NOTE: percent style multiplies by 100 — pass 0.12 for 12%
      return new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: fmt.maxFrac ?? 1,
      }).format(value);
    case "number":
    default:
      return new Intl.NumberFormat(locale, {
        notation: fmt.compact ? "compact" : "standard",
        maximumFractionDigits: fmt.maxFrac ?? (fmt.compact ? 1 : 0),
      }).format(value);
  }
}

// Delta: sign is data, color is decoration. Polarity decides good/bad.
export interface DeltaInfo {
  direction: "up" | "down" | "flat";
  tone: "good" | "bad" | "neutral";
  label: string;          // "+12.4%"  (visible)
  srDirection: string;    // "increase" (screen-reader)
}

export function computeDelta(
  current: number,
  previous: number,
  higherIsBetter: boolean,
  locale?: string,
): DeltaInfo {
  if (!Number.isFinite(previous) || previous === 0) {
    return { direction: "flat", tone: "neutral", label: "—", srDirection: "no change" };
  }
  const ratio = (current - previous) / Math.abs(previous);
  const direction = ratio > 0 ? "up" : ratio < 0 ? "down" : "flat";
  const tone =
    direction === "flat" ? "neutral"
    : (direction === "up") === higherIsBetter ? "good" : "bad";
  const label = new Intl.NumberFormat(locale, {
    style: "percent", signDisplay: "exceptZero", maximumFractionDigits: 1,
  }).format(ratio);
  const srDirection =
    direction === "up" ? "increase" : direction === "down" ? "decrease" : "no change";
  return { direction, tone, label, srDirection };
}
```

### 9.2 HTML (semantic foundation with ARIA + sparkline text alternative)
Uses a description list so label↔value are programmatically paired. Sparkline is decorative with a real table alternative.

```html
<article class="metric-card" aria-labelledby="m-rev-label">
  <dl class="metric-card__dl">
    <dt id="m-rev-label" class="metric-card__label">Monthly Recurring Revenue</dt>
    <dd class="metric-card__value" aria-describedby="m-rev-delta">
      <span aria-hidden="true">$42,500</span>
      <span class="sr-only">42,500 US dollars</span>
    </dd>
  </dl>

  <p id="m-rev-delta" class="metric-card__delta metric-card__delta--good">
    <span class="metric-card__arrow" aria-hidden="true">&#9650;</span>
    <span>+12.4%</span>
    <span class="sr-only">increase</span>
    <span class="metric-card__compare"> vs last month</span>
  </p>

  <!-- Decorative sparkline: hidden from AT, real data in the table below -->
  <svg class="metric-card__spark" viewBox="0 0 100 32" aria-hidden="true" focusable="false"
       preserveAspectRatio="none">
    <polyline points="0,28 20,24 40,26 60,16 80,12 100,6" fill="none"
              stroke="currentColor" stroke-width="2" />
  </svg>
  <table class="sr-only">
    <caption>Monthly Recurring Revenue, last 6 months</caption>
    <thead><tr><th>Month</th><th>Value</th></tr></thead>
    <tbody>
      <tr><td>Mar</td><td>$34,000</td></tr>
      <tr><td>Apr</td><td>$36,200</td></tr>
      <tr><td>May</td><td>$35,500</td></tr>
      <tr><td>Jun</td><td>$39,800</td></tr>
      <tr><td>Jul</td><td>$41,100</td></tr>
      <tr><td>Aug</td><td>$42,500</td></tr>
    </tbody>
  </table>
</article>
```

### 9.3 CSS (states, layout, skeleton, reduced-motion)

```css
.metric-card {
  --pad: 16px;
  --radius: 14px;
  --value-fs: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 128px;
  padding: var(--pad);
  border-radius: var(--radius);
  background: var(--surface, #fff);
  border: 1px solid var(--stroke, #e6e4df);
  box-shadow: 0 1px 2px rgb(0 0 0 / 6%);
  color: var(--fg, #0a0a0a);
}
.metric-card__label {
  font-size: 13px; letter-spacing: 0.03em; text-transform: uppercase;
  color: var(--muted, #6b6b6b); margin: 0;
}
.metric-card__value {
  font-size: var(--value-fs); font-weight: 700; line-height: 1.05; margin: 0;
  font-variant-numeric: tabular-nums;  /* digits keep width during count-up */
  min-height: calc(var(--value-fs) * 1.05); /* reserve space, no layout shift */
}
.metric-card__delta {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 600; margin: 0;
}
.metric-card__delta--good { color: var(--pos, #0f7b46); }
.metric-card__delta--bad  { color: var(--neg, #c0362c); }
.metric-card__delta--neutral { color: var(--muted, #6b6b6b); }
.metric-card__compare { color: var(--muted, #6b6b6b); font-weight: 400; }
.metric-card__spark { width: 100%; height: 32px; color: var(--accent, #5f2c82); }

/* Skeleton / loading */
.metric-card[aria-busy="true"] .metric-card__value,
.metric-card[aria-busy="true"] .metric-card__delta {
  color: transparent; border-radius: 6px;
  background: linear-gradient(90deg,#eee 25%,#f5f5f5 37%,#eee 63%);
  background-size: 400% 100%; animation: metric-shimmer 1.4s ease infinite;
}
@keyframes metric-shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }

/* Interactive (drill-down) card */
a.metric-card:hover { box-shadow: 0 4px 12px rgb(0 0 0 / 10%); }
.metric-card:focus-visible { outline: 2px solid var(--focus,#5f2c82); outline-offset: 2px; }

.sr-only {
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0;
}
@media (prefers-reduced-motion: reduce) {
  .metric-card[aria-busy="true"] .metric-card__value,
  .metric-card[aria-busy="true"] .metric-card__delta { animation: none; }
}
```

### 9.4 React + TypeScript (full reusable component)

```tsx
import { useId } from "react";
import { formatMetric, computeDelta, type MetricFormat } from "./format";

export interface MetricCardProps {
  label: string;
  value: number | null;              // null = empty/no-data
  previous?: number;                 // enables delta
  format: MetricFormat;
  higherIsBetter?: boolean;          // polarity: churn/latency -> false
  spark?: number[];                  // decorative trend series
  comparisonLabel?: string;          // "vs last month"
  status?: "ok" | "loading" | "error";
  locale?: string;
  href?: string;                     // if set, whole card is a drill-down link
}

export function MetricCard({
  label, value, previous, format, higherIsBetter = true,
  spark, comparisonLabel = "vs previous period",
  status = "ok", locale, href,
}: MetricCardProps) {
  const labelId = useId();
  const deltaId = useId();

  const Root = href ? "a" : "article";
  const rootProps = href ? { href } : {};

  if (status === "loading") {
    return (
      <article className="metric-card" aria-busy="true" aria-labelledby={labelId}>
        <dl className="metric-card__dl">
          <dt id={labelId} className="metric-card__label">{label}</dt>
          <dd className="metric-card__value">&nbsp;</dd>
        </dl>
        <span className="sr-only">Loading {label}</span>
      </article>
    );
  }
  if (status === "error") {
    return (
      <article className="metric-card" aria-labelledby={labelId}>
        <dl className="metric-card__dl">
          <dt id={labelId} className="metric-card__label">{label}</dt>
          <dd className="metric-card__value metric-card__value--error" role="alert">
            Couldn&rsquo;t load
          </dd>
        </dl>
      </article>
    );
  }
  const empty = value === null || !Number.isFinite(value);
  const delta =
    !empty && previous != null
      ? computeDelta(value as number, previous, higherIsBetter, locale)
      : null;

  return (
    <Root className="metric-card" aria-labelledby={labelId} {...rootProps}>
      <dl className="metric-card__dl">
        <dt id={labelId} className="metric-card__label">{label}</dt>
        <dd className="metric-card__value" aria-describedby={delta ? deltaId : undefined}>
          {empty ? "—" : formatMetric(value as number, format, locale)}
        </dd>
      </dl>

      {delta && (
        <p id={deltaId} className={`metric-card__delta metric-card__delta--${delta.tone}`}>
          <span className="metric-card__arrow" aria-hidden="true">
            {delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "—"}
          </span>
          <span>{delta.label}</span>
          <span className="sr-only">{delta.srDirection}</span>
          <span className="metric-card__compare">&nbsp;{comparisonLabel}</span>
        </p>
      )}

      {spark && spark.length > 1 && <Sparkline data={spark} label={label} />}
    </Root>
  );
}

function Sparkline({ data, label }: { data: number[]; label: string }) {
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
    .join(" ");
  return (
    <>
      <svg className="metric-card__spark" viewBox="0 0 100 32" aria-hidden="true"
           focusable="false" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth={2} />
      </svg>
      <span className="sr-only">
        {label} trend, {data.length} points, from {data[0]} to {data[data.length - 1]}.
      </span>
    </>
  );
}
```

### 9.5 Vanilla JavaScript (count-up honoring reduced-motion)

```javascript
// metric-card.js — progressive enhancement of the §9.2 markup
function animateCount(el, to, { format, durationMs = 900 }) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = format(to); return; }
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / durationMs, 1);
    const eased = 1 - Math.pow(1 - t, 3);         // easeOutCubic
    el.textContent = format(Math.round(to * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

document.querySelectorAll("[data-metric]").forEach((card) => {
  const valueEl = card.querySelector(".metric-card__value > [aria-hidden='true']");
  const target = Number(card.dataset.value);
  const nf = new Intl.NumberFormat(card.dataset.locale || undefined, {
    style: card.dataset.style || "decimal",
    currency: card.dataset.currency,
    notation: card.dataset.compact === "true" ? "compact" : "standard",
    maximumFractionDigits: 1,
  });
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      animateCount(valueEl, target, { format: (n) => nf.format(n) });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  io.observe(card);
});
```

### 9.6 Tailwind CSS

```html
<a href="/reports/revenue"
   class="group flex flex-col gap-2 min-h-32 p-4 rounded-xl bg-white border border-neutral-200
          shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-violet-700
          focus-visible:outline-offset-2 transition-shadow"
   aria-labelledby="mrr-label">
  <dl>
    <dt id="mrr-label" class="text-[13px] uppercase tracking-wide text-neutral-500">
      Monthly Recurring Revenue
    </dt>
    <dd class="text-3xl font-bold tabular-nums leading-tight" aria-describedby="mrr-delta">
      <span aria-hidden="true">$42.5K</span><span class="sr-only">42,500 US dollars</span>
    </dd>
  </dl>
  <p id="mrr-delta" class="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-700">
    <span aria-hidden="true">▲</span><span>+12.4%</span>
    <span class="sr-only">increase</span>
    <span class="font-normal text-neutral-500">&nbsp;vs last month</span>
  </p>
  <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"
       class="w-full h-8 text-violet-700">
    <polyline points="0,28 20,24 40,26 60,16 80,12 100,6" fill="none"
              stroke="currentColor" stroke-width="2" />
  </svg>
</a>
```

### 9.7 Next.js (App Router — server fetch + client live update)

```tsx
// app/dashboard/metrics/revenue-card.tsx  (Server Component wrapper)
import { MetricCard } from "@/components/metric-card";
import { LiveRevenue } from "./live-revenue";

export default async function RevenueCard() {
  // Server-side fetch: value is correct on first paint, no loading flash
  const res = await fetch("https://api.internal/metrics/mrr", {
    next: { revalidate: 60 },
    headers: { authorization: `Bearer ${process.env.METRICS_TOKEN}` },
  });
  if (!res.ok) {
    return <MetricCard label="MRR" value={null} format={{ kind: "currency", currency: "USD" }} status="error" />;
  }
  const { current, previous, series } = (await res.json()) as {
    current: number; previous: number; series: number[];
  };
  return (
    <LiveRevenue
      initial={{ current, previous, series }}
      label="Monthly Recurring Revenue"
    />
  );
}
// app/dashboard/metrics/live-revenue.tsx  ("use client")
"use client";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/metric-card";

type Snap = { current: number; previous: number; series: number[] };

export function LiveRevenue({ initial, label }: { initial: Snap; label: string }) {
  const [snap, setSnap] = useState(initial);
  useEffect(() => {
    const es = new EventSource("/api/metrics/mrr/stream");
    es.onmessage = (e) => setSnap(JSON.parse(e.data) as Snap);
    es.onerror = () => es.close();       // fall back to server-rendered value
    return () => es.close();
  }, []);
  return (
    <MetricCard
      label={label}
      value={snap.current}
      previous={snap.previous}
      spark={snap.series}
      format={{ kind: "currency", currency: "USD", compact: true }}
      higherIsBetter
      comparisonLabel="vs last month"
    />
  );
}
```

### 9.8 shadcn/ui + Radix pattern

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { computeDelta, formatMetric, type MetricFormat } from "@/lib/format";

export function StatCard({
  label, value, previous, format, higherIsBetter = true,
}: {
  label: string; value: number; previous: number;
  format: MetricFormat; higherIsBetter?: boolean;
}) {
  const d = computeDelta(value, previous, higherIsBetter);
  const Icon = d.direction === "up" ? TrendingUp : d.direction === "down" ? TrendingDown : Minus;
  const tone =
    d.tone === "good" ? "text-emerald-600" : d.tone === "bad" ? "text-red-600" : "text-muted-foreground";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{formatMetric(value, format)}</div>
        <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${tone}`}>
          <Icon className="h-4 w-4" aria-hidden />
          {d.label}
          <VisuallyHidden>{d.srDirection}</VisuallyHidden>
          <span className="font-normal text-muted-foreground">vs last month</span>
        </p>
      </CardContent>
    </Card>
  );
}
```

### 9.9 Vue 3 (SFC)

```vue
<script setup lang="ts">
import { computed } from "vue";
import { formatMetric, computeDelta, type MetricFormat } from "./format";

const props = withDefaults(defineProps<{
  label: string; value: number | null; previous?: number;
  format: MetricFormat; higherIsBetter?: boolean; comparisonLabel?: string;
}>(), { higherIsBetter: true, comparisonLabel: "vs previous period" });

const display = computed(() =>
  props.value == null || !Number.isFinite(props.value) ? "—" : formatMetric(props.value, props.format));
const delta = computed(() =>
  props.value != null && props.previous != null
    ? computeDelta(props.value, props.previous, props.higherIsBetter) : null);
</script>

<template>
  <article class="metric-card" :aria-labelledby="label">
    <dl>
      <dt :id="label" class="metric-card__label">{{ label }}</dt>
      <dd class="metric-card__value">{{ display }}</dd>
    </dl>
    <p v-if="delta" class="metric-card__delta" :class="`metric-card__delta--${delta.tone}`">
      <span aria-hidden="true">{{ delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '—' }}</span>
      <span>{{ delta.label }}</span>
      <span class="sr-only">{{ delta.srDirection }}</span>
      <span class="metric-card__compare">&nbsp;{{ comparisonLabel }}</span>
    </p>
  </article>
</template>
```

### 9.10 Svelte

```svelte
<script lang="ts">
  import { formatMetric, computeDelta, type MetricFormat } from "./format";
  export let label: string;
  export let value: number | null;
  export let previous: number | undefined = undefined;
  export let format: MetricFormat;
  export let higherIsBetter = true;
  export let comparisonLabel = "vs previous period";

  $: display = value == null || !Number.isFinite(value) ? "—" : formatMetric(value, format);
  $: delta = value != null && previous != null
    ? computeDelta(value, previous, higherIsBetter) : null;
</script>

<article class="metric-card" aria-labelledby={label}>
  <dl>
    <dt id={label} class="metric-card__label">{label}</dt>
    <dd class="metric-card__value">{display}</dd>
  </dl>
  {#if delta}
    <p class="metric-card__delta metric-card__delta--{delta.tone}">
      <span aria-hidden="true">{delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "—"}</span>
      <span>{delta.label}</span>
      <span class="sr-only">{delta.srDirection}</span>
      <span class="metric-card__compare">&nbsp;{comparisonLabel}</span>
    </p>
  {/if}
</article>
```

### 9.11 Angular (standalone component)

```typescript
import { Component, Input, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { formatMetric, computeDelta, MetricFormat } from "./format";

@Component({
  selector: "metric-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="metric-card" [attr.aria-labelledby]="label">
      <dl>
        <dt [id]="label" class="metric-card__label">{{ label }}</dt>
        <dd class="metric-card__value">{{ display() }}</dd>
      </dl>
      <p *ngIf="delta() as d" class="metric-card__delta" [class]="'metric-card__delta--' + d.tone">
        <span aria-hidden="true">{{ d.direction === 'up' ? '▲' : d.direction === 'down' ? '▼' : '—' }}</span>
        <span>{{ d.label }}</span>
        <span class="sr-only">{{ d.srDirection }}</span>
        <span class="metric-card__compare">&nbsp;{{ comparisonLabel }}</span>
      </p>
    </article>`,
})
export class MetricCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) set value(v: number | null) { this._value.set(v); }
  @Input() previous?: number;
  @Input({ required: true }) format!: MetricFormat;
  @Input() higherIsBetter = true;
  @Input() comparisonLabel = "vs previous period";
  private _value = signal<number | null>(null);
  display = computed(() => {
    const v = this._value();
    return v == null || !Number.isFinite(v) ? "—" : formatMetric(v, this.format);
  });
  delta = computed(() => {
    const v = this._value();
    return v != null && this.previous != null
      ? computeDelta(v, this.previous, this.higherIsBetter) : null;
  });
}
```

### 9.12 Bootstrap 5

```html
<div class="card shadow-sm h-100">
  <div class="card-body">
    <dl class="mb-2">
      <dt class="text-muted text-uppercase small fw-normal">Monthly Recurring Revenue</dt>
      <dd class="display-6 fw-bold mb-0 font-monospace" style="font-variant-numeric: tabular-nums;">
        <span aria-hidden="true">$42.5K</span>
        <span class="visually-hidden">42,500 US dollars</span>
      </dd>
    </dl>
    <p class="mb-0 d-inline-flex align-items-center gap-1">
      <span class="badge text-bg-success">
        <span aria-hidden="true">&#9650;</span> +12.4%
        <span class="visually-hidden">increase</span>
      </span>
      <span class="text-muted small">vs last month</span>
    </p>
  </div>
</div>
```

### 9.13 Web Component (framework-agnostic custom element)

```javascript
class MetricCard extends HTMLElement {
  static observedAttributes = ["label", "value", "previous", "currency", "higher-is-better"];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  render() {
    const label = this.getAttribute("label") ?? "";
    const value = Number(this.getAttribute("value"));
    const previous = this.hasAttribute("previous") ? Number(this.getAttribute("previous")) : null;
    const currency = this.getAttribute("currency");
    const higher = this.getAttribute("higher-is-better") !== "false";

    const nf = new Intl.NumberFormat(undefined, currency
      ? { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }
      : { notation: "compact", maximumFractionDigits: 1 });
    const display = Number.isFinite(value) ? nf.format(value) : "—";

    let deltaHTML = "";
    if (previous != null && previous !== 0 && Number.isFinite(value)) {
      const ratio = (value - previous) / Math.abs(previous);
      const up = ratio > 0, flat = ratio === 0;
      const good = flat ? false : up === higher;
      const arrow = flat ? "—" : up ? "▲" : "▼";
      const sr = flat ? "no change" : up ? "increase" : "decrease";
      const pct = new Intl.NumberFormat(undefined,
        { style: "percent", signDisplay: "exceptZero", maximumFractionDigits: 1 }).format(ratio);
      deltaHTML = `<p class="d ${flat ? "n" : good ? "g" : "b"}">
        <span aria-hidden="true">${arrow}</span> ${pct}
        <span class="sr">${sr}</span></p>`;
    }

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;padding:16px;border:1px solid #e6e4df;border-radius:14px;background:#fff}
        .l{font-size:13px;text-transform:uppercase;color:#6b6b6b;margin:0}
        .v{font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;margin:2px 0}
        .d{font-size:13px;font-weight:600;margin:0}
        .g{color:#0f7b46}.b{color:#c0362c}.n{color:#6b6b6b}
        .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
      </style>
      <dl aria-labelledby="l">
        <dt id="l" class="l">${label}</dt>
        <dd class="v">${display}</dd>
      </dl>${deltaHTML}`;
  }
}
customElements.define("metric-card", MetricCard);
```

### 9.14 Python (FastAPI endpoint + Jinja2 server render)

```python
# app.py — the server behind a live metric
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from jinja2 import Environment, BaseLoader
import babel.numbers as bn

app = FastAPI()

_TEMPLATE = Environment(loader=BaseLoader()).from_string("""
<article class="metric-card" aria-labelledby="m-label">
  <dl>
    <dt id="m-label" class="metric-card__label">{{ label }}</dt>
    <dd class="metric-card__value">{{ display }}</dd>
  </dl>
  {% if delta %}
  <p class="metric-card__delta metric-card__delta--{{ delta.tone }}">
    <span aria-hidden="true">{{ delta.arrow }}</span> {{ delta.label }}
    <span class="sr-only">{{ delta.sr }}</span>
  </p>{% endif %}
</article>""")

def build_delta(current: float, previous: float, higher_is_better: bool):
    if not previous:
        return None
    ratio = (current - previous) / abs(previous)
    up = ratio > 0
    flat = ratio == 0
    tone = "neutral" if flat else ("good" if up == higher_is_better else "bad")
    return {
        "arrow": "—" if flat else ("▲" if up else "▼"),
        "label": f"{ratio:+.1%}",
        "sr": "no change" if flat else ("increase" if up else "decrease"),
        "tone": tone,
    }

@app.get("/metrics/{key}", response_class=HTMLResponse)
def metric(key: str, locale: str = "en_US"):
    data = {"mrr": ("Monthly Recurring Revenue", 42500.0, 37800.0, "USD", True)}.get(key)
    if data is None:
        raise HTTPException(status_code=404, detail="unknown metric")
    label, current, previous, currency, higher = data
    display = bn.format_currency(current, currency, locale=locale, format_type="short")
    return _TEMPLATE.render(
        label=label, display=display,
        delta=build_delta(current, previous, higher),
    )
```

### 9.15 SwiftUI (iOS)

```swift
import SwiftUI

struct MetricCard: View {
    let label: String
    let value: Double
    let previous: Double?
    let currencyCode: String?
    let higherIsBetter: Bool

    private var display: String {
        if let code = currencyCode {
            return value.formatted(.currency(code: code).notation(.compactName))
        }
        return value.formatted(.number.notation(.compactName))
    }
    private var delta: (arrow: String, label: String, sr: String, good: Bool)? {
        guard let prev = previous, prev != 0 else { return nil }
        let ratio = (value - prev) / abs(prev)
        let up = ratio > 0, flat = ratio == 0
        return (flat ? "—" : up ? "▲" : "▼",
                ratio.formatted(.percent.sign(strategy: .always()).precision(.fractionLength(1))),
                flat ? "no change" : up ? "increase" : "decrease",
                flat ? false : up == higherIsBetter)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.caption).foregroundStyle(.secondary).textCase(.uppercase)
            Text(display).font(.system(size: 32, weight: .bold)).monospacedDigit()
            if let d = delta {
                (Text(d.arrow) + Text(" \(d.label)"))
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(d.good ? .green : .red)
                    .accessibilityLabel("\(d.label) \(d.sr)")
            }
        }
        .padding(16)
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(display)")
    }
}
```

### 9.16 Jetpack Compose (Android)

```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.NumberFormat
import java.util.Locale

@Composable
fun MetricCard(
    label: String,
    value: Double,
    previous: Double? = null,
    higherIsBetter: Boolean = true,
    locale: Locale = Locale.getDefault(),
) {
    val display = NumberFormat.getCompactNumberInstance(locale, NumberFormat.Style.SHORT).format(value)
    val ratio = previous?.takeIf { it != 0.0 }?.let { (value - it) / kotlin.math.abs(it) }
    val up = (ratio ?: 0.0) > 0
    val good = if (ratio == null || ratio == 0.0) false else up == higherIsBetter
    val srDir = when { ratio == null || ratio == 0.0 -> "no change"; up -> "increase"; else -> "decrease" }

    Card(Modifier.semantics(mergeDescendants = true) { contentDescription = "$label: $display, $srDir" }) {
        Column(Modifier.padding(16.dp)) {
            Text(label.uppercase(), style = MaterialTheme.typography.labelMedium)
            Text(display, fontSize = 32.sp, fontWeight = FontWeight.Bold)
            ratio?.let {
                val pct = NumberFormat.getPercentInstance(locale).apply { maximumFractionDigits = 1 }.format(it)
                Text(
                    text = "${if (up) "▲" else "▼"} $pct",
                    color = if (good) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}
```

### 9.17 Flutter (Dart) + Testing (Vitest/RTL + jest-axe + Playwright)

```dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class MetricCard extends StatelessWidget {
  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    this.previous,
    this.currencyCode,
    this.higherIsBetter = true,
  });
  final String label;
  final double value;
  final double? previous;
  final String? currencyCode;
  final bool higherIsBetter;

  @override
  Widget build(BuildContext context) {
    final display = currencyCode != null
        ? NumberFormat.compactCurrency(symbol: r'$').format(value)
        : NumberFormat.compact().format(value);
    final prev = previous;
    double? ratio;
    if (prev != null && prev != 0) ratio = (value - prev) / prev.abs();
    final up = (ratio ?? 0) > 0;
    final good = ratio == null || ratio == 0 ? false : up == higherIsBetter;
    final srDir = ratio == null || ratio == 0 ? 'no change' : (up ? 'increase' : 'decrease');

    return Semantics(
      label: '$label: $display, $srDir',
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.toUpperCase(), style: Theme.of(context).textTheme.labelMedium),
              Text(display, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
              if (ratio != null)
                Text(
                  '${up ? '▲' : '▼'} ${NumberFormat.percentPattern().format(ratio.abs())}',
                  style: TextStyle(color: good ? Colors.green.shade700 : Colors.red.shade700),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
```

```typescript
// metric-card.test.tsx — Vitest + React Testing Library + jest-axe
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("associates label with value and spells out the direction", () => {
    render(<MetricCard label="Churn" value={0.042} previous={0.035}
      higherIsBetter={false} format={{ kind: "percent" }} />);
    // label is programmatically the accessible name
    expect(screen.getByLabelText("Churn")).toBeInTheDocument();
    // rising churn is BAD even though it went up
    expect(screen.getByText("increase")).toBeInTheDocument();
    expect(screen.getByText(/\+20/)).toHaveClass("metric-card__delta--bad");
  });

  it("renders — for empty (not a misleading 0)", () => {
    render(<MetricCard label="New signups" value={null} format={{ kind: "number" }} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <MetricCard label="Revenue" value={42500} previous={37800}
        format={{ kind: "currency", currency: "USD" }} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
// metric-card.e2e.ts — Playwright: live update must not spam SR / must reformat
import { test, expect } from "@playwright/test";

test("live value updates in place and stays formatted", async ({ page }) => {
  await page.goto("/dashboard");
  const value = page.getByRole("group", { name: /monthly recurring revenue/i })
    .getByTestId("metric-value");
  await expect(value).toHaveText(/\$42\.5K/);
  await page.getByRole("button", { name: "Simulate revenue tick" }).click();
  await expect(value).toHaveText(/\$4[3-9]/);          // reformatted, not raw float
  await expect(value).not.toHaveText(/\d{6,}/);        // never a bare 6-digit number
});
```

* * *

## 10\. Accessibility
Standalone. The metric card's meaning lives in size and color — both invisible to AT. This section is where the component is won or lost.

**Roles & ARIA**

*   Use a **description list** (`<dl><dt>label</dt><dd>value</dd></dl>`) so the label is _programmatically_ the value's name. Alternatively, `aria-labelledby` the value at the label's `id`. Never leave a floating big number with a visually-adjacent-but-unlinked label.
*   Put the human-readable value in the DOM for AT. If you show `$42.5K` visually (compact), add a visually-hidden precise form: `<span class="sr-only">42,500 US dollars</span>`. Screen readers should not have to guess what "K" means.
*   The **delta must not be color-only.** Ship a sign/arrow (`▲`/`▼`/`—`) _and_ the number _and_ a visually-hidden word: `<span class="sr-only">increase</span>` / `decrease` / `no change`. Associate it with the value via `aria-describedby`.
*   The **sparkline** takes one of two routes: (a) decorative — `aria-hidden="true" focusable="false"` on the SVG, with the real data in an adjacent `.sr-only` table or a text summary ("trend up, 34k → 42.5k over 6 months"); or (b) accessible chart — `role="img"` with a descriptive `aria-label`. Never leave a bare unlabeled SVG that a screen reader announces as "image."
*   If the whole card is a drill-down, it's a single `<a>`/`<button>` — the accessible name is "\[label\]: \[value\], \[delta\]", not "link".

**Keyboard map** (only when the card is interactive/drill-down; a display card has no keyboard interaction):

| Key | Action |
| ---| --- |
| `Tab` | Move focus to the card (one stop for the whole card, not each inner part) |
| `Shift+Tab` | Move focus to the previous card |
| `Enter` | Activate drill-down (navigate / open detail) |
| `Space` | Activate if the card is a `<button>` (not for `<a>`) |
| `Esc` | Close the detail view/popover the card opened, return focus to the card |

**Focus management** — for a static card: none (not focusable). For a drill-down card: a visible 2px `focus-visible` ring on the _whole card_, offset 2px; if it opens a detail panel/modal, move focus in on open and return it to the card on close.

**Contrast** — value text ≥ 4.5:1 against the card surface (it's the most important text — don't let a "muted" treatment drop it below AA). The delta color (green/red) must _also_ meet 4.5:1 and must never be the _only_ carrier of meaning. The sparkline stroke, as a non-text graphic conveying info, needs ≥ 3:1 if it's the accessible chart route (decorative route is exempt but then needs the text alternative).

**Target size** — the card body is display-only, but a drill-down card's entire surface is the ≥ 44×44px target. Don't hide the affordance behind a tiny 16px arrow icon.

**`prefers-reduced-motion`** — count-up animation and delta pulse/flash snap to final value immediately; skeleton shimmer becomes a static tint. No motion is essential to reading a number.

**Live regions (the hard part)** — for a live-updating metric:

*   Wrap the value in a container that is **`aria-live="polite"`** **and** **`aria-atomic="true"`** so a change announces the _whole_ "label: value" phrase, not a lone digit.
*   **Throttle announcements.** A value ticking every second must not announce every tick — debounce to a meaningful cadence (e.g. announce at most every ~10s, or only on threshold crossings). Uncontrolled `aria-live` on high-frequency data is a screen-reader denial-of-service.
*   Use `aria-busy="true"` during refresh so AT knows the region is mid-update.
*   Never put `aria-live="assertive"` on a routine metric — reserve assertive for genuine alerts (threshold breach), and even then announce the label so the user knows _which_ metric.

**Common failures specific to this component**

*   Big number with no programmatic label → SR reads "42,500" with no idea what it measures.
*   Delta conveyed by color only → colorblind and SR users get no direction.
*   Compact `$1.2M` with no precise alternative → ambiguous magnitude for AT.
*   Sparkline as an unlabeled `<svg>` → announced as a meaningless "image."
*   `0` shown for "no data" → SR user is told the metric is zero when it's actually absent.
*   Live region announcing every tick → unusable audio spam.
* * *

## 11\. Innovative / Emerging Ideas
*   **View Transitions API for value changes** — use the CSS/JS **View Transitions API** (broadly shipping across browsers through 2025–2026) to cross-fade or roll a metric from old to new value on live update, compositor-driven, gated by `prefers-reduced-motion`. Smooth without a JS animation library.
*   **CSS** **`if()`** **/ container-query-driven density** — with container queries (and the 2026-era CSS `if()` function landing in engines), a metric card can pick Compact vs. Prominent tier from its _own_ rendered width, not global breakpoints — true self-sizing tiles for bento grids and embeds.
*   **Speculative/streamed metrics via SSE + Suspense** — server-streamed metric snapshots that hydrate progressively: skeleton → server value → live stream, with React Suspense/Next streaming so the number is correct on first paint and self-updating after.
*   **AI-generated "why" annotations** — a one-line generated explanation under the delta ("↑ 12%, driven by EU launch"), produced server-side from the same data slice. Raises the formatting/a11y bar (more text, must stay honest and labeled).
*   **`Intl.NumberFormat`** **`roundingPriority`** **/** **`signDisplay: "negative"`** — newer Intl options give precise control over compact rounding and sign display without hand-rolling logic, so `$999,500` never displays as a misleading `$1.0M`.
* * *

## 12\. Conversion / UX Killers
Silent mistakes that cost trust or money — each with why it fails and the fix implied:

*   **"Up is always green" polarity bug** — a rising churn/error/cost tile painted green tells the operator things are _good_ when they're on fire. It fails because polarity is context-dependent; fix by modeling `higherIsBetter` per metric so tone is computed, never assumed.
*   **Compact notation with no precise value** — `$1.2M` hides whether it's `$1,150,000` or `$1,249,000`, and finance users can't reconcile it. It fails because compact rounding destroys information silently; fix with a tooltip/`title`/sr-only exact figure.
*   **`0`** **masquerading as "no data"** — a brand-new account showing "0 sales" looks like failure, not emptiness, and triggers false alarm. It fails because absence and zero are different facts; fix with an explicit empty state ("—" / "No data yet").
*   **Layout shift when data lands** — a card that renders at zero height then jumps to 128px when the fetch resolves shoves the whole dashboard down and loses the user's place. It fails because the skeleton didn't reserve space; fix with `min-height` and skeleton blocks sized to expected content.
*   **Silent live updates** — a number that changes while the user is reading it, with no highlight, makes them distrust what they just saw ("wait, did that say 42 or 47?"). It fails because change without feedback reads as instability; fix with a brief value-flash and honest stale/refreshing indicator.
*   **Precision theater** — showing `$42,500.00` or `12.4823%` implies a certainty the data doesn't have and slows the glance. It fails because trailing precision adds cognitive load without value; fix by rounding to a decision-relevant precision.
*   **Delta with no baseline** — "+12%" with no "vs what" is meaningless and invites misreading (vs yesterday? last year?). It fails because a change needs a reference; fix by always shipping the comparison caption.
* * *

## 13\. Advanced Patterns
*   **TypeScript-enforced a11y via discriminated unions** — make it _impossible_ to ship a compact value without a precise alternative, or a delta without polarity:

```typescript
type Value =
  | { display: "standard"; value: number }
  | { display: "compact"; value: number; preciseLabel: string }; // compact REQUIRES sr text

type Trend =
  | { kind: "none" }
  | { kind: "delta"; previous: number; higherIsBetter: boolean };  // polarity REQUIRED

interface MetricCardProps { label: string; value: Value; trend: Trend; }
// The compiler now rejects a compact metric with no preciseLabel, and a delta with no polarity.
```

*   **Design-token tiers for the whole metric strip** — three-tier tokens (primitive → semantic → component) so a client theme reskins every card at once:

```css
:root {
  /* primitive */         --gold-500:#DCA424; --eminence-700:#5F2C82; --green-600:#0f7b46; --red-600:#c0362c;
  /* semantic */          --metric-pos: var(--green-600); --metric-neg: var(--red-600);
                          --metric-surface:#fff; --metric-accent: var(--eminence-700);
  /* component */         --metric-value-fs:32px; --metric-radius:14px; --metric-pad:16px;
}
[data-theme="ujg"] { --metric-surface:#0A0A0A; --metric-accent: var(--gold-500);
                     --metric-pos: var(--gold-500); }
```

*   **Formatter memoization + injection** — `Intl.NumberFormat` construction is expensive; memoize one formatter per (locale, style) and reuse across every card in the grid instead of constructing per-render. Inject the formatter so tests and SSR are deterministic across timezones/locales.
*   **Polarity as a first-class domain concept** — store `higherIsBetter` (and optional thresholds) on the _metric definition_, not the component call site, so revenue vs. churn tone is correct everywhere the metric appears (card, table, alert) from one source of truth.
* * *

## 14\. Performance & Bundle Cost
*   **Animate only compositor properties.** Count-up and value-flash must animate `transform`/`opacity` (and update `textContent`), never `width`/`top`/layout properties — a row of live tiles animating layout will jank the whole dashboard. The number text update itself is cheap; the _decoration_ is where jank hides.
*   **Reuse** **`Intl.NumberFormat`** **instances.** Constructing a formatter is one of the most expensive things you can do per render; a 6-card grid re-rendering on every live tick can build dozens of formatters/second. Memoize per (locale, options) and share. This is the single biggest metric-card perf win.
*   **Tree-shake the icon/chart imports.** Import `TrendingUp` from `lucide-react/icons/trending-up`, not the barrel; never pull a full charting library (Recharts/Chart.js, 40–150KB) just to draw a 6-point sparkline — hand-roll the `<polyline>` (a few lines, zero deps) or use a micro-sparkline lib.
*   **Virtualize / lazy-load off-screen tiles.** A dashboard with dozens of metric cards (or a scrolling report) should defer count-up and sparkline rendering until the card enters the viewport (`IntersectionObserver`), and virtualize long grids so you're not mounting 200 SVGs at once.
*   **Debounce live updates before render.** Coalesce high-frequency stream events (e.g. `requestAnimationFrame`\-batched or ~250ms debounce) so 20 ticks/second become a handful of renders; unbatched live updates are a re-render storm across the whole strip.
*   **SSR the first value.** Render the correct number server-side (Next.js RSC) so there's no loading-flash → layout-shift on first paint; hydrate the live subscription after.
* * *

## 15\. Security
Standalone. A metric card is display-only, but it renders _values from a server_ and often _gates business-sensitive numbers_ — so its surface is real, not zero.

*   **Attack surface: injected content via the value/label.** If the label or an AI-generated "why" annotation is interpolated as HTML (`innerHTML`, `dangerouslySetInnerHTML`, `v-html`), a malicious metric name or annotation can inject script (**XSS**). Fix: render values and labels as **text nodes** (`textContent`, React/Vue default escaping), never as raw HTML. The SVG sparkline points come from numbers — coerce with `Number()` and drop non-finite values so a poisoned data point can't break out of the attribute.
*   **Server-side validation & authorization (the real risk).** The number itself is the sensitive asset. The endpoint behind the card must **authorize per request** — a user must not be able to fetch `/metrics/mrr` for a tenant/org they can't see by editing the URL. Enforce tenant scoping and RBAC on the server; the client component is not a security boundary. Validate the metric key server-side (allow-list, as in §9.14) so arbitrary keys can't probe internal data.
*   **Don't leak precision or PII in the payload.** A card showing "Active users: 12k" should not ship the _list of users_ to the client in the same response "just in case." Send only the aggregate the card displays; over-fetching turns a harmless tile into a data-exfiltration vector.
*   **Rate-limit the live stream.** An SSE/WebSocket metric feed is an authenticated resource — rate-limit and auth it, and re-check authorization on reconnect, so a dropped-and-reopened stream can't become an unauthenticated firehose.

Bottom line: the _pixels_ are low-risk; the _data pipe and the authorization behind it_ are where a metric card gets a company in trouble. Treat the endpoint as the security boundary, escape all rendered text, and never trust the client to scope the query.
* * *

## 16\. Senior-Level Checklist
Ship-ready gate — every item non-negotiable:

*   **Semantics:** label programmatically tied to value (`<dl>`/`aria-labelledby`); card is `<article>` (or `<a>`/`<button>` if it drills down), not a bare `<div>`.
*   **Value readability:** precise value available to AT even when compact notation is shown; `tabular-nums` set; formatted through one `Intl` source of truth.
*   **Delta integrity:** direction carried by sign + arrow + sr-only word, never color alone; polarity (`higherIsBetter`) modeled so rising churn reads as bad.
*   **Empty vs zero:** explicit empty/no-data state distinct from a real `0`.
*   **Loading & error:** skeleton reserves height (no layout shift); error keeps the label and offers retry; `aria-busy` wired.
*   **Keyboard & focus:** if interactive, whole card is one tab stop with a visible 2px focus ring; if static, it's correctly _not_ focusable.
*   **Contrast & target size:** value ≥ 4.5:1; drill-down hit target ≥ 44×44px on the whole card.
*   **Motion:** count-up, flash, and shimmer all respect `prefers-reduced-motion`.
*   **Live discipline:** `aria-live="polite"` + `aria-atomic`, throttled announcements, assertive reserved for real threshold alerts.
*   **Performance:** `Intl` formatters memoized/shared; only compositor properties animated; sparkline has no heavy chart dependency.
*   **Security:** text-node rendering (no `innerHTML`), server-side authz + key allow-list on the metric endpoint, aggregate-only payloads.
*   **Localization:** locale-aware formatting (separators, currency, percent) verified in at least one non-en locale.
* * *

## 17\. Visual Styles
The same semantic tile across the 11 core skins — described specifically for THIS component (value + label + delta + sparkline):

*   **Flat** — solid card surface, no shadow, crisp 1px hairline or none; the big number in a bold flat weight, delta as a plain colored `▲ +12%`, sparkline a single flat-stroke polyline. Reads instantly, scales to hundreds of tiles.
*   **Material** — elevation-1 surface with a soft ambient shadow, the value in a `display` type token, the delta as an MD3 tonal chip, sparkline in the primary color; press/hover ripple only if the card is a drill-down.
*   **Glassmorphism** — translucent card with `backdrop-filter: blur()` over a vivid dashboard background; the number sits on frosted glass, the sparkline glows faintly through it. Watch value contrast hard — frosted backgrounds routinely drop the number below 4.5:1.
*   **Liquid Glass (2026, Apple iOS 26 / macOS Tahoe)** — the tile is a refractive material: the big number floats on glass that bends the wallpaper behind it with a specular rim, and the sparkline picks up a moving sheen. Pill-soft corners, reactive to scroll/motion; the value must stay legible as the background shifts.
*   **Neumorphism** — the card is a soft same-color extrusion, the sparkline drawn as an _inset_ engraved groove and the value debossed into the surface. Beautiful but contrast-poor — only viable for a decorative hero tile, never a dense data strip.
*   **Skeuomorphism** — a physical "gauge readout" look: beveled card edge, inner highlight, the number like an LCD/odometer with a subtle inner shadow, the delta arrow as a glossy 3D chevron.
*   **Neo-Brutalism** — thick black border, hard offset drop shadow, zero radius, clashing accent; the number huge and unapologetic, the delta a boxed `+12%` token, the sparkline a chunky 3px stroke. Maximum dashboard personality.
*   **Claymorphism** — puffy rounded card with inner top-light and bottom-shadow, the value soft and friendly, the delta arrow a rounded pill, the sparkline a thick rounded-cap line. Approachable, consumer-app energy.
*   **Aurora / Gradient** — animated multi-hue gradient card (or gradient number fill) on dark, the sparkline stroke a gradient, delta glowing. Premium/marketing "results" strips; honor `prefers-reduced-motion` and keep the number a solid legible color, not a low-contrast gradient.
*   **Minimal / Swiss** — no card chrome at all; a `dl` of label + number separated by whitespace and a hairline rule, the delta a small superscript, sparkline omitted or one thin line. Typography and grid do everything.
*   **UJG Brand** — Goldenrod (`#DCA424`) value on deep Eminence/Night (`#5F2C82` / `#0A0A0A`) surface, Methanerse display type for the number, Platinum label, the positive delta in Goldenrod and negative in Spanish Orange, sparkline in a warm gold stroke with a soft glow. The house default.

**Rule that never changes:** the style is skin. Across all eleven, the metric card's semantics (label ↔ value association), the sign-plus-text delta, the precise-value alternative for AT, the focus ring on a drill-down, and the 44px target stay identical. Skin is negotiable; the skeleton is not.