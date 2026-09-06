"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Global app shell — a persistent left sidebar listing the eight product
 * surfaces, with page content rendered to its right. Every route renders
 * inside this shell (see app/layout.tsx).
 */

interface Surface {
  href: string;
  label: string;
  glyph: string;
  hint: string;
}

const SURFACES: Surface[] = [
  { href: "/", label: "Home", glyph: "◈", hint: "Landing" },
  { href: "/portal", label: "Portal", glyph: "⇄", hint: "Where items move" },
  { href: "/dashboard", label: "Dashboard", glyph: "▤", hint: "Where items report" },
  { href: "/knowledge", label: "Knowledge Hub", glyph: "❋", hint: "Reference library" },
  { href: "/build", label: "Build Hub", glyph: "⚒", hint: "Compose & assemble" },
  { href: "/templates", label: "Template Hub", glyph: "❐", hint: "Starters & kits" },
  { href: "/workspace", label: "Workspace", glyph: "◱", hint: "Your saved work" },
  { href: "/settings", label: "Settings", glyph: "⚙", hint: "Account & config" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

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
    </div>
  );
}
