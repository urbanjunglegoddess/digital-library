# Sheet (Bottom Sheet)

# The Sheet (Bottom Sheet): A Senior Engineer's Complete Breakdown
The mobile-first slide-up panel that's replaced modals on touch devices. Here's everything from first principles to production code.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Bottom Sheet Actually Is
A **bottom sheet** (sheet, drawer) is a panel that slides up from the bottom of the viewport, can be dragged to different heights (snap points), and dismissed by swiping down. It's the native mobile pattern for contextual content that doesn't warrant a full page navigation.

**Bottom Sheet (this doc):** slides from bottom, draggable, has snap points. Mobile-primary.
**Modal/Dialog:** centered overlay, blocks the page. Desktop-primary.
**Drawer Navigation:** slides from the side, contains navigation. Different axis.
**Popover:** small floating panel anchored to an element. No drag mechanics.

Bottom sheets are what modals evolved into on mobile. They respect the thumb zone, support one-handed use, and feel native on iOS/Android.
* * *

## 2\. Why It Matters
**Mobile UX.** Centered modals on mobile are hostile: they're hard to reach with one hand, they obscure context, and they feel unnatural. Bottom sheets live in the thumb zone.
**Progressive disclosure.** A sheet can peek (25%), expand (50%), or go full (90%), revealing information progressively. Users decide how much they want.
**Platform alignment.** iOS (UISheetPresentationController) and Android (Material BottomSheet) both have native bottom sheets. Building one on web aligns with user expectations.
* * *

## 3\. Anatomy
**Drag handle:** a small pill-shaped indicator at the top signaling draggability.
**Header (optional):** title + close button at the top of the content area.
**Content area:** scrollable interior.
**Backdrop/Overlay:** dimmed background behind the sheet.
**Snap points:** defined heights the sheet snaps to (peek, half, full).
* * *

## 4\. Sizes / Scale (Snap Points)

| Snap Point | Height | Use |
| ---| ---| --- |
| Peek | 25% viewport | Quick actions, previews, minimal info |
| Half | 50% viewport | Lists, forms, moderate content |
| Full | 85-90% viewport | Long content, complex forms |
| Closed | 0% (offscreen) | Dismissed |

The drag handle is typically 4px H × 32-40px W, centered, with 12-16px top padding.
* * *

## 5\. States
**Closed:** sheet is offscreen.
**Peeking:** sheet at minimum snap point, content partially visible.
**Expanded (half):** sheet at middle snap point.
**Full:** sheet at maximum height.
**Dragging:** user is actively dragging. Sheet follows finger.
**Snapping:** sheet animating to nearest snap point after drag release.
**Dismissing:** sheet animating downward to close.
* * *

## 6\. Types / Variants
**Standard:** with snap points and drag dismissal.
**Non-dismissible:** can't be swiped away (critical content). Must have an explicit close button.
**Scrollable:** content inside scrolls; sheet only drags from the handle or non-scrollable areas.
**Nested:** a sheet inside a sheet (rare, complex, avoid if possible).
**With fixed footer:** action buttons pinned at the bottom of the sheet content.
* * *

## 7\. When to Use (and When Not To)
**Use a bottom sheet when:**
*   Mobile/touch-primary interface
*   Content is contextual and temporary
*   The user should maintain context of the page behind
*   Progressive disclosure (peek → full) serves the UX

**Use something else when:**
*   Desktop-only → Modal or Popover
*   Navigation → Drawer
*   Critical blocking decision → Dialog (with explicit actions)
*   Content is too long/complex → New page
* * *

## 8\. Across Design Systems
**Material:** `BottomSheet` with standard/modal variants. Three states: collapsed, half-expanded, expanded.
**Apple HIG:** `UISheetPresentationController` (iOS 15+) with detents (.medium, .large, custom). Native drag mechanics.
**Radix:** `Sheet` in community packages (vaul library is the standard).
**shadcn:** uses vaul (`Drawer`) component. The React standard.
**Fluent:** `Sheet` component for responsive experiences.
* * *

## 9\. The Code
### 9.1 React (vaul/shadcn pattern)

```typescript
import { Drawer } from "vaul";

export function BottomSheet({ trigger, title, children }: {
  trigger: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet__overlay" />
        <Drawer.Content className="sheet__content">
          <div className="sheet__handle" aria-hidden="true" />
          <Drawer.Title className="sheet__title">{title}</Drawer.Title>
          <div className="sheet__body">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### 9.2 CSS

```css
.sheet__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); }
.sheet__content {
  position: fixed; bottom: 0; left: 0; right: 0;
  max-height: 90vh; border-radius: 16px 16px 0 0;
  background: var(--sheet-bg, #fff); padding: 0 16px 16px;
  overflow-y: auto; overscroll-behavior: contain;
}
.sheet__handle {
  width: 40px; height: 4px; border-radius: 2px;
  background: var(--handle, #d0d0d0); margin: 12px auto 16px;
}
.sheet__title { font: 600 18px/1.3 system-ui; margin: 0 0 16px; }
```

### 9.3 Touch gesture handling (concept)

```javascript
// Simplified drag logic
let startY, currentY;
const snapPoints = [0.25, 0.5, 0.9]; // viewport fractions

handle.addEventListener("pointerdown", (e) => { startY = e.clientY; });
document.addEventListener("pointermove", (e) => {
  currentY = e.clientY;
  const delta = startY - currentY;
  sheet.style.height = `${Math.max(0, Math.min(90, (delta / window.innerHeight) * 100 + currentSnap * 100))}vh`;
});
document.addEventListener("pointerup", () => {
  // Snap to nearest point
  const currentFraction = parseFloat(sheet.style.height) / 100;
  const nearest = snapPoints.reduce((a, b) => Math.abs(b - currentFraction) < Math.abs(a - currentFraction) ? b : a);
  sheet.style.height = `${nearest * 100}vh`;
});
```

* * *

### 9.4 Tailwind CSS (with Alpine.js)

```html
<div x-data="{ open: false }">
  <!-- Trigger -->
  <button @click="open = true" class="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm">
    Open sheet
  </button>

  <!-- Backdrop -->
  <div x-show="open" x-transition:enter="transition ease-out duration-200"
       x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
       x-transition:leave="transition ease-in duration-150"
       x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0"
       @click="open = false"
       class="fixed inset-0 bg-black/40 z-40"></div>

  <!-- Sheet -->
  <div x-show="open" x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="translate-y-full" x-transition:enter-end="translate-y-0"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="translate-y-0" x-transition:leave-end="translate-y-full"
       role="dialog" aria-modal="true" aria-labelledby="sheet-title"
       @keydown.escape="open = false"
       class="fixed bottom-0 inset-x-0 z-50 max-h-[90vh] rounded-t-2xl bg-gray-900
              border-t border-gray-700 overflow-y-auto overscroll-contain p-4">
    <!-- Handle -->
    <div class="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-4" aria-hidden="true"></div>
    <!-- Close button (keyboard accessible) -->
    <button @click="open = false" class="absolute top-4 right-4 w-8 h-8 rounded-full
                                          flex items-center justify-center text-gray-400
                                          hover:bg-gray-800" aria-label="Close">&times;</button>
    <h2 id="sheet-title" class="text-lg font-semibold mb-4">Sheet Title</h2>
    <div><!-- Content --></div>
  </div>
</div>
```

### 9.5 Next.js (vaul integration)

```typescript
// components/bottom-sheet.tsx
"use client";
import { Drawer } from "vaul";
import { ReactNode } from "react";

interface BottomSheetProps {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ trigger, title, children, snapPoints }: BottomSheetProps) {
  return (
    <Drawer.Root snapPoints={snapPoints} shouldScaleBackground>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-h-[90vh] rounded-t-2xl
                                    bg-gray-900 border-t border-gray-700">
          <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto my-4" aria-hidden="true" />
          <div className="px-4 pb-8 overflow-y-auto">
            <Drawer.Title className="text-lg font-semibold mb-4">{title}</Drawer.Title>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Usage in a page:
export default function ProductPage() {
  return (
    <BottomSheet trigger={<button>View details</button>} title="Product Details" snapPoints={[0.4, 0.8]}>
      <ProductDetails />
    </BottomSheet>
  );
}
```

### 9.6 shadcn/ui (Drawer component)

```typescript
// shadcn uses vaul under the hood as <Drawer>
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger,
         DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export function SheetExample() {
  return (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Open</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Make changes to your profile here.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          {/* Form content */}
        </div>
        <DrawerFooter>
          <Button>Save</Button>
          <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

### 9.7 Vue 3

```html
<script setup lang="ts">
import { ref } from 'vue';
const open = ref(false);
</script>

<template>
  <button @click="open = true">Open sheet</button>

  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="open" class="sheet__overlay" @click="open = false"></div>
    </Transition>
    <!-- Sheet -->
    <Transition name="slide-up">
      <div v-if="open" class="sheet__content" role="dialog" aria-modal="true"
           aria-labelledby="sheet-title" @keydown.escape="open = false">
        <div class="sheet__handle" aria-hidden="true"></div>
        <button class="sheet__close" @click="open = false" aria-label="Close">&times;</button>
        <h2 id="sheet-title" class="sheet__title"><slot name="title">Sheet</slot></h2>
        <div class="sheet__body"><slot /></div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.slide-up-leave-active { transition: transform 0.2s ease-in; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
```

### 9.8 Svelte

```svelte
<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  export let open = false;
  export let title = 'Sheet';

  function close() { open = false; }
  function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
</script>

{#if open}
  <div class="sheet__overlay" transition:fade={{ duration: 200 }} on:click={close}></div>
  <div class="sheet__content" role="dialog" aria-modal="true" aria-labelledby="sheet-title"
       transition:fly={{ y: '100%', duration: 300 }} on:keydown={handleKey}>
    <div class="sheet__handle" aria-hidden="true"></div>
    <button class="sheet__close" on:click={close} aria-label="Close">&times;</button>
    <h2 id="sheet-title" class="sheet__title">{title}</h2>
    <div class="sheet__body"><slot /></div>
  </div>
{/if}
```

### 9.9 Angular (standalone)

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideUp', [
      state('closed', style({ transform: 'translateY(100%)' })),
      state('open', style({ transform: 'translateY(0)' })),
      transition('closed => open', animate('300ms cubic-bezier(0.22, 1, 0.36, 1)')),
      transition('open => closed', animate('200ms ease-in'))
    ])
  ],
  template: `
    <div *ngIf="open" class="sheet__overlay" (click)="close()"></div>
    <div [@slideUp]="open ? 'open' : 'closed'" *ngIf="open"
         class="sheet__content" role="dialog" aria-modal="true"
         [attr.aria-labelledby]="'sheet-title'" (keydown.escape)="close()">
      <div class="sheet__handle" aria-hidden="true"></div>
      <button class="sheet__close" (click)="close()" aria-label="Close">&times;</button>
      <h2 id="sheet-title" class="sheet__title">{{ title }}</h2>
      <div class="sheet__body"><ng-content></ng-content></div>
    </div>
  `,
  styleUrls: ['./bottom-sheet.component.css']
})
export class BottomSheetComponent {
  @Input() open = false;
  @Input() title = 'Sheet';
  @Output() closed = new EventEmitter<void>();
  close() { this.open = false; this.closed.emit(); }
}
```

### 9.10 Bootstrap 5 (Offcanvas bottom)

```html
<!-- Bootstrap's offcanvas can be positioned bottom -->
<button class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#bottomSheet">
  Open sheet
</button>

<div class="offcanvas offcanvas-bottom rounded-top-4" id="bottomSheet" tabindex="-1"
     aria-labelledby="sheetLabel" style="height: auto; max-height: 85vh;">
  <div class="offcanvas-header">
    <div class="mx-auto rounded-pill bg-secondary" style="width: 40px; height: 4px;"></div>
  </div>
  <div class="offcanvas-header pt-0">
    <h5 id="sheetLabel" class="offcanvas-title">Sheet Title</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <!-- Content -->
  </div>
</div>
```

### 9.11 Web Components

```typescript
class UiBottomSheet extends HTMLElement {
  static observedAttributes = ['open', 'title'];

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  attributeChangedCallback(name: string) {
    if (name === 'open') this.hasAttribute('open') ? this.show() : this.hide();
  }

  show() {
    this.render();
    document.addEventListener('keydown', this._escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    });
  }

  hide() {
    document.removeEventListener('keydown', this._escHandler);
  }

  close() { this.removeAttribute('open'); this.dispatchEvent(new CustomEvent('close')); }
  private _escHandler: any;

  render() {
    const isOpen = this.hasAttribute('open');
    const title = this.getAttribute('title') || 'Sheet';
    this.shadowRoot!.innerHTML = isOpen ? `
      <style>
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40; }
        .sheet { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; max-height: 90vh;
                 border-radius: 16px 16px 0 0; background: #1a1a1e; border-top: 1px solid #333;
                 padding: 0 16px 16px; overflow-y: auto; overscroll-behavior: contain;
                 animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } }
        .handle { width: 40px; height: 4px; border-radius: 2px; background: #555; margin: 12px auto 16px; }
        .close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%;
                 border: none; background: #333; color: #ccc; cursor: pointer; font-size: 16px; }
        h2 { font: 600 18px system-ui; color: #eee; margin: 0 0 16px; }
      </style>
      <div class="overlay" part="overlay"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="title">
        <div class="handle" aria-hidden="true"></div>
        <button class="close" aria-label="Close">&times;</button>
        <h2 id="title">${title}</h2>
        <slot></slot>
      </div>` : '';

    this.shadowRoot?.querySelector('.overlay')?.addEventListener('click', () => this.close());
    this.shadowRoot?.querySelector('.close')?.addEventListener('click', () => this.close());
  }
}
customElements.define('ui-bottom-sheet', UiBottomSheet);
// <ui-bottom-sheet title="Details"><p>Content here</p></ui-bottom-sheet>
// Open: element.setAttribute('open', '');  Close: element.removeAttribute('open');
```

### 9.12 Python (Jinja2 + HTMX)

```python
{% macro bottom_sheet(id, title, trigger_label='Open') %}
<button type="button" class="btn btn--primary"
        hx-get="/partials/sheet/{{ id }}" hx-target="#{{ id }}-container" hx-swap="innerHTML">
  {{ trigger_label }}
</button>
<div id="{{ id }}-container"></div>
{% endmacro %}

{# Partial returned by HTMX: #}
{# partials/sheet/details.html #}
<div class="sheet__overlay" onclick="this.parentElement.innerHTML = ''"></div>
<div class="sheet__content" role="dialog" aria-modal="true" aria-labelledby="{{ id }}-title">
  <div class="sheet__handle" aria-hidden="true"></div>
  <button class="sheet__close" aria-label="Close"
          onclick="this.closest('.sheet__content').parentElement.innerHTML = ''">&times;</button>
  <h2 id="{{ id }}-title" class="sheet__title">{{ title }}</h2>
  <div class="sheet__body">
    {{ content }}
  </div>
</div>
```

### 9.13 SwiftUI (native)

```swift
import SwiftUI

struct SheetExample: View {
    @State private var showSheet = false

    var body: some View {
        Button("Show Details") { showSheet = true }
            .sheet(isPresented: $showSheet) {
                SheetContent()
                    .presentationDetents([.medium, .large]) // Snap points
                    .presentationDragIndicator(.visible) // Native handle
            }
    }
}

struct SheetContent: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            VStack {
                Text("Sheet content here")
            }
            .navigationTitle("Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// iOS 16+ detents are the native "snap points":
// .presentationDetents([.fraction(0.25), .medium, .large])
// .presentationDetents([.height(200), .medium, .large])
```

### 9.14 Jetpack Compose (Android)

```kotlin
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BottomSheetExample() {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = false)
    var showSheet by remember { mutableStateOf(false) }

    Button(onClick = { showSheet = true }) { Text("Open Sheet") }

    if (showSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSheet = false },
            sheetState = sheetState,
            dragHandle = { BottomSheetDefaults.DragHandle() } // Native handle
        ) {
            // Sheet content
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Sheet Title", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(16.dp))
                Text("Sheet content goes here.")
                Spacer(modifier = Modifier.height(24.dp))
                Button(onClick = { showSheet = false }, modifier = Modifier.fillMaxWidth()) {
                    Text("Done")
                }
            }
        }
    }
}

// Standard (non-modal) bottom sheet with peek:
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PeekingSheet() {
    val scaffoldState = rememberBottomSheetScaffoldState()

    BottomSheetScaffold(
        scaffoldState = scaffoldState,
        sheetPeekHeight = 100.dp,
        sheetContent = {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Peek content (always visible)")
                Text("Expanded content (drag up to see)")
            }
        }
    ) {
        // Main page content
    }
}
```

### 9.15 Flutter (Dart)

```dart
import 'package:flutter/material.dart';

class BottomSheetExample extends StatelessWidget {
  const BottomSheetExample({super.key});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => _showSheet(context),
      child: const Text('Open Sheet'),
    );
  }

  void _showSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // allows full-height
      useSafeArea: true,
      showDragHandle: true, // native drag indicator
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.5, // 50% viewport
        minChildSize: 0.25, // peek at 25%
        maxChildSize: 0.9, // max 90%
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Sheet Title', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                const Text('Sheet content goes here.'),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Done'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Persistent bottom sheet (with peek):
// Use Scaffold's bottomSheet property or DraggableScrollableSheet
```

### 9.16 Testing (comprehensive)

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { BottomSheet } from "./BottomSheet";

describe("Bottom Sheet", () => {
  it("is hidden by default", () => {
    render(<BottomSheet trigger={<button>Open</button>} title="Test">Content</BottomSheet>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    render(<BottomSheet trigger={<button>Open</button>} title="Test">Content</BottomSheet>);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has aria-modal=true when open", async () => {
    render(<BottomSheet trigger={<button>Open</button>} title="Test">Content</BottomSheet>);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby pointing to the title", async () => {
    render(<BottomSheet trigger={<button>Open</button>} title="Details">Content</BottomSheet>);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby");
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<BottomSheet trigger={<button>Open</button>} title="Test">Content</BottomSheet>);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has a close button for keyboard users", async () => {
    render(<BottomSheet trigger={<button>Open</button>} title="Test">Content</BottomSheet>);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("drag handle is aria-hidden", async () => {
    render(<BottomSheet trigger={<button>Open</button>} title="Test">Content</BottomSheet>);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    const handle = screen.getByRole("dialog").querySelector('[aria-hidden="true"]');
    expect(handle).toBeInTheDocument();
  });

  it("has no axe violations when open", async () => {
    const { container } = render(<BottomSheet trigger={<button>Open</button>} title="Test">Content</BottomSheet>);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

* * *

## 10\. Accessibility
A bottom sheet is a modal surface with custom drag mechanics, which makes it one of the higher-risk components for accessibility. The gesture layer (swipe/drag) is invisible to keyboard and assistive-technology users, so every drag affordance needs a non-gesture equivalent.

### 10.1 ARIA Roles & Attributes
*   **`role="dialog"`** on the sheet container (use `role="alertdialog"` only for critical, non-dismissible confirmations).
*   **`aria-modal="true"`** so assistive tech treats everything behind the sheet as inert.
*   **`aria-labelledby`** pointing at the visible sheet title (or `aria-label` when there is no visible title).
*   **`aria-describedby`** pointing at the lead description when the sheet's purpose needs explanation.
*   **Drag handle is decorative:** mark it `aria-hidden="true"`. It is a visual affordance only and must never be the sole way to operate the sheet.
*   **Backdrop/overlay** is not a focus target; backdrop-click dismissal is a mouse/touch convenience, mirrored by Escape for keyboards.
*   **Snap points** are not natively expressible in ARIA. If a height change conveys meaning, expose a real control (e.g. an expand/collapse button with `aria-expanded`) rather than relying on drag alone.

### 10.2 Keyboard Map
The sheet is interactive (swipe/drag), so every gesture needs a keyboard equivalent, and focus must be trapped while it is open.

| Key | Action |
| ---| --- |
| `Tab` | Move focus to the next focusable element inside the sheet (wraps at the end — focus trap) |
| `Shift + Tab` | Move focus to the previous focusable element (wraps at the start) |
| `Escape` | Dismiss the sheet (on a non-dismissible sheet this is a no-op and focus stays trapped) |
| `Enter` / `Space` | Activate the focused control (close button, footer actions) |
| `Arrow Up` / `Arrow Down` | Cycle snap points (peek → half → full) when an expand control is focused — the keyboard stand-in for drag |
| `Home` / `End` | Jump to the smallest / largest snap point |

Drag-to-dismiss and drag-to-resize have no keyboard analog by default — that is exactly why an explicit close button (and, for multi-snap sheets, an expand/collapse control) is mandatory, not optional.

### 10.3 Focus Management
**On open:** move focus into the sheet — to the first interactive element, or to the sheet container itself (`tabindex="-1"`) when the content is read-only. Never leave focus on the trigger sitting behind the backdrop.
**While open:** trap focus. `Tab` from the last element wraps to the first; `Shift+Tab` from the first wraps to the last. Content behind the sheet is made inert (`inert` attribute, or `aria-hidden="true"` on the app root).
**On close:** return focus to the element that opened the sheet. If that trigger no longer exists (e.g. it lived in a list that changed), fall back to a sensible nearby anchor.
**Restore, don't reset:** dropping focus to `<body>` on close dumps keyboard and screen-reader users at the top of the page — a common and disorienting failure.

### 10.4 Color & Contrast
*   Sheet text against the sheet surface: **4.5:1** minimum for body copy, **3:1** for large text (18px+ bold / 24px+ regular).
*   The drag handle and other non-text affordances (borders, focus rings): **3:1** against their background.
*   The backdrop scrim must genuinely dim the page, but the sheet surface cannot borrow contrast from the scrim — test the sheet against its own background, not the dimmed page behind it.
*   **Focus indicators:** a visible focus ring on every interactive element, 3:1 against adjacent colors, never stripped with `outline: none` unless replaced.
*   UJG brand note: Night surface with Platinum body text clears 4.5:1; a Goldenrod handle on Night clears 3:1.

### 10.5 Touch Target Size
*   **44 × 44px minimum** (WCAG 2.5.5 / Apple HIG) for the close button, footer actions, and any tappable control. Android Material calls for 48dp.
*   The **drag handle's hit area** should be at least 44px tall even though the visible pill is only ~4px — pad the hit zone generously; a hairline handle is nearly impossible to grab.
*   Space adjacent targets so a thumb can't trigger two at once (8px+ gaps).

### 10.6 Reduced Motion
*   Respect `prefers-reduced-motion: reduce`: disable spring physics and the slide-up/slide-down animation, or replace them with a near-instant opacity fade.
*   Never make dismissal _depend_ on an animation completing — the sheet must be gone, and focus returned, even when motion is off.
*   Suppress parallax/scale-background effects (`shouldScaleBackground`) under reduced motion; they are the most nausea-inducing part of the pattern.

### 10.7 Common Failures
*   **Gesture-only dismissal:** swipe-down is the only way out, so keyboard and switch users are trapped. Always ship a close button.
*   **No focus trap:** `Tab` escapes to the page behind the sheet while it visually blocks the screen.
*   **Focus lost on close:** focus falls to `<body>` instead of returning to the trigger.
*   **Handle-only affordance:** the draggable pill is `aria-hidden` (correct) but nothing replaces it for non-drag users (incorrect).
*   **Scrim mistaken for contrast:** sheet text passes only because the page behind is dimmed, and fails against the sheet's own surface.
*   **Sub-44px close button** tucked in a corner — the most-needed control is the hardest to hit.
*   **Motion ignored:** spring animation still fires under `prefers-reduced-motion`.
*   **Background not inert:** a screen reader can still read and navigate the page behind the open sheet.
* * *

## 11\. Innovative / Emerging Ideas
*   **Stack sheets:** multiple sheets layered with z-offset (iOS 16+ style)
*   **Detent customization:** custom snap heights per content type
*   **Sheet → page transition:** when expanded to full, morph into a regular page (shared element transition)
*   **Haptic snap points:** device vibrates as sheet passes each snap point
* * *

## 12\. Conversion / UX Killers
*   **No drag handle:** users don't know they can swipe
*   **Scroll conflict:** scrolling content inside vs. dragging the sheet. Must differentiate.
*   **No close button:** keyboard/AT users trapped
*   **Full sheet for tiny content:** a 90vh sheet for 3 lines of text. Use peek or a popover.
*   **Non-dismissible without explanation:** users feel trapped
* * *

## 13\. Advanced Patterns
**Scroll → drag transition:** when content is scrolled to top and user keeps pulling down, switch from scroll to sheet drag-to-dismiss.

**Multi-snap sheets with lazy content:** peek shows a summary; expanding to half loads more detail; expanding to full loads the complete view.
* * *

## 14\. Performance & Bundle Cost
*   **Spring physics** (for snap animation) can be expensive. Use CSS `transition` with a spring-like cubic-bezier, or a lightweight spring library.
*   **`overscroll-behavior: contain`** on the sheet prevents background scroll.
*   **Backdrop as a separate layer** with `will-change: opacity` for smooth dimming.
* * *

## 15\. Security
Minimal. If the sheet contains a form, standard form security applies (CSRF, validation).
* * *

## 16\. Senior-Level Checklist
*   Drag handle present and visible
*   Close button for keyboard/AT users
*   `role="dialog"` + `aria-modal` + `aria-labelledby`
*   Focus trapped when modal
*   Escape closes
*   Snap points defined and working
*   Scroll vs. drag conflict resolved
*   `prefers-reduced-motion` disables spring animation
*   `overscroll-behavior: contain` prevents background scroll
*   Works on both touch and pointer devices
* * *

## 17\. Visual Styles
**Flat:** solid surface, subtle top radius, no shadow.
**Material:** elevated surface with M3 rounded corners, scrim backdrop.
**Glassmorphism:** frosted translucent sheet over blurred content.
**Liquid Glass:** refractive material with specular rim at the top edge.
**Neumorphism:** sheet raised from soft surface below.
**Skeuomorphism:** sheet has a paper/card texture, handle looks physical.
**Neo-Brutalism:** thick top border, hard shadow, bold radius.
**Claymorphism:** puffy sheet with soft inner glow.
**Aurora/Gradient:** sheet edge has an animated gradient accent.
**Minimal/Swiss:** thin top border, no radius, no shadow. Just the line.
**UJG Brand:** Night surface, Eminence top-border accent, Goldenrod drag handle.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).