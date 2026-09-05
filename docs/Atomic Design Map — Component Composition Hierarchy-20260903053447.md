# Atomic Design Map — Component Composition Hierarchy

# Atomic Design Map — Component Composition Hierarchy
Use this as the subcategory structure for your Affinity Assets panel. Atoms are the drag-and-drop primitives; molecules combine them; organisms are full sections you drop onto a page template.

* * *
## Atoms (22 components)
These are single-purpose, standalone elements. Every molecule and organism is built from these.

| Atom | Sizes | Notes |
| ---| ---| --- |
| Button | XS–XL (28–56px H) | Primary, Secondary, Ghost, Icon-only, Disabled, Loading |
| Icon | 16, 20, 24, 32px | Decorative and functional variants |
| Link | Inherits text size | Default, Hover, Visited, Active, Disabled |
| Label | 12–16px text | Form labels, captions |
| Badge | S/M/L (16–24px) | Dot, Count, Overflow |
| Avatar | XS–XL (24–80px) | Image, Initials, Fallback, Status-indicator |
| Divider | 1px | Horizontal, Vertical, With-text |
| Checkbox | S/M/L (16–24px) | Unchecked, Checked, Indeterminate, Disabled |
| Radio Button | S/M/L (16–24px) | Unselected, Selected, Disabled |
| Toggle/Switch | S/M/L | Off, On, Disabled |
| Input Field | S/M/L (32–48px H) | Empty, Filled, Focus, Error, Disabled, Read-only |
| Image | Fluid | Loading/Skeleton, Loaded, Error/Broken |
| Progress Bar | S/M/L (4–12px H) | Empty, Partial, Complete, Indeterminate |
| Rating (star) | S/M/L (16–32px) | Empty, Partial, Full |
| Info Label | 20–28px H | Default, With-icon |
| Tag/Chip | S/M/L (24–32px) | Default, Hover, Selected, Removable, Disabled |
| Spinner/Loading Indicator | S/M/L/XL (16–48px) | Circular, Dots, Bar variants |
| Skeleton | Mirrors target dimensions | Shimmer/pulse; text, circle, rect shapes |
| Slider/Range | Thumb: S/M/L (20–28px) | Single + Dual-thumb, With-value-label |
| Textarea | S/M/L (80–160px min-H) | Auto-resize, With-count |
| Kbd | 20–28px H inline | Single key, Combination, Light/Dark |
| Blockquote | Auto H, max 65ch | Left-border accent, Pull-quote, With-attribution |

* * *
## Molecules (26 components)
Each molecule is a reusable cluster. In Affinity, these are grouped assets that combine 2–4 atoms.

| Molecule | Composed of (Atoms) | Notes |
| ---| ---| --- |
| Labeled Input | Label + Input Field + Info Label/Error text | The fundamental form unit |
| Search Bar | Input Field + Button + Icon | S/M/L (36–52px H) |
| Select/Dropdown | Input Field + Icon + Popover trigger | Closed, Open, Multi-select |
| Combo Box | Input Field + List + Popover | Filtering, No results |
| Date Picker | Input Field + Calendar panel + Buttons | Single, Range |
| Avatar Group | Avatar + Avatar + "+N" Badge | Max 3–5 shown |
| Breadcrumb | Link + Link + Divider/Icon | Truncated, Overflow |
| Pagination | Button + Button + Badge/Number | Active page, Disabled |
| Alert | Icon + Text + Button (dismiss) + Link | Info, Success, Warning, Error |
| Toast/Snackbar | Icon + Text + Button | Auto-dismiss |
| Message Bar | Icon + Text + Button | Full-bleed variant |
| Popover | Container + Content + Arrow | Positioned top/bottom/left/right |
| Tooltip | Container + Text + Arrow | Hover-triggered |
| Rating (group) | Rating stars + Label | Read-only, Interactive |
| Audio Player | Progress Bar + Buttons + Label | Play, Pause, Seek |
| Stepper/Wizard | Icons + Labels + Connectors + Badges | Horizontal + Vertical; Completed, Active, Upcoming, Error |
| Dropdown Menu | Button + List + Icons + Dividers + Kbd | Action menus (Edit, Delete); Nested submenus |
| Context Menu | Trigger area + List + Icons + Kbd | Right-click; same structure as Dropdown Menu |
| Empty State | Image/Illustration + Text + Button | First-use, No-results, No-data, Error, Permission |
| Segmented Control | Button + Button + Button (grouped) | 2–5 segments; Icon-only, Icon+label |
| OTP/Pin Input | Input Field × 4–6 + Focus indicator | Auto-advance, Paste support |
| Hover Card | Avatar + Text + Buttons in Popover | Rich preview on hover (profiles, link previews) |
| Color Picker | Gradient area + Sliders + Input + Swatches | Compact swatch trigger + expanded panel |
| Code Block | Text + Line numbers + Button (copy) + Label | Inline snippet + Multi-line block |
| File Upload/Dropzone | Area + Button + List + Progress Bar + Icon | Default, Drag-over, Uploading, Complete, Error |
| Toolbar | Buttons + Dividers + Dropdown Menu | Grouped actions, overflow menu, responsive collapse |

* * *
## Organisms (26 components)
These are the big reusable blocks. In Affinity, each one is a complex grouped asset or a saved artboard.

| Organism | Composed of (Molecules + Atoms) | Notes |
| ---| ---| --- |
| Header/Navbar | Logo (Image) + Navigation + Search Bar + Avatar + Buttons | Sticky, Collapsed, Transparent |
| Footer | Navigation + Links + Form (newsletter) + Dividers | Auto-height, min 200px |
| Side Menu | Links + Dividers + Avatar + Badges + Toggle (collapse) | Expanded 240–280px, Collapsed 64px |
| Bottom Tabs | Icons + Labels + Badges | Mobile only, 56–64px H |
| Drawer Navigation | Overlay + Side Menu + Links | Open/Closed, 80% mobile / 320–400px desktop |
| Navigation (mega) | Links + Buttons + Cards + Images | Horizontal, Vertical, Mega-menu |
| Card | Image + Text + Buttons + Badge + Avatar | Default, Hover, Selected, Skeleton |
| Carousel | Cards/Images + Pagination + Buttons | Autoplay, Paused, Dragging |
| Hero Banner | Image/Video + Heading + Buttons | 400–700px H, With-CTA |
| Form | Multiple Labeled Inputs + Select + Buttons + Alert | Submitting, Success, Error-summary |
| Modal/Dialog | Overlay + Container + Buttons + Form | S/M/L (400–720px W) |
| News Feed | Cards + Avatars + Images + Links | Loading, Populated, Empty |
| Data Grid/Table | Rows + Pagination + Checkbox + Buttons + Sort controls | Sortable, Filtered, Loading |
| List (complex) | List Items + Checkboxes + Avatars + Badges + Dividers | Grouped, Selected |
| Accordion | Headers + Content panels + Icons | Expanded, Collapsed, Multi-open |
| Tabs | Tab buttons + Content panels | Horizontal, Vertical, Scrollable |
| Sheet (Bottom Sheet) | Overlay + Drag handle + Content area + Buttons | Peek/Half/Full snap; Mobile primary |
| Command Palette | Search Bar + List + Kbd + Overlay | Cmd+K; grouped results, keyboard nav |
| Timeline | Icons + Cards + Connectors + Badges + Avatars | Vertical + Horizontal; Completed, Active, Upcoming |
| Tree View | Links + Icons + Checkboxes + Indent levels | Expand/Collapse, Selection, Drag-target |
| Notification Center | Badge (trigger) + Popover + List + Avatars | Unread/Read, Grouped by date, Empty state |
| Video Player | Progress Bar + Buttons + Overlay + Labels | Play/Pause/Seek/Fullscreen/Captions |
| Calendar (Full View) | Grid + Buttons + Badge + Popover + Events | Month/Week/Day views |
| Kanban Board | Columns + Cards + Buttons + Badges + Avatars | Drag-and-drop, Empty columns |
| Chart/Graph | Axes + Legend + Tooltip + Buttons | Bar, Line, Pie, Donut containers |
| Map/Location | Map frame + Pins + Popover + Buttons + Search | Zoom, Locate me, Info windows |

* * *
## Templates (page skeletons, no real content)
These are full-page wireframe layouts in Affinity. Empty placeholders showing where organisms sit.

| Template | Organisms Used | Breakpoints |
| ---| ---| --- |
| Landing Page | Header + Hero Banner + Cards (grid) + Footer | All 7 |
| Dashboard | Header + Side Menu + Data Grid + Cards + Charts | Tablet+ |
| Product/Detail Page | Header + Hero/Image + Tabs + Form + Footer | All 7 |
| Settings/Account | Header + Side Menu + Form + Alerts + Footer | Tablet+ |
| Blog/Article | Header + Hero + Content (text) + News Feed + Footer | All 7 |
| Auth (Login/Signup) | Header (minimal) + Form + Alert + Footer (minimal) | All 7 |
| E-commerce Listing | Header + Search + Cards (grid) + Pagination + Footer | All 7 |
| Modal Flow | Any page + Modal + Overlay (multi-step) | All 7 |

* * *
## Pages (templates filled with real content)
Not stored as assets. These are what you produce when you combine a Template + real copy + real images for a client deliverable or your own site.

* * *
## Affinity Assets Panel Structure

```plain
UJG Component Kit/
  Atoms/
    Buttons
    Icons
    Links
    Labels
    Badges
    Avatars
    Dividers
    Checkboxes
    Radio Buttons
    Toggles
    Input Fields
    Images
    Progress Bars
    Rating Stars
    Tags-Chips
    Spinners
    Skeletons
    Sliders
    Textareas
    Kbd
    Blockquotes
  Molecules/
    Labeled Inputs
    Search Bar
    Select-Dropdown
    Combo Box
    Date Picker
    Avatar Group
    Breadcrumb
    Pagination
    Alerts
    Toasts
    Message Bars
    Popovers
    Tooltips
    Audio Player
    Stepper-Wizard
    Dropdown Menu
    Context Menu
    Empty State
    Segmented Control
    OTP-Pin Input
    Hover Card
    Color Picker
    Code Block
    File Upload-Dropzone
    Toolbar
  Organisms/
    Header-Navbar
    Footer
    Side Menu
    Bottom Tabs
    Drawer
    Cards
    Carousel
    Hero Banner
    Forms
    Modals-Dialogs
    News Feed
    Data Grid
    Lists
    Accordion
    Tabs
    Sheet (Bottom Sheet)
    Command Palette
    Timeline
    Tree View
    Notification Center
    Video Player
    Calendar (Full View)
    Kanban Board
    Chart-Graph
    Map-Location
  Templates/
    Landing Page
    Dashboard
    Detail Page
    Settings
    Blog
    Auth
    E-commerce
    Modal Flow
```

* * *
## Build Order
1. **Atoms first.** Every molecule needs them. Start with Button, Input Field, Icon, Label, Avatar.
2. **Molecules second.** Combine your atoms. Labeled Input, Search Bar, Alert, Pagination.
3. **Organisms third.** Assemble molecules into sections. Header, Card, Form, Modal.
4. **Templates last.** Arrange organisms into page layouts at each breakpoint.

Design each level at M (40px) / 1440px desktop first, then derive size and breakpoint variants.