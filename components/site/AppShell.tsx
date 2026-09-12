"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/shell.css";

/**
 * Global app shell — the nine product surfaces, at three sizes.
 *
 *   ≥1024px   full 256px rail, label + hint
 *   768–1023  64px icon rail (labels move into title/aria-label)
 *   ≤767px    bottom tab bar of four plus More, the other five in the sheet
 *
 * The rail order is the information architecture; the mobile tab bar picks the
 * surfaces you move through daily and pushes the rest into the sheet, so nobody
 * meets a nine-item nav wall before they meet the content. The bar is a
 * five-column grid, so exactly four surfaces may carry a `tab` — Portal and
 * Dashboard are status surfaces you visit deliberately, not in passing, so they
 * live in the sheet and Search takes the slot.
 */

interface Surface {
  href: string;
  label: string;
  glyph: string;
  hint: string;
  /** Short label for the bottom tab bar. */
  tab?: string;
}

const SURFACES: Surface[] = [
  { href: "/", label: "Home", glyph: "◈", hint: "Landing", tab: "Home" },
  { href: "/portal", label: "Portal", glyph: "⇄", hint: "Where items move" },
  { href: "/dashboard", label: "Dashboard", glyph: "▤", hint: "Where items report" },
  { href: "/knowledge", label: "Knowledge Hub", glyph: "❋", hint: "Reference library", tab: "Library" },
  { href: "/search", label: "Search", glyph: "⌕", hint: "Find anything", tab: "Search" },
  { href: "/build", label: "Build Hub", glyph: "⚒", hint: "Compose & assemble", tab: "Build" },
  { href: "/templates", label: "Template Hub", glyph: "❐", hint: "Starters & kits" },
  { href: "/workspace", label: "Workspace", glyph: "◱", hint: "Your saved work" },
  { href: "/settings", label: "Settings", glyph: "⚙", hint: "Account & config" },
];

const TABS = SURFACES.filter((s) => s.tab);
const OVERFLOW = SURFACES.filter((s) => !s.tab);

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface ShellViewer {
  displayName: string | null;
  isAdmin: boolean;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const [viewer, setViewer] = useState<ShellViewer | null>(null);
  // Distinguishes "not signed in" from "have not asked yet", so the rail can
  // stay blank for a beat instead of flashing "Sign in" at a signed-in user.
  const [viewerKnown, setViewerKnown] = useState(false);

  // Fetched here rather than passed down from the layout: reading the session
  // server-side in the layout would opt every route out of static rendering.
  // Re-runs on navigation so signing in or out is reflected without a reload.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setViewer(
          data?.signed_in
            ? { displayName: data.display_name, isAdmin: Boolean(data.is_admin) }
            : null,
        );
        setViewerKnown(true);
      })
      .catch(() => {
        if (!cancelled) setViewerKnown(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Route change closes the sheet; Escape closes it from the keyboard.
  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const overflowActive = OVERFLOW.some((s) => isActive(pathname, s.href));

  return (
    <div className="app">
      {/* First focusable thing on every page: lets keyboard and screen-reader
          users jump the nine-item rail instead of tabbing through it on each
          navigation. Visible only while focused. */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <aside className="app-rail">
        <Link href="/" className="app-brand">
          <span className="app-brand__glyph" aria-hidden="true">
            ◈
          </span>
          <span className="app-brand__text">
            Digital Asset Library
            <span className="app-brand__sub">Urban Jungle Goddess</span>
          </span>
        </Link>

        <nav className="app-nav" aria-label="Primary">
          <ul>
            {SURFACES.map((s) => {
              const active = isActive(pathname, s.href);
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className={`app-nav__item${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    title={s.label}
                  >
                    <span className="app-nav__glyph" aria-hidden="true">
                      {s.glyph}
                    </span>
                    <span className="app-nav__labels">
                      <span className="app-nav__label">{s.label}</span>
                      <span className="app-nav__hint">{s.hint}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="app-rail__account">
          {!viewerKnown ? null : viewer ? (
            <>
              <Link href="/account" className="app-account">
                <span className="app-account__avatar" aria-hidden="true">
                  {(viewer.displayName ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="app-account__labels">
                  <span className="app-account__name">
                    {viewer.displayName ?? "Your account"}
                  </span>
                  <span className="app-account__hint">
                    {viewer.isAdmin ? "Admin" : "Signed in"}
                  </span>
                </span>
              </Link>
              {/* POST, so no prefetch or cross-site link can sign you out. */}
              <form action="/auth/signout" method="post">
                <button type="submit" className="app-account__out">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="app-account app-account--out">
              <span className="app-account__avatar" aria-hidden="true">
                →
              </span>
              <span className="app-account__labels">
                <span className="app-account__name">Sign in</span>
                <span className="app-account__hint">Save your work</span>
              </span>
            </Link>
          )}
        </div>

        <div className="app-rail__foot">
          <span>Phase 5 · v0.1.0</span>
          <span className="app-rail__foot-sub">Next.js + Supabase</span>
        </div>
      </aside>

      <div className="app-main" id="main" tabIndex={-1}>
        {children}
      </div>

      {/* Mobile: five tabs, the rest behind More. */}
      <nav className="app-tabs" aria-label="Primary">
        {TABS.map((s) => {
          const active = isActive(pathname, s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`app-tab${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="app-tab__glyph" aria-hidden="true">
                {s.glyph}
              </span>
              <span className="app-tab__label">{s.tab}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`app-tab${overflowActive || moreOpen ? " is-active" : ""}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <span className="app-tab__glyph" aria-hidden="true">
            ⋯
          </span>
          <span className="app-tab__label">More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="app-more">
          <button
            type="button"
            className="app-more__scrim"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="app-more__sheet" role="dialog" aria-modal="true" aria-label="All surfaces">
            <div className="app-more__grab" aria-hidden="true" />
            <p className="app-more__eyebrow">All surfaces</p>
            <ul className="app-more__list">
              {OVERFLOW.map((s) => {
                const active = isActive(pathname, s.href);
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className={`app-more__item${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="app-more__glyph" aria-hidden="true">
                        {s.glyph}
                      </span>
                      <span className="app-more__labels">
                        <span className="app-more__label">{s.label}</span>
                        <span className="app-more__hint">{s.hint}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="app-more__account">
              {!viewerKnown ? null : viewer ? (
                <>
                  <Link href="/account" className="app-more__item">
                    <span className="app-more__glyph" aria-hidden="true">
                      ◍
                    </span>
                    <span className="app-more__labels">
                      <span className="app-more__label">
                        {viewer.displayName ?? "Your account"}
                      </span>
                      <span className="app-more__hint">
                        Collections &amp; profile
                      </span>
                    </span>
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="app-account__out">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="app-more__item">
                  <span className="app-more__glyph" aria-hidden="true">
                    →
                  </span>
                  <span className="app-more__labels">
                    <span className="app-more__label">Sign in</span>
                    <span className="app-more__hint">Save your work</span>
                  </span>
                </Link>
              )}
            </div>

            <div className="app-more__foot">
              <span>Phase 5 · v0.1.0</span>
              <span>Next.js + Supabase</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
