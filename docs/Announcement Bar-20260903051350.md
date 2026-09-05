# Announcement Bar

# Announcement Bar
A slim, site-wide broadcast strip — the single loudest inch of the page. Here's everything from first principles to production code, at the same depth as the Button reference.
* * *

## 1\. What It Actually Is
An announcement bar is a slim, full-width strip — usually pinned to the very top of the viewport, above or fused with the header — that broadcasts **one** promotional or informational message to **every** visitor of a site: a sale, a shipping cutoff, a maintenance window, a new-feature note. It is site-chrome, not page content. It carries at most a single call-to-action and, in almost every good implementation, a dismiss control that remembers the visitor's choice.

Four components get lumped together and shouldn't be:
*   **Announcement Bar (this):** persistent, site-wide, one editorial message chosen by the business, dismissible with memory. Lives in the layout shell, not the page. "Free shipping over $75 — ends Sunday."
*   **Alert / Banner (page-level status):** contextual to the current page or a specific object — a validation summary, a "your subscription expired" notice, an error at the top of a form. It reacts to state, isn't dismissed-and-remembered site-wide, and uses `role="alert"`/`role="status"` because it's status, not chrome. Ant calls this Alert; Bootstrap calls it Alert; Material calls it a Banner.
*   **Toast / Snackbar (transient):** appears in a corner, announces the result of an action ("Copied to clipboard"), and **auto-dismisses** after a few seconds. Ephemeral, action-scoped, never site-wide, never persistent.
*   **Message Bar / Inline Notification (Fluent's** **`MessageBar`****, Carbon's inline notification):** a status strip scoped to a region or panel — "This connection is read-only." It's a sibling of the alert, embedded in content, not pinned to the top of the whole site.

**Rule of thumb:** if the business chose the message, it applies to the whole site, it survives navigation, and dismissing it should be remembered — it's an announcement bar. If the message is a reaction to _state_ (an error, a result, an expiry), it's an alert or a toast, and you should reach for `role="alert"`/`role="status"` and, for toasts, auto-dismiss. The announcement bar is the only one of the four that is _editorial chrome_ rather than _system status_.
* * *

## 2\. Why It Matters
The announcement bar occupies the highest-value pixels on the entire site — the first thing every visitor sees, on every page, before they've scrolled. That leverage cuts both ways.
*   **Conversion & revenue.** "Free shipping over $75" or "Code SPRING20 — ends tonight" in the bar is one of the highest-ROI merchandising surfaces in e-commerce; a threshold message provably lifts average order value. But it competes with your actual hero CTA — a loud bar with its own strong CTA can _cannibalize_ the primary conversion path. The stakes are measured directly in orders.
*   **Accessibility & the reading order.** Because the bar is the first thing in the DOM, it's the first thing a screen-reader user hears on every page load and the first Tab stop for a keyboard user. Done wrong, it forces every assistive-tech user to wade through a promo before reaching the nav — every single page. Done right (`role="region"` with a label, a real dismiss button, correct focus return), it's a quick, skippable landmark.
*   **Trust & the dark-pattern line.** A countdown that resets on refresh, a fake "3 left in stock," or a dismiss button that reappears on the next click reads as manipulation and erodes trust fast. The bar is where urgency marketing and dark patterns meet; honest scarcity builds trust, fake scarcity torches it (and, under the EU's UCPD/DSA and FTC guidance, can be _illegal_).
*   **Performance & layout stability (CLS).** The bar renders before the hero. If it pushes the whole page down when it appears — or vanishes and yanks content up when dismissed — you ship a Cumulative Layout Shift hit that Core Web Vitals penalizes and users feel as a jerk. Reserving its space or animating with `transform` is a measurable Web Vitals concern, not a nicety.
*   **Legal / compliance surface.** Shipping-policy changes, recall notices, and regulated-industry disclosures often _live_ in the announcement bar. If it's dismissible-and-forgotten, a user may never see a required notice; if it's a cookie/consent bar, it's governed by GDPR/ePrivacy entirely.
* * *

## 3\. Anatomy
Every well-built announcement bar is composed of predictable parts. It's a display component with one interactive control, so the anatomy leans on structure plus the dismiss affordance.
*   **Container (the strip):** the full-viewport-width band, typically 36–56px tall, with a background that signals tone (neutral/promo/urgent). It's the landmark — `role="region"` with an `aria-label` when the content is important, or a plain `<div>` when it's low-stakes decoration.
*   **Leading icon (optional):** a small glyph reinforcing tone — a tag for a sale, a wrench for maintenance, an info circle for a notice. Decorative ones get `aria-hidden="true"`; meaningful ones need a text equivalent.
*   **Message text:** the single editorial line. Should truncate gracefully or wrap on narrow screens (never clip mid-word behind the dismiss button). Verb-and-benefit-forward: "Free shipping over $75 — ends Sunday," not "Notice: promotional offer active."
*   **Inline CTA (single, optional):** at most **one** link or button — "Shop the sale," "Learn more." It's the reason the bar earns its space. More than one CTA and you've diluted the one job the bar has.
*   **Countdown / urgency element (optional):** a live timer ("Ends in 03:42:19") or a threshold cue. Must count down from a _real_ server deadline, and must respect reduced-motion (no frantic tick animation).
*   **Dismiss button (the one interactive control):** an X or "No thanks," right-aligned, with a **real accessible label** ("Dismiss announcement") — never a bare `×` glyph. Minimum 44×44px hit target even if the visual X is smaller. On activation it hides the bar and persists the choice keyed to the announcement's id/version.
*   **Persistence layer (invisible but essential):** the localStorage/cookie key that records _which_ announcement was dismissed (`announcement:v=summer-sale-2026`), so a _new_ announcement re-shows rather than staying hidden forever.
* * *

## 4\. Sizes / Scale / Density
The bar is a system of a very small number of heights — it's meant to be slim. Height should be driven by a spacing token, not a magic number, so the whole system scales and so the reserved space (§14, CLS) matches exactly.

| Tier | Token | Height | Padding (inline) | Font | Use case |
| ---| ---| ---| ---| ---| --- |
| Compact | `--ann-h-sm` | 36px | 12px | 13px | Dense apps, dashboards, secondary notices |
| Default | `--ann-h-md` | 44px | 16px | 14px | Marketing sites, most promos — meets the 44px target in one row |
| Comfortable | `--ann-h-lg` | 56px | 24px | 15px | Hero campaigns, bars with icon + countdown + CTA |
| Wrap (mobile) | `--ann-h-auto` | auto (min 44px) | 12px | 14px | Narrow viewports where the message must wrap to 2 lines |

Rules that matter:
*   **The dismiss target stays ≥44×44px even when the strip is 36px tall** — expand the hit area with padding/pseudo-elements rather than growing the visible X.
*   **Reserve the height as a layout token,** `--ann-h`, and offset the sticky header / page top by the same variable, so appearing and dismissing never shift content (see §14).
*   **On mobile, allow a wrap tier** rather than truncating the message into meaninglessness; a two-line bar with a full-width tap-through beats an ellipsis that hides the offer.
*   **Never stack multiple bars.** If you have two things to say, rotate them in one strip (see §6) or pick one. Two 44px bars is 88px of chrome before the user sees anything.
* * *

## 5\. States
An announcement bar has fewer interactive states than a button, but several _lifecycle_ states that tutorials skip. Each is described, not just named.
1. **Hidden / not-yet-rendered (SSR default):** on first paint the server should ideally already know (via cookie) whether to render the bar, so it never flashes in and out. Default to _not shown_ only when you can't determine dismissal server-side.
2. **Entering:** the bar becomes visible. If animated, it should `transform: translateY(-100%) → 0` (compositor-only) or simply occupy pre-reserved space — never animate `height` and shove the page.
3. **Visible / rest (default):** the baseline. Message + optional CTA + dismiss, all legible at ≥4.5:1 contrast against the tone background.
4. **CTA hover / focus:** the single CTA gets the standard link/button feedback and a visible `:focus-visible` ring — the ring color must clear contrast against the _tone_ background, not just white.
5. **Dismiss hover / focus / active:** the X shows hover feedback and a focus ring; on `:active` a subtle press. This is the one control keyboard users will Tab to.
6. **Dismissing / leaving:** on click, hide via `transform`/opacity (or collapse the reserved space deliberately), then persist the choice. Focus must move somewhere sensible (see §10) — not vanish into `<body>`.
7. **Dismissed (persisted):** the bar is gone and stays gone _for this announcement id/version_. A new announcement (new id) resets to Visible.
8. **Live-updating (countdown / rotating):** the content changes over time — a timer ticks, or messages rotate. This state must respect `prefers-reduced-motion` and must not steal focus or spam a screen reader on every tick.
9. **Scheduled-out / expired:** the campaign window closed (server clock). The bar should not render at all — not render a dead "Sale ended" strip unless that itself is the intended message.
10. **Sticky-scrolled:** if the bar is sticky, its appearance while the header is also sticky (z-index, shadow, the moment they overlap) is its own visual state to design deliberately.
* * *

## 6\. Types / Variants
Every functional variant named and described. Tone variants change _color and icon_; structural variants change _behavior_.
*   **Informational (neutral):** muted background, info icon. Policy notes, general updates. Lowest urgency; often the most-dismissed, so keep it genuinely useful.
*   **Promotional (brand/accent):** brand-colored, benefit-led copy, one CTA. The revenue workhorse ("Free shipping over $75 — Shop now").
*   **Urgent (warning/error tone):** high-contrast warm/red tone for maintenance windows, outages, recalls. Often _non-dismissible_ (or re-shows every session) because the user genuinely needs it.
*   **Countdown / urgency:** promotional plus a live timer bound to a real server deadline. Powerful and dangerous — honest deadlines only (see §12 dark patterns).
*   **Rotating / carousel:** one strip cycling through 2–4 messages on a timer or via prev/next controls. Must pause on hover/focus, must be reduced-motion-safe, and needs manual controls for anyone who can't catch an auto-advancing message. Generally use sparingly — a rotating bar with no controls is an accessibility anti-pattern.
*   **Marquee / auto-scrolling ticker:** text that slides horizontally ("ANNOUNCING… ANNOUNCING…"). **Generally an anti-pattern** — it's hard to read, impossible to pause for many users, and motion-sickness-inducing. If required, it _must_ pause on hover and on keyboard focus, honor `prefers-reduced-motion` (freeze to static text), and never be the only way to read a critical message.
*   **Cookie / consent bar:** a specialized, usually non-dismissible-until-answered variant governed by privacy law. Related pattern, different rules — don't treat consent as a promo.
*   **Sticky vs. static:** static scrolls away with the page; sticky pins to the top. Sticky bars must coordinate z-index and offset with a sticky header, and eat into every viewport, so reserve them for genuinely persistent needs.
* * *

## 7\. When to Use (and When Not To)
Use an announcement bar when you have **one** message that applies to the **whole site**, is chosen by the business, and is worth the most valuable pixels you own.

**Use when:**
*   Site-wide sales, promo codes, or free-shipping thresholds.
*   Shipping / delivery / return-policy changes that affect every shopper.
*   Scheduled maintenance or known-outage warnings (often the urgent, non-dismissible variant).
*   A single high-value new-feature or launch announcement.
*   Time-boxed campaigns with a _real_ deadline (countdown variant).

**Don't use / use something else when:**
*   **You have a per-page or per-object status** → that's an **Alert / Banner** (`role="alert"`/`role="status"`), placed in the page, not the site chrome.
*   **You're confirming the result of an action** ("Saved," "Copied") → that's a **Toast / Snackbar**, transient and corner-anchored.
*   **The message is personalized** ("Welcome back, Omegea — your cart expires soon") → that's a targeted **notification** or in-page module, not a broadcast strip.
*   **You have more than one thing to say** → pick one, or rotate; never stack two bars.
*   **The content is long-form** (multi-paragraph policy) → link to a page from a short bar; don't make the bar tall.
*   **It's a cookie/consent decision** → use a purpose-built consent bar with the legal affordances, not a promo bar.

**Placement heuristics:**
*   **Top of the viewport, above or fused with the header** — that's where users expect site-wide chrome.
*   **Decide sticky vs. static deliberately:** sticky costs viewport on every scroll; reserve it for messages that must stay reachable.
*   **Coordinate with a sticky header's z-index** so the bar never disappears _under_ the header or double-stacks awkwardly.
*   **One primary CTA, right-of-message or trailing;** dismiss furthest right so it's the last, not first, thing after the CTA.
* * *

## 8\. Across Design Systems
Same slim strip, different philosophies and different _names_ — knowing them makes you fluent in any codebase.
*   **Material Design (Google):** Calls the closest thing a **Banner** — "a prominent message with related actions," shown at the top of content, one or two text buttons, dismissed by user action, one at a time. Material deliberately distinguishes Banner (persistent, top) from Snackbar (transient, bottom).
*   **Apple HIG (iOS/macOS):** No pinned promo-bar primitive; the platform equivalent is a top-of-screen notification/label or a `SafeArea`\-aware header accessory. HIG pushes toward restraint — system notifications and sheets over persistent marketing chrome. Liquid Glass (iOS 26 / macOS Tahoe) is reshaping how any such top accessory looks (translucent, refractive).
*   **Fluent (Microsoft):** Ships **`MessageBar`** — a full-width strip with intent (info/success/warning/error), an icon, an optional action, and a dismiss. It's the canonical enterprise announcement/notification strip and maps almost 1:1 onto this component.
*   **Ant Design:** Distinguishes **`Alert`** (banner-mode `banner` prop makes a top strip, closable, with `type` info/success/warning/error) from **`Notification`** (corner toast) and **`Message`** (transient center toast). The `<Alert banner closable />` is Ant's announcement bar.
*   **Tailwind CSS / utility-first:** No prescribed component; composed from utilities (`w-full`, `bg-…`, `flex`, `items-center`). Tailwind UI sells "Banner" blocks. Freedom plus consistency risk — teams wrap it in one `<AnnouncementBar>` component to enforce tone tokens.
*   **shadcn/Radix:** No dedicated announcement primitive, but the pattern is built from a styled `<div role="region">` plus Radix primitives for the dismiss and (if rotating) a headless carousel. Behavior/a11y from Radix, tone variants via cva — same recipe as their Button.
*   **Bootstrap 5:** Uses **Alert** with `.alert-dismissible` and the close button; a full-bleed `.alert` with `border-radius: 0` at the top of the layout is the standard Bootstrap announcement bar. Carbon (IBM) and Polaris (Shopify) each ship a dedicated Banner/Notification too.

### 8b. Visual Styles / Trends
The design system is _whose_ rules; the visual style is _which look_ the strip wears (full set in §17). **What's trending in 2026:**
*   **Liquid Glass bars** on Apple platforms and racing onto the web — a translucent, refractive strip that lets the page glow through, replacing flat promo bars. Gorgeous over a dark, saturated backdrop; a contrast minefield over busy content, so test the text against the _worst-case_ background behind the blur.
*   **Server-driven, scheduled, A/B-tested content** as the default: the bar's copy, tone, and window come from a CMS/edge config, not hardcoded markup — swap the campaign without a deploy.
*   **Motion-restrained urgency:** countdowns and rotators that respect `prefers-reduced-motion` by default, after years of jittery timers.
*   **Honest-scarcity backlash:** post-DSA/UCPD enforcement, fake countdowns and "only 2 left" are being designed _out_; "real deadline or no timer" is the emerging norm.
*   **Bento / editorial bars:** the strip treated as a tiny editorial layout — icon, headline, timer, CTA in a balanced mini-grid rather than one cramped line.
* * *

## 9\. The Code
The biggest section. Every block is real, runnable, and production-shaped — real imports, real persistence keyed to an announcement id/version, real reduced-motion handling, real server scheduling. No stubs.

### 9.1 HTML (semantic foundation with ARIA)

```html
<!-- Important, dismissible announcement: a labelled landmark region -->
<div class="ann" role="region" aria-label="Site announcement" data-ann-id="summer-sale-2026" hidden>
  <div class="ann__inner">
    <span class="ann__icon" aria-hidden="true">🏷️</span>
    <p class="ann__msg">
      Free shipping on orders over $75 —
      <a class="ann__cta" href="/sale">Shop the sale</a>
    </p>
    <button type="button" class="ann__dismiss" aria-label="Dismiss announcement">
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    </button>
  </div>
</div>
```

Key HTML rules:
*   **`role="region"`** **+** **`aria-label`** turns the bar into a named landmark a screen-reader user can jump to _or skip_ — use it when the message matters. For a purely decorative promo you may drop the role entirely; don't use `role="banner"` (that's reserved for the page header) and don't use `role="alert"` (that's for state-driven status, and it interrupts).
*   **The dismiss button is a real** **`<button type="button">`** **with an** **`aria-label`** — never a bare `×` character in a `<span onclick>`.
*   **`data-ann-id`** carries the announcement's identity/version so the persistence layer can re-show a _new_ announcement.
*   **The CTA is a real** **`<a href>`** — it's navigation, not an action.

### 9.2 CSS (states, layout, reduced-motion, no layout shift)

```css
:root {
  --ann-h: 44px;                 /* single source of truth for height + offset */
  --ann-bg: #042D1D;             /* Dark Green (informational default) */
  --ann-fg: #E8E6E1;             /* Platinum */
  --ann-focus: #DCA424;          /* Goldenrod */
}

/* Reserve the space up front so appearing/dismissing never shifts layout */
body { padding-top: var(--ann-h); }
body[data-ann-dismissed] { padding-top: 0; }

.ann {
  position: fixed; inset-block-start: 0; inset-inline: 0;
  z-index: 1000;                 /* above a sticky header (which sits ~900) */
  block-size: var(--ann-h);
  display: flex; align-items: center; justify-content: center;
  background: var(--ann-bg); color: var(--ann-fg);
  transform: translateY(0);
  transition: transform .25s ease;
}
.ann[hidden] { display: none; }
.ann--leaving { transform: translateY(-100%); }   /* compositor-only, no reflow */

.ann__inner {
  display: flex; align-items: center; gap: 12px;
  inline-size: min(100%, 1200px); padding-inline: 16px;
}
.ann__msg { margin: 0; font: 500 14px/1.3 system-ui, sans-serif;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ann__cta { color: var(--ann-focus); text-underline-offset: 2px; }
.ann__cta:focus-visible,
.ann__dismiss:focus-visible {
  outline: 2px solid var(--ann-focus); outline-offset: 2px;
}
.ann__dismiss {
  margin-inline-start: auto; display: grid; place-items: center;
  inline-size: 44px; block-size: 44px;         /* 44px target on a 44px bar */
  color: inherit; background: none; border: 0; cursor: pointer; border-radius: 6px;
}
.ann__dismiss:hover { background: rgb(255 255 255 / .12); }

/* Tone variants */
.ann--promo  { --ann-bg: #5F2C82; }             /* Eminence */
.ann--urgent { --ann-bg: #7E3209; --ann-fg: #fff; }  /* Sienna */

/* Marquee/rotator motion must yield to the user */
@media (prefers-reduced-motion: reduce) {
  .ann { transition: none; }
  .ann__marquee { animation: none !important; }  /* freeze to static text */
}
@media (max-width: 640px) {                      /* wrap instead of clip on mobile */
  .ann { block-size: auto; min-block-size: var(--ann-h); }
  .ann__msg { white-space: normal; }
}
```

### 9.3 React + TypeScript (full reusable component with persistence)

```tsx
import { useCallback, useEffect, useState } from "react";

type Tone = "info" | "promo" | "urgent";

export interface AnnouncementBarProps {
  /** Stable id INCLUDING a version, e.g. "summer-sale-2026-v2".
   *  Change it to re-show a dismissed bar for a new campaign. */
  id: string;
  tone?: Tone;
  /** Omit or set persist={false} for non-dismissible urgent notices. */
  persist?: boolean;
  cta?: { label: string; href: string };
  children: React.ReactNode;
  onDismiss?: (id: string) => void;
}

const KEY = (id: string) => `ann:dismissed:${id}`;

export function AnnouncementBar({
  id, tone = "info", persist = true, cta, children, onDismiss,
}: AnnouncementBarProps) {
  // Start hidden to avoid a flash, then reveal only if not already dismissed.
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!persist) { setVisible(true); return; }
    try {
      setVisible(localStorage.getItem(KEY(id)) !== "1");
    } catch {
      setVisible(true); // storage blocked (private mode) → show, fail open
    }
  }, [id, persist]);

  const dismiss = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      setVisible(false);
      try { if (persist) localStorage.setItem(KEY(id), "1"); } catch { /* ignore */ }
      onDismiss?.(id);
    }, 250); // matches the CSS transform transition
  }, [id, persist, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className={`ann ann--${tone} ${leaving ? "ann--leaving" : ""}`}
      data-ann-id={id}
    >
      <div className="ann__inner">
        <p className="ann__msg">
          {children}
          {cta && <> <a className="ann__cta" href={cta.href}>{cta.label}</a></>}
        </p>
        {persist && (
          <button type="button" className="ann__dismiss"
                  aria-label="Dismiss announcement" onClick={dismiss}>
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
```

Why this is the senior version: the dismissal key **includes a version**, so shipping `summer-sale-2026-v2` re-shows for everyone; storage access is wrapped in `try/catch` so private-mode/blocked-storage **fails open** (shows the bar) instead of throwing; `persist={false}` cleanly expresses a non-dismissible urgent notice; and the leave animation is `transform`\-based to avoid CLS.

### 9.4 Vanilla JavaScript (no framework, full keyboard, per-id persistence)

```javascript
function initAnnouncementBar(el) {
  const id = el.dataset.annId;
  if (!id) throw new Error("Announcement bar needs data-ann-id");
  const KEY = `ann:dismissed:${id}`;

  let dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === "1"; } catch { /* fail open */ }
  if (dismissed) { el.remove(); document.body.dataset.annDismissed = "1"; return; }

  el.hidden = false;
  const btn = el.querySelector(".ann__dismiss");

  function close() {
    el.classList.add("ann--leaving");
    const done = () => {
      el.remove();
      document.body.dataset.annDismissed = "1";
      try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
      // Return focus somewhere sensible so keyboard users aren't dumped on <body>.
      (document.querySelector("main a, main button, main") || document.body).focus?.();
    };
    el.addEventListener("transitionend", done, { once: true });
    // Fallback if reduced-motion kills the transition (transitionend won't fire):
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) done();
  }

  btn?.addEventListener("click", close);
}
document.querySelectorAll(".ann").forEach(initAnnouncementBar);
```

### 9.5 Tailwind CSS

```html
<div role="region" aria-label="Site announcement" data-ann-id="summer-sale-2026"
     class="fixed inset-x-0 top-0 z-[1000] flex h-11 items-center justify-center
            bg-[#5F2C82] text-[#E8E6E1] transition-transform duration-200
            data-[leaving=true]:-translate-y-full">
  <div class="flex w-full max-w-6xl items-center gap-3 px-4">
    <p class="m-0 truncate text-sm font-medium">
      Free shipping over $75 —
      <a href="/sale"
         class="text-[#DCA424] underline-offset-2 focus-visible:outline
                focus-visible:outline-2 focus-visible:outline-[#DCA424]">Shop the sale</a>
    </p>
    <button type="button" aria-label="Dismiss announcement"
            class="ml-auto grid size-11 place-items-center rounded-md
                   hover:bg-white/10 focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-[#DCA424]">
      <svg viewBox="0 0 20 20" class="size-4" aria-hidden="true" focusable="false">
        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    </button>
  </div>
</div>
```

The `h-11` (44px) keeps the strip and the dismiss target both at the accessible minimum; body offset is handled with a `pt-11` on the layout wrapper so the fixed bar doesn't cover content.

### 9.6 Next.js (App Router — server-driven content + cookie, no flash)

```tsx
// app/components/AnnouncementBar.tsx  (Server Component — reads the campaign + cookie)
import { cookies } from "next/headers";
import { getActiveAnnouncement } from "@/lib/announcements";
import { DismissButton } from "./DismissButton";

export async function AnnouncementBar() {
  const ann = await getActiveAnnouncement(new Date()); // scheduling window on the server
  if (!ann) return null;                                // no active campaign → render nothing

  const dismissed = (await cookies()).get(`ann_${ann.id}`)?.value === "1";
  if (dismissed) return null;                           // decided on the server → zero flash

  return (
    <div role="region" aria-label="Site announcement"
         className={`ann ann--${ann.tone}`} data-ann-id={ann.id}>
      <div className="ann__inner">
        <p className="ann__msg">
          {ann.message}
          {ann.cta && <> <a className="ann__cta" href={ann.cta.href}>{ann.cta.label}</a></>}
        </p>
        {ann.dismissible && <DismissButton id={ann.id} />}
      </div>
    </div>
  );
}
```

```tsx
// app/components/DismissButton.tsx  (Client — writes the cookie via a Server Action)
"use client";
import { useTransition } from "react";
import { dismissAnnouncement } from "@/app/actions";

export function DismissButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="ann__dismiss" aria-label="Dismiss announcement"
            disabled={pending}
            onClick={() => start(() => dismissAnnouncement(id))}>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    </button>
  );
}
```

```ts
// app/actions.ts  (server: persists dismissal in a scoped cookie)
"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function dismissAnnouncement(id: string) {
  (await cookies()).set(`ann_${id}`, "1", {
    maxAge: 60 * 60 * 24 * 180, httpOnly: false, sameSite: "lax", path: "/",
  });
  revalidatePath("/", "layout"); // drop the bar site-wide on next render
}
```

Server-side scheduling + cookie means the bar's presence is decided before HTML is sent — no flash-of-announcement, and the campaign window lives in one place.

### 9.7 shadcn/Radix pattern (cva variants + Radix VisuallyHidden)

```tsx
import * as React from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const bar = cva(
  "fixed inset-x-0 top-0 z-[1000] flex h-11 items-center justify-center transition-transform",
  {
    variants: {
      tone: {
        info:   "bg-[#042D1D] text-[#E8E6E1]",
        promo:  "bg-[#5F2C82] text-[#E8E6E1]",
        urgent: "bg-[#7E3209] text-white",
      },
    },
    defaultVariants: { tone: "info" },
  }
);

interface Props
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bar> {
  id: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function AnnouncementBar({
  id, tone, dismissible = true, onDismiss, className, children, ...rest
}: Props) {
  return (
    <div role="region" aria-label="Site announcement"
         data-ann-id={id} className={cn(bar({ tone }), className)} {...rest}>
      <div className="flex w-full max-w-6xl items-center gap-3 px-4">
        <p className="m-0 truncate text-sm font-medium">{children}</p>
        {dismissible && (
          <button type="button" onClick={onDismiss}
                  className="ml-auto grid size-11 place-items-center rounded-md
                             hover:bg-white/10 focus-visible:outline focus-visible:outline-2
                             focus-visible:outline-[#DCA424]">
            <X aria-hidden className="size-4" />
            <VisuallyHidden>Dismiss announcement</VisuallyHidden>
          </button>
        )}
      </div>
    </div>
  );
}
```

### 9.8 Vue 3 (SFC, persistence + reduced-motion aware)

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = withDefaults(defineProps<{
  id: string; tone?: "info" | "promo" | "urgent"; persist?: boolean;
}>(), { tone: "info", persist: true });

const emit = defineEmits<{ dismiss: [id: string] }>();
const visible = ref(false);
const leaving = ref(false);
const KEY = `ann:dismissed:${props.id}`;

onMounted(() => {
  if (!props.persist) { visible.value = true; return; }
  try { visible.value = localStorage.getItem(KEY) !== "1"; }
  catch { visible.value = true; }
});

function dismiss() {
  leaving.value = true;
  setTimeout(() => {
    visible.value = false;
    try { if (props.persist) localStorage.setItem(KEY, "1"); } catch {}
    emit("dismiss", props.id);
  }, 250);
}
</script>

<template>
  <div v-if="visible" role="region" aria-label="Site announcement"
       :data-ann-id="id" :class="['ann', `ann--${tone}`, { 'ann--leaving': leaving }]">
    <div class="ann__inner">
      <p class="ann__msg"><slot /></p>
      <button v-if="persist" type="button" class="ann__dismiss"
              aria-label="Dismiss announcement" @click="dismiss">✕</button>
    </div>
  </div>
</template>
```

### 9.9 Svelte

```svelte
<script lang="ts">
  export let id: string;
  export let tone: "info" | "promo" | "urgent" = "info";
  export let persist = true;

  const KEY = `ann:dismissed:${id}`;
  let visible = false;
  let leaving = false;

  import { onMount } from "svelte";
  onMount(() => {
    if (!persist) { visible = true; return; }
    try { visible = localStorage.getItem(KEY) !== "1"; } catch { visible = true; }
  });

  function dismiss() {
    leaving = true;
    setTimeout(() => {
      visible = false;
      try { if (persist) localStorage.setItem(KEY, "1"); } catch {}
    }, 250);
  }
</script>

{#if visible}
  <div class="ann ann--{tone}" class:ann--leaving={leaving}
       role="region" aria-label="Site announcement" data-ann-id={id}>
    <div class="ann__inner">
      <p class="ann__msg"><slot /></p>
      {#if persist}
        <button type="button" class="ann__dismiss"
                aria-label="Dismiss announcement" on:click={dismiss}>✕</button>
      {/if}
    </div>
  </div>
{/if}
```

### 9.10 Angular (standalone component)

```typescript
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-announcement-bar",
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="visible" role="region" aria-label="Site announcement"
         [attr.data-ann-id]="id"
         [class]="'ann ann--' + tone" [class.ann--leaving]="leaving">
      <div class="ann__inner">
        <p class="ann__msg"><ng-content></ng-content></p>
        <button *ngIf="persist" type="button" class="ann__dismiss"
                aria-label="Dismiss announcement" (click)="dismiss()">✕</button>
      </div>
    </div>`,
})
export class AnnouncementBarComponent implements OnInit {
  @Input({ required: true }) id!: string;
  @Input() tone: "info" | "promo" | "urgent" = "info";
  @Input() persist = true;
  @Output() dismissed = new EventEmitter<string>();

  visible = false;
  leaving = false;
  private get key() { return `ann:dismissed:${this.id}`; }

  ngOnInit(): void {
    if (!this.persist) { this.visible = true; return; }
    try { this.visible = localStorage.getItem(this.key) !== "1"; }
    catch { this.visible = true; }
  }

  dismiss(): void {
    this.leaving = true;
    setTimeout(() => {
      this.visible = false;
      try { if (this.persist) localStorage.setItem(this.key, "1"); } catch {}
      this.dismissed.emit(this.id);
    }, 250);
  }
}
```

### 9.11 Bootstrap 5 (full-bleed dismissible alert)

```html
<!-- A top-pinned, square-cornered alert IS the Bootstrap announcement bar -->
<div id="ann" class="alert alert-dark alert-dismissible rounded-0 m-0 text-center py-2"
     role="region" aria-label="Site announcement" data-ann-id="summer-sale-2026">
  <span class="me-2">Free shipping over $75 —
    <a href="/sale" class="alert-link">Shop the sale</a>
  </span>
  <button type="button" class="btn-close" data-bs-dismiss="alert"
          aria-label="Dismiss announcement"></button>
</div>

<script>
  // Bootstrap only hides it; persist the choice ourselves, keyed to the id.
  const ann = document.getElementById("ann");
  const KEY = `ann:dismissed:${ann.dataset.annId}`;
  try { if (localStorage.getItem(KEY) === "1") ann.remove(); } catch {}
  ann?.addEventListener("closed.bs.alert", () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
  });
</script>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

### 9.12 Web Component (framework-agnostic custom element)

```javascript
class AnnouncementBar extends HTMLElement {
  static observedAttributes = ["tone"];
  #key() { return `ann:dismissed:${this.getAttribute("ann-id")}`; }

  connectedCallback() {
    let dismissed = false;
    try { dismissed = localStorage.getItem(this.#key()) === "1"; } catch {}
    if (dismissed) { this.remove(); return; }

    const tone = this.getAttribute("tone") ?? "info";
    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host { position: fixed; inset: 0 0 auto; z-index: 1000; display: block; }
        .bar { display: flex; align-items: center; justify-content: center;
               min-height: 44px; padding-inline: 16px; color: #E8E6E1;
               background: ${tone === "urgent" ? "#7E3209" : tone === "promo" ? "#5F2C82" : "#042D1D"}; }
        button { margin-inline-start: auto; width: 44px; height: 44px;
                 background: none; border: 0; color: inherit; cursor: pointer; }
        button:focus-visible { outline: 2px solid #DCA424; outline-offset: 2px; }
      </style>
      <div class="bar" role="region" aria-label="Site announcement">
        <slot></slot>
        <button type="button" aria-label="Dismiss announcement" part="dismiss">✕</button>
      </div>`;
    this.shadowRoot.querySelector("button").addEventListener("click", () => {
      try { localStorage.setItem(this.#key(), "1"); } catch {}
      this.remove();
    });
  }
}
customElements.define("announcement-bar", AnnouncementBar);
// Usage: <announcement-bar ann-id="summer-sale-2026" tone="promo">Free shipping over $75</announcement-bar>
```

### 9.13 Python (Jinja2 render + FastAPI scheduling/dismiss endpoint)

**Template** (Jinja2 — server decides the active, non-dismissed campaign):

```html
{% if ann %}
<div class="ann ann--{{ ann.tone }}" role="region" aria-label="Site announcement"
     data-ann-id="{{ ann.id }}">
  <div class="ann__inner">
    <p class="ann__msg">{{ ann.message }}
      {% if ann.cta %}<a class="ann__cta" href="{{ ann.cta.href }}">{{ ann.cta.label }}</a>{% endif %}
    </p>
    {% if ann.dismissible %}
    <form method="post" action="/announcements/{{ ann.id }}/dismiss">
      <button type="submit" class="ann__dismiss" aria-label="Dismiss announcement">✕</button>
    </form>
    {% endif %}
  </div>
</div>
{% endif %}
```

**Endpoint** (FastAPI — scheduling window + persist dismissal in a cookie):

```python
from datetime import datetime, timezone
from fastapi import FastAPI, Request, Response, Cookie
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# In real apps this comes from a CMS / edge config table.
CAMPAIGNS = [{
    "id": "summer-sale-2026-v2", "tone": "promo", "dismissible": True,
    "message": "Free shipping on orders over $75 —",
    "cta": {"label": "Shop the sale", "href": "/sale"},
    "start": datetime(2026, 6, 1, tzinfo=timezone.utc),
    "end":   datetime(2026, 9, 1, tzinfo=timezone.utc),
}]

def active_announcement(now: datetime, dismissed_ids: set[str]):
    for c in CAMPAIGNS:
        if c["start"] <= now < c["end"] and c["id"] not in dismissed_ids:
            return c
    return None

@app.get("/")
def home(request: Request, ann_dismissed: str | None = Cookie(default=None)):
    dismissed = set((ann_dismissed or "").split(","))
    ann = active_announcement(datetime.now(timezone.utc), dismissed)
    return templates.TemplateResponse("home.html", {"request": request, "ann": ann})

@app.post("/announcements/{ann_id}/dismiss")
def dismiss(ann_id: str, response: Response, ann_dismissed: str | None = Cookie(default=None)):
    ids = set(filter(None, (ann_dismissed or "").split(",")))
    ids.add(ann_id)  # keyed to id+version, so a new campaign re-shows
    response.set_cookie("ann_dismissed", ",".join(sorted(ids)),
                        max_age=60 * 60 * 24 * 180, samesite="lax")
    response.headers["Location"] = "/"
    response.status_code = 303
    return response
```

### 9.14 SwiftUI (iOS — the platform equivalent, dismissal persisted)

```swift
import SwiftUI

struct AnnouncementBar: View {
    let id: String                 // e.g. "summer-sale-2026-v2"
    let message: String
    var tone: Color = Color(red: 0.37, green: 0.17, blue: 0.51) // Eminence

    @AppStorage private var dismissed: Bool
    init(id: String, message: String) {
        self.id = id; self.message = message
        _dismissed = AppStorage(wrappedValue: false, "ann.dismissed.\(id)")
    }

    var body: some View {
        if !dismissed {
            HStack(spacing: 12) {
                Text(message).font(.subheadline.weight(.medium))
                Spacer(minLength: 8)
                Button { withAnimation { dismissed = true } } label: {
                    Image(systemName: "xmark")
                }
                .accessibilityLabel("Dismiss announcement")
                .frame(width: 44, height: 44)      // 44pt target
            }
            .padding(.horizontal, 16)
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(tone).foregroundStyle(.white)
            .accessibilityElement(children: .contain)
            .accessibilityLabel("Site announcement")
        }
    }
}
```

### 9.15 Jetpack Compose (Android — dismissal persisted via DataStore)

```kotlin
@Composable
fun AnnouncementBar(
    id: String,
    message: String,
    tone: Color = Color(0xFF5F2C82),   // Eminence
    store: AnnouncementStore = rememberAnnouncementStore(),
) {
    val dismissed by store.isDismissed(id).collectAsState(initial = true)
    val scope = rememberCoroutineScope()

    if (!dismissed) {
        Row(
            modifier = Modifier.fillMaxWidth().heightIn(min = 44.dp)
                .background(tone).padding(horizontal = 16.dp)
                .semantics { contentDescription = "Site announcement" },
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(message, color = Color.White, style = MaterialTheme.typography.bodyMedium,
                 modifier = Modifier.weight(1f))
            IconButton(
                onClick = { scope.launch { store.dismiss(id) } },
                modifier = Modifier.size(44.dp),
            ) {
                Icon(Icons.Default.Close, contentDescription = "Dismiss announcement",
                     tint = Color.White)
            }
        }
    }
}
```

### 9.16 Flutter (Dart — dismissal persisted via SharedPreferences)

```dart
class AnnouncementBar extends StatefulWidget {
  const AnnouncementBar({super.key, required this.id, required this.message,
    this.tone = const Color(0xFF5F2C82)});
  final String id;      // "summer-sale-2026-v2"
  final String message;
  final Color tone;
  @override
  State<AnnouncementBar> createState() => _AnnouncementBarState();
}

class _AnnouncementBarState extends State<AnnouncementBar> {
  bool _visible = false;
  String get _key => 'ann.dismissed.${widget.id}';

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((p) {
      setState(() => _visible = !(p.getBool(_key) ?? false));
    });
  }

  Future<void> _dismiss() async {
    setState(() => _visible = false);
    final p = await SharedPreferences.getInstance();
    await p.setBool(_key, true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_visible) return const SizedBox.shrink();
    return Semantics(
      label: 'Site announcement',
      container: true,
      child: Container(
        constraints: const BoxConstraints(minHeight: 44),
        color: widget.tone,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(children: [
          Expanded(child: Text(widget.message,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500))),
          IconButton(
            iconSize: 20,
            constraints: const BoxConstraints.tightFor(width: 44, height: 44),
            tooltip: 'Dismiss announcement',
            onPressed: _dismiss,
            icon: const Icon(Icons.close, color: Colors.white),
          ),
        ]),
      ),
    );
  }
}
```

### 9.17 Testing (Vitest / RTL + jest-axe + Playwright)

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AnnouncementBar } from "./AnnouncementBar";

describe("AnnouncementBar", () => {
  beforeEach(() => localStorage.clear());

  it("renders as a labelled region with a real dismiss label", () => {
    render(<AnnouncementBar id="t1">Free shipping over $75</AnnouncementBar>);
    expect(screen.getByRole("region", { name: /site announcement/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dismiss announcement/i })).toBeInTheDocument();
  });

  it("hides and persists the choice keyed to the id", async () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <AnnouncementBar id="sale-v1" onDismiss={onDismiss}>Sale</AnnouncementBar>);
    await userEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledWith("sale-v1");
    expect(localStorage.getItem("ann:dismissed:sale-v1")).toBe("1");
    unmount();
    render(<AnnouncementBar id="sale-v1">Sale</AnnouncementBar>);
    expect(screen.queryByRole("region")).not.toBeInTheDocument(); // stays gone
  });

  it("re-shows when the announcement version changes", () => {
    localStorage.setItem("ann:dismissed:sale-v1", "1");
    render(<AnnouncementBar id="sale-v2">New sale</AnnouncementBar>); // new id/version
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<AnnouncementBar id="a11y">Notice</AnnouncementBar>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

```typescript
// e2e/announcement.spec.ts — Playwright
import { test, expect } from "@playwright/test";

test("dismiss survives reload, new campaign re-shows", async ({ page }) => {
  await page.goto("/");
  const bar = page.getByRole("region", { name: "Site announcement" });
  await expect(bar).toBeVisible();
  await page.getByRole("button", { name: "Dismiss announcement" }).click();
  await expect(bar).toBeHidden();

  await page.reload();
  await expect(page.getByRole("region", { name: "Site announcement" })).toBeHidden();
});
```

* * *

## 10\. Accessibility
Standalone and non-negotiable. The bar is the first thing every assistive-tech user meets on every page, so getting it right pays off site-wide.

**Roles & ARIA:**
*   **Important, persistent message →** **`role="region"`** **+** **`aria-label`** ("Site announcement"). This makes it a _named landmark_ users can navigate to or skip. It does **not** interrupt.
*   **Do not use** **`role="banner"`** — that ARIA role is reserved for the site header/masthead; using it on the promo strip creates a duplicate/incorrect banner landmark.
*   **Do not use** **`role="alert"`** **for editorial promos** — `alert` is an assertive live region that interrupts the screen reader immediately. Reserve it (or `role="status"`) for genuinely urgent, state-driven notices (an outage), not "20% off."
*   **The dismiss control is a real** **`<button>`** **with a text label** — `aria-label="Dismiss announcement"` (or visually-hidden text). Never a bare `×`, which some screen readers read as "times" or skip entirely.
*   **Decorative icons get** **`aria-hidden="true"`****;** the CTA is a real `<a href>` with meaningful text ("Shop the sale," not "here").

**Keyboard map (the bar has one-to-two interactive controls plus optional rotator):**

| Key | Action |
| ---| --- |
| `Tab` | Move to the CTA, then to the dismiss button (bar is early in the DOM, so it's an early stop — keep it to ≤2 stops) |
| `Enter` | Activate the focused CTA link |
| `Enter` / `Space` | Activate the focused dismiss button |
| `Esc` | (Optional but expected) dismiss the bar when focus is inside it |
| `Arrow Left/Right` | On a rotating variant with controls: previous / next message |

**Focus management:** when the bar is dismissed, focus must not fall into the void (`<body>`), which strands keyboard users at the top with no context. Move focus to the next logical element — the main landmark, the header's first link, or a skip-target. On a rotating bar, advancing messages must **not** steal focus.

**Contrast:** message text ≥ 4.5:1 against the _tone_ background (test against promo/urgent colors, not just white); the CTA and the focus ring must each clear 3:1 as non-text/UI elements against that same colored background — a Goldenrod ring is invisible on a light bar.

**Target size:** the dismiss button must present a ≥44×44px hit area even when the strip is only 36px tall — pad the button beyond the visible glyph.

**Reduced motion:** under `prefers-reduced-motion: reduce`, freeze marquees/rotators to static text, drop the slide-in/out transform to an instant show/hide, and stop any countdown "pulse." A frantic ticking timer is exactly what this media query exists to kill.

**Common failures specific to this component:**
*   Using `role="alert"` so every promo _interrupts_ whatever the screen-reader user was reading.
*   A `<div onclick>` X with no label and no keyboard support.
*   A rotating/marquee bar that can't be paused and outruns a reading speed.
*   Dismiss that yanks the page up (CLS) _and_ dumps focus on `<body>`.
*   A sticky bar that overlaps the skip-link or covers the top of `main` so keyboard focus lands hidden behind it.
* * *

## 11\. Innovative / Emerging Ideas
The bar looks solved but keeps evolving:
*   **Edge-personalized, still-cacheable content:** the bar's message chosen at the CDN edge by geo/segment (Next.js middleware, Cloudflare Workers) so a EU visitor sees a VAT note and a US visitor sees free-shipping — without busting the full-page cache or leaking a flash of the wrong message.
*   **`View Transitions API`** **for the enter/exit:** native, GPU-friendly morphing of the bar in and out (and reflowing the page) with a couple of lines of CSS, respecting reduced-motion, replacing hand-rolled JS animation.
*   **`Intl`****\-driven honest countdowns:** timers formatted with `Intl.RelativeTimeFormat`/`Intl.DurationFormat` and bound to a server `end` timestamp, so the deadline is real, localized, and identical across every visitor's clock — the antidote to the reset-on-refresh dark pattern.
*   **Consent-aware persistence:** dismissal stored in a first-party cookie only after consent, with a storage-partitioned fallback — anticipating third-party-cookie deprecation and privacy-sandbox constraints (a 2026-era platform change).
*   **AI/agentic bars:** "Summarize what changed" or "Apply this code at checkout for me" — the CTA hands a task to an agent with streaming progress instead of just linking out.
*   **Container-query-driven density:** the bar re-lays-out (icon + timer + CTA → single line → wrapped) based on its own inline size via `@container`, not global breakpoints, so it composes correctly inside any shell.
* * *

## 12\. Conversion / UX Killers
None of these throw an error. They quietly cost money or trust — and every one is fixable in an afternoon.
*   **Fake urgency / resetting countdowns.** A timer that restarts on refresh, or "only 2 left" that's never true, reads as manipulation the moment a user notices. _Why it fails:_ trust collapses site-wide and it's now legally actionable under FTC/EU dark-pattern rules. _Fix:_ bind timers to a real server deadline; if there's no real deadline, no timer.
*   **Layout shift on appear/dismiss (CLS).** The bar drops in and shoves the hero down, or vanishes and yanks content up. _Why it fails:_ a measurable Core Web Vitals penalty and a physically jarring experience. _Fix:_ reserve the height as a token and animate with `transform`, never `height`.
*   **Two CTAs (or two bars).** The strip has one job; a second CTA or a second stacked bar splits attention and doubles the chrome tax before the user sees the page. _Fix:_ one message, one CTA — rotate or cut the rest.
*   **Cannibalizing the hero.** A loud promo bar with a strong CTA competes with the page's actual primary conversion. _Why it fails:_ clicks leak from the money path into a discount rabbit hole. _Fix:_ make the bar support, not compete with, the hero — softer CTA, or drop it on high-intent pages.
*   **Un-dismissible / reappearing bar.** No X, or an X that returns on the next click because dismissal isn't persisted. _Why it fails:_ it reads as an ad you can't close; users bounce or install a blocker. _Fix:_ persist dismissal keyed to the announcement id/version.
*   **Never-updating persistence.** Dismissal keyed to a generic `announcement=1`, so the _next_ campaign never shows to anyone who ever dismissed the last one. _Fix:_ version the key (`ann:summer-sale-2026-v2`).
*   **Truncated-to-meaningless on mobile.** The offer ellipses into "Free shipping on ord…" behind the X. _Fix:_ wrap to two lines on narrow viewports instead of clipping.
*   **Contrast that fails on the tone background.** White-on-goldenrod copy or a focus ring that disappears on a light promo bar. _Fix:_ test text and ring contrast against every tone variant, not just the default.
* * *

## 13\. Advanced Patterns
Senior-level techniques specific to this component.

**TypeScript-enforced a11y — a dismissible bar** **_must_** **be labelled, an urgent bar** **_can't_** **be silently dismissed.** A discriminated union makes illegal states unrepresentable at compile time:

```typescript
type BaseAnn = { id: string; message: string; cta?: { label: string; href: string } };

type DismissibleAnn = BaseAnn & {
  dismissible: true;
  /** required so we never ship an X with no accessible name */
  dismissLabel: string;
  tone?: "info" | "promo";
};

type UrgentAnn = BaseAnn & {
  dismissible: false;               // outage/recall: user must see it
  tone: "urgent";
  role: "alert";                    // urgent → assertive live region, on purpose
};

export type Announcement = DismissibleAnn | UrgentAnn;
// A DismissibleAnn without dismissLabel won't compile; an UrgentAnn can't be dismissible.
```

**Design-token tiers — the bar themes without a rewrite.** Primitive → semantic → component tokens, so a rebrand or a new tone touches one line and the reserved-space offset stays in sync:

```css
:root {
  /* primitive */
  --eminence: #5F2C82; --dark-green: #042D1D; --sienna: #7E3209; --gold: #DCA424;
  /* semantic (tone roles) */
  --tone-info: var(--dark-green); --tone-promo: var(--eminence); --tone-urgent: var(--sienna);
  /* component (the bar only ever reads these) */
  --ann-h: 44px;
  --ann-bg: var(--tone-info);
  --ann-ring: var(--gold);
}
.ann--promo  { --ann-bg: var(--tone-promo); }
.ann--urgent { --ann-bg: var(--tone-urgent); }
.ann { block-size: var(--ann-h); background: var(--ann-bg); }
body { padding-block-start: var(--ann-h); }   /* same token → zero drift, zero CLS */
```

**Server-authoritative scheduling with a client-cached hint.** The campaign window and A/B bucket are decided server-side (§9.6/§9.13) so the deadline can't be gamed from the client and there's no flash; the client only _reads_ a cookie/localStorage hint to avoid re-showing a dismissed bar. The rule: **the server decides** **_whether_** **and** **_what_****; the client only remembers** **_dismissed_****.** This is also what keeps a countdown honest — the `end` timestamp is the server's, not `Date.now() + 3h`.
* * *

## 14\. Performance & Bundle Cost
*   **Zero layout shift is the headline perf goal.** The bar renders above the fold, so any height it adds on appear (or removes on dismiss) is a direct CLS hit. Reserve its height as a token (`padding-top: var(--ann-h)` on `body`) and animate only `transform`/`opacity` — compositor-only properties that never trigger reflow. Never animate `height`.
*   **Decide presence on the server to avoid a flash + reflow.** Reading the dismissal cookie during SSR (§9.6) means the bar is either in the first paint or absent — no client-side "mount, measure, hide" that repaints and shifts. A client-only bar flashes on every navigation.
*   **Tree-shake the icon and the timer.** Import the single close glyph (`import { X } from "lucide-react"`), never the whole set (`import * as Icons`), which can add hundreds of KB for one X. If you show a countdown, format with the platform `Intl.*` APIs instead of pulling in moment/day.js.
*   **Lazy-load the heavy variants.** A static promo bar is a few bytes of markup; a rotating carousel or marquee brings a timer loop and controls. Code-split the rotator so the 95% of pages using a plain bar don't pay for the carousel JS. Virtualize nothing on the bar itself — it's one row — but don't let a "just in case" carousel dependency ship on every page.
*   **One timer, paused off-screen.** A countdown or rotator should use a single `requestAnimationFrame`/interval that pauses via the Page Visibility API when the tab is hidden and on hover/focus — not a per-second re-render of the whole app. Update only the text node, not the React tree.
* * *

## 15\. Security
Standalone. The announcement bar is mostly display, so its surface is small — but it is _not_ zero, especially the moment its content is server/CMS-driven or it renders anything a user can influence.
*   **XSS via CMS-driven content is the real risk.** The whole point of a modern bar is that marketing edits the copy in a CMS. If that message (or CTA href/label) is rendered as raw HTML, a compromised or careless CMS entry becomes stored XSS on _every page of the site_ — the worst possible blast radius. **Escape by default** (React/Vue/Jinja auto-escape; never `dangerouslySetInnerHTML`/`v-html`/`| safe` on bar content), and if limited formatting is needed, sanitize an allowlist server-side.
*   **Validate the CTA URL.** A `href` that comes from config must be checked — reject `javascript:` and `data:` schemes, and constrain off-site links. An unchecked `href="{{ ann.cta.href }}"` is an open-redirect / script-injection vector.
*   **The dismiss endpoint (if server-persisted) needs the normal state-change hygiene.** It's a POST that writes a cookie: put a CSRF token on the form, scope the cookie `SameSite=Lax`, and treat the `ann_id` as untrusted input — validate it against the known campaign list, don't reflect it into a response, and don't let an attacker set arbitrary cookies via a crafted id.
*   **No authorization surface, and that's the point.** The bar gates nothing and reveals nothing sensitive — it's public chrome shown to everyone. Don't ever put secret or personalized data in it under the assumption "they'll dismiss it"; it's the least private surface on the site.
*   **Persistence is not a security control.** A dismissed bar hidden via cookie/localStorage is a UX convenience; it says nothing about auth. The countdown deadline must be enforced server-side (an expired promo code is rejected at checkout, not merely hidden), because the client clock and the client-stored state are fully attacker-controllable.
* * *

## 16\. Senior-Level Checklist
Ship-ready gate — every item non-negotiable.
- [ ] Correct semantics: `role="region"` + `aria-label` for an important bar; no `role="banner"`, no `role="alert"` for editorial promos.
- [ ] Dismiss is a real `<button>` with a text/`aria-label` name; CTA is a real `<a href>` with meaningful copy.
- [ ] Exactly **one** message and **one** CTA; never two stacked bars.
- [ ] Keyboard: CTA and dismiss both reachable and operable; `Esc` dismisses; focus moves somewhere sensible on close (never `<body>`).
- [ ] Dismiss target ≥44×44px even on a 36px strip; text contrast ≥4.5:1 and ring ≥3:1 against **every** tone background.
- [ ] Zero layout shift: height reserved as a token, offset applied to header/page, enter/exit via `transform` only.
- [ ] Dismissal persisted **and versioned** (`ann:<campaign>-v<n>`) so a new announcement re-shows.
- [ ] Presence decided server-side (no flash); scheduling window and countdown deadline enforced on the server, not the client clock.
- [ ] `prefers-reduced-motion` respected: marquees/rotators freeze, transitions become instant.
- [ ] CMS content escaped by default; CTA href validated (no `javascript:`/open-redirect); dismiss POST is CSRF-protected.
- [ ] Rotating/marquee variant has manual controls, pauses on hover/focus, and is never the only way to read a critical message.
* * *

## 17\. Visual Styles
The same slim strip, rendered across the 11 core visual languages. Each note is specific to _this_ component.
*   **Flat:** solid tone-colored band, no shadow, crisp bottom edge; the dismiss X is a plain glyph and the CTA an underlined link. Reads instantly, renders cheapest — the default for a promo strip.
*   **Material:** the bar as an elevated Banner with a subtle bottom shadow separating it from content, an intent icon at the leading edge, and a text-button CTA with a ripple on tap; dismiss is an icon button.
*   **Glassmorphism:** a translucent strip with `backdrop-filter: blur()` letting the hero image bleed through; watch text contrast against whatever scrolls beneath — pin a semi-opaque tint under the blur so the message never drops below 4.5:1.
*   **Liquid Glass (2026):** an Apple-style refractive band that bends and brightens the content behind it with a specular top rim and a sheen that shifts on scroll; pill-radius CTA floating in the glass. Sings over deep Eminence, dangerous over busy imagery.
*   **Neumorphism:** the strip as a same-color surface with a soft inset groove separating it from the page, the dismiss X as a gently extruded soft button; accent use only — the low contrast fights the "must be seen" job of an announcement.
*   **Skeuomorphism:** a "printed ticket / marquee sign" treatment — beveled edges, a subtle paper or LED texture, an inset gradient; the countdown styled like a flip-clock. Characterful for a themed campaign, heavy for everyday use.
*   **Neo-Brutalism:** a hard black bottom border, a chunky offset shadow, zero radius, a clashing high-energy fill (Spanish Orange on Night), the dismiss X a bold monospace `[X]`. Maximum personality for a launch or drop.
*   **Claymorphism:** a puffy rounded band with a big radius, inner top-light and bottom-shadow, and a soft glow; the dismiss X a rounded pillowy button. Friendly, playful — good for a lighthearted promo, wrong for an outage notice.
*   **Aurora / Gradient:** an animated multi-hue gradient sweeping across the strip (Eminence→Sienna→Goldenrod) on a dark base; premium and eye-catching, but honor `prefers-reduced-motion` and keep text on a steady contrast zone, not riding the moving hue.
*   **Minimal / Swiss:** near-zero decoration — a thin hairline rule under a white/Platinum strip, the message set in a precise grid, the CTA a quiet underline, a small X. Typography and spacing do all the work; ideal for editorial or luxury brands.
*   **UJG Brand:** Goldenrod text and CTA on a deep Eminence (or Night) band, a warm subtle glow at the bottom edge, Methanerse for a short display headline and Urbanist for the message; confident but calm — the house default, the "walking in the park" version of urgency.

**The rule that never changes:** the style is skin; the behavior is the skeleton. Across all eleven, the semantics (`role="region"` + label), the keyboard path, the real dismiss label, the visible focus ring, the 44px target, the versioned persistence, and the zero-layout-shift contract are identical. Change the paint, never the bones.