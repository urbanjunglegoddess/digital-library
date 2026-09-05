# Chart/Graph (Full Build)

# The Chart/Graph: A Senior Engineer's Complete Breakdown
The data visualization component containers for bar, line, pie, and area charts. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you configure chart type, data series, axes, tooltips, and responsive behavior, then output code for every target.

**Audit a chart:** the companion audit checks data table alternative, color-blind safety, axis labeling, tooltip keyboard access, and reduced-motion compliance, then exports a client-ready report.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Chart Component Actually Is
A **chart** (graph, data visualization) is a visual representation of data using geometric shapes (bars, lines, arcs, points) to reveal patterns, trends, and comparisons. As a component library asset, this doc covers the **reusable container and structure**: axes, legends, tooltips, states, and accessibility patterns that every chart type shares.

**Chart (this doc):** the reusable frame (axes, legend, tooltip, states). Applied across: bar, line, pie, donut, area, scatter.
**Data Grid/Table:** tabular data. Charts are the visual alternative.
**Infographic:** custom one-off visual. Not reusable.
**Sparkline:** a tiny inline chart (no axes, no legend). A miniature variant.
* * *

## 2\. Why It Matters
**Data storytelling.** Numbers in a table require mental effort. A chart reveals the story instantly: "Revenue is growing," "Signups spike on Tuesdays," "Category A dominates."
**Decision support.** Dashboards, analytics, and reporting all depend on charts. A bad chart (confusing axes, misleading scale, no accessible alternative) leads to bad decisions.
**Accessibility is the missing layer.** Charts are among the LEAST accessible components on the web. A screen-reader user sees nothing unless you provide a data table alternative or structured descriptions.
* * *

## 3\. Anatomy
**Chart container:** the bounding box. Fixed aspect ratio or responsive width with min-height.
**Title (optional):** what the chart shows. Should be a complete sentence-like statement ("Monthly revenue, Jan–Jun 2026").
**Axes (X/Y):** labeled scales. X is typically time/categories; Y is the value. Grid lines help read values.
**Axis labels:** units and names ("Revenue ($K)" on Y, "Month" on X).
**Tick marks:** increments along axes.
**Grid lines (optional):** horizontal/vertical lines from ticks across the chart area. Aid value reading.
**Data series:** the visual data (bars, line, dots, arcs). Can be single or multiple series.
**Legend:** color-coded key identifying each series. Clickable to toggle visibility.
**Tooltip:** detail popup on hover/focus showing exact values for a data point.
**Annotations (optional):** callouts highlighting specific points ("Record high").
**Empty state:** "No data available" when there's nothing to chart.
**Loading state:** skeleton or spinner in the chart area.
**Error state:** "Failed to load data" with retry.
* * *

## 4\. Sizes / Scale

| Token | Min Height | Aspect Ratio | Use |
| ---| ---| ---| --- |
| S | 160px | 2:1 | Sparkline-adjacent, sidebar |
| M | 280px | 16:9 | Default dashboard card |
| L | 400px | 16:9 | Feature chart, full-width |
| XL | 500px | 4:3 | Analytics page, detailed |

Width: 100% parent (fluid). The chart reflows with container width.

Pie/Donut: typically 1:1 aspect ratio. Size by diameter (200-400px).
* * *

## 5\. States
**Loading:** skeleton chart area (axis lines + placeholder shapes) or centered spinner.
**Populated:** chart rendered with data.
**Empty/No data:** empty state message with illustration.
**Hover (tooltip):** hovering a data point shows exact value(s) in a tooltip.
**Focused (keyboard):** data points navigable with arrows. Focused point shows tooltip.
**Series toggled:** clicking a legend item hides/shows its data series.
**Filtered:** external filter changes the visible data range. Chart animates to new state.
**Error:** data fetch failed. Error message with retry.
**Animating:** entrance animation when the chart first renders (bars grow up, line draws, slices expand). Must respect `prefers-reduced-motion`.
* * *

## 6\. Types / Variants
**Bar (vertical):** comparing values across categories. The default for "which is bigger?"
**Bar (horizontal):** for long category labels or many categories.
**Stacked bar:** parts of a whole within each category.
**Grouped bar:** side-by-side bars within each category (comparing series).
**Line:** trend over time. Single or multi-series.
**Area:** line with filled area below. Emphasizes volume.
**Stacked area:** multiple series stacked (total shown by top edge).
**Pie:** parts of a whole (one data set). Limit to 5-7 slices max.
**Donut:** pie with a hole. The center can hold a total/label.
**Scatter:** two-variable relationship (X vs Y values per point).
**Sparkline:** tiny inline chart (no axes, no labels). Trend indication only.
**Combo:** mixed types (bars + line on the same chart, dual Y-axis).
* * *

## 7\. When to Use (and When Not To)
**Use a chart when:**
*   Visualizing trends, comparisons, or distributions
*   The shape/pattern is more informative than the raw numbers
*   Users need to spot outliers or trends quickly
*   Data has 3+ data points (below that, just show the numbers)

**Use something else when:**
*   Exact values matter more than visual pattern → Table
*   Only 1-2 data points → just show the number with a label
*   Data is hierarchical → Tree map
*   Geographic → Map visualization
*   The chart would be misleading (truncated axis, cherry-picked range)
* * *

## 8\. Across Design Systems
**Chart.js:** the most popular open-source charting library. Canvas-based, lightweight (~60KB), good out-of-the-box.
**D3.js:** the most powerful/flexible. SVG-based, low-level (you build everything). Maximum control, maximum effort.
**Recharts:** React-specific, built on D3. Composable API with React components.
**Nivo:** React, built on D3. Beautiful defaults, many chart types, accessible.
**Visx (Airbnb):** React + D3 primitives. Low-level composability.
**Apache ECharts:** full-featured, canvas-based, excellent for dashboards.
**Plotly:** scientific/statistical charting. Excellent for complex visualizations.
**Tremor:** React charting components designed for dashboards. Simple API, good defaults.
* * *

## 9\. The Code
### 9.1 Chart.js (bar chart with accessible wrapper)

```plain
<figure class="chart-container" role="figure" aria-label="Monthly revenue, Jan-Jun 2026">
  <canvas id="revenue-chart"></canvas>
  <!-- Accessible data table alternative -->
  <details class="chart-table">
    <summary>View data as table</summary>
    <table aria-label="Monthly revenue data">
      <thead><tr><th>Month</th><th>Revenue ($K)</th></tr></thead>
      <tbody>
        <tr><td>January</td><td>42</td></tr>
        <tr><td>February</td><td>55</td></tr>
        <tr><td>March</td><td>48</td></tr>
        <tr><td>April</td><td>71</td></tr>
        <tr><td>May</td><td>63</td></tr>
        <tr><td>June</td><td>89</td></tr>
      </tbody>
    </table>
  </details>
</figure>
```

```javascript
new Chart(document.getElementById('revenue-chart'), {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue ($K)',
      data: [42, 55, 48, 71, 63, 89],
      backgroundColor: 'oklch(42% 0.14 305)',
      borderRadius: 4,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Revenue ($K)' } },
      x: { title: { display: true, text: 'Month' } }
    },
    animation: {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750
    }
  }
});
```

### 9.2 React (Recharts)

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartData { name: string; value: number; }

interface RevenueChartProps {
  data: ChartData[];
  title: string;
}

export function RevenueChart({ data, title }: RevenueChartProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <figure role="figure" aria-label={title}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(30% 0.02 305)" />
          <XAxis dataKey="name" stroke="oklch(60% 0.01 305)" />
          <YAxis stroke="oklch(60% 0.01 305)" />
          <Tooltip
            contentStyle={{ background: 'oklch(18% 0.015 305)', border: '1px solid oklch(30% 0.02 305)', borderRadius: 8 }}
            labelStyle={{ color: 'oklch(90% 0.01 305)' }}
          />
          <Bar dataKey="value" fill="oklch(42% 0.14 305)" radius={[4, 4, 0, 0]}
               isAnimationActive={!prefersReducedMotion} />
        </BarChart>
      </ResponsiveContainer>

      {/* Accessible alternative */}
      <details className="chart-table">
        <summary>View as table</summary>
        <table aria-label={title}>
          <thead><tr><th>Category</th><th>Value</th></tr></thead>
          <tbody>
            {data.map(d => <tr key={d.name}><td>{d.name}</td><td>{d.value}</td></tr>)}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
```

### 9.3 SwiftUI (Swift Charts)

```swift
import SwiftUI
import Charts

struct RevenueChartView: View {
    let data: [ChartDataPoint]

    struct ChartDataPoint: Identifiable {
        let id = UUID()
        let name: String
        let value: Double
    }

    var body: some View {
        VStack(alignment: .leading) {
            Text("Monthly Revenue")
                .font(.headline)
                .accessibilityAddTraits(.isHeader)

            Chart(data) { point in
                BarMark(
                    x: .value("Month", point.name),
                    y: .value("Revenue", point.value)
                )
                .foregroundStyle(Color.purple.gradient)
                .cornerRadius(4)
            }
            .frame(height: 250)
            .chartYAxis { AxisMarks(position: .leading) }
            .accessibilityLabel("Bar chart showing monthly revenue")
            .accessibilityElement(children: .combine)
        }
        .padding()
    }
}

// Usage:
// RevenueChartView(data: [
//   .init(name: "Jan", value: 42), .init(name: "Feb", value: 55),
//   .init(name: "Mar", value: 48), .init(name: "Apr", value: 71),
// ])
```

### 9.4 Jetpack Compose (Vico library)

```kotlin
// Using Vico (popular Compose charting library)
import com.patrykandpatrick.vico.compose.cartesian.*
import com.patrykandpatrick.vico.core.cartesian.data.*

@Composable
fun RevenueChart(data: List<Pair<String, Float>>) {
    Column(modifier = Modifier.semantics { contentDescription = "Bar chart: Monthly revenue" }) {
        Text("Monthly Revenue", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(bottom = 16.dp))

        val chartEntryModel = entryModelOf(*data.mapIndexed { i, (_, v) -> entryOf(i, v) }.toTypedArray())

        CartesianChartHost(
            chart = rememberCartesianChart(
                rememberColumnCartesianLayer(),
                startAxis = rememberStartAxis(),
                bottomAxis = rememberBottomAxis(valueFormatter = { value, _ -> data.getOrNull(value.toInt())?.first ?: "" })
            ),
            model = chartEntryModel,
            modifier = Modifier.fillMaxWidth().height(250.dp)
        )

        // Accessible data table (hidden visually, available to AT)
        data.forEach { (name, value) ->
            Row(modifier = Modifier.semantics { contentDescription = "$name: $${value.toInt()}K" }.height(0.dp)) {}
        }
    }
}

// Alternative: using MPAndroidChart via AndroidView for more chart types
```

### 9.5 Flutter (fl\_chart)

```dart
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class RevenueChart extends StatelessWidget {
  final List<ChartData> data;
  final String title;

  const RevenueChart({super.key, required this.data, required this.title});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Bar chart: $title',
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        SizedBox(
          height: 250,
          child: BarChart(
            BarChartData(
              barGroups: data.asMap().entries.map((entry) => BarChartGroupData(
                x: entry.key,
                barRods: [BarChartRodData(
                  toY: entry.value.value,
                  color: const Color(0xFF5F2C82),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                  width: 20,
                )],
              )).toList(),
              titlesData: FlTitlesData(
                bottomTitles: AxisTitles(sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (value, meta) => Text(data[value.toInt()].name, style: const TextStyle(fontSize: 11)),
                )),
                leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              borderData: FlBorderData(show: false),
              gridData: FlGridData(drawVerticalLine: false),
            ),
          ),
        ),
        // Accessible data table
        ExpansionTile(
          title: const Text('View as table', style: TextStyle(fontSize: 12)),
          children: [
            DataTable(
              columns: const [DataColumn(label: Text('Month')), DataColumn(label: Text('Revenue'))],
              rows: data.map((d) => DataRow(cells: [DataCell(Text(d.name)), DataCell(Text('\$${d.value.toInt()}K'))])).toList(),
            ),
          ],
        ),
      ]),
    );
  }
}

class ChartData { final String name; final double value;
  ChartData({required this.name, required this.value}); }
```

### 9.6 Testing

```typescript
describe("Chart", () => {
  it("has a data table alternative for accessibility", () => {
    render(<RevenueChart data={mockData} title="Revenue" />);
    expect(screen.getByRole('table', { name: /revenue/i })).toBeInTheDocument();
  });

  it("figure has aria-label with chart title", () => {
    render(<RevenueChart data={mockData} title="Monthly revenue" />);
    expect(screen.getByRole('figure', { name: /monthly revenue/i })).toBeInTheDocument();
  });

  it("respects prefers-reduced-motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    render(<RevenueChart data={mockData} title="Revenue" />);
    // Animation should be disabled
  });
});
```

* * *

## 10\. Accessibility
### The fundamental problem
Charts are **visual by nature.** A bar chart is meaningless to someone who can't see it. Unlike most components where ARIA can bridge the gap, charts need a **fundamentally different representation** for non-visual access.
### Solution 1: Data table alternative (required)
Every chart MUST have a data table alternative. Options:
*   `<details><summary>View as table</summary><table>...</table></details>` (collapsible, always available)
*   A visible table below/beside the chart
*   A "Download data" link to CSV
*   Wire the chart to its table with `aria-describedby` — e.g. `<canvas role="img" aria-label="..." aria-describedby="revenue-table">` pointing at the `id` of the data `<table>` — so assistive tech announces the table as the chart's description
### Solution 2: Structured description
`role="figure"` + `aria-label="Monthly revenue chart showing growth from $42K in January to $89K in June"` provides a text summary of the trend. This helps AT users understand the _story_ without reading every data point.
### Solution 3: Focusable data points
For interactive charts (SVG-based), make data points focusable:

```plain
<circle cx="100" cy="50" r="5" tabindex="0" role="img" aria-label="March: $48K" />
```

Arrow keys navigate between points. Tooltip announces on focus.
### Color-blind safety
Chart series colors must be distinguishable for all color vision types. Solutions:
*   Use patterns/textures in addition to color (stripes, dots, crosshatch)
*   Ensure each series has a distinct label in the legend
*   Test with a colorblindness simulator (Sim Daltonism)
*   Use a colorblind-safe palette (Okabe-Ito, ColorBrewer)
### Reduced motion
Entrance animations (bars growing, line drawing) must be disabled under `prefers-reduced-motion`. Chart appears in its final state instantly.
### Legend interactivity
Clickable legend items (to toggle series) must be keyboard-accessible (Enter/Space to toggle, focus ring visible).
* * *

## 11\. Innovative / Emerging Ideas
*   **AI-generated chart insights:** automatic annotations ("Revenue peaked in June, +47% vs. January")
*   **Natural language querying:** "Show me revenue by month" generates the chart
*   **Animated transitions between chart types:** bar → line → pie with smooth morphing
*   **Real-time streaming charts:** data updates live via WebSocket
*   **Responsive chart reflow:** complex chart on desktop, simplified/smaller on mobile (not just shrunk)
*   **Voice descriptions:** audio narration of chart trends for accessibility
* * *

## 12\. Conversion / UX Killers
*   **No accessible alternative:** screen-reader users get nothing. Legal liability (WCAG failure).
*   **Misleading axis (truncated Y-axis):** not starting at zero exaggerates differences.
*   **Too many series:** 10 lines on one chart is unreadable. Limit to 4-5 or allow series toggling.
*   **Color-only series differentiation:** colorblind users can't distinguish series.
*   **Tiny text on axes:** illegible on mobile or retina screens.
*   **No empty state:** chart area is blank when no data exists. Show "No data" message.
*   **No loading state:** chart jumps in after a delay with no indication something was loading.
*   **Pie charts with 15 slices:** unreadable. Limit to 5-7 slices; group the rest as "Other."
* * *

## 13\. Advanced Patterns
**Responsive resize with debounce:**

```typescript
useEffect(() => {
  const observer = new ResizeObserver(debounce(([entry]) => {
    setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
  }, 100));
  observer.observe(containerRef.current!);
  return () => observer.disconnect();
}, []);
```

**Dual Y-axis (combo chart):**
One series on the left axis, another on the right. Useful for comparing metrics with different scales (revenue in $K + growth rate in %).

**Drill-down:** clicking a bar/slice filters to a sub-dataset (click "March" to see daily breakdown).
* * *

## 14\. Performance & Bundle Cost
*   **Chart.js:** ~60KB gzipped (all chart types). Tree-shakeable to ~35KB for one type.
*   **D3:** ~25KB core, but you build everything yourself.
*   **Recharts:** ~45KB for common chart types.
*   **Canvas vs. SVG:** Canvas is faster for many data points (1000+). SVG is better for accessibility (focusable elements) and small datasets.
*   **Lazy-load charts below the fold.** Use Intersection Observer to render only when visible.
*   **Memoize chart config.** Don't recreate the chart on every render. Only update data.
* * *

## 15\. Security
*   **XSS in axis labels/tooltips.** If chart labels come from user input or API data, sanitize.
*   **Data leakage.** The chart API should only return data the user is authorized to see.
*   **Export/download:** if offering CSV/image export, validate it doesn't include data from other users.
* * *

## 16\. Senior-Level Checklist
- [ ] Data table alternative always available
- [ ] `role="figure"` + `aria-label` with trend summary
- [ ] Color palette is colorblind-safe (not color-only)
- [ ] Legends and series have patterns/labels as backup
- [ ] Tooltip keyboard-accessible (focusable points)
- [ ] Legend items keyboard-toggleable
- [ ] Axes labeled with units
- [ ] Y-axis starts at zero (unless explicitly justified)
- [ ] `prefers-reduced-motion`: no entrance animation
- [ ] Responsive: chart resizes or adapts to container
- [ ] Loading state before data arrives
- [ ] Empty state when no data
- [ ] Error state with retry
- [ ] Pie/donut limited to 5-7 slices
- [ ] Chart library tree-shaken to minimize bundle
* * *

## 17\. Visual Styles
**Flat:** clean axes, solid-fill bars/areas, no gradients. Crisp and readable.
**Material:** M3 color roles for series. Rounded bar corners. Subtle grid lines.
**Glassmorphism:** chart on a frosted panel. Series have slight transparency.
**Liquid Glass:** chart area uses glass material. Bars/lines have specular highlights.
**Neumorphism:** chart area inset into soft surface. Bars appear raised.
**Skeuomorphism:** graph-paper texture background. Handwritten-style annotation fonts.
**Neo-Brutalism:** thick axis lines, bold bar colors, hard shadows on bars.
**Claymorphism:** puffy rounded bars, soft area fills, friendly palette.
**Aurora/Gradient:** series fills are subtle gradients. Grid lines pulse gently.
**Minimal/Swiss:** hairline axes, no grid, thin lines, maximum data-ink ratio.
**UJG Brand:** Night background, Eminence/Goldenrod/Spanish Orange as series colors, Platinum axes.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).