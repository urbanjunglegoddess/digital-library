# Hover Card (Full Build)

# The Hover Card: A Senior Engineer's Complete Breakdown
The rich preview panel that appears on hover, giving users context without navigating away. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you configure trigger type, content layout, delay, and positioning, then output code for every target.

**Audit a hover card:** the companion audit checks trigger accessibility, keyboard equivalence, delay timing, and focus management, then exports a client-ready report.

This doc follows the ⭐ COMPONENT ASSET TEMPLATE (follow this) ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).
* * *

## 1\. What a Hover Card Actually Is
A **hover card** (preview card, profile popup, hovercard) is a floating panel that appears when hovering over a trigger element, showing a rich preview of linked content. User profiles, link previews, product details, file metadata.

The distinctions:

**Hover Card (this doc):** rich content panel on hover. Contains multiple elements (avatar, text, buttons). The user can move their cursor into the card to interact with its content.
**Tooltip:** simple text hint on hover. Single line, non-interactive, disappears when cursor leaves the trigger. NEVER contains interactive elements.
**Popover:** similar structure but triggered by CLICK, not hover. Persists until explicitly closed.
**Preview (link unfurl):** an embedded preview rendered inline (like Slack's link previews). Not a floating panel.

The defining characteristic: **the user can hover into the card itself and interact with it** (click links, buttons). This is what separates a hover card from a tooltip. Tooltips disappear when you try to reach them; hover cards wait for you.
* * *

## 2\. Why It Matters
**Context without navigation.** Hovering a username shows their profile (avatar, role, status, action buttons) without leaving the current page. Hovering a task link shows its title, status, and assignee. This keeps users in flow.

**Reduces page loads.** Without hover cards, users click through to profiles/details, then hit back. Hover cards serve 80% of the info need without a navigation round-trip.

**Progressive disclosure done right.** The page stays clean (just a link or name), but rich context is one hover away for those who want it.

**The accessibility trap.** Hover cards are inherently problematic: hover doesn't exist for keyboard users or touch users. The component MUST provide equivalent access through focus, or the information must be available elsewhere. This is the core engineering challenge.
* * *

## 3\. Anatomy
**Trigger:** the element that activates the hover card (a link, username, avatar, or any interactive element). Usually styled distinctly (underline, different color) to hint at the preview availability.

**Card container:** the floating panel that appears. Positioned relative to the trigger (above, below, left, right, with collision detection).

**Arrow/Pointer (optional):** a triangle pointing from the card back to the trigger element.

**Content area:** the rich content inside. Typical layouts:
*   User profile: avatar + name + role + bio + follow/message buttons
*   Link preview: thumbnail + title + description + domain
*   Product: image + name + price + rating + "Add to cart"
*   Task: title + status badge + assignee avatar + due date

**Interactive elements (optional):** buttons, links within the card that the user can click.

**Delay mechanism:** intentional delays before showing (200-400ms) and hiding (100-200ms) to prevent accidental triggers and allow cursor travel to the card.
* * *

## 4\. Sizes / Scale

| Token | Width | Max Height | Padding | Use |
| ---| ---| ---| ---| --- |
| S | 240px | 200px | 12px | Compact previews, metadata |
| M | 300px | 280px | 16px | Default (profiles, links) |
| L | 360px | 360px | 20px | Rich previews (products, tasks) |

Arrow size: 8-12px. Offset from trigger: 8-12px gap.

The card should NEVER exceed the viewport. Use collision detection (Floating UI) to flip/shift when near edges.
* * *

## 5\. States
**Hidden:** card not visible. Trigger in default state.

**Intent detected (delay running):** cursor entered the trigger. The show-delay timer is running (200-400ms). Card not yet visible. If cursor leaves before delay completes, nothing shows.

**Visible:** card is displayed. Cursor is either on the trigger OR on the card itself (both keep it open).

**Cursor in transit:** cursor left the trigger and is traveling toward the card. A brief hide-delay (100-200ms) keeps the card open during this gap-crossing. This is critical: without it, the card disappears the instant you move toward it.

**Hiding (delay running):** cursor left both trigger and card. The hide-delay timer is running. If cursor re-enters either within the delay, the card stays visible.

**Loading:** card is visible but content is being fetched asynchronously. Shows a skeleton or spinner inside the card frame.

**Error:** content failed to load. Show a minimal inline error state ("Couldn't load preview") inside the card frame, or suppress the card entirely.

**Focus-triggered:** for keyboard users, the card appears on focus (with the same delay). Stays visible while focus remains on the trigger.
* * *

## 6\. Types / Variants
**User/Profile card:** avatar, name, username, bio, role/title, follow/message buttons. The most common hover card.
**Link preview:** thumbnail/og-image, page title, description, domain. Like Slack/Twitter link unfurls but on hover.
**Product card:** product image, name, price, rating, quick-add button.
**Task/Issue card:** title, status badge, assignee, priority, due date.
**File preview:** file icon/thumbnail, name, size, modified date, open/download links.
**Repository card (GitHub style):** repo name, description, stars, language, last commit.
**Contact card (Outlook style):** photo, name, title, email, phone, schedule meeting button.

**Event/Date card:** event title, time, location, attendee avatars, RSVP button. Calendar and scheduling apps.

**Code/Reference card:** function signature, brief doc comment, link to full docs. IDE-style hover documentation on code symbols.

**Minimal card:** just a name plus one line of metadata, for dense UIs where a full card would be too heavy.
* * *

## 7\. When to Use (and When Not To)
**Use a hover card when:**
*   Preview information would save the user a navigation round-trip
*   The trigger element naturally invites exploration (a username, a link)
*   The preview contains actions the user might want quick access to
*   Desktop users are the primary audience (hover exists)

**Use something else when:**
*   The information is essential (not supplemental) → show it inline or navigate to it
*   Mobile/touch is the primary context → hover doesn't exist; use tap-to-preview or a bottom sheet
*   The preview is just one line of text → Tooltip
*   The preview should persist and be dismissible → Popover (click-triggered)
*   The content inside is complex enough to need its own page → just link to the page

**Touch fallback:** on touch devices, the trigger should navigate directly to the full content (a link to the profile page). The hover card is a desktop enhancement, never the only path.
* * *

## 8\. Across Design Systems
**Radix UI:** `HoverCard` primitive. Handles the show/hide delay, gap-bridging, positioning, and provides both hover AND focus triggers. The gold standard for accessible hover cards in React.

**shadcn:** `<HoverCard>` built on Radix with styled content.

**GitHub:** uses hover cards extensively (user profiles, repos, issues). Shows on hover with a delay, allows cursor travel to the card.

**Twitter/X:** profile hover cards on @mentions. Rich content with follow button.

**LinkedIn:** profile cards on hover. Contact info, mutual connections.

**Material/Ant/Chakra:** no dedicated hover card component. Teams build from Popover primitives with hover trigger logic.
* * *

## 9\. The Code
### 9.1 HTML + CSS (structure)

```html
<!-- Trigger -->
<a href="/user/sarah" class="hovercard-trigger" data-hovercard-target="sarah-card">
  @sarah_dev
</a>

<!-- Card (positioned by JS, initially hidden) -->
<div id="sarah-card" class="hovercard" role="tooltip" hidden>
  <div class="hovercard__arrow"></div>
  <div class="hovercard__content">
    <img src="/avatars/sarah.jpg" alt="" class="hovercard__avatar" />
    <div class="hovercard__info">
      <h3 class="hovercard__name">Sarah Chen</h3>
      <p class="hovercard__role">Senior Engineer @ Acme</p>
      <p class="hovercard__bio">Building design systems. Opinions are my own.</p>
    </div>
    <div class="hovercard__actions">
      <button type="button" class="btn btn--sm">Follow</button>
      <a href="/messages/sarah" class="btn btn--sm btn--ghost">Message</a>
    </div>
  </div>
</div>
```

```css
.hovercard {
  position: absolute;
  z-index: 50;
  width: 300px;
  background: var(--card-bg, oklch(18% 0.015 305));
  border: 1px solid var(--card-border, oklch(28% 0.02 305));
  border-radius: 12px;
  box-shadow: 0 8px 32px oklch(0% 0 0 / 0.4);
  padding: 16px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.hovercard.is-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.hovercard__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.hovercard__name {
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 12px;
}

.hovercard__role {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.hovercard__bio {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 8px;
  line-height: 1.4;
}

.hovercard__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

@media (prefers-reduced-motion: reduce) {
  .hovercard { transition: opacity 0.1s; transform: none; }
}
```

### 9.2 JavaScript (delay + gap-bridging)

```javascript
class HoverCard {
  constructor(trigger, card, options = {}) {
    this.trigger = trigger;
    this.card = card;
    this.showDelay = options.showDelay || 300;
    this.hideDelay = options.hideDelay || 150;
    this.showTimer = null;
    this.hideTimer = null;
    this.isVisible = false;

    this.trigger.addEventListener('mouseenter', () => this.handleTriggerEnter());
    this.trigger.addEventListener('mouseleave', () => this.handleTriggerLeave());
    this.trigger.addEventListener('focus', () => this.handleTriggerEnter());
    this.trigger.addEventListener('blur', () => this.handleTriggerLeave());
    this.card.addEventListener('mouseenter', () => this.handleCardEnter());
    this.card.addEventListener('mouseleave', () => this.handleCardLeave());
  }

  handleTriggerEnter() {
    clearTimeout(this.hideTimer);
    this.showTimer = setTimeout(() => this.show(), this.showDelay);
  }

  handleTriggerLeave() {
    clearTimeout(this.showTimer);
    this.hideTimer = setTimeout(() => this.hide(), this.hideDelay);
  }

  handleCardEnter() {
    clearTimeout(this.hideTimer); // Keep card open when cursor enters it
  }

  handleCardLeave() {
    this.hideTimer = setTimeout(() => this.hide(), this.hideDelay);
  }

  show() {
    this.card.hidden = false;
    // Position with Floating UI (or manual calculation)
    this.position();
    requestAnimationFrame(() => this.card.classList.add('is-visible'));
    this.isVisible = true;
  }

  hide() {
    this.card.classList.remove('is-visible');
    this.card.addEventListener('transitionend', () => {
      if (!this.isVisible) this.card.hidden = true;
    }, { once: true });
    this.isVisible = false;
  }

  position() {
    // Use Floating UI for production:
    // computePosition(this.trigger, this.card, { placement: 'bottom', middleware: [offset(8), flip(), shift()] })
    const triggerRect = this.trigger.getBoundingClientRect();
    this.card.style.top = `${triggerRect.bottom + 8 + window.scrollY}px`;
    this.card.style.left = `${triggerRect.left + window.scrollX}px`;
  }
}
```

### 9.3 React (Radix pattern)

```typescript
import * as HoverCard from "@radix-ui/react-hover-card";

interface UserHoverCardProps {
  username: string;
  children: React.ReactNode;
}

export function UserHoverCard({ username, children }: UserHoverCardProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  return (
    <HoverCard.Root openDelay={300} closeDelay={150}>
      <HoverCard.Trigger asChild
        onMouseEnter={() => { if (!user) fetchUser(username).then(setUser); }}>
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content className="hovercard" sideOffset={8}>
          {user ? (
            <>
              <img src={user.avatar} alt="" className="hovercard__avatar" />
              <h3 className="hovercard__name">{user.name}</h3>
              <p className="hovercard__role">{user.role}</p>
              <p className="hovercard__bio">{user.bio}</p>
              <div className="hovercard__actions">
                <button className="btn btn--sm">Follow</button>
                <a href={`/messages/${username}`} className="btn btn--sm btn--ghost">Message</a>
              </div>
            </>
          ) : (
            <HoverCardSkeleton />
          )}
          <HoverCard.Arrow className="hovercard__arrow" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

// Usage:
<UserHoverCard username="sarah_dev">
  <a href="/user/sarah">@sarah_dev</a>
</UserHoverCard>
```

### 9.4 Vue 3

```html
<script setup lang="ts">
import { ref } from 'vue';
import { useFloating, offset, flip, shift } from '@floating-ui/vue';

const props = defineProps<{ username: string }>();
const isOpen = ref(false);
const user = ref(null);
const triggerRef = ref(null);
const cardRef = ref(null);
let showTimer: number, hideTimer: number;

const { floatingStyles } = useFloating(triggerRef, cardRef, {
  placement: 'bottom-start',
  middleware: [offset(8), flip(), shift()]
});

function show() { clearTimeout(hideTimer); showTimer = setTimeout(() => { isOpen.value = true; loadUser(); }, 300); }
function hide() { clearTimeout(showTimer); hideTimer = setTimeout(() => { isOpen.value = false; }, 150); }
function keepOpen() { clearTimeout(hideTimer); }

async function loadUser() {
  if (!user.value) user.value = await fetchUser(props.username);
}
</script>

<template>
  <span ref="triggerRef" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
    <slot />
  </span>
  <Teleport to="body">
    <div v-if="isOpen" ref="cardRef" :style="floatingStyles" class="hovercard"
         @mouseenter="keepOpen" @mouseleave="hide">
      <template v-if="user">
        <img :src="user.avatar" alt="" class="hovercard__avatar" />
        <h3>{{ user.name }}</h3>
        <p>{{ user.role }}</p>
      </template>
      <HoverCardSkeleton v-else />
    </div>
  </Teleport>
</template>
```

### 9.5 Tailwind CSS (with Alpine.js)

```html
<div class="relative inline-block" x-data="hoverCard()" @mouseenter="show()" @mouseleave="hide()" @focus="show()" @blur="hide()">
  <!-- Trigger -->
  <a href="/user/sarah" class="text-purple-400 hover:underline">@sarah_dev</a>

  <!-- Card -->
  <div x-show="visible" x-transition:enter="transition ease-out duration-150"
       x-transition:enter-start="opacity-0 translate-y-1" x-transition:enter-end="opacity-100 translate-y-0"
       x-transition:leave="transition ease-in duration-100"
       x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0"
       @mouseenter="keepOpen()" @mouseleave="hide()"
       class="absolute top-full left-0 mt-2 w-72 p-4 rounded-xl bg-gray-900 border border-gray-700
              shadow-xl z-50">
    <img src="/avatars/sarah.jpg" alt="" class="w-12 h-12 rounded-full" />
    <h3 class="mt-3 text-sm font-semibold text-gray-100">Sarah Chen</h3>
    <p class="text-xs text-gray-400 mt-0.5">Senior Engineer @ Acme</p>
    <p class="text-xs text-gray-300 mt-2 leading-relaxed">Building design systems.</p>
    <div class="flex gap-2 mt-3">
      <button class="px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs font-medium">Follow</button>
      <a href="/messages/sarah" class="px-3 py-1.5 rounded-md border border-gray-600 text-gray-300 text-xs">Message</a>
    </div>
  </div>
</div>

<script>
function hoverCard() {
  let showTimer, hideTimer;
  return {
    visible: false,
    show() { clearTimeout(hideTimer); showTimer = setTimeout(() => this.visible = true, 300); },
    hide() { clearTimeout(showTimer); hideTimer = setTimeout(() => this.visible = false, 150); },
    keepOpen() { clearTimeout(hideTimer); }
  };
}
</script>
```

### 9.6 Next.js (with prefetch)

```typescript
// components/user-hover-card.tsx
"use client";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useState } from "react";
import Link from "next/link";

export function UserHoverCard({ username, children }: { username: string; children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  async function loadUser() {
    if (user) return;
    const data = await fetch(`/api/users/${username}/card`).then(r => r.json());
    setUser(data);
  }

  return (
    <HoverCard.Root openDelay={300} closeDelay={150}>
      <HoverCard.Trigger asChild onMouseEnter={loadUser} onFocus={loadUser}>
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content className="hovercard" sideOffset={8} align="start">
          {user ? <UserCardContent user={user} username={username} /> : <HoverCardSkeleton />}
          <HoverCard.Arrow className="hovercard__arrow" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

// Server API route: app/api/users/[username]/card/route.ts
import { NextResponse } from "next/server";
export async function GET(req: Request, { params }: { params: { username: string } }) {
  const user = await db.getUserCard(params.username);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ name: user.name, role: user.role, bio: user.bio, avatar: user.avatarUrl });
}
```

### 9.7 shadcn/ui

```typescript
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserCard({ username }: { username: string }) {
  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>
        <a href={`/user/${username}`} className="text-sm font-medium underline">@{username}</a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72" align="start">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`/avatars/${username}.jpg`} />
            <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Sarah Chen</h4>
            <p className="text-xs text-muted-foreground">Senior Engineer @ Acme</p>
            <p className="text-xs pt-1">Building design systems.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm">Follow</Button>
          <Button size="sm" variant="outline">Message</Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
```

### 9.8 Svelte

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { computePosition, offset, flip, shift } from '@floating-ui/dom';

  export let username: string;
  let visible = false;
  let user: any = null;
  let triggerEl: HTMLElement;
  let cardEl: HTMLElement;
  let showTimer: number, hideTimer: number;

  function show() { clearTimeout(hideTimer); showTimer = setTimeout(async () => { visible = true; await loadUser(); position(); }, 300); }
  function hide() { clearTimeout(showTimer); hideTimer = setTimeout(() => { visible = false; }, 150); }
  function keepOpen() { clearTimeout(hideTimer); }

  async function loadUser() { if (!user) user = await fetch(`/api/users/${username}/card`).then(r => r.json()); }
  async function position() {
    if (!triggerEl || !cardEl) return;
    const { x, y } = await computePosition(triggerEl, cardEl, { placement: 'bottom-start', middleware: [offset(8), flip(), shift()] });
    cardEl.style.left = `${x}px`; cardEl.style.top = `${y}px`;
  }
</script>

<span bind:this={triggerEl} on:mouseenter={show} on:mouseleave={hide} on:focus={show} on:blur={hide}>
  <slot />
</span>

{#if visible}
  <div bind:this={cardEl} class="hovercard" on:mouseenter={keepOpen} on:mouseleave={hide} style="position:absolute;">
    {#if user}
      <img src={user.avatar} alt="" class="hovercard__avatar" />
      <h3 class="hovercard__name">{user.name}</h3>
      <p class="hovercard__role">{user.role}</p>
    {:else}
      <div class="skeleton" style="width:48px;height:48px;border-radius:50%"></div>
      <div class="skeleton" style="width:120px;height:14px;margin-top:12px"></div>
    {/if}
  </div>
{/if}
```

### 9.9 Angular (standalone)

```typescript
import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hover-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span #trigger (mouseenter)="show()" (mouseleave)="hide()" (focus)="show()" (blur)="hide()">
      <ng-content></ng-content>
    </span>
    <div *ngIf="visible" class="hovercard" #card (mouseenter)="keepOpen()" (mouseleave)="hide()">
      <img *ngIf="user?.avatar" [src]="user.avatar" alt="" class="hovercard__avatar" />
      <h3 *ngIf="user" class="hovercard__name">{{ user.name }}</h3>
      <p *ngIf="user" class="hovercard__role">{{ user.role }}</p>
      <div *ngIf="!user" class="hovercard-skeleton">Loading...</div>
    </div>
  `,
  styleUrls: ['./hover-card.component.css']
})
export class HoverCardComponent {
  @Input() username = '';
  visible = false;
  user: any = null;
  private showTimer: any;
  private hideTimer: any;

  show() { clearTimeout(this.hideTimer); this.showTimer = setTimeout(() => { this.visible = true; this.loadUser(); }, 300); }
  hide() { clearTimeout(this.showTimer); this.hideTimer = setTimeout(() => { this.visible = false; }, 150); }
  keepOpen() { clearTimeout(this.hideTimer); }
  async loadUser() { if (!this.user) this.user = await fetch(`/api/users/${this.username}/card`).then(r => r.json()); }
}
```

### 9.10 Web Components

```typescript
class UiHoverCard extends HTMLElement {
  private showTimer: any; private hideTimer: any;
  private visible = false; private userData: any = null;

  connectedCallback() {
    this.addEventListener('mouseenter', () => this.show());
    this.addEventListener('mouseleave', () => this.hide());
    this.addEventListener('focus', () => this.show(), true);
    this.addEventListener('blur', () => this.hide(), true);
  }

  show() {
    clearTimeout(this.hideTimer);
    this.showTimer = setTimeout(async () => {
      if (!this.userData) {
        const username = this.getAttribute('username');
        this.userData = await fetch(`/api/users/${username}/card`).then(r => r.json());
      }
      this.visible = true; this.renderCard();
    }, 300);
  }

  hide() { clearTimeout(this.showTimer); this.hideTimer = setTimeout(() => { this.visible = false; this.removeCard(); }, 150); }

  renderCard() {
    if (this.querySelector('.hovercard')) return;
    const card = document.createElement('div');
    card.className = 'hovercard is-visible';
    card.innerHTML = `<img src="${this.userData.avatar}" alt="" style="width:48px;height:48px;border-radius:50%"/>
      <h3>${this.userData.name}</h3><p>${this.userData.role}</p>`;
    card.addEventListener('mouseenter', () => clearTimeout(this.hideTimer));
    card.addEventListener('mouseleave', () => this.hide());
    this.appendChild(card);
  }

  removeCard() { this.querySelector('.hovercard')?.remove(); }
}
customElements.define('ui-hover-card', UiHoverCard);
// <ui-hover-card username="sarah"><a href="/user/sarah">@sarah_dev</a></ui-hover-card>
```

### 9.11 Python (server endpoint for card data)

```python
# FastAPI: serve hover card data
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class UserCardResponse(BaseModel):
    name: str
    role: str
    bio: str
    avatar: str

@app.get("/api/users/{username}/card", response_model=UserCardResponse)
async def get_user_card(username: str, current_user=Depends(get_current_user)):
    """Return minimal user profile for hover card display."""
    user = await db.get_user_by_username(username)
    if not user:
        raise HTTPException(404, "User not found")
    # Only return fields the current user is authorized to see
    return UserCardResponse(
        name=user.display_name,
        role=user.title or "",
        bio=user.bio[:140] if user.bio else "",  # Truncate for card
        avatar=user.avatar_url or f"/api/avatars/{username}/default"
    )

# Jinja2 macro (server-rendered trigger):
# {% macro hover_trigger(username, display_text) %}
# <ui-hover-card username="{{ username }}">
#   <a href="/user/{{ username }}">{{ display_text }}</a>
# </ui-hover-card>
# {% endmacro %}
```

### 9.12 SwiftUI (contextual preview, not hover)

```swift
// SwiftUI doesn't have "hover cards" — it uses .contextMenu or .onHover (macOS only)
// The closest mobile equivalent is a tap-to-preview or context menu

// macOS hover (only):
struct UserLink: View {
    let username: String
    @State private var showPreview = false

    var body: some View {
        Link("@\(username)", destination: URL(string: "/user/\(username)")!)
            .onHover { hovering in
                // Only available on macOS
                withAnimation(.easeOut(duration: 0.15)) { showPreview = hovering }
            }
            .popover(isPresented: $showPreview) {
                UserPreviewCard(username: username)
                    .frame(width: 280)
                    .padding()
            }
    }
}

// iOS: use .contextMenu for long-press preview (not hover)
struct UserMention: View {
    let username: String
    var body: some View {
        Text("@\(username)")
            .contextMenu {
                Button("View Profile") { /* navigate */ }
                Button("Message") { /* send */ }
            } preview: {
                // iOS 16+: preview content shown on long-press
                UserPreviewCard(username: username)
            }
    }
}
```

### 9.13 Testing

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { UserHoverCard } from "./UserHoverCard";

describe("HoverCard", () => {
  it("shows card after hover delay", async () => {
    render(<UserHoverCard username="sarah"><a href="/sarah">@sarah</a></UserHoverCard>);
    await userEvent.hover(screen.getByText("@sarah"));
    await waitFor(() => expect(screen.getByText(/sarah chen/i)).toBeVisible(), { timeout: 500 });
  });

  it("hides card when cursor leaves trigger and card", async () => {
    render(<UserHoverCard username="sarah"><a href="/sarah">@sarah</a></UserHoverCard>);
    await userEvent.hover(screen.getByText("@sarah"));
    await waitFor(() => expect(screen.getByText(/sarah chen/i)).toBeVisible());
    await userEvent.unhover(screen.getByText("@sarah"));
    await waitFor(() => expect(screen.queryByText(/sarah chen/i)).not.toBeInTheDocument(), { timeout: 300 });
  });

  it("shows card on focus (keyboard accessible)", async () => {
    render(<UserHoverCard username="sarah"><a href="/sarah">@sarah</a></UserHoverCard>);
    screen.getByText("@sarah").focus();
    await waitFor(() => expect(screen.getByText(/sarah chen/i)).toBeVisible(), { timeout: 500 });
  });

  it("trigger remains a navigable link", () => {
    render(<UserHoverCard username="sarah"><a href="/user/sarah">@sarah</a></UserHoverCard>);
    expect(screen.getByRole("link", { name: /@sarah/i })).toHaveAttribute("href", "/user/sarah");
  });

  it("card content is loaded asynchronously", async () => {
    render(<UserHoverCard username="sarah"><a href="/sarah">@sarah</a></UserHoverCard>);
    await userEvent.hover(screen.getByText("@sarah"));
    // Should show skeleton/loading first, then content
    await waitFor(() => expect(screen.getByText(/sarah chen/i)).toBeVisible());
  });

  it("has no axe violations when card is visible", async () => {
    const { container } = render(<UserHoverCard username="sarah"><a href="/sarah">@sarah</a></UserHoverCard>);
    await userEvent.hover(screen.getByText("@sarah"));
    await waitFor(() => expect(screen.getByText(/sarah chen/i)).toBeVisible());
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

* * *

## 10\. Accessibility

### The fundamental problem

Hover cards are **inherently inaccessible** to:

*   Keyboard users (no cursor to hover)
*   Touch users (no hover state)
*   Screen magnifier users (the card may appear outside their viewport)

Every hover card implementation MUST address these gaps.

### Solution 1: Show on focus (Radix approach)

The trigger also opens the card on `focus`. Keyboard users Tab to the trigger, the card appears after the same delay. Card stays visible while trigger has focus. This is what Radix `HoverCard` does.

**Limitation:** if the card contains interactive elements (buttons, links), the user can't Tab into the card from the trigger (focus leaves the trigger, card closes). Radix solves this by keeping the card open briefly after blur, allowing Tab into the card.

### Solution 2: Information available elsewhere

Everything in the hover card MUST also be accessible via the link destination. The hover card is a _convenience_, never the only path. The trigger should always be a link (`<a>`) to the full content page.

### Solution 3: Touch fallback

On touch devices, the trigger simply navigates (it's a link). The hover card never appears. This is progressive enhancement: desktop gets the hover card, mobile gets direct navigation.

### ARIA considerations

*   **`role="tooltip"`** on the card if it's purely informational (no interactive elements inside). AT announces the content as tooltip text.
*   If the card **contains interactive elements** (buttons, links), DON'T use `role="tooltip"`. Tooltips aren't supposed to be interactive. Instead, treat it as an unlabeled floating container and rely on the focus-management pattern.
*   **`aria-describedby`** on the trigger pointing to the card ID (when card is visible) lets AT read the card content as supplemental info for the trigger.

### Timing

*   Show delay ≥ 200ms (prevents accidental triggers while scanning)
*   Hide delay ≥ 100ms (gap-bridging: cursor traveling from trigger to card)
*   These delays also help screen magnifier users whose viewport movement triggers inadvertent hovers

### Reduced motion

The entrance animation (opacity + translateY) must be reduced or eliminated under `prefers-reduced-motion`.
* * *

## 11\. Innovative / Emerging Ideas

*   **Preloading on hover-intent:** detect hover trajectory and prefetch card data before the delay completes (saving perceived latency).
*   **AI-generated summaries:** for link previews, generate a brief AI summary of the linked content rather than showing the og:description.
*   **Shared element transition:** when the user clicks through from hover card to full page, morph the card into the page header using View Transitions API.
*   **Nested hover cards:** hovering a name inside a hover card opens another card. Dangerous but occasionally useful (GitHub does this). Limit to one level of nesting.
*   **Video/GIF previews:** for media links, show a short auto-playing preview clip in the card.
*   **Quick actions without navigating:** follow, message, assign, bookmark directly from the card without ever leaving the current page.
* * *

## 12\. Conversion / UX Killers

*   **No show delay:** card appears instantly on hover. Users see cards flashing as they move their cursor across the page. Maddening.
*   **No hide delay (gap-bridging):** card disappears the instant cursor leaves the trigger. Users can never reach the card's interactive elements.
*   **Card covers the trigger:** positioned on top of the element you're hovering. Cursor enters card, leaves trigger, enters trigger again, creating a flicker loop.
*   **Slow content loading with no skeleton:** card appears as an empty box for 1-2 seconds. Show a skeleton immediately.
*   **No touch fallback:** touch users tap the trigger and nothing useful happens (hover card can't show). The trigger must navigate on tap.
*   **Card too far from trigger:** the gap between trigger and card is > 12px. Cursor loses the card in transit.
*   **Too many hover cards on a page:** every link, every username, every product has a card. Overwhelming. Reserve for high-value triggers.
*   **Interactive elements that are unreachable:** buttons in the card that keyboard users can never focus.
* * *

## 13\. Advanced Patterns

### Async content loading with cache

```typescript
const cache = new Map<string, UserProfile>();

async function loadCardContent(username: string): Promise<UserProfile> {
  if (cache.has(username)) return cache.get(username)!;
  const data = await fetch(`/api/users/${username}/card`).then(r => r.json());
  cache.set(username, data);
  return data;
}
```

### Hover-intent detection
Instead of a simple delay, detect whether the cursor is moving _toward_ the trigger (intent) or just passing over it. Libraries like `hoverintent` use cursor velocity/direction.
### Positioning with Floating UI

```typescript
import { computePosition, offset, flip, shift, arrow } from '@floating-ui/dom';

async function position(trigger: HTMLElement, card: HTMLElement, arrowEl: HTMLElement) {
  const { x, y, placement, middlewareData } = await computePosition(trigger, card, {
    placement: 'bottom',
    middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowEl })]
  });
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
  // Position arrow based on middlewareData.arrow
}
```

### Singleton (one card at a time)
Only one hover card should be visible at any moment. Opening a new card dismisses the previous one, so the cursor crossing multiple triggers never leaves a trail of stacked cards.

```typescript
const cardManager = {
  current: null as HoverCardController | null,
  open(card: HoverCardController) {
    if (this.current && this.current !== card) this.current.close();
    this.current = card;
    card.open();
  }
};
```

* * *

## 14\. Performance & Bundle Cost
*   **Lazy-load card content.** Don't fetch profile data for every username on the page. Fetch only when hover-intent is detected (during the show delay).
*   **Cache aggressively.** Once a user's card data is fetched, cache it. Same user mentioned 10 times = 1 fetch.
*   **Don't mount the card DOM until needed.** Use a portal that mounts on show, unmounts on hide.
*   **Debounce rapid hovers.** If the user quickly hovers 5 triggers in 1 second, don't fire 5 fetch requests. Cancel the previous on each new hover.
*   **Image optimization in cards.** Avatar images should be small (48-64px display = serve at 96-128px for 2x). Use `loading="lazy"` if the card isn't immediately visible.
*   **Floating UI tree-shaking.** Import only the middleware you use (offset, flip, shift), not the entire library.
* * *

## 15\. Security
*   **XSS in card content.** If the card displays user-generated content (bios, descriptions), sanitize. An attacker's bio shouldn't execute scripts when hovered.
*   **SSRF in link previews.** If you fetch og:image/og:description for link preview cards, validate the URL server-side. Don't let a crafted link trigger requests to internal services.
*   **Information disclosure.** The card API endpoint must respect permissions. Hovering a username shouldn't reveal private profile fields the current user isn't authorized to see.
*   **Clickjacking.** If the card contains action buttons (Follow, Message), ensure they have proper CSRF protection.
*   **Prefetch authorization.** If you prefetch card data on hover intent, make sure the prefetch request is authenticated and authorized — hovering should only ever fetch data the current user is allowed to see.
* * *

## 16\. Senior-Level Checklist
- [ ] Show delay ≥ 200ms (no instant flash)
- [ ] Hide delay ≥ 100ms (gap-bridging works)
- [ ] Cursor can travel from trigger to card without card closing
- [ ] Card also shows on focus (keyboard accessible)
- [ ] Trigger is a link that navigates on click/tap (touch fallback)
- [ ] Content available elsewhere (card is convenience, not only path)
- [ ] Positioned with collision detection (Floating UI: flip + shift)
- [ ] Card never covers the trigger element
- [ ] Loading state (skeleton) for async content
- [ ] Content cached after first fetch
- [ ] Interactive elements inside card are focusable
- [ ] `prefers-reduced-motion`: no entrance animation
- [ ] Touch devices: hover card never shown; trigger navigates directly
- [ ] Card content sanitized against XSS
- [ ] API respects permissions (no info leakage)
- [ ] Only one hover card visible at a time (singleton)
- [ ] No nested hover cards (or max 1 level)
- [ ] Performance: content lazy-loaded, DOM lazy-mounted
* * *

## 17\. Visual Styles
The same hover card rendered across eleven aesthetics. The style is skin; the delay mechanics, focus behavior, positioning, and content sanitization never change.

**Flat:** solid surface with 1px border, subtle shadow. Clean and universal. No arrow needed if offset is small.

**Material:** elevated card (dp8) with M3 surface-container-high color. Rounded corners following M3 shape scale. Content follows M3 typography roles.

**Glassmorphism:** frosted glass card over blurred page content. 1px light border for edge. Avatar and text float over the glass. Guard text contrast.

**Liquid Glass (2026):** refractive card surface with specular rim. Content appears to float behind the glass with a depth effect. The macOS Quick Look / iOS preview feel.

**Neumorphism:** card raised from the soft page surface with dual shadows. Content inside is flush. Low-contrast risk on secondary text.

**Skeuomorphism:** card looks like a physical card (paper texture, slight curl shadow). Avatar has a glossy photo frame. Buttons are beveled.

**Neo-Brutalism:** thick 2-3px border, hard offset shadow. Bold typography inside. Arrow is a solid black triangle.

**Claymorphism:** puffy rounded card with soft inner glow. Content elements are also rounded. Playful, friendly.

**Aurora/Gradient:** card has a subtle gradient border. On appearance, the gradient briefly pulses. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** no shadow, thin 1px border. Content is pure typography with generous whitespace. No arrow. Maximum restraint.

**UJG Brand:** Night surface card with Eminence border and subtle Goldenrod glow on appearance. Avatar ring in Eminence. Action buttons in Goldenrod. The house default.

Full style definitions on the 🎨 Design Styles (visual languages) ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).