# Calendar Full View (Full Build)

# The Calendar (Full View): A Senior Engineer's Complete Breakdown
The full month/week/day grid for event display and scheduling. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle view mode, event density, navigation, and creation interactions, then output code for every target.

**Audit a calendar:** the companion audit checks grid semantics, keyboard navigation, event announcement, and today indication, then exports a client-ready report.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Full Calendar Actually Is
A **full calendar** (calendar view, schedule view) is an interactive grid showing events across days, weeks, or months. Users can view, create, edit, and navigate time-based data.

**Calendar view (this doc):** full interactive grid with events. Month, week, day views. Users can navigate, create, and manage entries.
**Date Picker:** a small inline calendar for selecting a date in a form. An input component, not a view. See the Date Picker doc.
**Timeline:** linear chronological sequence without a grid structure.
**Gantt chart:** horizontal bars showing task duration. Related but different visualization.
**Agenda/List view:** flat list of upcoming events. Often a companion view within a calendar component.
* * *

## 2\. Why It Matters
**Time is universal.** Every scheduling, booking, project management, and productivity app needs a calendar view. It's one of the most complex UI components to build well.
**Density management.** A month view can have 0-15 events per day cell. Handling overflow ("+ 3 more"), multi-day spanning events, and visual hierarchy within tiny cells is the layout challenge.
**Accessibility is a deep problem.** A calendar grid has a rich keyboard contract (arrow keys between days, page up/down between months). Events within cells need to be focusable and announced with full context.
* * *

## 3\. Anatomy
**Header:** month/year display + prev/next navigation arrows + view switcher (Month/Week/Day/Agenda) + "Today" button.
**Day-of-week headers:** Sun–Sat (or Mon–Sun) labels across the top.
**Grid cells (month view):** 7 columns × 5-6 rows. Each cell = one day. Contains date number + events.
**Events:** colored chips/blocks showing title + time. Positioned within cells.
**Multi-day events:** span across multiple cells (rendered as a continuous bar).
**Today indicator:** highlight on the current date (background tint, ring, or bold number).
**Time slots (week/day view):** hourly rows for time-based positioning. Events are placed at their start time with height proportional to duration.
**All-day events (week/day view):** banner at the top of the day column.
**Current time indicator (week/day view):** a red line showing "now" in the time grid.
**Overflow indicator:** "+3 more" link when a cell has more events than it can display.
**Week numbers (optional):** numbers running down the left side, one per week row (ISO week or locale week numbering).
* * *

## 4\. Sizes / Scale

| Element | Dimensions | Notes |
| ---| ---| --- |
| Month view | 100% width, 400-600px H | Cells are equal size grid |
| Week view | 100% width, 600-800px H | Scrollable time grid |
| Day view | 100% width, 600px+ H | Single column time grid |
| Day cell (month) | min 100px W, 80-120px H | Must fit 2-3 event chips |
| Event chip (month) | 100% cell width, 20-24px H | Truncated text |
| Time slot (week/day) | 48-60px H per hour | 24 rows = full day |
| Header | 48-56px H | Fixed, non-scrolling |

The calendar should be responsive: on mobile, month view may show dots instead of event text, or collapse to agenda view. Interactive targets follow the **44px minimum touch size** — day cells and event chips must stay tappable even as the grid compresses.
* * *

## 5\. States
**Default (current month/week/day):** grid showing today's context. Today is highlighted.
**Navigating:** user clicked prev/next. Grid transitions to new time period. Animation optional (slide left/right).
**Event hover:** an event is hovered. Shows elevation or a tooltip with full details.
**Event selected:** an event is clicked. Opens a detail popover or navigates to event page.
**Creating:** user is drag-selecting a time range (week/day view) to create a new event. Shows a temporary block.
**Loading:** events are being fetched for the visible range. Shows skeleton event chips or a subtle loading indicator.
**Empty cell:** a day with no events. Shows nothing (clean) or a subtle "+" on hover to indicate creation affordance.
**Overflow:** a cell has more events than visible. Shows "+N more" that opens a popover with the full list.
**Error:** events failed to load. Error state in the grid body with retry.
**Dragging (event):** user is drag-moving an event to a different day/time. Shows ghost at new position.
* * *

## 6\. Types / Variants
**Month view:** the classic calendar grid. 7×6 cells. Best for seeing event distribution across a month. Limited detail per event.
**Week view:** 7 columns with time slots (hourly rows). Events positioned by time+duration. Best for scheduling and seeing daily patterns.
**Day view:** single column with detailed time slots. Best for a busy day with many events.
**Agenda/List view:** flat chronological list of upcoming events. No grid. Best for mobile and quick scanning.
**Year view (mini):** 12 small month grids for year-at-a-glance. Usually just dots indicating days with events.
**Multi-resource view:** multiple columns representing people/rooms/resources, each with their own time grid. For resource scheduling.
**Responsive:** month view on desktop, agenda view on mobile (auto-switch at breakpoint).
* * *

## 7\. When to Use (and When Not To)
**Use a full calendar when:**
*   Users need to see events across time (scheduling, availability)
*   Time-based patterns matter (busy days, conflicts, gaps)
*   Creating and managing time-based entries is a primary action
*   Multiple views (month/week/day) serve different planning needs

**Use something else when:**
*   Just picking a date for a form → Date Picker
*   Showing a list of upcoming events without spatial context → List/Feed
*   Project duration planning → Gantt chart
*   A simple schedule (recurring weekly) → Table layout
*   The calendar has very few events (< 5/month) → a simple list is clearer
* * *

## 8\. Across Design Systems
**FullCalendar:** the industry standard open-source calendar. Feature-complete (month/week/day/agenda, drag-create, drag-move, multi-day events, resource views). Accessible. Available as vanilla JS, React, Vue, Angular.

**React Big Calendar:** React-specific, full-featured. Localization, drag-and-drop, custom event rendering.

**Ant Design:** `<Calendar>` component with month/year views, custom cell rendering. More of a date-picker-on-steroids than a full scheduling calendar.

**Apple Calendar:** native macOS/iOS calendar with system-level accessibility and performance.

**Google Calendar:** the UX benchmark. Month/week/day/agenda views, drag-create, multi-calendar overlay, smart scheduling.
* * *

## 9\. The Code
### 9.1 HTML (month view structure)

```html
<div class="calendar" role="application" aria-label="Calendar">
  <header class="cal-header">
    <button type="button" aria-label="Previous month">&lsaquo;</button>
    <h2 aria-live="polite" aria-atomic="true">July 2026</h2>
    <button type="button" aria-label="Next month">&rsaquo;</button>
    <button type="button" class="cal-today-btn">Today</button>
  </header>

  <div class="cal-grid" role="grid" aria-label="July 2026">
    <div class="cal-row cal-row--header" role="row">
      <div role="columnheader" abbr="Sunday">Sun</div>
      <div role="columnheader" abbr="Monday">Mon</div>
      <div role="columnheader" abbr="Tuesday">Tue</div>
      <div role="columnheader" abbr="Wednesday">Wed</div>
      <div role="columnheader" abbr="Thursday">Thu</div>
      <div role="columnheader" abbr="Friday">Fri</div>
      <div role="columnheader" abbr="Saturday">Sat</div>
    </div>
    <div class="cal-row" role="row">
      <div class="cal-cell cal-cell--other" role="gridcell" aria-label="June 29">
        <span class="cal-date">29</span>
      </div>
      <!-- ... -->
      <div class="cal-cell cal-cell--today" role="gridcell" aria-current="date" aria-label="July 22, today, 2 events">
        <span class="cal-date">22</span>
        <div class="cal-events">
          <button class="cal-event" style="background: var(--event-blue)" aria-label="Team standup, 9:00 AM">
            Team standup
          </button>
          <button class="cal-event" style="background: var(--event-purple)" aria-label="Design review, 2:00 PM">
            Design review
          </button>
        </div>
      </div>
      <!-- ... -->
    </div>
  </div>
</div>
```

Key decisions:
*   **`role="grid"`** on the calendar grid. Enables grid keyboard pattern (arrows between cells).
*   **`role="gridcell"`** on each day cell.
*   **`role="columnheader"`** on weekday labels.
*   **`aria-current="date"`** on today's cell. AT announces "today."
*   **`aria-label`** on each cell includes the full date AND event count ("July 22, today, 2 events"). This is how AT users know what's in each cell without seeing the visual events.
*   **Events are** **`<button>`** **elements** so they're focusable and activatable.
*   **`aria-live="polite"`** on the month title so navigation announcements work.
### 9.2 React + TypeScript (simplified month view)

```typescript
import { useState, useMemo } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function Calendar({ events, onEventClick, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const days = useMemo(() => generateMonthGrid(year, month), [year, month]);
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getEventsForDate = (date: Date) => events.filter(e =>
    e.start.toDateString() === date.toDateString()
  );

  return (
    <div className="calendar" role="application" aria-label="Calendar">
      <header className="cal-header">
        <button onClick={prevMonth} aria-label="Previous month">&lsaquo;</button>
        <h2 aria-live="polite" aria-atomic="true">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth} aria-label="Next month">&rsaquo;</button>
        <button onClick={goToday} className="cal-today-btn">Today</button>
      </header>

      <div className="cal-grid" role="grid" aria-label={`${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`}>
        <div className="cal-row cal-row--header" role="row">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d =>
            <div key={d} role="columnheader">{d}</div>
          )}
        </div>
        {chunk(days, 7).map((week, wi) => (
          <div key={wi} className="cal-row" role="row">
            {week.map(date => {
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === today.toDateString();
              const isOtherMonth = date.getMonth() !== month;
              return (
                <div key={date.toISOString()} role="gridcell"
                     aria-current={isToday ? 'date' : undefined}
                     aria-label={`${date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}${isToday ? ', today' : ''}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}
                     className={`cal-cell ${isToday ? 'cal-cell--today' : ''} ${isOtherMonth ? 'cal-cell--other' : ''}`}
                     onClick={() => onDateClick?.(date)}>
                  <span className="cal-date">{date.getDate()}</span>
                  <div className="cal-events">
                    {dayEvents.slice(0, 3).map(evt => (
                      <button key={evt.id} className="cal-event" style={{ background: evt.color }}
                              aria-label={`${evt.title}, ${evt.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
                              onClick={(e) => { e.stopPropagation(); onEventClick?.(evt); }}>
                        {evt.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && <span className="cal-overflow">+{dayEvents.length - 3} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function generateMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const start = new Date(year, month, 1 - startDay);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}
```

### 9.3 SwiftUI (native EventKit integration)

```swift
import SwiftUI

struct CalendarView: View {
    @State private var selectedDate = Date()
    @State private var currentMonth = Date()
    let events: [CalendarEvent]

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: previousMonth) { Image(systemName: "chevron.left") }
                    .accessibilityLabel("Previous month")
                Spacer()
                Text(currentMonth, format: .dateTime.month(.wide).year())
                    .font(.headline)
                Spacer()
                Button(action: nextMonth) { Image(systemName: "chevron.right") }
                    .accessibilityLabel("Next month")
            }
            .padding()

            // Day headers
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 4) {
                ForEach(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], id: \.self) { day in
                    Text(day).font(.caption).foregroundColor(.secondary)
                }

                // Day cells
                ForEach(daysInMonth(), id: \.self) { date in
                    let dayEvents = events.filter { Calendar.current.isDate($0.start, inSameDayAs: date) }
                    VStack(spacing: 2) {
                        Text("\(Calendar.current.component(.day, from: date))")
                            .font(.subheadline)
                            .fontWeight(Calendar.current.isDateInToday(date) ? .bold : .regular)
                            .foregroundColor(Calendar.current.isDateInToday(date) ? .purple : .primary)
                        if !dayEvents.isEmpty {
                            Circle().fill(.purple).frame(width: 6, height: 6)
                        }
                    }
                    .frame(height: 44)
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("\(date.formatted(.dateTime.weekday(.wide).month(.wide).day())), \(dayEvents.count) events")
                    .accessibilityAddTraits(Calendar.current.isDateInToday(date) ? .isSelected : [])
                }
            }
        }
    }

    func previousMonth() { currentMonth = Calendar.current.date(byAdding: .month, value: -1, to: currentMonth)! }
    func nextMonth() { currentMonth = Calendar.current.date(byAdding: .month, value: 1, to: currentMonth)! }
    func daysInMonth() -> [Date] { /* generate 42-day grid */ return [] }
}
```

### 9.4 Jetpack Compose

```kotlin
@Composable
fun CalendarMonth(
    events: List<CalendarEvent>,
    onDateClick: (LocalDate) -> Unit = {},
    onEventClick: (CalendarEvent) -> Unit = {}
) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    val today = LocalDate.now()
    val daysInGrid = remember(currentMonth) { generateMonthGrid(currentMonth) }

    Column(modifier = Modifier.fillMaxWidth()) {
        // Header
        Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { currentMonth = currentMonth.minusMonths(1) }) {
                Icon(Icons.Default.ChevronLeft, "Previous month")
            }
            Text(currentMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy")),
                 style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f), textAlign = TextAlign.Center)
            IconButton(onClick = { currentMonth = currentMonth.plusMonths(1) }) {
                Icon(Icons.Default.ChevronRight, "Next month")
            }
        }

        // Day headers
        Row(modifier = Modifier.fillMaxWidth()) {
            listOf("Sun","Mon","Tue","Wed","Thu","Fri","Sat").forEach { day ->
                Text(day, modifier = Modifier.weight(1f), textAlign = TextAlign.Center,
                     style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        // Grid
        daysInGrid.chunked(7).forEach { week ->
            Row(modifier = Modifier.fillMaxWidth().height(64.dp)) {
                week.forEach { date ->
                    val dayEvents = events.filter { it.start.toLocalDate() == date }
                    val isToday = date == today
                    Box(
                        modifier = Modifier.weight(1f).fillMaxHeight()
                            .clickable { onDateClick(date) }
                            .semantics {
                                contentDescription = "${date.format(DateTimeFormatter.ofPattern("EEEE, MMMM d"))}${if (isToday) ", today" else ""}${if (dayEvents.isNotEmpty()) ", ${dayEvents.size} events" else ""}"
                            },
                        contentAlignment = Alignment.TopCenter
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(4.dp)) {
                            Text("${date.dayOfMonth}",
                                 fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal,
                                 color = if (isToday) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
                            if (dayEvents.isNotEmpty()) {
                                Box(modifier = Modifier.size(6.dp).background(MaterialTheme.colorScheme.primary, CircleShape))
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### 9.5 Flutter

```dart
import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';

class CalendarWidget extends StatefulWidget {
  final List<CalendarEvent> events;
  final Function(DateTime)? onDateSelected;
  final Function(CalendarEvent)? onEventTap;
  const CalendarWidget({super.key, required this.events, this.onDateSelected, this.onEventTap});
  @override State<CalendarWidget> createState() => _CalendarWidgetState();
}

class _CalendarWidgetState extends State<CalendarWidget> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  List<CalendarEvent> _getEventsForDay(DateTime day) =>
    widget.events.where((e) => isSameDay(e.start, day)).toList();

  @override
  Widget build(BuildContext context) {
    return TableCalendar(
      firstDay: DateTime.utc(2020, 1, 1),
      lastDay: DateTime.utc(2030, 12, 31),
      focusedDay: _focusedDay,
      selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
      onDaySelected: (selectedDay, focusedDay) {
        setState(() { _selectedDay = selectedDay; _focusedDay = focusedDay; });
        widget.onDateSelected?.call(selectedDay);
      },
      eventLoader: _getEventsForDay,
      calendarStyle: CalendarStyle(
        todayDecoration: BoxDecoration(color: const Color(0xFF5F2C82).withOpacity(0.3), shape: BoxShape.circle),
        selectedDecoration: const BoxDecoration(color: Color(0xFFDCA424), shape: BoxShape.circle),
        markerDecoration: const BoxDecoration(color: Color(0xFF5F2C82), shape: BoxShape.circle),
        markerSize: 6,
      ),
      headerStyle: const HeaderStyle(formatButtonVisible: false, titleCentered: true),
    );
  }
}

class CalendarEvent { final String title; final DateTime start; final DateTime end; final Color? color;
  CalendarEvent({required this.title, required this.start, required this.end, this.color}); }
```

### 9.6 Testing

```typescript
describe("Calendar", () => {
  it("renders a grid with role=grid", () => {
    render(<Calendar events={[]} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it("today has aria-current=date", () => {
    render(<Calendar events={[]} />);
    expect(screen.getByRole('gridcell', { current: 'date' })).toBeInTheDocument();
  });

  it("navigation updates the month heading", async () => {
    render(<Calendar events={[]} />);
    await userEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByRole('heading', { level: 2 })).not.toHaveTextContent(/july/i);
  });

  it("events are keyboard-focusable buttons", () => {
    const events = [{ id: '1', title: 'Standup', start: new Date(), end: new Date(), color: 'blue' }];
    render(<Calendar events={events} />);
    expect(screen.getByRole('button', { name: /standup/i })).toBeInTheDocument();
  });
});
```

* * *

## 10\. Accessibility
**`role="grid"`** enables the ARIA grid keyboard pattern:
*   ArrowRight/Left: next/previous day
*   ArrowDown/Up: same day next/previous week
*   Home: first day of week
*   End: last day of week
*   PageDown: same day next month
*   PageUp: same day previous month

**`aria-current="date"`** on today. AT announces "today."

**Cell labels include context:** "Wednesday, July 22, today, 2 events" gives AT users full information per cell.

**Events are buttons** with descriptive `aria-label` ("Team standup, 9:00 AM"). Focusable and activatable.

**Month title with** **`aria-live="polite"`** announces "August 2026" when navigating.

**Color-coded events** must not rely on color alone. The event title is always visible text.
* * *

## 11\. Innovative / Emerging Ideas
*   **AI scheduling:** suggest optimal meeting times based on participants' availability
*   **Drag-to-create (week/day view):** drag across time slots to create a new event with that duration
*   **Conflict detection:** visual indicators when events overlap
*   **Weather integration:** weather icons on future days
*   **Timezone visualization:** multi-timezone overlay for distributed teams
* * *

## 12\. Conversion / UX Killers
*   **No keyboard navigation:** grid is mouse-only
*   **Events not focusable:** AT users can't reach or read events
*   **No today indicator:** users get lost in the grid
*   **No responsive behavior:** month grid overflows on mobile. Collapse to agenda.
*   **Overflow events hidden with no indicator:** events exist but users don't know
*   **Navigation with no announcement:** pressing "next month" changes the grid silently
* * *

## 13\. Advanced Patterns
**Virtual scrolling (week/day view):** only render time slots in the viewport. A 24-hour day with 15-min slots = 96 rows. Virtualize.

**Event drag-and-drop:** move events between days/times. Requires drag ghost, snap-to-grid, and server persistence.

**Recurring events:** display recurring events with a visual indicator and "Edit this / Edit all" actions.
* * *

## 14\. Performance & Bundle Cost
*   **Only fetch events for the visible date range.** Don't load 12 months of events at once.
*   **Virtualize the time grid (week/day).** 96 rows × 7 columns = 672 cells. Virtualize.
*   **Memoize event positioning calculations.** Recalculate only when events or date range changes.
*   **FullCalendar is ~45KB gzipped.** For a single month view, a custom lightweight implementation may be smaller.
* * *

## 15\. Security
*   **Authorization per event.** The API must only return events the user is authorized to see.
*   **XSS in event titles.** Sanitize user-generated event titles before rendering.
*   **Timezone attacks.** Validate timezone data server-side. A crafted timezone offset shouldn't break date logic.
* * *

## 16\. Senior-Level Checklist
- [ ] `role="grid"` with proper `gridcell`, `row`, `columnheader` structure
- [ ] Arrow key navigation between days
- [ ] PageUp/Down for month navigation
- [ ] `aria-current="date"` on today
- [ ] Month title announced on navigation (`aria-live`)
- [ ] Events are focusable buttons with descriptive `aria-label`
- [ ] Overflow handled ("+N more" clickable)
- [ ] Responsive: month collapses to agenda on mobile
- [ ] Multi-day events span correctly
- [ ] Today button returns to current date
- [ ] Loading state while fetching events
- [ ] Color-coded events have text (not color-only)
- [ ] Events only fetched for visible date range
* * *

## 17\. Visual Styles
**Flat:** clean grid lines, subtle cell borders, event chips with solid color fills. Google Calendar aesthetic.
**Material:** M3 surface colors, event chips with tonal fills, rounded containers.
**Glassmorphism:** grid over blurred background. Event chips are translucent.
**Liquid Glass:** refractive cell borders, event chips with glass material.
**Neumorphism:** cells as soft recessed areas. Today raised.
**Skeuomorphism:** desk calendar / paper planner aesthetic. Torn-edge top.
**Neo-Brutalism:** thick grid borders, bold event chips, hard shadows.
**Claymorphism:** puffy cells, rounded event pills, soft shadows.
**Aurora/Gradient:** today highlight has animated gradient. Event colors are gradient fills.
**Minimal/Swiss:** hairline grid, no background on cells. Typography carries the structure.
**UJG Brand:** Night grid, Eminence cell borders, Goldenrod today indicator, events in brand palette.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).