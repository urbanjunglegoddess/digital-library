# Timeline (Full Build)

# The Timeline: A Senior Engineer's Complete Breakdown
The component that shows events in chronological sequence connected by a visual thread. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle orientation, density, status states, and content variants, then output code for every target.

**Audit a timeline:** the companion audit checks semantic list structure, status communication, connector accessibility, and responsive behavior, then exports a client-ready report.

This doc follows the Private ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).

* * *
## 1\. What a Timeline Actually Is
A **timeline** is a vertical (or horizontal) sequence of events connected by a visual line, showing chronological progression. Each event has an indicator (dot, icon, or avatar), content (text, card, or rich media), and optionally a timestamp.

The distinctions people confuse:

**Timeline (this doc):** chronological sequence of _past or ongoing_ events with visual connectors. Activity logs, order tracking, project history, changelogs.
**Stepper/Wizard:** shows _future steps_ in a process the user is completing now. The user is an actor; in a timeline, the user is an observer.
**List:** a flat sequence without visual connectors or temporal emphasis. No inherent time relationship.
**Feed/News Feed:** reverse-chronological content stream. Infinite, scrollable, real-time. A timeline is finite and bounded.
**Gantt chart:** time-based project planning. Horizontal bars showing duration. Different visualization entirely.

The through-line: a timeline takes raw event data and turns it into a **scannable narrative**. The connectors, indicators, and timestamps create the visual sentence "this happened, then this, then this."

* * *
## 2\. Why It Matters
**Activity tracking.** Every SaaS app needs an activity log: who did what, when. Without a timeline component, it's a table. With one, it's a story.

**Order/delivery tracking.** E-commerce order status (Placed → Processing → Shipped → Delivered) is a timeline. It's the primary UX for "where is my package" and directly impacts support ticket volume. A clear timeline = fewer support requests.

**Onboarding progress.** Showing users what they've completed and what's ahead reduces churn. The timeline makes progress _visible_.

**Storytelling.** "About us" pages, company history, product changelogs. The timeline format creates narrative momentum that a flat list doesn't.

**Debugging/auditing.** Developer tools, audit logs, deployment history. When you need to understand a sequence of events, the timeline is the natural visualization.

* * *
## 3\. Anatomy
**Connector line:** the vertical (or horizontal) line linking events. The visual thread that creates the "timeline" metaphor. Can be solid (completed), dashed (upcoming), or colored by status.

**Event indicator:** the marker at the junction of the connector and the content. Options: dot (simple), icon (semantic: check, alert, user), avatar (who did it), number (step count), or color-coded circle (status).

**Content block:** the event description. Can be as simple as one line of text, or as complex as a card with title, body, metadata, and actions.

**Timestamp:** the when. Positioned above, beside, or opposite the content. Can be relative ("2 hours ago"), absolute ("Jul 22, 2026"), or both.

**Status styling:** visual encoding of event state:
*   Completed: solid connector, filled indicator, full-opacity content
*   Active/Current: highlighted indicator (pulsing, larger, or brand-colored), emphasized content
*   Upcoming: dashed/light connector, outlined/muted indicator, muted content
*   Error: red indicator, error icon, alert-styled content

**Tail (optional):** a short connector at the end that fades out, indicating "more events may come."

* * *
## 4\. Sizes / Scale

| Token | Indicator | Connector W | Content Gap | Line H (between items) | Use |
| ---| ---| ---| ---| ---| --- |
| S | 12px dot | 1.5px | 12px | 24px | Dense activity logs, sidebar |
| M | 20px (dot/icon) | 2px | 16px | 32px | Default |
| L | 32px (icon/avatar) | 2.5px | 20px | 40px | Feature timelines, marketing |
| XL | 48px (avatar/badge) | 3px | 24px | 48px | Hero/storytelling timelines |

Content block: unconstrained width (fills available space). For alternating layouts, each side gets 50% minus the indicator column.

The indicator column (indicator + connector) is typically 40-80px wide, positioned left (default), centered (alternating), or inline (compact).

* * *
## 5\. States
**Completed:** the event has happened. Solid connector line above it, filled indicator (often with a check icon), full-opacity content. The connector between two completed events is solid and colored.

**Active/Current:** the event is happening now. Indicator is highlighted (brand color, slightly larger, or with a pulsing ring animation). Content may be emphasized (bolder, outlined card). The connector above is solid; the connector below is dashed or lighter ("not yet done").

**Upcoming/Pending:** the event hasn't happened yet. Dashed or light-gray connector, outlined/hollow indicator, muted content (lower opacity or lighter text). Signals "this will happen next."

**Error:** something went wrong at this step. Red indicator with error/warning icon, connector may turn red or stop. Content explains the failure. Used in deployment timelines, order tracking ("Delivery failed").

**Skipped:** a step that was bypassed. Crossed-out or dimmed indicator with a skip icon. Connector passes through without stopping.

**Loading:** the timeline is fetching more events. Show a skeleton item at the end (pulsing placeholder indicator + text lines).

**Empty:** no events yet. Show an empty state ("No activity yet") with an illustration or a single dashed line.

**Expanded/Collapsed (per item):** some timeline items have additional detail that can be toggled. An expand/collapse control reveals more content without navigating away.

* * *
## 6\. Types / Variants
**Vertical left-aligned (default):** indicator column on the left, content on the right. The most common layout. Works at all screen sizes.

**Vertical alternating (zigzag):** content alternates left and right of a centered connector line. Creates visual rhythm and uses horizontal space better on desktop. Collapses to left-aligned on mobile.

**Vertical centered:** indicators centered with content extending both sides. Similar to alternating but both sides visible simultaneously (for comparing parallel tracks).

**Horizontal:** events laid out left-to-right along a horizontal line. Good for 3-7 events (more gets crowded). Often used for order tracking (Placed → Shipped → Delivered). Responsive: stacks to vertical on narrow screens.

**Compact/Inline:** minimal styling. Just a list with small dot indicators and timestamps. No cards, no large indicators. For dense logs.

**Grouped:** events grouped by date ("Today", "Yesterday", "July 20") with group headers between clusters.

**Interactive:** events are clickable/expandable. Clicking reveals detail, navigates to a detail page, or opens a panel.

**Real-time/Streaming:** new events appear at the top (or bottom) as they happen. Animated entrance. Used in live activity feeds.

**With branches:** the timeline forks (parallel tracks, concurrent events). Complex; shows events happening simultaneously on different tracks.

* * *
## 7\. When to Use (and When Not To)
**Use a timeline when:**
*   Events have a clear chronological order
*   The sequence/progression is the information (not just the data)
*   Users need to understand what happened in what order
*   You're tracking status through stages (order tracking, deployment pipeline)
*   The number of events is bounded and finite (not infinite scroll)

**Use something else when:**
*   Events are independent (no sequence matters) → Cards or List
*   The data is tabular (many fields per event) → Table/Data Grid
*   It's an infinite real-time stream → Feed/News Feed
*   Users need to _plan_ future time → Calendar or Gantt
*   There are only 3-5 _future_ steps the user takes → Stepper
*   You're showing concurrent events on parallel tracks with duration → Gantt chart

* * *
## 8\. Across Design Systems
**Material Design:** No dedicated timeline component in M3. Teams build custom using `Stepper` as a base or compose from primitives. The Material Design guidelines suggest using a "vertical stepper" variant for activity-style timelines.

**Apple HIG:** No explicit timeline component. Built custom. The closest native pattern is the Mail thread view or the Health app's timeline graphs.

**Ant Design:** `<Timeline>` component with `<Timeline.Item>`. Supports `color` (status), `dot` (custom indicator), `pending` (last item loading), and `mode` (left/right/alternate). One of the most complete timeline APIs.

**Chakra UI:** No built-in; community recipes compose from `VStack` + custom CSS.

**MUI:** `<Timeline>` with `<TimelineItem>`, `<TimelineSeparator>` (dot + connector), `<TimelineContent>`, and `<TimelineOppositeContent>`. Supports left, right, and alternating alignment.

**Fluent:** No dedicated timeline. Built custom from `List` + `Persona` + dividers.

**Tailwind UI:** Timeline examples in their component gallery but no headless component.

* * *
## 9\. The Code
### 9.1 HTML (semantic, accessible)

```plain
<section aria-label="Order history"><ol class="timeline">
    <li class="timeline__item timeline__item--completed">
      <div class="timeline__indicator" aria-hidden="true">
        <svg><!-- check icon --></svg>
      </div>
      <div class="timeline__connector" aria-hidden="true"></div>
      <div class="timeline__content">
        <time class="timeline__time" datetime="2026-07-20T09:15:00">Jul 20, 9:15 AM</time>
        <h3 class="timeline__title">Order placed</h3>
        <p class="timeline__body">Order #4821 confirmed. Payment processed.</p>
      </div>
    </li>
    <li class="timeline__item timeline__item--completed">
      <div class="timeline__indicator" aria-hidden="true">
        <svg><!-- check icon --></svg>
      </div>
      <div class="timeline__connector" aria-hidden="true"></div>
      <div class="timeline__content">
        <time class="timeline__time" datetime="2026-07-20T14:30:00">Jul 20, 2:30 PM</time>
        <h3 class="timeline__title">Shipped</h3>
        <p class="timeline__body">Package picked up by carrier. Tracking: 1Z999AA10123456784</p>
      </div>
    </li>
    <li class="timeline__item timeline__item--active" aria-current="step">
      <div class="timeline__indicator" aria-hidden="true">
        <svg><!-- truck icon --></svg>
      </div>
      <div class="timeline__connector timeline__connector--dashed" aria-hidden="true"></div>
      <div class="timeline__content">
        <time class="timeline__time" datetime="2026-07-22T10:00:00">Jul 22, 10:00 AM</time>
        <h3 class="timeline__title">In transit</h3>
        <p class="timeline__body">Package is on the way. Estimated delivery: Jul 23.</p>
      </div>
    </li>
    <li class="timeline__item timeline__item--upcoming">
      <div class="timeline__indicator" aria-hidden="true">
        <svg><!-- home icon --></svg>
      </div>
      <div class="timeline__content">
        <h3 class="timeline__title">Delivered</h3>
        <p class="timeline__body">Expected Jul 23</p>
      </div>
    </li>
  </ol>
</section>
```

Key HTML decisions:
*   **`<ol>`** (ordered list) communicates sequence semantically. Screen readers announce "list, 4 items" which implies order.
*   **`<li>`** per event. AT announces position ("1 of 4").
*   **`<time datetime="...">`** machine-readable timestamps.
*   **`aria-current="step"`** on the active item. AT announces which event is current.
*   **Indicators and connectors are** **`aria-hidden="true"`** since they're decorative. The status information is carried by the content text and class-driven sr-only labels.
*   **Status conveyed in text:** "Order placed" (completed), "In transit" (active). Don't rely on dot color alone.
### 9.2 CSS

```css
.timeline {
  list-style: none;
  padding: 0;
  position: relative;
}

.timeline__item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 0 16px;
  padding-bottom: 32px;
  position: relative;
}

/* Connector line */
.timeline__item::before {
  content: '';
  position: absolute;
  left: 19px; /* center of 40px indicator column */
  top: 28px; /* below the indicator */
  bottom: 0;
  width: 2px;
  background: var(--connector-color, oklch(35% 0.02 305));
}

.timeline__item:last-child::before { display: none; }

.timeline__item--completed::before {
  background: var(--connector-done, oklch(42% 0.12 305));
}

.timeline__item--upcoming::before {
  background: repeating-linear-gradient(
    180deg,
    var(--connector-color) 0 4px,
    transparent 4px 8px
  );
}

/* Indicator */
.timeline__indicator {
  grid-column: 1;
  grid-row: 1;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--indicator-bg, oklch(30% 0.02 305));
  border: 2px solid var(--indicator-border, oklch(42% 0.08 305));
  color: var(--indicator-fg, oklch(70% 0.01 305));
  margin-top: 4px;
  z-index: 1;
  position: relative;
}

.timeline__item--completed .timeline__indicator {
  background: var(--indicator-done-bg, oklch(42% 0.14 305));
  border-color: var(--indicator-done-bg);
  color: #fff;
}

.timeline__item--active .timeline__indicator {
  background: var(--indicator-active-bg, oklch(78% 0.135 82));
  border-color: var(--indicator-active-bg);
  color: oklch(15% 0.01 305);
  box-shadow: 0 0 0 4px oklch(78% 0.135 82 / 0.2);
}

.timeline__item--upcoming .timeline__indicator {
  background: transparent;
  border-color: oklch(40% 0.02 305);
  color: oklch(50% 0.01 305);
}

/* Content */
.timeline__content {
  grid-column: 2;
  grid-row: 1;
  padding-top: 2px;
}

.timeline__time {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted, oklch(55% 0.01 305));
  margin-bottom: 4px;
}

.timeline__title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.timeline__body {
  font-size: 0.82rem;
  color: var(--text-secondary, oklch(70% 0.01 305));
  line-height: 1.5;
}

.timeline__item--upcoming .timeline__title,
.timeline__item--upcoming .timeline__body {
  opacity: 0.5;
}

/* Active pulse */
.timeline__item--active .timeline__indicator::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid oklch(78% 0.135 82 / 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .timeline__item--active .timeline__indicator::after { animation: none; opacity: 0.3; }
}

/* Alternating variant */
.timeline--alternate .timeline__item {
  grid-template-columns: 1fr 40px 1fr;
}

.timeline--alternate .timeline__item:nth-child(odd) .timeline__content {
  grid-column: 1;
  text-align: right;
}

.timeline--alternate .timeline__item:nth-child(odd) .timeline__indicator {
  grid-column: 2;
}

.timeline--alternate .timeline__item:nth-child(even) .timeline__content {
  grid-column: 3;
}

.timeline--alternate .timeline__item:nth-child(even) .timeline__indicator {
  grid-column: 2;
}

/* Responsive: alternating collapses to left-aligned */
@media (max-width: 640px) {
  .timeline--alternate .timeline__item {
    grid-template-columns: 40px 1fr;
  }
  .timeline--alternate .timeline__item .timeline__content {
    grid-column: 2 !important;
    text-align: left !important;
  }
  .timeline--alternate .timeline__item .timeline__indicator {
    grid-column: 1 !important;
  }
}
```

### 9.3 React + TypeScript

```typescript
import { ReactNode } from "react";

type TimelineItemStatus = "completed" | "active" | "upcoming" | "error" | "skipped";

interface TimelineEvent {
  id: string;
  status: TimelineItemStatus;
  title: string;
  body?: string;
  timestamp?: string;
  datetime?: string;
  icon?: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  variant?: "left" | "alternate";
  size?: "sm" | "md" | "lg";
  label: string;
}

export function Timeline({ events, variant = "left", size = "md", label }: TimelineProps) {
  return (
    <section aria-label={label}><ol className={`timeline timeline--${variant} timeline--${size}`}>
        {events.map((event) => (
          <li key={event.id}
              className={`timeline__item timeline__item--${event.status}`}
              aria-current={event.status === "active" ? "step" : undefined}>
            <div className="timeline__indicator" aria-hidden="true">
              {event.icon || <StatusIcon status={event.status} />}
            </div>
            <div className="timeline__content">
              {event.timestamp && (
                <time className="timeline__time" dateTime={event.datetime}>
                  {event.timestamp}
                </time>
              )}
              <h3 className="timeline__title">{event.title}</h3>
              {event.body && <p className="timeline__body">{event.body}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StatusIcon({ status }: { status: TimelineItemStatus }) {
  switch (status) {
    case "completed": return <CheckIcon />;
    case "active": return <CircleDotIcon />;
    case "error": return <AlertIcon />;
    case "skipped": return <SkipIcon />;
    default: return <CircleIcon />;
  }
}
```

### 9.4 Vue 3

```plain
<script setup lang="ts">
interface TimelineEvent {
  id: string;
  status: 'completed' | 'active' | 'upcoming' | 'error';
  title: string;
  body?: string;
  timestamp?: string;
  datetime?: string;
}

defineProps<{ events: TimelineEvent[]; label: string; variant?: 'left' | 'alternate' }>();
</script>

<template>
  <section :aria-label="label"><ol :class="['timeline', `timeline--${variant ?? 'left'}`]">
      <li v-for="event in events" :key="event.id"
          :class="['timeline__item', `timeline__item--${event.status}`]"
          :aria-current="event.status === 'active' ? 'step' : undefined">
        <div class="timeline__indicator" aria-hidden="true">
          <slot :name="`icon-${event.status}`"><StatusIcon :status="event.status" /></slot>
        </div>
        <div class="timeline__content">
          <time v-if="event.timestamp" class="timeline__time" :datetime="event.datetime">{{ event.timestamp }}</time>
          <h3 class="timeline__title">{{ event.title }}</h3>
          <p v-if="event.body" class="timeline__body">{{ event.body }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>
```

### 9.5 Svelte

```plain
<script lang="ts">
  export let events: Array<{
    id: string; status: string; title: string;
    body?: string; timestamp?: string; datetime?: string;
  }> = [];
  export let label: string;
  export let variant: 'left' | 'alternate' = 'left';
</script>

<section aria-label={label}><ol class="timeline timeline--{variant}">
    {#each events as event (event.id)}
      <li class="timeline__item timeline__item--{event.status}"
          aria-current={event.status === 'active' ? 'step' : undefined}>
        <div class="timeline__indicator" aria-hidden="true">
          <StatusIcon status={event.status} />
        </div>
        <div class="timeline__content">
          {#if event.timestamp}
            <time class="timeline__time" datetime={event.datetime}>{event.timestamp}</time>
          {/if}
          <h3 class="timeline__title">{event.title}</h3>
          {#if event.body}<p class="timeline__body">{event.body}</p>{/if}
        </div>
      </li>
    {/each}
  </ol>
</section>
```

### 9.6 SwiftUI

```swift
struct TimelineView: View {
    let events: [TimelineEvent]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(events.enumerated()), id: \.element.id) { index, event in
                HStack(alignment: .top, spacing: 12) {
                    // Indicator column
                    VStack(spacing: 0) {
                        Circle()
                            .fill(event.status.color)
                            .frame(width: 20, height: 20)
                            .overlay(event.status.icon.font(.system(size: 10)))
                        if index < events.count - 1 {
                            Rectangle()
                                .fill(event.status == .completed ? Color.purple : Color.gray.opacity(0.3))
                                .frame(width: 2)
                                .frame(maxHeight: .infinity)
                        }
                    }
                    // Content
                    VStack(alignment: .leading, spacing: 4) {
                        if let time = event.timestamp {
                            Text(time).font(.caption).foregroundColor(.secondary)
                        }
                        Text(event.title).font(.headline)
                        if let body = event.body {
                            Text(body).font(.subheadline).foregroundColor(.secondary)
                        }
                    }
                    .padding(.bottom, 24)
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("\(event.title), \(event.status.label)")
            }
        }
    }
}
```

### 9.7 Testing

```typescript
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Timeline } from "./Timeline";

const mockEvents = [
  { id: "1", status: "completed", title: "Order placed", timestamp: "Jul 20" },
  { id: "2", status: "active", title: "In transit", timestamp: "Jul 22" },
  { id: "3", status: "upcoming", title: "Delivered" },
];

describe("Timeline", () => {
  it("renders as an ordered list", () => {
    render(<Timeline events={mockEvents} label="Order history" />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("active item has aria-current=step", () => {
    render(<Timeline events={mockEvents} label="Order history" />);
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
  });

  it("timestamps use <time> with datetime", () => {
    const { container } = render(<Timeline events={mockEvents} label="Order history" />);
    const times = container.querySelectorAll("time");
    expect(times.length).toBeGreaterThan(0);
  });

  it("section has an accessible label", () => {
    render(<Timeline events={mockEvents} label="Order history" />);
    expect(screen.getByRole("region", { name: /order history/i }) ||
           screen.getByLabelText(/order history/i)).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Timeline events={mockEvents} label="Order history" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

### 9.8 Tailwind CSS

```plain
<section aria-label="Order history">
  <ol class="relative">
    <!-- Completed -->
    <li class="pb-8 pl-8 relative" aria-current="false">
      <!-- Connector -->
      <div class="absolute left-[9px] top-[28px] bottom-0 w-0.5 bg-purple-600" aria-hidden="true"></div>
      <!-- Indicator -->
      <div class="absolute left-0 top-1 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center z-10" aria-hidden="true">
        <svg class="w-3 h-3 text-white" aria-hidden="true"><!-- check --></svg>
      </div>
      <!-- Content -->
      <time class="block text-xs text-gray-500 mb-1">Jul 20, 9:15 AM</time>
      <h3 class="text-sm font-semibold text-gray-200">Order placed</h3>
      <p class="text-xs text-gray-400 mt-1">Order #4821 confirmed.</p>
    </li>
    <!-- Active -->
    <li class="pb-8 pl-8 relative" aria-current="step">
      <div class="absolute left-[9px] top-[28px] bottom-0 w-0.5 bg-gray-700 [background:repeating-linear-gradient(180deg,theme(colors.gray.700)_0_4px,transparent_4px_8px)]" aria-hidden="true"></div>
      <div class="absolute left-0 top-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center z-10 ring-4 ring-amber-400/20" aria-hidden="true">
        <svg class="w-3 h-3 text-gray-900" aria-hidden="true"><!-- truck --></svg>
      </div>
      <time class="block text-xs text-gray-500 mb-1">Jul 22, 10:00 AM</time>
      <h3 class="text-sm font-semibold text-gray-100">In transit</h3>
      <p class="text-xs text-gray-400 mt-1">Estimated delivery: Jul 23.</p>
    </li>
    <!-- Upcoming -->
    <li class="pl-8 relative opacity-50">
      <div class="absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-gray-600 z-10" aria-hidden="true"></div>
      <h3 class="text-sm font-medium text-gray-400">Delivered</h3>
      <p class="text-xs text-gray-500 mt-1">Expected Jul 23</p>
    </li>
  </ol>
</section>
```

### 9.9 Jetpack Compose

```kotlin
@Composable
fun TimelineWidget(events: List<TimelineEvent>, modifier: Modifier = Modifier) {
    Column(modifier = modifier.semantics { contentDescription = "Event timeline" }) {
        events.forEachIndexed { index, event ->
            Row(modifier = Modifier.padding(bottom = if (index < events.size - 1) 0.dp else 0.dp)) {
                // Indicator column
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(40.dp)) {
                    Box(modifier = Modifier.size(20.dp).clip(CircleShape).background(event.status.color),
                        contentAlignment = Alignment.Center) {
                        when (event.status) {
                            Status.Completed -> Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(12.dp))
                            Status.Active -> Box(Modifier.size(8.dp).background(Color.White, CircleShape))
                            else -> {}
                        }
                    }
                    if (index < events.size - 1) {
                        Box(modifier = Modifier.width(2.dp).height(48.dp)
                            .background(if (event.status == Status.Completed) Color(0xFF5F2C82) else Color.Gray.copy(alpha = 0.3f)))
                    }
                }
                // Content
                Column(modifier = Modifier.padding(start = 12.dp, bottom = 24.dp)
                    .semantics { contentDescription = "${event.title}, ${event.status.name.lowercase()}" }) {
                    event.timestamp?.let { Text(it, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                    Text(event.title, style = MaterialTheme.typography.titleSmall)
                    event.body?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                }
            }
        }
    }
}
```

### 9.10 Flutter

```dart
import 'package:flutter/material.dart';

class TimelineWidget extends StatelessWidget {
  final List<TimelineEvent> events;
  const TimelineWidget({super.key, required this.events});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Event timeline',
      child: Column(children: List.generate(events.length, (i) => _buildItem(context, events[i], i))),
    );
  }

  Widget _buildItem(BuildContext context, TimelineEvent event, int index) {
    final isLast = index == events.length - 1;
    return Semantics(
      label: '${event.title}, ${event.status.name}',
      child: IntrinsicHeight(
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Indicator column
          SizedBox(width: 40, child: Column(children: [
            Container(width: 20, height: 20,
              decoration: BoxDecoration(shape: BoxShape.circle, color: event.status.color),
              child: event.status == TimelineStatus.completed
                ? const Icon(Icons.check, size: 12, color: Colors.white)
                : null,
            ),
            if (!isLast) Expanded(child: Container(width: 2,
              color: event.status == TimelineStatus.completed ? const Color(0xFF5F2C82) : Colors.grey.shade700)),
          ])),
          // Content
          Expanded(child: Padding(
            padding: const EdgeInsets.only(left: 12, bottom: 24),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (event.timestamp != null) Text(event.timestamp!, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
              const SizedBox(height: 2),
              Text(event.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              if (event.body != null) ...[const SizedBox(height: 4),
                Text(event.body!, style: TextStyle(fontSize: 12, color: Colors.grey.shade400))],
            ]),
          )),
        ]),
      ),
    );
  }
}

enum TimelineStatus { completed, active, upcoming, error }
extension on TimelineStatus { Color get color { switch (this) {
  case TimelineStatus.completed: return const Color(0xFF5F2C82);
  case TimelineStatus.active: return const Color(0xFFDCA424);
  case TimelineStatus.upcoming: return Colors.grey.shade700;
  case TimelineStatus.error: return Colors.red;
}}}

class TimelineEvent { final String title; final String? body; final String? timestamp; final TimelineStatus status;
  TimelineEvent({required this.title, this.body, this.timestamp, required this.status}); }
```

* * *
## 10\. Accessibility
**Semantic structure:** `<ol>` (ordered list) is the correct element. The order IS the information. Screen readers announce "list, 4 items" and each item's position ("1 of 4, 2 of 4"). This communicates sequence without any visual styling.

**`aria-current="step"`** on the active/current event. AT announces "current step" so users know which event is happening now.

**Status conveyed in text:** don't rely on dot color or connector style alone. Include the status in the content ("Order placed", "In transit") or add a visually-hidden status label: `<span class="sr-only">Completed:</span> Order placed`.

**Timestamps:** use `<time datetime="...">` for machine-readable dates. Screen readers can parse and announce these in the user's preferred format.

**Decorative elements** **`aria-hidden="true"`****\*\*\*\*:** the indicator dots, connector lines, and icons are visual reinforcement. The meaning is already in the text content and list structure. Mark them `aria-hidden` so AT doesn't read "bullet, line, bullet, line."

**Interactive timelines:** if events are clickable (expanding detail, navigating to a page), make the click target a `<button>` or `<a>` within the content block. The `<li>` itself should NOT be the button (it breaks list semantics). Focus ring should be visible on the interactive element.

**Color alone:** completed (green dot) vs. error (red dot) must not be the only differentiator. Add icons (check vs. ×) that carry the meaning independent of color.

**Reduced motion:** the active-item pulse animation must be disabled under `prefers-reduced-motion`. Replace with a static ring or increased size.

**Horizontal timelines:** add `aria-orientation="horizontal"` if using a custom role, or simply ensure the list reads in the correct order in DOM. Visual layout doesn't affect AT reading order as long as DOM order is correct.

* * *
## 11\. Innovative / Emerging Ideas
*   **Animated connector fill:** the connector line "fills" with color as time passes between events (live tracking). Like a progress bar between steps.
*   **Real-time streaming:** new events animate in at the top/bottom as they happen (WebSocket). The new item slides/fades in with a highlight that fades after a few seconds.
*   **Branching timelines:** forking paths for concurrent events (CI/CD pipelines where tests and builds run in parallel). Two connector tracks that split and merge.
*   **Time-scaled spacing:** instead of equal spacing between events, space proportionally to the time between them. Events 5 minutes apart are close; events 3 days apart are far. Creates a more accurate visual of the temporal distribution.
*   **Expandable detail:** each event has a collapsed summary and an expandable detail view. Clicking/toggling reveals the full content without navigating away.
*   **AI-generated summaries:** for long timelines (100+ events), an AI summary at the top: "3 deployments this week, 1 failed."
*   **View Transitions API:** morphing between timeline views (compact → detailed) using shared element transitions.

* * *
## 12\. Conversion / UX Killers
*   **Relying on color alone for status:** green/gray/red dots with no icon or text differentiation. Fails colorblind users and is ambiguous.
*   **No active/current indicator:** users can't tell which step they're on. The whole timeline looks the same.
*   **Too many events without grouping:** 50 events in a flat list. Group by date, or paginate/virtualize.
*   **Timestamps in inconsistent formats:** mixing "2 hours ago", "Jul 20, 2026", and "20/07/26" in the same timeline. Pick one format or provide both (relative + absolute on hover).
*   **Horizontal timeline that overflows on mobile:** events fall off-screen with no scroll indicator. Always stack to vertical on narrow screens.
*   **Empty timeline with no explanation:** a blank space where the timeline should be. Show an empty state with context.
*   **No loading state:** the timeline appears as blank, then suddenly populates. Show skeleton items while loading.
*   **Alternating layout that's hard to follow:** if the alternating pattern makes users' eyes zigzag confusingly, use left-aligned instead. Alternating works for 4-8 events max.
*   **Interactive items with no keyboard access:** clickable timeline events that only respond to mouse.

* * *
## 13\. Advanced Patterns
### Grouped timeline with date headers

```plain
<ol class="timeline">
  <li class="timeline__group-header" role="presentation">
    <span>Today</span>
  </li>
  <li class="timeline__item timeline__item--completed">...</li>
  <li class="timeline__item timeline__item--active">...</li>
  <li class="timeline__group-header" role="presentation">
    <span>Yesterday</span>
  </li>
  <li class="timeline__item timeline__item--completed">...</li>
</ol>
```

### Infinite scroll / pagination
For timelines with 100+ events, load in batches:

```typescript
function useInfiniteTimeline(fetchEvents: (cursor: string) => Promise<{ events: Event[]; nextCursor: string | null }>) {
  const [events, setEvents] = useState<Event[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && cursor && !loading) loadMore();
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [cursor, loading]);

  async function loadMore() {
    setLoading(true);
    const result = await fetchEvents(cursor!);
    setEvents(prev => [...prev, ...result.events]);
    setCursor(result.nextCursor);
    setLoading(false);
  }

  return { events, loading, sentinelRef };
}
```

### Live-updating timeline (WebSocket)

```typescript
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/events");
  ws.onmessage = (msg) => {
    const event = JSON.parse(msg.data);
    setEvents(prev => [event, ...prev]); // prepend new events
    // Announce to screen readers
    announce(`New event: ${event.title}`);
  };
  return () => ws.close();
}, []);
```

* * *
## 14\. Performance & Bundle Cost
*   **Virtualize long timelines.** 100+ events in the DOM is expensive. Use virtual scrolling (react-virtual, Tanstack Virtual) to render only visible items. The tricky part: the connector lines between items need to span across virtualized boundaries.
*   **Lazy-load expanded content.** If timeline items have expandable detail, don't fetch/render it until the user expands. Keep the collapsed view lightweight.
*   **CSS for connectors, not JS.** The connector line is a `::before` pseudo-element. No JavaScript needed for the visual thread.
*   **Animate only new items.** When streaming events arrive, animate only the new item's entrance. Don't re-animate existing items.
*   **Images in timeline content:** lazy-load with `loading="lazy"` and provide dimensions to prevent layout shift.
*   **Group headers as sticky:** for grouped timelines, sticky date headers (`position: sticky`) are cheap but create stacking context issues. Test with z-index.

* * *
## 15\. Security
Minimal direct surface. Considerations:
*   **XSS in event content:** if timeline events display user-generated content (comments, commit messages), sanitize HTML. Never `innerHTML` untrusted strings.
*   **Sensitive data in activity logs:** timeline events often show "who did what." Ensure the API only returns events the current user is authorized to see. Don't leak other users' actions.
*   **Timestamp manipulation:** if timestamps come from the client, validate server-side. A malicious client could backdate events.
*   **Rate limiting on real-time feeds:** WebSocket-delivered timeline events should be rate-limited to prevent flood attacks that overwhelm the UI.

* * *
## 16\. Senior-Level Checklist
Before a timeline is "done":
- [ ] Semantic `<ol>` structure (ordered list)
- [ ] `aria-current="step"` on the active/current event
- [ ] Status conveyed by icon + text, not color alone
- [ ] Timestamps use `<time datetime="...">`
- [ ] Decorative elements (dots, lines) are `aria-hidden="true"`
- [ ] Interactive items are keyboard-accessible (button/link within content)
- [ ] Empty state shown when no events exist
- [ ] Loading state (skeleton items) while fetching
- [ ] Alternating layout collapses to left-aligned on mobile
- [ ] Horizontal layout stacks to vertical on mobile
- [ ] `prefers-reduced-motion` disables pulse/entrance animations
- [ ] Long timelines paginated or virtualized (not 500 DOM nodes)
- [ ] Event content sanitized against XSS
- [ ] Color + icon + text triple-redundancy for status
- [ ] Connector lines don't carry meaning alone (they're reinforcement)
- [ ] Tested in VoiceOver/NVDA: list announced, items read in order

* * *
## 17\. Visual Styles
The same timeline rendered across eleven aesthetics. The style is skin; `<ol>` semantics, `aria-current`, status text, and keyboard behavior never change.

**Flat:** thin solid connector line, small circular dot indicators. Clean, minimal. Completed = filled primary dot, active = filled accent dot, upcoming = outlined. The safest default.

**Material:** connector with slight width transitions at indicators. Indicators are M3 icon buttons (filled tonal for completed, outlined for upcoming). Content blocks on subtle elevated cards. Staggered entrance animation (50ms per item).

**Glassmorphism:** translucent content cards over blurred background. Connector is a thin frosted line. Indicators are glass circles. Guard text contrast against variable backgrounds.

**Liquid Glass (2026):** refractive indicators with specular highlights. Connector line has a subtle inner glow. Content cards use the Liquid Glass material. The premium tracking experience. Ensure text legibility with solid fallback layers.

**Neumorphism:** indicators raised from soft surface (extruded dots). Active indicator pressed in (inset shadow). Connector as a groove in the surface. Content blocks flush with the same surface (no cards).

**Skeuomorphism:** connector is a "rope" or "thread" texture. Indicators are pin-heads or rivets. Content blocks look like attached notes/cards. The bulletin-board metaphor.

**Neo-Brutalism:** thick 3px connector line in black. Large bold indicators (squares instead of circles). Content blocks have thick borders and hard offset shadows. High-contrast, high-personality.

**Claymorphism:** puffy rounded indicators (3D pill shapes). Connector is a soft rounded tube. Content blocks are soft clay cards. Friendly, playful, consumer-facing.

**Aurora/Gradient:** connector line is an animated gradient (flows downward like liquid). Active indicator pulses with gradient. Content blocks have gradient-border accents. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** no connector line at all. Just timestamps left-aligned with thin rules between events. Indicators are tiny 6px dots or none. Typography and whitespace carry the structure. Maximum restraint.

**UJG Brand:** Eminence connector on Night background. Completed indicators are Goldenrod-filled circles. Active indicator has a warm glow ring in Goldenrod. Content uses Platinum text on Night. Upcoming events use Dark Green indicators. The house default.

Full style definitions and tokens on the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).