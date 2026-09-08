"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/shell.css";

/**
 * Global app shell — the eight product surfaces, at three sizes.
 *
 *   ≥1024px   full 256px rail, label + hint
 *   768–1023  64px icon rail (labels move into title/aria-label)
 *   ≤767px    bottom tab bar of five, the other three behind More
 *
 * The rail order is the information architecture; the mobile tab bar picks the
 * five surfaces you move through daily and pushes the rest into the sheet, so
 * nobody meets an eight-item nav wall before they meet the content.
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
  { href: "/portal", label: "Portal", glyph: "⇄", hint: "Where items move", tab: "Portal" },
  { href: "/dashboard", label: "Dashboard", glyph: "▤", hint: "Where items report" },
  { href: "/knowledge", label: "Knowledge Hub", glyph: "❋", hint: "Reference library", tab: "Library" },
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [moreOpen, setMoreOpen] = useState(false);

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
      <aside className="app-rail" aria-label="Primary">
        <Link href="/" className="app-brand">
          <span className="app-brand__glyph" aria-hidden="true">
            ◈
          </span>
          <span className="app-brand__text">
            Digital Asset Library
            <span className="app-brand__sub">Urban Jungle Goddess</span>
          </span>
        </Link>

        <nav className="app-nav">
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

        <div className="app-rail__foot">
          <span>Phase 1 · v0.1.0</span>
          <span className="app-rail__foot-sub">Next.js + Supabase</span>
        </div>
      </aside>

      <div className="app-main">{children}</div>

      {/* Mobile: five tabs, the rest behind More. */}
      <nav className="app-tabs" aria-label="Primary (mobile)">
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
            <div className="app-more__foot">
              <span>Phase 1 · v0.1.0</span>
              <span>Next.js + Supabase</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
