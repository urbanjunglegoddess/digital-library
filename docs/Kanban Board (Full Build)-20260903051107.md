# Kanban Board (Full Build)

# The Kanban Board: A Senior Engineer's Complete Breakdown
The column-based drag layout for workflow visualization. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you configure columns, card content, drag behavior, and WIP limits, then output code for every target.

**Audit a kanban board:** the companion audit checks keyboard alternatives to drag, card announcements, column labeling, and drop-target feedback, then exports a client-ready report.

This doc follows the Private ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).

* * *
## 1\. What a Kanban Board Actually Is
A **kanban board** is a visual workflow tool with vertical columns representing stages (To Do, In Progress, Done) and cards representing work items that move between columns via drag-and-drop.

**Kanban Board (this doc):** columns + draggable cards representing workflow stages. Items move left-to-right through the process.
**Table/Data Grid:** rows and columns of data. No drag-between-columns workflow.
**List:** linear sequence. No stage-based organization.
**Trello/ClickUp Board view:** product implementations of the kanban pattern.

The core value: **making work-in-progress visible** across stages, enabling teams to spot bottlenecks, manage capacity, and move work through a system.

* * *
## 2\. Why It Matters
**Workflow visibility.** Everyone sees what's in progress, what's blocked, what's done. No asking "what are you working on?" The board IS the answer.
**WIP limits.** Kanban's core principle: limit work-in-progress per stage. The board makes overload visible.
**Bottleneck detection.** A column piling up (many cards in "Review") is instantly visible. The board surfaces process problems.

* * *
## 3\. Anatomy
**Board container:** horizontal scrollable area holding all columns.
**Columns:** vertical lanes. Each has a header, card list, and footer/add action.
**Column header:** stage name + card count + optional WIP limit indicator + overflow menu (rename, delete, settings).
**Cards:** individual work items within columns. Title + metadata (assignee avatar, priority, tags, due date).
**Add card action:** "+" button or "Add card" at the bottom (or top) of a column.
**Drag handle/behavior:** cards can be dragged between columns (changing status) and reordered within columns (changing priority).
**Drop indicators:** visual feedback showing where a card will land (line between cards, column highlight).
**Swimlanes (optional):** horizontal rows across columns grouping cards by a dimension (assignee, priority, epic).
**Column scroll:** vertical scroll within individual columns when they have many cards.
**Board scroll:** horizontal scroll to see all columns when they exceed viewport width.

* * *
## 4\. Sizes / Scale

| Element | Dimensions | Notes |
| ---| ---| --- |
| Column width | 280-320px | Narrow enough to show 3-4 columns on standard screens |
| Column gap | 12-16px | Breathing room between lanes |
| Card min-height | 60px | Title + one line of metadata |
| Card padding | 12-16px | Content breathing room |
| Column header | 40-48px H | Title + count + actions |
| Board padding | 16-24px | Space around the board edges |

Board height: typically viewport height minus header. Columns scroll internally.

* * *
## 5\. States
**Default:** columns visible with cards. No drag in progress.
**Card dragging:** a card is lifted and following the cursor. The original position shows a placeholder/ghost.
**Column drop-target:** the column a dragged card is over. Highlighted border or background tint.
**Card drop-position:** a line or gap between cards showing exactly where the card will insert.
**Card placeholder:** a dashed outline in the card's original position (or the target position) while dragging.
**Empty column:** a column with no cards. Shows a drop target indicator and/or "No items" message with add action.
**WIP limit reached:** column header shows a warning. May prevent adding more cards (strict) or just warn (advisory).
**Loading:** board or individual columns are loading. Skeleton cards.
**Card hover:** subtle elevation or border change.
**Card selected:** clicked/focused card. Shows detail panel or inline expansion.
**Creating:** new card form open within a column (inline or modal).

* * *
## 6\. Types / Variants
**Simple kanban:** columns + cards, drag between columns.
**With swimlanes:** horizontal grouping (by assignee, priority, sprint).
**With WIP limits:** column max-card counts enforced or indicated.
**Collapsible columns:** columns can collapse to just their header (saves space for "Done" columns).
**Vertical kanban (rare):** horizontal lanes for mobile. Cards move up/down.
**Filtered board:** a search/filter bar above that highlights or hides cards.
**Multi-board:** tabs or switcher between different boards (different projects/teams).
**With column automation:** cards auto-move when status changes elsewhere (bi-directional sync with task status).

* * *
## 7\. When to Use (and When Not To)
**Use a kanban board when:**
*   Work flows through stages (To Do → In Progress → Done)
*   Visual workflow management is the primary need
*   Teams need to see WIP and bottlenecks at a glance
*   Card-level detail matters (not just counts)

**Use something else when:**
*   Data is tabular with many fields → Table/Data Grid
*   Timeline/scheduling matters more than stage → Calendar or Gantt
*   Only listing items without workflow → List view
*   Too many columns (>7) → the board becomes too wide; consider a different visualization

* * *
## 8\. Across Design Systems
**dnd-kit:** the modern React drag-and-drop library. Accessible, performant, supports keyboard DnD. The standard for React kanban implementations.
**react-beautiful-dnd (Atlassian):** older but well-known. Full keyboard support for drag. Deprecated by Atlassian in favor of Pragmatic DnD.
**Pragmatic drag and drop (Atlassian):** the successor. Framework-agnostic.
**Sortable.js:** vanilla JS sortable lists. Can compose into kanban.
**Trello:** the UX benchmark for kanban boards.
**ClickUp Board view:** the gold standard for feature-rich kanban with swimlanes, WIP limits, and automation.

* * *
## 9\. The Code
### 9.1 HTML structure

```html
<div class="kanban" role="region" aria-label="Project board">
  <div class="kanban__column" aria-label="To Do, 3 cards">
    <header class="kanban__col-header">
      <h3>To Do</h3>
      <span class="kanban__count">3</span>
    </header>
    <div class="kanban__cards" role="listbox" aria-label="To Do cards">
      <div class="kanban__card" role="option" aria-grabbed="false" tabindex="0"
           aria-label="Fix login bug, assigned to Sarah, high priority"
           aria-describedby="card-1-move">
        <h4>Fix login bug</h4>
        <div class="kanban__card-meta">
          <span class="priority priority--high">High</span>
          <img src="/sarah.jpg" alt="Sarah" class="avatar" />
        </div>
      </div>
      <!-- Visually hidden move instructions -->
      <span id="card-1-move" class="sr-only">Press Space to grab, arrows to move, Space to drop</span>
      <!-- More cards -->
    </div>
    <button class="kanban__add" type="button">+ Add card</button>
  </div>

  <div class="kanban__column" aria-label="In Progress, 2 cards, limit 3">
    <header class="kanban__col-header">
      <h3>In Progress</h3>
      <span class="kanban__count">2 / 3</span>
    </header>
    <div class="kanban__cards" role="listbox" aria-label="In Progress cards">
      <!-- cards -->
    </div>
  </div>

  <div class="kanban__column" aria-label="Done, 5 cards">
    <!-- ... -->
  </div>
</div>
```

### 9.2 React + dnd-kit

```typescript
import { DndContext, closestCorners, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface Card { id: string; title: string; columnId: string; priority: string; assignee?: string; }
interface Column { id: string; title: string; wipLimit?: number; }

export function KanbanBoard({ columns, cards, onCardMove }: {
  columns: Column[]; cards: Card[]; onCardMove: (cardId: string, toColumn: string, position: number) => void;
}) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: any) {
    setActiveCard(cards.find(c => c.id === event.active.id) || null);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;
    // Determine target column and position
    const targetColumn = over.data.current?.columnId || over.id;
    const position = over.data.current?.position || 0;
    onCardMove(active.id, targetColumn, position);
    setActiveCard(null);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
               onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kanban" role="region" aria-label="Project board">
        {columns.map(col => {
          const colCards = cards.filter(c => c.columnId === col.id);
          return (
            <KanbanColumn key={col.id} column={col} cards={colCards} />
          );
        })}
      </div>
      <DragOverlay>
        {activeCard && <KanbanCard card={activeCard} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ column, cards }: { column: Column; cards: Card[] }) {
  return (
    <div className="kanban__column" aria-label={`${column.title}, ${cards.length} cards${column.wipLimit ? `, limit ${column.wipLimit}` : ''}`}>
      <header className="kanban__col-header">
        <h3>{column.title}</h3>
        <span className="kanban__count">{cards.length}{column.wipLimit ? ` / ${column.wipLimit}` : ''}</span>
      </header>
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban__cards">
          {cards.map(card => <SortableCard key={card.id} card={card} columnId={column.id} />)}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({ card, columnId }: { card: Card; columnId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { columnId }
  });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
         className={`kanban__card ${isDragging ? 'kanban__card--dragging' : ''}`}
         {...attributes} {...listeners}>
      <h4>{card.title}</h4>
      <div className="kanban__card-meta">
        <span className={`priority priority--${card.priority}`}>{card.priority}</span>
        {card.assignee && <span className="avatar-sm">{card.assignee}</span>}
      </div>
    </div>
  );
}
```

### 9.3 SwiftUI (native drag-and-drop alternative)

```swift
import SwiftUI

struct KanbanBoardView: View {
    @StateObject var vm = KanbanViewModel()

    var body: some View {
        ScrollView(.horizontal, showsIndicators: true) {
            HStack(alignment: .top, spacing: 16) {
                ForEach(vm.columns) { column in
                    KanbanColumnView(column: column, cards: vm.cards(for: column.id),
                                     onMove: { cardId, targetCol in vm.moveCard(cardId, to: targetCol) })
                }
            }
            .padding()
        }
        .accessibilityLabel("Project board")
    }
}

struct KanbanColumnView: View {
    let column: KanbanColumn
    let cards: [KanbanCard]
    let onMove: (String, String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(column.title).font(.headline)
                Spacer()
                Text("\(cards.count)").font(.caption).foregroundColor(.secondary)
            }
            .padding(.horizontal, 12)

            LazyVStack(spacing: 8) {
                ForEach(cards) { card in
                    CardView(card: card)
                        .contextMenu {
                            // Keyboard alternative to drag: context menu "Move to..."
                            Menu("Move to...") {
                                ForEach(vm.columns.filter { $0.id != column.id }) { target in
                                    Button(target.title) { onMove(card.id, target.id) }
                                }
                            }
                        }
                        .accessibilityLabel("\(card.title), column: \(column.title)")
                        .accessibilityHint("Use context menu to move to another column")
                }
            }
        }
        .frame(width: 280)
        .padding(.vertical, 12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color(.systemGray6)))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("\(column.title), \(cards.count) cards")
    }
}
```

### 9.4 Jetpack Compose

```kotlin
@Composable
fun KanbanBoard(columns: List<KanbanColumn>, cards: List<KanbanCard>, onCardMove: (String, String) -> Unit) {
    val scrollState = rememberScrollState()

    Row(
        modifier = Modifier.horizontalScroll(scrollState).padding(16.dp).semantics { contentDescription = "Project board" },
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        columns.forEach { column ->
            val colCards = cards.filter { it.columnId == column.id }
            KanbanColumnComposable(column, colCards, columns, onCardMove)
        }
    }
}

@Composable
fun KanbanColumnComposable(column: KanbanColumn, cards: List<KanbanCard>, allColumns: List<KanbanColumn>, onMove: (String, String) -> Unit) {
    Surface(
        modifier = Modifier.width(280.dp).semantics { contentDescription = "${column.title}, ${cards.size} cards" },
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceContainerLow
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(column.title, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
                Text("${cards.size}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Spacer(Modifier.height(12.dp))
            cards.forEach { card ->
                var showMenu by remember { mutableStateOf(false) }
                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    onClick = { /* open detail */ }
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(card.title, style = MaterialTheme.typography.bodyMedium)
                        Row(modifier = Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            AssistChip(onClick = {}, label = { Text(card.priority) })
                            Spacer(Modifier.weight(1f))
                            // Keyboard alternative: "Move to" menu
                            Box {
                                IconButton(onClick = { showMenu = true }) { Icon(Icons.Default.MoreVert, "Move card") }
                                DropdownMenu(expanded = showMenu, onDismissRequest = { showMenu = false }) {
                                    allColumns.filter { it.id != column.id }.forEach { target ->
                                        DropdownMenuItem(text = { Text("Move to ${target.title}") },
                                            onClick = { onMove(card.id, target.id); showMenu = false })
                                    }
                                }
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

class KanbanBoardWidget extends StatelessWidget {
  final List<KanbanColumn> columns;
  final List<KanbanCard> cards;
  final Function(String cardId, String targetColumnId) onCardMove;

  const KanbanBoardWidget({super.key, required this.columns, required this.cards, required this.onCardMove});

  List<KanbanCard> _cardsForColumn(String columnId) => cards.where((c) => c.columnId == columnId).toList();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Project board',
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: columns.map((col) => _buildColumn(context, col)).toList(),
        ),
      ),
    );
  }

  Widget _buildColumn(BuildContext context, KanbanColumn column) {
    final colCards = _cardsForColumn(column.id);
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerLow, borderRadius: BorderRadius.circular(12)),
      child: Semantics(
        label: '${column.title}, ${colCards.length} cards',
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              Text(column.title, style: Theme.of(context).textTheme.titleSmall),
              const Spacer(),
              Text('${colCards.length}', style: Theme.of(context).textTheme.labelSmall),
            ]),
          ),
          ...colCards.map((card) => _buildCard(context, card, column)),
        ]),
      ),
    );
  }

  Widget _buildCard(BuildContext context, KanbanCard card, KanbanColumn currentColumn) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Card(
        child: Semantics(
          label: '${card.title}, column: ${currentColumn.title}',
          hint: 'Use menu to move to another column',
          child: ListTile(
            title: Text(card.title),
            subtitle: Text(card.priority),
            trailing: PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, size: 18),
              tooltip: 'Move card',
              onSelected: (targetId) => onCardMove(card.id, targetId),
              itemBuilder: (context) => columns
                  .where((c) => c.id != currentColumn.id)
                  .map((c) => PopupMenuItem(value: c.id, child: Text('Move to ${c.title}')))
                  .toList(),
            ),
            dense: true,
          ),
        ),
      ),
    );
  }
}

class KanbanColumn { final String id; final String title; final int? wipLimit;
  KanbanColumn({required this.id, required this.title, this.wipLimit}); }
class KanbanCard { final String id; final String title; final String columnId; final String priority;
  KanbanCard({required this.id, required this.title, required this.columnId, required this.priority}); }
```

### 9.6 Testing

```typescript
describe("KanbanBoard", () => {
  it("renders columns with labels", () => {
    render(<KanbanBoard columns={mockColumns} cards={mockCards} onCardMove={() => {}} />);
    expect(screen.getByRole('region', { name: /project board/i })).toBeInTheDocument();
  });

  it("cards are keyboard-focusable", () => {
    render(<KanbanBoard columns={mockColumns} cards={mockCards} onCardMove={() => {}} />);
    const cards = screen.getAllByRole('button');
    expect(cards[0]).toHaveAttribute('tabindex');
  });

  it("columns show WIP limits in label", () => {
    const cols = [{ id: 'wip', title: 'In Progress', wipLimit: 3 }];
    const cards = [{ id: '1', title: 'Task', columnId: 'wip', priority: 'medium' }];
    render(<KanbanBoard columns={cols} cards={cards} onCardMove={() => {}} />);
    expect(screen.getByLabelText(/in progress.*limit 3/i)).toBeInTheDocument();
  });
});
```

* * *
## 10\. Accessibility
### The fundamental problem: drag-and-drop
Drag-and-drop is inherently mouse/touch-first. **Keyboard users and screen-reader users cannot drag.** A kanban board that only supports mouse drag is broken for these users.
### Solution: keyboard alternative
Every drag-and-drop board MUST provide a keyboard-accessible way to move cards:

**Option A (dnd-kit approach):** Space to grab a card, arrow keys to move it (between positions and across columns), Space to drop. dnd-kit's `KeyboardSensor` handles this with live-region announcements.

**Option B (context menu):** select a card, open a context menu or "Move to..." dropdown that lists target columns and positions. Works with any AT.

**Option C (keyboard shortcuts):** while a card is focused, specific keys move it (e.g., Ctrl+Arrow moves the card, plain Arrow moves focus).
### Announcements
dnd-kit provides live-region announcements during keyboard drag:
*   "Grabbed: Fix login bug. Current position: 1 of 3 in To Do."
*   "Moved: Fix login bug. New position: 1 of 2 in In Progress."
*   "Dropped: Fix login bug. Final position: 1 of 2 in In Progress."
### Column labels
Each column needs `aria-label` that includes: column name, card count, and WIP limit if applicable.
### Card labels
Each card should announce: title, key metadata (assignee, priority), and instructions for how to move it.

* * *
## 11\. Innovative / Emerging Ideas
*   **AI card suggestions:** auto-suggest which column a card should move to based on activity patterns
*   **Animated card transitions:** cards animate from source to destination column (View Transitions API)
*   **Collaborative real-time:** multiple users dragging simultaneously with presence cursors
*   **Auto-archive:** done cards automatically collapse or archive after N days
*   **Cumulative flow diagram:** analytics overlay showing flow rate per column over time

* * *
## 12\. Conversion / UX Killers
*   **No keyboard alternative to drag:** completely excludes keyboard/AT users
*   **Cards can only be seen, not acted on:** no way to edit, comment, or view detail from the board
*   **Too many columns (8+):** horizontal scrolling becomes primary interaction. Simplify the workflow.
*   **No WIP visibility:** 50 cards pile up in one column with no warning
*   **Drag is laggy:** pointer-event handling that isn't 60fps ruins the experience
*   **No undo on accidental drop:** user drops a card in the wrong column with no way back
*   **Mobile: drag impossible:** need a touch-friendly alternative (tap card → "Move to" menu)

* * *
## 13\. Advanced Patterns
**Optimistic updates:** move the card in the UI immediately, persist to server async. Revert on failure.

**Swimlanes:** group cards horizontally by a dimension. Each swimlane row has its own columns. Useful for per-assignee or per-priority views.

**Virtual scrolling within columns:** for columns with 50+ cards, virtualize the card list.

* * *
## 14\. Performance & Bundle Cost
*   **dnd-kit is ~15KB gzipped.** Lightweight compared to alternatives.
*   **Virtualize long columns.** 50+ cards in one column = performance problem. Virtualize.
*   **Optimistic updates** reduce perceived latency (move card instantly, sync later).
*   **Batch real-time updates.** If 5 users move cards simultaneously, batch the state updates.
*   **Memoize cards.** Each card should only re-render when its own data changes.

* * *
## 15\. Security
*   **Authorization per card action.** Moving a card = changing its status. The API must verify the user has permission to change that card's status.
*   **Rate limiting on moves.** Rapid automated moves could abuse the system.
*   **XSS in card content.** Card titles and descriptions may be user-generated. Sanitize.
*   **Audit trail.** Log who moved what, when. Important for compliance and undo.

* * *
## 16\. Senior-Level Checklist
- [ ] Keyboard alternative to drag-and-drop (Space to grab, arrows to move)
- [ ] Live-region announcements during keyboard drag
- [ ] Cards are focusable and announce title + metadata
- [ ] Columns have `aria-label` with name + count + WIP limit
- [ ] Visual drop indicators (line between cards, column highlight)
- [ ] Empty column shows drop target
- [ ] WIP limits visible and enforced/warned
- [ ] Optimistic updates with server sync and revert on failure
- [ ] Horizontal scroll for many columns
- [ ] Vertical scroll within tall columns
- [ ] Mobile: tap-based move alternative (not drag-only)
- [ ] Card order persisted immediately
- [ ] `prefers-reduced-motion`: no drag animations
- [ ] Tested with NVDA/VoiceOver: cards grabbable and movable via keyboard

* * *
## 17\. Visual Styles
**Flat:** clean column borders, cards with subtle shadow on drag-lift. Drop zone is a dashed outline.
**Material:** elevated cards (dp2 at rest, dp8 while dragging). Columns on M3 surface-container.
**Glassmorphism:** frosted column backgrounds. Cards are glass panels. Drag overlay is frosted.
**Liquid Glass:** columns use liquid glass material. Dragged card has refractive lift effect.
**Neumorphism:** columns as grooves in soft surface. Cards raised. Dragged card lifts higher.
**Skeuomorphism:** columns as physical "lanes" or trays. Cards look like sticky notes or index cards.
**Neo-Brutalism:** thick column borders, cards with bold outlines and hard shadows on drag.
**Claymorphism:** puffy columns, soft rounded cards, bouncy drag animation.
**Aurora/Gradient:** column headers have gradient accents. Dragged card gets a gradient glow.
**Minimal/Swiss:** no column backgrounds. Just headers and hairline separators. Cards are text-heavy with minimal decoration.
**UJG Brand:** Night columns with Eminence headers. Cards on Night surface with Goldenrod drag indicator. Column borders in Dark Green.

Full style definitions on the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).