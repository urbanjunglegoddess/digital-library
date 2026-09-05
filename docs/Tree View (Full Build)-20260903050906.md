# Tree View (Full Build)

# The Tree View: A Senior Engineer's Complete Breakdown
The nested expandable list for hierarchical data. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle selection mode, expand/collapse behavior, and drag-and-drop, then output code for every target.

**Audit a tree view:** the companion audit checks role structure, aria-expanded states, keyboard navigation, level communication, and multi-select behavior, then exports a client-ready report.

This doc follows the Private ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).

* * *
## 1\. What a Tree View Actually Is
A **tree view** is a hierarchical list where items (nodes) can be expanded to reveal children, collapsed to hide them, and optionally selected or checked. It visualizes parent-child relationships in nested data.

The distinctions:

**Tree View (this doc):** nested expand/collapse with parent-child relationships. Has a rich ARIA contract (`role="tree"`, `role="treeitem"`). File browsers, category trees, org charts, component hierarchies.
**Accordion:** expand/collapse but FLAT. Items are peers, not nested. One level only.
**List:** flat, no nesting, no expand/collapse.
**Side menu with submenus:** navigation-specific tree. Overlaps visually but uses `role="navigation"` and link semantics rather than tree semantics.
**Nested dropdown menus:** ephemeral (disappear on close). A tree view is persistent, always-visible.

The defining characteristic: **depth**. A tree view can nest arbitrarily deep (folders within folders within folders). The ARIA `aria-level` attribute communicates this depth to assistive technology.

* * *
## 2\. Why It Matters
**Any hierarchical data needs a tree view.** File systems, org charts, category taxonomies, nested comments, component trees (React DevTools), document outlines, project structures. The alternative (flattening the hierarchy or paginating through levels) loses the overview that makes trees powerful.

**Keyboard navigation is complex and mandatory.** The tree view has one of the richest keyboard contracts in ARIA: arrow up/down to move between visible items, arrow right to expand a branch or move into its children, arrow left to collapse or move to parent, Home/End, type-ahead. Getting this right is the engineering challenge.

**Performance at scale.** A tree with 10,000 nodes (a large file system, a deep category tree) can't render all nodes at once. Lazy-loading children on expand and virtualizing visible nodes are advanced but necessary patterns.

* * *
## 3\. Anatomy
**Root container:** the top-level element (`role="tree"`) with `aria-label`.

**Branch/Parent node:** an expandable item with children. Has `role="treeitem"` + `aria-expanded="true|false"`. Contains a disclosure triangle/chevron.

**Leaf node:** an item with no children. Has `role="treeitem"` without `aria-expanded`. It's a terminal node.

**Child group:** the container of a branch's children (`role="group"`). Visually indented. Hidden when the parent is collapsed.

**Expand/collapse control:** the chevron, triangle, or +/- icon that toggles expansion. Clicking it or pressing ArrowRight (when collapsed) expands the branch.

**Indentation:** visual nesting depth. Typically 16-24px per level. Creates the "tree" shape.

**Connector lines (optional):** vertical and horizontal lines connecting parents to children. Makes deep nesting easier to follow visually.

**Checkbox (optional):** for multi-select trees where users can check multiple items. Supports tri-state (checked, unchecked, indeterminate for partially-selected parents).

**Icon (optional):** file type, folder open/closed, status indicator. Provides type context at a glance.

**Selection highlight:** background color or border on the currently-selected/focused item.

* * *
## 4\. Sizes / Scale

| Token | Item H | Indent | Icon | Font | Use |
| ---| ---| ---| ---| ---| --- |
| S | 28px | 16px | 14px | 12px | Dense file trees, code outlines |
| M | 36px | 20px | 16px | 13px | Default |
| L | 44px | 24px | 20px | 14px | Touch-friendly, settings trees |

Chevron/expand icon: 12-16px, positioned at the start of the item before the label.

Connector lines: 1px width, same indent offset as the content they connect.

Tree width: typically 200-400px for sidebars, or full-width for main content trees.

* * *
## 5\. States
**Collapsed (branch):** children hidden. Chevron points right/down. `aria-expanded="false"`.

**Expanded (branch):** children visible below, indented. Chevron points down/open. `aria-expanded="true"`.

**Selected:** the item is the current selection (single-select tree). Background highlight + `aria-selected="true"`.

**Focused:** the item has keyboard focus. Visible focus ring. In a tree, focus and selection can be independent (focus moves with arrows, selection requires Enter/Space or click).

**Checked (checkbox tree):** the item's checkbox is checked. `aria-checked="true"`.

**Indeterminate (checkbox tree):** a parent whose children are partially checked. `aria-checked="mixed"`. Shows a dash instead of a checkmark.

**Disabled:** the item exists but can't be interacted with. `aria-disabled="true"`. Skipped by focus navigation.

**Loading:** a branch was expanded but its children are loading asynchronously. Shows a spinner or skeleton children.

**Drag source:** the item is being dragged (drag-and-drop reordering). Visual lift/shadow.

**Drop target:** another item is being dragged over this one. Visual highlight indicating where it would land (above, below, or as child).

**Empty branch:** a folder/branch that has no children. Shows "(empty)" or removes the expand control.

* * *
## 6\. Types / Variants
**Single-select tree:** clicking an item selects it (file browser navigation). Only one item selected at a time.

**Multi-select tree (checkboxes):** each item has a checkbox. Parents have tri-state. Used for permissions, category assignment, filter selection.

**Flat tree (single level):** technically a tree with only root-level items and no nesting. Rare; usually just use a list.

**Drag-and-drop tree:** items can be reordered and re-parented via drag. Used in CMS page builders, file managers, navigation editors.

**Lazy-load tree:** children aren't fetched until the parent is expanded. Shows a loading state per-branch. Essential for large datasets.

**Virtualized tree:** only visible nodes are in the DOM. Supports 10,000+ items without performance degradation. Uses libraries like react-virtual.

**Filter/search tree:** a text input above the tree filters visible nodes, auto-expanding parents of matches.

**Icon tree:** each item has a type-specific icon (folder, file type, status). The most common visual enhancement.

* * *
## 7\. When to Use (and When Not To)
**Use a tree view when:**
*   Data has parent-child relationships (hierarchy)
*   Users need to see the structure/nesting at a glance
*   Expanding/collapsing portions of the hierarchy is valuable
*   The full hierarchy is too large to show flat (100+ items across levels)
*   Users need to navigate to a specific node in a deep structure

**Use something else when:**
*   Data is flat (no nesting) → List
*   Only one level of expand/collapse → Accordion
*   Selecting from a short flat list → Select/Dropdown
*   Navigation links (not data) → Nav with nested menus
*   Choosing a single item from a shallow hierarchy → Cascading dropdown (menu)
*   The hierarchy is very shallow (2 levels, < 20 items) → a grouped list may be simpler

* * *
## 8\. Across Design Systems
**Radix UI / React Aria:** No built-in tree. Teams build custom or use specialized libraries.

**Ant Design:** `<Tree>` component with `checkable`, `draggable`, `showLine`, `loadData` (async), `selectable`, and virtual scroll support. One of the most complete tree implementations.

**MUI:** `<TreeView>` with `<TreeItem>`. Supports multi-select, controlled/uncontrolled expand, and icons. Accessible with proper ARIA.

**Fluent:** `Tree` component with expand/collapse, selection, and nested items.

**VS Code tree:** the gold standard for performance and keyboard navigation. Supports millions of items via virtualization, lazy loading, filter, drag-and-drop, and rich decorations.

**react-arborist:** purpose-built React tree library with drag-and-drop, virtualization, rename, and full keyboard support. Closest to VS Code quality in React.

**Apple HIG:** `NSOutlineView` (macOS) is the native tree. Automatically accessible, supports drag-and-drop, and handles performance natively.

* * *
## 9\. The Code
### 9.1 HTML + ARIA

```plain
<div role="tree" aria-label="Project files">
  <div role="treeitem" aria-expanded="true" aria-level="1" aria-setsize="3" aria-posinset="1" tabindex="0">
    <span class="tree__toggle" aria-hidden="true">▾</span>
    <span class="tree__icon" aria-hidden="true">📁</span>
    <span class="tree__label">src</span>
    <div role="group">
      <div role="treeitem" aria-level="2" aria-setsize="2" aria-posinset="1" tabindex="-1">
        <span class="tree__icon" aria-hidden="true">📄</span>
        <span class="tree__label">index.ts</span>
      </div>
      <div role="treeitem" aria-expanded="false" aria-level="2" aria-setsize="2" aria-posinset="2" tabindex="-1">
        <span class="tree__toggle" aria-hidden="true">▸</span>
        <span class="tree__icon" aria-hidden="true">📁</span>
        <span class="tree__label">components</span>
        <div role="group" hidden>
          <div role="treeitem" aria-level="3" aria-setsize="1" aria-posinset="1" tabindex="-1">
            <span class="tree__icon" aria-hidden="true">📄</span>
            <span class="tree__label">Button.tsx</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div role="treeitem" aria-level="1" aria-setsize="3" aria-posinset="2" tabindex="-1">
    <span class="tree__icon" aria-hidden="true">📄</span>
    <span class="tree__label">package.json</span>
  </div>
  <div role="treeitem" aria-level="1" aria-setsize="3" aria-posinset="3" tabindex="-1">
    <span class="tree__icon" aria-hidden="true">📄</span>
    <span class="tree__label">tsconfig.json</span>
  </div>
</div>
```

Key ARIA:
*   **`role="tree"`** on the root container.
*   **`role="treeitem"`** on every node (branches AND leaves).
*   **`aria-expanded="true|false"`** ONLY on branches (nodes with children). Leaves don't get this attribute.
*   **`role="group"`** wraps each set of children.
*   **`aria-level`** communicates depth (1, 2, 3...). Critical for AT to announce nesting.
*   **`aria-setsize`** **+** **`aria-posinset`** tell AT "item 2 of 3 at this level."
*   **Roving tabindex:** exactly one treeitem has `tabindex="0"` (the focused one). All others have `-1`.
### 9.2 CSS

```css
[role="tree"] {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  user-select: none;
}

[role="treeitem"] {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  padding-left: calc(var(--level, 0) * 20px + 8px);
  border-radius: 4px;
  cursor: pointer;
  outline: none;
  color: var(--tree-fg, oklch(80% 0.01 305));
}

[role="treeitem"]:hover {
  background: var(--tree-hover, oklch(25% 0.015 305));
}

[role="treeitem"]:focus-visible {
  outline: 2px solid var(--tree-ring, oklch(78% 0.135 82));
  outline-offset: -2px;
}

[role="treeitem"][aria-selected="true"] {
  background: var(--tree-selected, oklch(42% 0.1 305 / 0.3));
  color: var(--tree-selected-fg, oklch(92% 0.01 305));
}

.tree__toggle {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 10px;
  transition: transform 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

[aria-expanded="true"] > .tree__toggle {
  transform: rotate(0deg);
}

[aria-expanded="false"] > .tree__toggle {
  transform: rotate(-90deg);
}

.tree__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tree__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

[role="group"] {
  display: block;
}

[role="group"][hidden] {
  display: none;
}

/* Connector lines (optional) */
.tree--lines [role="group"] {
  position: relative;
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid var(--tree-line, oklch(35% 0.02 305));
}
```

### 9.3 JavaScript (keyboard handler)

```javascript
class TreeKeyboard {
  constructor(root) {
    this.root = root;
    this.root.addEventListener('keydown', this.handleKey.bind(this));
    this.root.addEventListener('click', this.handleClick.bind(this));
  }

  get visibleItems() {
    return [...this.root.querySelectorAll('[role="treeitem"]')].filter(el => {
      // Item is visible if none of its ancestor groups are hidden
      let parent = el.parentElement;
      while (parent && parent !== this.root) {
        if (parent.hidden) return false;
        parent = parent.parentElement;
      }
      return true;
    });
  }

  get focused() {
    return this.root.querySelector('[role="treeitem"][tabindex="0"]');
  }

  focusItem(item) {
    if (this.focused) this.focused.setAttribute('tabindex', '-1');
    item.setAttribute('tabindex', '0');
    item.focus();
  }

  handleKey(e) {
    const items = this.visibleItems;
    const current = this.focused;
    const index = items.indexOf(current);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index < items.length - 1) this.focusItem(items[index + 1]);
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) this.focusItem(items[index - 1]);
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (current.getAttribute('aria-expanded') === 'false') {
          this.expand(current);
        } else if (current.getAttribute('aria-expanded') === 'true') {
          // Move to first child
          const firstChild = current.querySelector('[role="group"] > [role="treeitem"]');
          if (firstChild) this.focusItem(firstChild);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (current.getAttribute('aria-expanded') === 'true') {
          this.collapse(current);
        } else {
          // Move to parent
          const group = current.closest('[role="group"]');
          if (group) {
            const parent = group.closest('[role="treeitem"]');
            if (parent) this.focusItem(parent);
          }
        }
        break;

      case 'Home':
        e.preventDefault();
        this.focusItem(items[0]);
        break;

      case 'End':
        e.preventDefault();
        this.focusItem(items[items.length - 1]);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        this.select(current);
        break;

      default:
        // Type-ahead: jump to item starting with typed character
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const char = e.key.toLowerCase();
          const match = items.find((item, i) => i > index &&
            item.querySelector('.tree__label')?.textContent.toLowerCase().startsWith(char)
          ) || items.find(item =>
            item.querySelector('.tree__label')?.textContent.toLowerCase().startsWith(char)
          );
          if (match) this.focusItem(match);
        }
    }
  }

  expand(item) {
    item.setAttribute('aria-expanded', 'true');
    const group = item.querySelector('[role="group"]');
    if (group) group.hidden = false;
  }

  collapse(item) {
    item.setAttribute('aria-expanded', 'false');
    const group = item.querySelector('[role="group"]');
    if (group) group.hidden = true;
  }

  select(item) {
    this.root.querySelectorAll('[aria-selected="true"]').forEach(el =>
      el.setAttribute('aria-selected', 'false')
    );
    item.setAttribute('aria-selected', 'true');
  }

  handleClick(e) {
    const item = e.target.closest('[role="treeitem"]');
    if (!item) return;

    if (e.target.closest('.tree__toggle')) {
      const expanded = item.getAttribute('aria-expanded');
      if (expanded === 'true') this.collapse(item);
      else if (expanded === 'false') this.expand(item);
    }

    this.focusItem(item);
    this.select(item);
  }
}

// Initialize
document.querySelectorAll('[role="tree"]').forEach(t => new TreeKeyboard(t));
```

### 9.4 React + TypeScript

```typescript
import { useState, useCallback, KeyboardEvent, ReactNode } from "react";

interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  children?: TreeNode[];
}

interface TreeViewProps {
  data: TreeNode[];
  label: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
}

export function TreeView({ data, label, onSelect, defaultExpanded = [] }: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const select = useCallback((id: string) => {
    setSelected(id);
    onSelect?.(id);
  }, [onSelect]);

  return (
    <div role="tree" aria-label={label}>
      {data.map((node, i) => (
        <TreeItem key={node.id} node={node} level={1}
                 position={i + 1} setSize={data.length}
                 expanded={expanded} selected={selected}
                 onToggle={toggle} onSelect={select} />
      ))}
    </div>
  );
}

function TreeItem({ node, level, position, setSize, expanded, selected, onToggle, onSelect }: {
  node: TreeNode; level: number; position: number; setSize: number;
  expanded: Set<string>; selected: string | null;
  onToggle: (id: string) => void; onSelect: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Keyboard handling delegated to parent tree manager
    // (simplified here; full implementation uses the class above)
  };

  return (
    <>
      <div role="treeitem"
           aria-expanded={hasChildren ? isExpanded : undefined}
           aria-selected={isSelected}
           aria-level={level}
           aria-setsize={setSize}
           aria-posinset={position}
           tabindex={isSelected ? 0 : -1}
           className={`tree-item ${isSelected ? 'tree-item--selected' : ''}`}
           style={{ paddingLeft: `${(level - 1) * 20 + 8}px` }}
           onClick={() => { if (hasChildren) onToggle(node.id); onSelect(node.id); }}>
        {hasChildren && (
          <span className="tree__toggle" aria-hidden="true">
            {isExpanded ? '▾' : '▸'}
          </span>
        )}
        {node.icon && <span className="tree__icon" aria-hidden="true">{node.icon}</span>}
        <span className="tree__label">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div role="group">
          {node.children!.map((child, i) => (
            <TreeItem key={child.id} node={child} level={level + 1}
                     position={i + 1} setSize={node.children!.length}
                     expanded={expanded} selected={selected}
                     onToggle={onToggle} onSelect={onSelect} />
          ))}
        </div>
      )}
    </>
  );
}
```

### 9.5 Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TreeView } from "./TreeView";

const mockData = [
  { id: "src", label: "src", children: [
    { id: "index", label: "index.ts" },
    { id: "components", label: "components", children: [
      { id: "button", label: "Button.tsx" }
    ]}
  ]},
  { id: "pkg", label: "package.json" }
];

describe("TreeView", () => {
  it("renders with role=tree", () => {
    render(<TreeView data={mockData} label="Files" />);
    expect(screen.getByRole("tree", { name: /files/i })).toBeInTheDocument();
  });

  it("branch items have aria-expanded", () => {
    render(<TreeView data={mockData} label="Files" defaultExpanded={["src"]} />);
    const src = screen.getByRole("treeitem", { name: /src/i });
    expect(src).toHaveAttribute("aria-expanded", "true");
  });

  it("leaf items do NOT have aria-expanded", () => {
    render(<TreeView data={mockData} label="Files" defaultExpanded={["src"]} />);
    const index = screen.getByRole("treeitem", { name: /index/i });
    expect(index).not.toHaveAttribute("aria-expanded");
  });

  it("items have aria-level", () => {
    render(<TreeView data={mockData} label="Files" defaultExpanded={["src"]} />);
    const index = screen.getByRole("treeitem", { name: /index/i });
    expect(index).toHaveAttribute("aria-level", "2");
  });

  it("ArrowRight expands a collapsed branch", async () => {
    render(<TreeView data={mockData} label="Files" />);
    const src = screen.getByRole("treeitem", { name: /src/i });
    src.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(src).toHaveAttribute("aria-expanded", "true");
  });

  it("ArrowLeft collapses an expanded branch", async () => {
    render(<TreeView data={mockData} label="Files" defaultExpanded={["src"]} />);
    const src = screen.getByRole("treeitem", { name: /src/i });
    src.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(src).toHaveAttribute("aria-expanded", "false");
  });

  it("has no axe violations", async () => {
    const { container } = render(<TreeView data={mockData} label="Files" defaultExpanded={["src"]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

### 9.6 Jetpack Compose

```kotlin
@Composable
fun TreeView(nodes: List<TreeNode>, label: String, onSelect: (String) -> Unit = {}) {
    var expanded by remember { mutableStateOf(setOf<String>()) }
    var selected by remember { mutableStateOf<String?>(null) }

    Column(modifier = Modifier.semantics { contentDescription = label }) {
        nodes.forEach { node -> TreeNodeItem(node, 0, expanded, selected, { id ->
            expanded = if (id in expanded) expanded - id else expanded + id
        }, { id -> selected = id; onSelect(id) }) }
    }
}

@Composable
fun TreeNodeItem(node: TreeNode, level: Int, expanded: Set<String>, selected: String?,
                 onToggle: (String) -> Unit, onSelect: (String) -> Unit) {
    val hasChildren = node.children.isNotEmpty()
    val isExpanded = node.id in expanded
    val isSelected = node.id == selected

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = (level * 20).dp)
            .clip(RoundedCornerShape(4.dp))
            .background(if (isSelected) Color(0xFF5F2C82).copy(alpha = 0.2f) else Color.Transparent)
            .clickable { if (hasChildren) onToggle(node.id); onSelect(node.id) }
            .padding(horizontal = 8.dp, vertical = 6.dp)
            .semantics {
                contentDescription = "${node.label}${if (hasChildren) ", ${if (isExpanded) "expanded" else "collapsed"}" else ""}"
                if (isSelected) selected = true
            },
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (hasChildren) {
            Icon(if (isExpanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight, null,
                 modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            Spacer(Modifier.width(16.dp))
        }
        Spacer(Modifier.width(4.dp))
        Text(node.label, style = MaterialTheme.typography.bodySmall,
             fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal)
    }

    if (hasChildren && isExpanded) {
        node.children.forEach { child -> TreeNodeItem(child, level + 1, expanded, selected, onToggle, onSelect) }
    }
}

data class TreeNode(val id: String, val label: String, val children: List<TreeNode> = emptyList())
```

### 9.7 Flutter

```dart
import 'package:flutter/material.dart';

class TreeViewWidget extends StatefulWidget {
  final List<TreeNode> nodes;
  final String label;
  final ValueChanged<String>? onSelect;
  const TreeViewWidget({super.key, required this.nodes, required this.label, this.onSelect});
  @override State<TreeViewWidget> createState() => _TreeViewWidgetState();
}

class _TreeViewWidgetState extends State<TreeViewWidget> {
  final Set<String> _expanded = {};
  String? _selected;

  void _toggle(String id) => setState(() => _expanded.contains(id) ? _expanded.remove(id) : _expanded.add(id));
  void _select(String id) { setState(() => _selected = id); widget.onSelect?.call(id); }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: widget.label,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start,
        children: widget.nodes.map((n) => _buildNode(n, 0)).toList()),
    );
  }

  Widget _buildNode(TreeNode node, int level) {
    final hasChildren = node.children.isNotEmpty;
    final isExpanded = _expanded.contains(node.id);
    final isSelected = _selected == node.id;

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Semantics(
        selected: isSelected,
        expanded: hasChildren ? isExpanded : null,
        label: node.label,
        child: InkWell(
          onTap: () { if (hasChildren) _toggle(node.id); _select(node.id); },
          borderRadius: BorderRadius.circular(4),
          child: Container(
            padding: EdgeInsets.only(left: level * 20.0 + 8, top: 6, bottom: 6, right: 8),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF5F2C82).withOpacity(0.15) : null,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(children: [
              if (hasChildren)
                Icon(isExpanded ? Icons.expand_more : Icons.chevron_right, size: 16, color: Colors.grey)
              else
                const SizedBox(width: 16),
              const SizedBox(width: 4),
              Expanded(child: Text(node.label, style: TextStyle(fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal))),
            ]),
          ),
        ),
      ),
      if (hasChildren && isExpanded)
        ...node.children.map((child) => _buildNode(child, level + 1)),
    ]);
  }
}

class TreeNode { final String id; final String label; final List<TreeNode> children;
  TreeNode({required this.id, required this.label, this.children = const []}); }
```

* * *
## 10\. Accessibility
### The keyboard contract (WAI-ARIA Tree View pattern)

| Key | Action |
| ---| --- |
| ArrowDown | Move focus to the next visible treeitem (down the visible list) |
| ArrowUp | Move focus to the previous visible treeitem |
| ArrowRight (on collapsed branch) | Expand the branch |
| ArrowRight (on expanded branch) | Move focus to the first child |
| ArrowRight (on leaf) | Nothing |
| ArrowLeft (on expanded branch) | Collapse the branch |
| ArrowLeft (on collapsed branch or leaf) | Move focus to the parent |
| Home | Focus first visible treeitem in the entire tree |
| End | Focus last visible treeitem in the entire tree |
| Enter / Space | Activate (select) the focused item. In checkbox trees, toggle the check. |
| Type-ahead | Jump to the next item whose label starts with the typed character |
| \* (asterisk) | Expand all siblings at the current level |

### ARIA roles and properties

| Element | Role/Attribute | Required |
| ---| ---| --- |
| Root container | `role="tree"` + `aria-label` | Yes |
| Every node | `role="treeitem"` | Yes |
| Branch nodes | \`aria-expanded="true | false"\` |
| All nodes | `aria-level` | Yes (communicates depth) |
| All nodes | `aria-setsize` + `aria-posinset` | Recommended (position context) |
| Selected node | `aria-selected="true"` | Yes (when selection exists) |
| Checkbox tree | \`aria-checked="true | false |
| Child container | `role="group"` | Yes (wraps children) |
| Disabled nodes | `aria-disabled="true"` | When applicable |

### Multi-select trees (checkbox)
**Tri-state checkboxes:** when a parent has some children checked and some unchecked, the parent shows `aria-checked="mixed"` (indeterminate state). This is a dash or horizontal line visually.

**Checking a parent checks all descendants.** Unchecking a parent unchecks all descendants. Checking the last unchecked child auto-checks the parent.
### Screen reader announcements
A properly implemented tree view announces:
*   "Files, tree" (on focus to the tree)
*   "src, expanded, tree item, level 1, 1 of 2" (on a branch)
*   "index.ts, tree item, level 2, 1 of 2" (on a leaf)
*   "collapsed" / "expanded" (on toggle)
### Focus management
**Roving tabindex:** one item has `tabindex="0"`, all others `-1`. Arrow keys move the `0`. Tab exits the tree entirely.

**Expanding doesn't move focus.** The user presses ArrowRight to expand, then ArrowRight again (or ArrowDown) to enter the children. Expanding alone keeps focus on the parent.

**Collapsing moves descendants back:** when a branch collapses while focus is on one of its children, focus should move back to the branch.

* * *
## 11\. Innovative / Emerging Ideas
*   **Virtualized trees (react-virtual, Tanstack Virtual):** only visible items in the DOM. Handles 100,000+ nodes. The engineering challenge: maintaining aria-setsize/posinset for items not in the DOM.
*   **Lazy-load on expand:** fetch children from an API when the user first expands a branch. Show a loading spinner per-branch.
*   **Fuzzy search/filter:** type in a search box to filter the tree. Auto-expand parents of matching items. Highlight matched text.
*   **Drag-and-drop reordering:** rearrange items and re-parent them. The gold standard: VS Code's file explorer, Figma's layer panel. Requires keyboard alternative ("Move to..." command).
*   **Multi-root trees:** multiple top-level roots that act as independent trees (VS Code's multi-root workspaces).
*   **Real-time collaborative trees:** multiple users editing the tree simultaneously (shared file system, collaborative page builder).
*   **AI-organized trees:** auto-grouping items by similarity, auto-collapsing rarely-used branches.

* * *
## 12\. Conversion / UX Killers
*   **No keyboard navigation:** a tree that only works with mouse click. Completely inaccessible to keyboard and AT users.
*   **Missing aria-expanded:** screen readers can't tell if a branch is open or closed.
*   **Missing aria-level:** screen readers can't communicate depth. Users get lost in the hierarchy.
*   **All nodes rendered at once (large trees):** 10,000 DOM nodes destroys performance. Virtualize.
*   **No loading state for lazy-load:** expanding a branch shows nothing for 2 seconds, then children appear. Show a spinner immediately.
*   **Indentation too subtle:** at 4-5 levels deep, users can't tell which parent an item belongs to. Use connector lines or increase indent.
*   **Click on label expands instead of selects:** users expect click = select, not click = toggle expansion. Separate the expand control (chevron) from the selection target (label).
*   **No type-ahead:** in a tree with 100+ items, users must arrow through every single one. Type-ahead jumps to a match.
*   **Drag-and-drop with no keyboard alternative:** drag works for mouse users; keyboard users can't move items at all.
*   **Collapse loses selection:** user selects a deeply nested item, collapses a parent, and the selection disappears. The selection should persist (and be auto-revealed if the user expands again).

* * *
## 13\. Advanced Patterns
### Checkbox tree with cascading selection

```typescript
function toggleCheck(nodeId: string, tree: TreeNode[], checked: Set<string>): Set<string> {
  const next = new Set(checked);
  const node = findNode(nodeId, tree);
  if (!node) return next;

  if (next.has(nodeId)) {
    // Uncheck this node and all descendants
    uncheckAll(node, next);
  } else {
    // Check this node and all descendants
    checkAll(node, next);
  }

  // Update all ancestors (bubble up)
  updateAncestors(nodeId, tree, next);
  return next;
}

function getCheckState(node: TreeNode, checked: Set<string>): 'checked' | 'unchecked' | 'mixed' {
  if (!node.children?.length) return checked.has(node.id) ? 'checked' : 'unchecked';
  const childStates = node.children.map(c => getCheckState(c, checked));
  if (childStates.every(s => s === 'checked')) return 'checked';
  if (childStates.every(s => s === 'unchecked')) return 'unchecked';
  return 'mixed';
}
```

### Lazy-loading children

```typescript
const [loading, setLoading] = useState<Set<string>>(new Set());

async function handleExpand(nodeId: string) {
  if (getChildren(nodeId).length > 0) { toggle(nodeId); return; } // already loaded

  setLoading(prev => new Set(prev).add(nodeId));
  const children = await fetchChildren(nodeId);
  setChildren(nodeId, children);
  setLoading(prev => { const next = new Set(prev); next.delete(nodeId); return next; });
  expand(nodeId);
}

// In render:
{loading.has(node.id) && <span class="tree__loading">Loading...</span>}
```

### Drag-and-drop with keyboard alternative
The keyboard alternative to drag-and-drop: select an item, press a shortcut (Ctrl+Shift+M), and a command palette appears with "Move to..." options (list of possible parent targets).

* * *
## 14\. Performance & Bundle Cost
*   **Virtualize.** A tree with 1,000+ visible items must virtualize. Only render items in the viewport. Libraries: react-virtual, Tanstack Virtual. The challenge: maintaining correct ARIA attributes for items not in DOM.
*   **Lazy-load children.** Don't fetch the entire tree upfront. Load children on expand.
*   **Memoize tree items.** Each tree item should be memoized (`React.memo`) to avoid re-rendering the entire tree when one item changes.
*   **CSS indentation over JS.** Use `padding-left: calc(var(--level) * 20px)` rather than calculating pixel values in JS.
*   **Collapse animation:** animating `height` of a group is expensive. Use `grid-template-rows: 0fr → 1fr` or just don't animate (instant show/hide is fine for trees).
*   **Icon sprites:** in a file tree with many icons, use an SVG sprite sheet rather than individual SVG component imports.

* * *
## 15\. Security
*   **XSS in node labels:** if tree items display user-generated content (file names, folder names, tag labels), sanitize. Never `innerHTML` untrusted strings into tree item labels.
*   **Path traversal in file trees:** if the tree represents a file system and selection triggers server-side operations, validate paths server-side. A crafted tree node ID like `../../etc/passwd` must be rejected.
*   **Permission scoping:** only show tree nodes the user has permission to see. A folder tree should not expose private folders to unauthorized users.
*   **Drag-and-drop re-parenting:** validate the new parent-child relationship server-side. Don't allow a user to move a node into a location they don't have write access to.

* * *
## 16\. Senior-Level Checklist
Before a tree view is "done":
- [ ] `role="tree"` on root with `aria-label`
- [ ] `role="treeitem"` on every node
- [ ] `aria-expanded` on branches (NOT on leaves)
- [ ] `role="group"` wraps each set of children
- [ ] `aria-level` communicates depth to AT
- [ ] `aria-setsize` + `aria-posinset` for position context
- [ ] `aria-selected` on the current selection
- [ ] Roving tabindex (one item `tabindex="0"`, rest `-1`)
- [ ] Full keyboard: ArrowDown/Up, ArrowRight (expand/enter), ArrowLeft (collapse/parent), Home, End, type-ahead
- [ ] Expand does NOT move focus. ArrowRight again enters children.
- [ ] Collapse with focus on a descendant moves focus back to the collapsed branch
- [ ] Checkbox trees use `aria-checked` with tri-state support (`mixed`)
- [ ] Large trees virtualized (only visible nodes in DOM)
- [ ] Lazy-load shows loading state per-branch
- [ ] Drag-and-drop has a keyboard alternative
- [ ] Indentation visible AND communicated via `aria-level`
- [ ] Focus ring visible on the current item
- [ ] Disabled nodes are `aria-disabled` and skipped by arrows
- [ ] Node labels sanitized against XSS
- [ ] Tested in VoiceOver/NVDA: tree announced, levels read, expand/collapse works

* * *
## 17\. Visual Styles
The same tree view rendered across eleven aesthetics. The style is skin; `role="tree"`, roving tabindex, `aria-expanded`, and keyboard navigation never change.

**Flat:** minimal decoration. Items are plain text with a chevron for branches. Selection is a subtle background tint. Connector lines optional (often omitted for cleaner look). The VS Code / Finder default.

**Material:** items on subtle elevated surface. Selection uses M3 secondary-container color. Expand/collapse has a subtle ripple. Icons use M3 icon styles.

**Glassmorphism:** tree panel is frosted glass. Selected item has a glass highlight. Connector lines are very faint. Guard text contrast against variable backgrounds.

**Liquid Glass (2026):** selected item has a refractive highlight with specular rim. The tree panel itself uses the liquid glass material. Expand/collapse chevron has a subtle glass rotation effect.

**Neumorphism:** tree panel is flush with the soft surface. Selected item is "pressed in" (inset shadow). Branches feel raised when expanded. Low contrast risk on unselected items.

**Skeuomorphism:** folder icons are realistic 3D folders. The tree panel has a wood-grain or paper texture. Selected item has a glossy highlight bar.

**Neo-Brutalism:** thick left connector lines. Bold item text. Selected item has a hard offset background. Chevrons are large and blocky.

**Claymorphism:** items are puffy rounded pills. Selected item has a deeper clay impression. Connector lines are soft rounded tubes. Friendly and playful.

**Aurora/Gradient:** selected item highlight is an animated gradient. Connector lines pulse subtly with color. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** no connector lines, no icons. Just indented text with a thin underline on selection. Maximum typographic clarity. Works for shallow, content-focused trees.

**UJG Brand:** Night background, Eminence connector lines. Selected item has Goldenrod left-border and tinted background. Expand chevrons in Platinum. Folder icons tinted Eminence. The house default.

Full style definitions and tokens on the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).