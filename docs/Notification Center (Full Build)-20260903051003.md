# Notification Center (Full Build)

# The Notification Center: A Senior Engineer's Complete Breakdown
The bell icon + dropdown panel for in-app notifications. Here's everything from first principles to production code.

**Try it live:** the interactive playground (built in a later pass) will let you toggle unread count, grouped/flat views, real-time updates, and notification types, then output code for every target.

**Audit a notification center:** the companion audit checks trigger labeling, live-region announcements, keyboard navigation, and focus management, then exports a client-ready report.

This doc follows the Private ([https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531](https://app.clickup.com/8495850/docs/838qa-81211/838qa-200531)) and its visual styles are drawn from the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).

* * *
## 1\. What a Notification Center Actually Is
A **notification center** is a persistent UI element (typically a bell icon button with an unread badge) that opens a panel listing recent in-app notifications. It's the in-app equivalent of your phone's notification shade: a collected, reviewable history of things that need attention.

The distinctions:

**Notification Center (this doc):** persistent bell trigger + panel with a collected list of notifications. Notifications persist until read/dismissed.
**Toast/Snackbar:** ephemeral, auto-dismissing messages. Fire once and disappear. A toast is a flash; a notification persists in the center.
**Alert (inline):** a status banner within the page flow. Tied to specific content.
**Push notification:** OS-level notification (browser Notification API, mobile push). External to the app. The notification center is the in-app _record_ of what happened.
**Activity feed/Timeline:** a chronological stream of all events. A notification center is curated: only things that _need your attention_.
**Email/Inbox:** persistent messages with full content. Notifications are short signals pointing to something else.

The through-line: a notification center answers "what happened that I should know about?" in a glanceable, persistent format.

* * *
## 2\. Why It Matters
**Engagement driver.** Notifications drive users back to action: "You have a new comment," "Your export is ready," "3 tasks due today." A well-designed notification center increases DAU/MAU by surfacing reasons to re-engage.

**Reduces missed signals.** Without a center, transient toasts are the only signal. If the user blinked, they missed it. The center provides a permanent record.

**Reduces interruption.** Instead of modal popups or aggressive toasts for every event, less-urgent notifications collect silently in the center. Users check them at their pace.

**Conversely: notification fatigue kills engagement.** A center full of noise ("John viewed your profile" × 50) trains users to ignore it. Curation matters more than volume.

* * *
## 3\. Anatomy
**Trigger button:** bell icon (or similar) in the app header. Always visible. Contains the unread badge.

**Unread badge:** a count or dot indicator on the trigger. Shows how many unread notifications exist. Common patterns: exact count ("3"), capped count ("9+"), or just a dot ("something's new").

**Panel:** the dropdown/popover that opens on click. Contains the notification list.

**Panel header:** "Notifications" title + "Mark all read" action + optional filter tabs (All / Mentions / System).

**Notification items:** each notification has:
*   Icon or avatar (who/what triggered it)
*   Title/summary text
*   Body/detail (optional, 1-2 lines)
*   Timestamp (relative: "2h ago")
*   Read/unread indicator (dot, bold text, or background tint)
*   Action(s) (optional: Accept/Reject, View, Dismiss)

**Group headers (optional):** "Today", "Yesterday", "Earlier" grouping.

**Empty state:** "No notifications" illustration when the list is empty.

**Footer (optional):** "View all notifications" link to a full notifications page.

**Loading state:** skeleton items while fetching.

* * *
## 4\. Sizes / Scale

| Element | Dimensions | Notes |
| ---| ---| --- |
| Trigger button | 40px icon button | Standard header icon button size |
| Unread badge | 16-20px diameter | Positioned top-right of trigger |
| Panel width | 320-400px | Wider panels feel email-like; keep compact |
| Panel max-height | 60-70vh | Scroll within for overflow |
| Notification item | 64-80px min-height | Avatar/icon (32-40px) + text + timestamp |
| Item padding | 12-16px | Comfortable touch targets |

On mobile: the panel may be full-screen or a bottom sheet instead of a dropdown.

* * *
## 5\. States
**All read (no badge):** bell icon without a badge. The user is caught up. Panel still openable to review past notifications.

**Unread (badge visible):** badge shows count or dot. The user has unseen notifications.

**Panel closed:** default state. Only the trigger is visible.

**Panel open:** dropdown visible below the trigger. Focus moves inside.

**Item unread:** notification hasn't been seen/clicked. Bold title, colored dot, or tinted background.

**Item read:** notification has been seen. Normal weight, no dot, standard background.

**Item with actions:** notification includes accept/reject or other inline actions.

**Loading:** panel opened but notifications are being fetched. Show skeleton items.

**Empty:** no notifications at all. Show empty state illustration + message.

**Real-time update:** a new notification arrives while the panel is closed (badge increments) or open (item prepends with entrance animation).

**Error:** failed to fetch notifications. Show error state with retry button.

* * *
## 6\. Types / Variants
**Simple list:** flat chronological list, newest first. No grouping.

**Grouped by date:** "Today", "Yesterday", "This week", "Earlier" sections.

**Tabbed/Filtered:** tabs across the panel header (All / Mentions / System / Invites). Each tab shows a subset.

**With categories:** notifications are color-coded or icon-coded by type (comment, assignment, system, billing).

**Actionable:** notifications with inline action buttons (Accept invitation, View comment, Approve request). The action resolves the notification.

**Stackable/Grouped:** similar notifications collapse ("Sarah and 3 others commented on your post" instead of 4 separate items).

**Real-time:** new notifications stream in via WebSocket. The panel updates live.

**With preferences:** a settings link/gear icon opens notification preferences (which types to receive, email vs. in-app).

* * *
## 7\. When to Use (and When Not To)
**Use a notification center when:**
*   Your app generates events users should know about
*   Events happen asynchronously (while the user is doing other things)
*   Users need a history of what happened (not just ephemeral alerts)
*   Multiple types of notifications exist (comments, assignments, system events)

**Use something else when:**
*   It's a real-time chat → Chat/messaging interface
*   It's a critical blocking alert → Modal/Dialog
*   It's a one-time confirmation → Toast
*   It's about the current page context → Inline alert/banner
*   The app has no async events (simple static site) → Don't add a bell for show

* * *
## 8\. Across Design Systems
**No design system ships a full notification center** as a single component. It's a composite pattern built from primitives: Popover + List + Badge + Button.

**Radix:** compose from `Popover` + custom content.
**shadcn:** community examples combine `Popover` + `ScrollArea` + styled list items.
**Ant Design:** `<Badge>` on trigger + `<Popover>` or `<Drawer>` for panel + `<List>` for items.
**Material:** uses `Badge` on an `IconButton` + `Menu` or `Drawer` for the panel.
**Apple HIG:** native notification center in iOS/macOS is system-level. In-app, teams build custom.

For real-time delivery infrastructure: **Novu**, **Knock**, **OneSignal**, **Pusher** provide backend + prebuilt React components.

* * *
## 9\. The Code
### 9.1 HTML + ARIA

```html
<!-- Trigger -->
<button type="button" class="notif-trigger" aria-label="Notifications, 3 unread"
        aria-haspopup="true" aria-expanded="false" aria-controls="notif-panel">
  <svg aria-hidden="true"><!-- bell icon --></svg>
  <span class="notif-badge" aria-hidden="true">3</span>
</button>

<!-- Panel -->
<div id="notif-panel" class="notif-panel" role="region" aria-label="Notifications" hidden>
  <header class="notif-header">
    <h2 class="notif-header__title">Notifications</h2>
    <button type="button" class="notif-header__action">Mark all read</button>
  </header>

  <ul class="notif-list" aria-label="Notification list">
    <li class="notif-item notif-item--unread">
      <img src="avatar.jpg" alt="" class="notif-item__avatar" />
      <div class="notif-item__content">
        <p class="notif-item__text"><strong>Sarah</strong> commented on your task</p>
        <time class="notif-item__time" datetime="2026-07-22T12:30:00">2h ago</time>
      </div>
      <span class="notif-item__dot" aria-label="Unread"></span>
    </li>
    <li class="notif-item">
      <div class="notif-item__icon" aria-hidden="true">
        <svg><!-- system icon --></svg>
      </div>
      <div class="notif-item__content">
        <p class="notif-item__text">Your export is ready to download</p>
        <time class="notif-item__time" datetime="2026-07-22T10:00:00">4h ago</time>
      </div>
    </li>
  </ul>

  <footer class="notif-footer">
    <a href="/notifications">View all</a>
  </footer>
</div>
```

Key decisions:
*   **Trigger** **`aria-label`** **includes unread count** ("Notifications, 3 unread"). Updated dynamically. This is how AT users know there are unread items without seeing the visual badge.
*   **`aria-haspopup="true"`** **+** **`aria-expanded`** on the trigger. Standard popover pattern.
*   **Panel uses** **`role="region"`** **with** **`aria-label`** (alternative: `role="dialog"` if it traps focus like a modal). Region is lighter; the panel doesn't block the page.
*   **`<ul>`** **for the notification list.** Screen readers announce "list, 5 items."
*   **Unread dot has** **`aria-label="Unread"`** or is paired with sr-only text. The visual dot alone means nothing to AT.
*   **Badge on trigger is** **`aria-hidden="true"`** because the count is in the `aria-label` already. Don't announce it twice.
### 9.2 CSS

```css
.notif-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--icon-fg, oklch(75% 0.01 305));
  cursor: pointer;
}

.notif-trigger:hover { background: var(--hover-bg, oklch(25% 0.015 305)); }
.notif-trigger:focus-visible { outline: 2px solid var(--ring, oklch(78% 0.135 82)); outline-offset: 2px; }

.notif-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: oklch(55% 0.22 25);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}

.notif-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  max-height: 65vh;
  background: var(--panel-bg, oklch(16% 0.015 305));
  border: 1px solid var(--panel-border, oklch(28% 0.02 305));
  border-radius: 12px;
  box-shadow: 0 8px 32px oklch(0% 0 0 / 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--panel-border);
}

.notif-header__title { font-size: 0.95rem; font-weight: 600; }
.notif-header__action {
  font-size: 0.75rem;
  color: var(--link, oklch(78% 0.135 82));
  background: none; border: none; cursor: pointer;
}

.notif-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-border, oklch(24% 0.015 305));
  cursor: pointer;
  transition: background 0.12s;
}

.notif-item:hover { background: var(--item-hover, oklch(20% 0.015 305)); }

.notif-item--unread {
  background: var(--item-unread, oklch(18% 0.025 305));
}

.notif-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.notif-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(25% 0.03 305);
  flex-shrink: 0;
}

.notif-item__content { flex: 1; min-width: 0; }
.notif-item__text { font-size: 0.82rem; line-height: 1.4; margin-bottom: 4px; }
.notif-item__time { font-size: 0.7rem; color: var(--text-muted, oklch(55% 0.01 305)); }

.notif-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: oklch(60% 0.2 260);
  flex-shrink: 0;
  margin-top: 6px;
}

.notif-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--panel-border);
  text-align: center;
}

.notif-footer a {
  font-size: 0.78rem;
  color: var(--link);
  text-decoration: none;
}
```

### 9.3 React + TypeScript

```typescript
import { useState, useRef, useEffect } from "react";

interface Notification {
  id: string;
  type: "comment" | "assignment" | "system" | "mention";
  title: string;
  body?: string;
  timestamp: string;
  datetime: string;
  read: boolean;
  avatar?: string;
  href?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function NotificationCenter({ notifications, onMarkAllRead, onMarkRead, onDismiss }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="notif-wrapper" style={{ position: 'relative' }}>
      <button ref={triggerRef} className="notif-trigger" onClick={() => setOpen(!open)}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-haspopup="true" aria-expanded={open} aria-controls="notif-panel">
        <BellIcon aria-hidden="true" />
        {unreadCount > 0 && <span className="notif-badge" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div ref={panelRef} id="notif-panel" className="notif-panel" role="region" aria-label="Notifications">
          <header className="notif-header">
            <h2 className="notif-header__title">Notifications</h2>
            {unreadCount > 0 && (
              <button className="notif-header__action" onClick={onMarkAllRead}>Mark all read</button>
            )}
          </header>

          {notifications.length === 0 ? (
            <div className="notif-empty">
              <p>No notifications</p>
            </div>
          ) : (
            <ul className="notif-list" aria-label="Notifications">
              {notifications.map(notif => (
                <li key={notif.id} className={`notif-item ${!notif.read ? 'notif-item--unread' : ''}`}
                    onClick={() => { onMarkRead(notif.id); if (notif.href) window.location.href = notif.href; }}>
                  {notif.avatar ? (
                    <img src={notif.avatar} alt="" className="notif-item__avatar" />
                  ) : (
                    <div className="notif-item__icon" aria-hidden="true"><TypeIcon type={notif.type} /></div>
                  )}
                  <div className="notif-item__content">
                    <p className="notif-item__text" dangerouslySetInnerHTML={{ __html: notif.title }} />
                    <time className="notif-item__time" dateTime={notif.datetime}>{notif.timestamp}</time>
                  </div>
                  {!notif.read && <span className="notif-item__dot" aria-label="Unread" />}
                </li>
              ))}
            </ul>
          )}

          <footer className="notif-footer">
            <a href="/notifications">View all</a>
          </footer>
        </div>
      )}
    </div>
  );
}
```

### 9.4 Real-time updates (WebSocket)

```typescript
function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/notifications?user=${userId}`);

    ws.onmessage = (event) => {
      const newNotif: Notification = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
      announce(`New notification: ${newNotif.title}`);
    };

    return () => ws.close();
  }, [userId]);

  return notifications;
}

function announce(message: string) {
  const region = document.getElementById('sr-announcer') ||
    (() => { const el = document.createElement('div'); el.id = 'sr-announcer'; el.setAttribute('aria-live', 'polite'); el.setAttribute('aria-atomic', 'true'); el.className = 'sr-only'; document.body.appendChild(el); return el; })();
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}
```

### 9.5 Tailwind CSS

```html
<!-- Trigger -->
<div class="relative">
  <button class="relative w-10 h-10 rounded-lg inline-flex items-center justify-center text-gray-400
                 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-amber-400"
          aria-label="Notifications, 3 unread" aria-haspopup="true" aria-expanded="false">
    <svg class="w-5 h-5" aria-hidden="true"><!-- bell --></svg>
    <span class="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500
                 text-white text-[11px] font-semibold flex items-center justify-center" aria-hidden="true">3</span>
  </button>

  <!-- Panel -->
  <div class="absolute right-0 mt-2 w-[360px] max-h-[65vh] rounded-xl bg-gray-900 border border-gray-700
              shadow-xl overflow-hidden flex flex-col z-50"
       role="region" aria-label="Notifications">
    <header class="flex items-center justify-between px-4 py-3 border-b border-gray-800">
      <h2 class="text-sm font-semibold">Notifications</h2>
      <button class="text-xs text-purple-400 hover:text-purple-300">Mark all read</button>
    </header>
    <ul class="flex-1 overflow-y-auto divide-y divide-gray-800" aria-label="Notifications">
      <li class="flex items-start gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 cursor-pointer">
        <img src="/avatar.jpg" alt="" class="w-9 h-9 rounded-full" />
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-200"><strong>Sarah</strong> commented on your task</p>
          <time class="text-xs text-gray-500">2h ago</time>
        </div>
        <span class="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" aria-label="Unread"></span>
      </li>
    </ul>
    <footer class="px-4 py-2.5 border-t border-gray-800 text-center">
      <a href="/notifications" class="text-xs text-purple-400 hover:text-purple-300">View all</a>
    </footer>
  </div>
</div>
```

### 9.6 Next.js (with streaming + Server Actions)

```typescript
// app/components/notification-center.tsx
"use client";
import { NotificationCenter } from "@/components/notification-center";
import { markAllRead, markRead } from "@/app/actions/notifications";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationCenterWrapper() {
  const { notifications, mutate } = useNotifications(); // SWR or React Query

  return (
    <NotificationCenter
      notifications={notifications}
      onMarkAllRead={async () => { await markAllRead(); mutate(); }}
      onMarkRead={async (id) => { await markRead(id); mutate(); }}
    />
  );
}

// app/actions/notifications.ts
"use server";
import { revalidatePath } from "next/cache";

export async function markAllRead() {
  await db.markAllNotificationsRead(getCurrentUserId());
  revalidatePath("/", "layout"); // Refresh badge count everywhere
}

export async function markRead(id: string) {
  await db.markNotificationRead(getCurrentUserId(), id);
  revalidatePath("/", "layout");
}

// API route for real-time (Server-Sent Events):
// app/api/notifications/stream/route.ts
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sub = pubsub.subscribe(`notif:${getUserId(req)}`, (notif) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(notif)}\n\n`));
      });
      req.signal.addEventListener('abort', () => { sub.unsubscribe(); controller.close(); });
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
}
```

### 9.7 Vue 3

```html
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Notification { id: string; title: string; timestamp: string; read: boolean; avatar?: string; }

const open = ref(false);
const notifications = ref<Notification[]>([]);
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

function markAllRead() { notifications.value.forEach(n => n.read = true); }
function markRead(id: string) { const n = notifications.value.find(x => x.id === id); if (n) n.read = true; }
function toggle() { open.value = !open.value; }

// Real-time via SSE
let eventSource: EventSource;
onMounted(() => {
  eventSource = new EventSource('/api/notifications/stream');
  eventSource.onmessage = (e) => {
    notifications.value.unshift(JSON.parse(e.data));
  };
});
onUnmounted(() => eventSource?.close());
</script>

<template>
  <div class="notif-wrapper" v-click-outside="() => open = false">
    <button @click="toggle" :aria-label="`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`"
            aria-haspopup="true" :aria-expanded="open" class="notif-trigger">
      <BellIcon aria-hidden="true" />
      <span v-if="unreadCount" class="notif-badge" aria-hidden="true">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>
    <div v-if="open" class="notif-panel" role="region" aria-label="Notifications" @keydown.escape="open = false">
      <header class="notif-header">
        <h2>Notifications</h2>
        <button v-if="unreadCount" @click="markAllRead">Mark all read</button>
      </header>
      <ul class="notif-list" aria-label="Notifications">
        <li v-for="n in notifications" :key="n.id" :class="['notif-item', { 'notif-item--unread': !n.read }]"
            @click="markRead(n.id)">
          <img v-if="n.avatar" :src="n.avatar" alt="" class="notif-item__avatar" />
          <div class="notif-item__content">
            <p v-html="n.title"></p>
            <time class="notif-item__time">{{ n.timestamp }}</time>
          </div>
          <span v-if="!n.read" class="notif-item__dot" aria-label="Unread"></span>
        </li>
      </ul>
      <div v-if="!notifications.length" class="notif-empty">No notifications</div>
    </div>
  </div>
</template>
```

### 9.8 Svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  let open = false;
  let notifications: Array<{ id: string; title: string; timestamp: string; read: boolean; avatar?: string }> = [];
  $: unreadCount = notifications.filter(n => !n.read).length;

  function toggle() { open = !open; }
  function markAllRead() { notifications = notifications.map(n => ({ ...n, read: true })); }
  function markRead(id: string) { notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n); }

  let eventSource: EventSource;
  onMount(() => {
    eventSource = new EventSource('/api/notifications/stream');
    eventSource.onmessage = (e) => { notifications = [JSON.parse(e.data), ...notifications]; };
  });
  onDestroy(() => eventSource?.close());
</script>

<div class="notif-wrapper">
  <button on:click={toggle} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          aria-haspopup="true" aria-expanded={open} class="notif-trigger">
    <BellIcon />
    {#if unreadCount}<span class="notif-badge" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>{/if}
  </button>
  {#if open}
    <div class="notif-panel" role="region" aria-label="Notifications" on:keydown={(e) => { if (e.key === 'Escape') open = false; }}>
      <header class="notif-header">
        <h2>Notifications</h2>
        {#if unreadCount}<button on:click={markAllRead}>Mark all read</button>{/if}
      </header>
      <ul class="notif-list">
        {#each notifications as n (n.id)}
          <li class="notif-item" class:notif-item--unread={!n.read} on:click={() => markRead(n.id)}>
            {#if n.avatar}<img src={n.avatar} alt="" class="notif-item__avatar" />{/if}
            <div class="notif-item__content"><p>{@html n.title}</p><time>{n.timestamp}</time></div>
            {#if !n.read}<span class="notif-item__dot" aria-label="Unread"></span>{/if}
          </li>
        {/each}
      </ul>
      {#if !notifications.length}<div class="notif-empty">No notifications</div>{/if}
    </div>
  {/if}
</div>
```

### 9.9 SwiftUI

```swift
import SwiftUI

struct NotificationCenterView: View {
    @StateObject var viewModel = NotificationViewModel()
    @State private var showPanel = false

    var body: some View {
        Button(action: { showPanel.toggle() }) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell")
                    .font(.system(size: 20))
                if viewModel.unreadCount > 0 {
                    Text(viewModel.unreadCount > 9 ? "9+" : "\(viewModel.unreadCount)")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(4)
                        .background(Circle().fill(Color.red))
                        .offset(x: 8, y: -8)
                }
            }
        }
        .accessibilityLabel("Notifications\(viewModel.unreadCount > 0 ? ", \(viewModel.unreadCount) unread" : "")")
        .popover(isPresented: $showPanel) {
            NavigationStack {
                List {
                    ForEach(viewModel.notifications) { notif in
                        NotificationRow(notification: notif)
                            .onTapGesture { viewModel.markRead(notif.id) }
                    }
                }
                .listStyle(.plain)
                .navigationTitle("Notifications")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Mark all read") { viewModel.markAllRead() }
                            .disabled(viewModel.unreadCount == 0)
                    }
                }
                .overlay {
                    if viewModel.notifications.isEmpty {
                        ContentUnavailableView("No notifications", systemImage: "bell.slash")
                    }
                }
            }
            .frame(width: 350, height: 450)
        }
    }
}
```

### 9.10 Jetpack Compose

```kotlin
@Composable
fun NotificationCenter(viewModel: NotificationViewModel = viewModel()) {
    var showPanel by remember { mutableStateOf(false) }
    val unreadCount = viewModel.notifications.count { !it.read }

    Box {
        // Trigger
        IconButton(onClick = { showPanel = true }) {
            BadgedBox(badge = {
                if (unreadCount > 0) Badge { Text(if (unreadCount > 9) "9+" else "$unreadCount") }
            }) { Icon(Icons.Default.Notifications, contentDescription = "Notifications${if (unreadCount > 0) ", $unreadCount unread" else ""}") }
        }

        // Panel as dropdown
        DropdownMenu(expanded = showPanel, onDismissRequest = { showPanel = false }) {
            Text("Notifications", style = MaterialTheme.typography.titleSmall, modifier = Modifier.padding(16.dp))
            if (unreadCount > 0) {
                TextButton(onClick = { viewModel.markAllRead() }, modifier = Modifier.padding(horizontal = 16.dp)) {
                    Text("Mark all read", style = MaterialTheme.typography.labelSmall)
                }
            }
            HorizontalDivider()
            if (viewModel.notifications.isEmpty()) {
                Text("No notifications", modifier = Modifier.padding(32.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
            } else {
                viewModel.notifications.forEach { notif ->
                    DropdownMenuItem(
                        text = {
                            Column {
                                Text(notif.title, fontWeight = if (!notif.read) FontWeight.Bold else FontWeight.Normal)
                                Text(notif.timestamp, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        },
                        onClick = { viewModel.markRead(notif.id); showPanel = false },
                        leadingIcon = { if (notif.avatar != null) AsyncImage(model = notif.avatar, modifier = Modifier.size(32.dp).clip(CircleShape)) }
                    )
                }
            }
        }
    }
}
```

### 9.11 Flutter

```dart
import 'package:flutter/material.dart';

class NotificationCenterWidget extends StatefulWidget {
  const NotificationCenterWidget({super.key});
  @override State<NotificationCenterWidget> createState() => _NotificationCenterState();
}

class _NotificationCenterState extends State<NotificationCenterWidget> {
  final List<NotificationItem> _notifications = []; // Populated from API/stream
  int get _unreadCount => _notifications.where((n) => !n.read).length;

  void _markAllRead() => setState(() => _notifications.forEach((n) => n.read = true));
  void _markRead(String id) => setState(() => _notifications.firstWhere((n) => n.id == id).read = true);

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      offset: const Offset(0, 48),
      icon: Badge(
        isLabelVisible: _unreadCount > 0,
        label: Text(_unreadCount > 9 ? '9+' : '$_unreadCount'),
        child: const Icon(Icons.notifications_outlined),
      ),
      tooltip: 'Notifications${_unreadCount > 0 ? ', $_unreadCount unread' : ''}',
      itemBuilder: (context) => [
        PopupMenuItem(enabled: false, child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Notifications', style: Theme.of(context).textTheme.titleSmall),
            if (_unreadCount > 0) TextButton(onPressed: _markAllRead, child: const Text('Mark all read')),
          ],
        )),
        const PopupMenuDivider(),
        if (_notifications.isEmpty)
          const PopupMenuItem(enabled: false, child: Center(child: Text('No notifications')))
        else
          ..._notifications.map((n) => PopupMenuItem(
            value: n.id,
            onTap: () => _markRead(n.id),
            child: ListTile(
              leading: n.avatar != null ? CircleAvatar(backgroundImage: NetworkImage(n.avatar!), radius: 18) : null,
              title: Text(n.title, style: TextStyle(fontWeight: n.read ? FontWeight.normal : FontWeight.bold)),
              subtitle: Text(n.timestamp),
              dense: true, contentPadding: EdgeInsets.zero,
              trailing: !n.read ? Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.blue, shape: BoxShape.circle)) : null,
            ),
          )),
      ],
    );
  }
}

class NotificationItem { String id; String title; String timestamp; bool read; String? avatar;
  NotificationItem({required this.id, required this.title, required this.timestamp, this.read = false, this.avatar}); }
```

### 9.12 Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NotificationCenter } from "./NotificationCenter";

const mockNotifs = [
  { id: '1', type: 'comment', title: '<strong>Sarah</strong> commented', timestamp: '2h ago', datetime: '2026-07-22T12:30:00', read: false },
  { id: '2', type: 'system', title: 'Export ready', timestamp: '4h ago', datetime: '2026-07-22T10:00:00', read: true },
];

describe("NotificationCenter", () => {
  it("trigger label includes unread count", () => {
    render(<NotificationCenter notifications={mockNotifs} onMarkAllRead={() => {}} onMarkRead={() => {}} />);
    expect(screen.getByRole('button', { name: /notifications, 1 unread/i })).toBeInTheDocument();
  });

  it("badge shows unread count", () => {
    const { container } = render(<NotificationCenter notifications={mockNotifs} onMarkAllRead={() => {}} onMarkRead={() => {}} />);
    expect(container.querySelector('.notif-badge')?.textContent).toBe('1');
  });

  it("opens panel on click", async () => {
    render(<NotificationCenter notifications={mockNotifs} onMarkAllRead={() => {}} onMarkRead={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to trigger", async () => {
    render(<NotificationCenter notifications={mockNotifs} onMarkAllRead={() => {}} onMarkRead={() => {}} />);
    const trigger = screen.getByRole('button', { name: /notifications/i });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: /notifications/i })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("mark all read fires callback", async () => {
    const onMarkAll = vi.fn();
    render(<NotificationCenter notifications={mockNotifs} onMarkAllRead={onMarkAll} onMarkRead={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await userEvent.click(screen.getByText(/mark all read/i));
    expect(onMarkAll).toHaveBeenCalled();
  });

  it("shows empty state when no notifications", async () => {
    render(<NotificationCenter notifications={[]} onMarkAllRead={() => {}} onMarkRead={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<NotificationCenter notifications={mockNotifs} onMarkAllRead={() => {}} onMarkRead={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

* * *
## 10\. Accessibility
**Trigger button:**
*   `aria-label` is dynamic: "Notifications, 3 unread" (when unread exist) or just "Notifications" (when all read).
*   `aria-haspopup="true"` tells AT a popup will appear.
*   `aria-expanded="true|false"` reflects panel open state.
*   The visual badge is `aria-hidden="true"` (the count is in the label).

**Panel:**
*   `role="region"` with `aria-label="Notifications"`. Lightweight container; doesn't trap focus like a dialog.
*   If the panel is designed as a modal (with backdrop), use `role="dialog"` + `aria-modal="true"` + focus trap.
*   Close on Escape. Return focus to trigger.

**Notification list:**
*   Semantic `<ul>` with `<li>` per item.
*   Each item should be a focusable element (link or button) if clickable.
*   Unread indicator: don't rely on the visual dot alone. Add `aria-label="Unread"` or include "(new)" in the text for AT.

**Real-time updates:**
*   When a new notification arrives (panel closed): update the `aria-label` count on the trigger. AT won't re-announce it unless it's a live region, which is appropriate.
*   When a new notification arrives (panel open): prepend the item. Use `aria-live="polite"` on a region to announce "New notification: \[title\]."
*   Don't use `aria-live="assertive"` for notifications. They're not urgent enough to interrupt.

**Mark-all-read button:** provide an accessible label. After clicking, announce "All notifications marked as read" via a live region.

**Focus management:**
*   On open: focus moves to the panel (or the first item, or the header).
*   On close: focus returns to the trigger.
*   Tab within the panel cycles through interactive elements (items, actions, footer link).

* * *
## 11\. Innovative / Emerging Ideas
*   **Stacked notifications:** similar events grouped ("Sarah and 4 others commented") with expand to see individual items.
*   **Notification preferences inline:** a quick toggle per notification type ("Mute comments on this task") without navigating to settings.
*   **AI-prioritized:** notifications ranked by relevance/urgency using AI, not just chronological.
*   **Snooze:** "Remind me in 1 hour" per notification. The notification disappears and reappears later.
*   **Rich media notifications:** inline image previews, video thumbnails, interactive components within the notification item.
*   **Cross-device sync:** mark as read on one device, reflected instantly on others.
*   **Notification categories with colored indicators:** visual color-coding by type (mentions = blue, assignments = purple, system = gray) with non-color backup (icons).
*   **Sound/haptic on arrival:** configurable per notification type.

* * *
## 12\. Conversion / UX Killers
*   **Too many low-value notifications:** "John viewed your profile" × 50 trains users to ignore the entire center. Curate ruthlessly.
*   **No way to clear/dismiss:** notifications pile up with no bulk action. "Mark all read" is minimum viable.
*   **Badge anxiety:** a permanently-present red badge with a high number creates stress. Allow users to clear it easily.
*   **Notifications that don't link anywhere:** "New comment" with no way to navigate to the comment. Every notification should deep-link to its source.
*   **Panel that's too small to read:** cramming long text into a 280px panel. Give items room to breathe.
*   **No empty state:** opening to a blank white box. Show a friendly "All caught up" message.
*   **No loading state:** panel opens blank, then items pop in. Show skeleton items immediately.
*   **Real-time updates that thrash the UI:** 50 notifications arriving in 1 second. Batch updates and throttle the UI.
*   **Bell icon with no notifications ever:** a bell that's always empty. Remove it until the feature is actually generating notifications.
*   **No preferences:** users can't control what they receive. They'll ignore or disable everything.

* * *
## 13\. Advanced Patterns
### Infinite scroll / pagination in the panel

```typescript
const { notifications, loading, loadMore, hasMore } = usePaginatedNotifications();

// In the panel:
<ul className="notif-list" onScroll={(e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) loadMore();
}}>
  {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
  {loading && <SkeletonItem />}
</ul>
```

### Optimistic mark-as-read

```typescript
function markRead(id: string) {
  // Optimistic: update UI immediately
  setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  // Then sync with server
  api.markRead(id).catch(() => {
    // Revert on failure
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
  });
}
```

### Badge count sync
Keep the badge count accurate across tabs using `BroadcastChannel`:

```typescript
const channel = new BroadcastChannel('notifications');
channel.onmessage = (e) => {
  if (e.data.type === 'mark-read') {
    setNotifications(prev => prev.map(n => n.id === e.data.id ? { ...n, read: true } : n));
  }
};

// When marking read in this tab:
channel.postMessage({ type: 'mark-read', id: notifId });
```

* * *
## 14\. Performance & Bundle Cost
*   **Don't fetch all notifications on page load.** Fetch only the count (for the badge). Load the full list when the panel opens.
*   **Paginate the list.** Don't load 500 notifications at once. Load 20, lazy-load more on scroll.
*   **Batch real-time updates.** If 10 notifications arrive in 1 second, batch them into one state update and one DOM paint.
*   **WebSocket heartbeat:** maintain the connection efficiently. Reconnect on drop with exponential backoff.
*   **Memoize notification items.** Each `<li>` should only re-render when its own data changes, not when any notification changes.
*   **Panel lazy-mount:** don't render the panel DOM when it's closed. Mount on open, unmount on close.
*   **Thumbnail lazy-loading:** avatars and images in notifications should use `loading="lazy"`.

* * *
## 15\. Security
*   **Authorization per notification.** The API must only return notifications the requesting user is authorized to see. Never expose another user's notifications.
*   **XSS in notification content.** If notification text includes user-generated content (names, comment excerpts), sanitize server-side before delivery. The React `dangerouslySetInnerHTML` example above is risky; prefer pre-sanitized HTML or structured data rendered safely.
*   **Notification spoofing.** Validate WebSocket messages server-side. A malicious client shouldn't be able to inject fake notifications into another user's feed.
*   **Rate limiting on mark-as-read.** Prevent abuse of the mark-all-read endpoint (bulk status changes as a DoS vector).
*   **Deep-link validation.** Notification `href` values should be validated against allowed domains/paths. A compromised notification system shouldn't be able to redirect users to malicious URLs.
*   **Sensitive content in notifications.** Don't include full message content in notifications visible on lock screens or browser title bars. Use generic summaries ("New message from Sarah") rather than the actual text.

* * *
## 16\. Senior-Level Checklist
- [ ] Trigger `aria-label` includes dynamic unread count
- [ ] `aria-haspopup` + `aria-expanded` on trigger
- [ ] Badge is `aria-hidden` (count is in the label)
- [ ] Panel has `role="region"` (or `role="dialog"`) with `aria-label`
- [ ] Close on Escape, focus returns to trigger
- [ ] Notification list is semantic `<ul>`
- [ ] Each item is keyboard-focusable (link or button)
- [ ] Unread state conveyed by more than visual dot (aria-label or text)
- [ ] Real-time updates announced via `aria-live="polite"`
- [ ] Mark-all-read action accessible and announced
- [ ] Empty state shown when no notifications
- [ ] Loading state (skeleton) while fetching
- [ ] Error state with retry on fetch failure
- [ ] Deep-link on every notification item
- [ ] Notifications paginated (not all loaded at once)
- [ ] WebSocket reconnection with backoff
- [ ] Badge count synced across tabs
- [ ] Notification content sanitized against XSS
- [ ] API scoped to authorized user only
- [ ] `prefers-reduced-motion`: no animated entrances for new items

* * *
## 17\. Visual Styles
The same notification center rendered across eleven aesthetics. The style is skin; the trigger labeling, panel ARIA, keyboard behavior, and live-region announcements never change.

**Flat:** clean panel with 1px border, subtle shadow. Items separated by hairline borders. Unread dot is a solid circle. The universal default.

**Material:** elevated panel (dp8 shadow). Items follow M3 list-item spec with leading avatar, two-line text, trailing metadata. Unread indicator is a tonal background tint.

**Glassmorphism:** frosted glass panel over blurred page content. Items have translucent hover states. Badge is a bright solid dot visible through the glass.

**Liquid Glass (2026):** refractive panel with specular rim. Items have a subtle glass divider. The unread dot refracts light. Premium and native-feeling.

**Neumorphism:** panel raised from soft surface. Items are flush, separated by soft shadows. Unread items have a different shadow depth. Contrast risk on text.

**Skeuomorphism:** panel looks like a physical notification drawer or clipboard. Items are "cards" with paper texture. Badge is a red sticker.

**Neo-Brutalism:** thick-bordered panel with hard offset shadow. Items have bold borders. Badge is an oversized bright rectangle, not a circle. Loud.

**Claymorphism:** puffy rounded panel. Items are soft pills. Badge is a clay bubble. Playful, consumer-facing.

**Aurora/Gradient:** panel has a gradient border accent. New/unread items glow briefly on arrival. Badge has a gradient fill. Honor `prefers-reduced-motion`.

**Minimal/Swiss:** no shadow on panel, just a thin border. Items are text-only with timestamps right-aligned. Unread is a simple bold weight change. Maximum restraint.

**UJG Brand:** Night panel with Eminence border. Items on Night surface; unread items have a subtle Eminence left-accent (2px). Badge is Goldenrod. Timestamps in text-muted Platinum. Avatar rings in Eminence. The house default.

Full style definitions on the Private ([https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551](https://app.clickup.com/8495850/docs/838qa-87871/838qa-200551)).