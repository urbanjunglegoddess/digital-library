import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import "@/styles/dashboard.css";
import {
  getAllComponents,
  getCategories,
  type ComponentStatus,
} from "@/lib/content";
import { getViewer } from "@/lib/auth";
import { listCollections } from "@/lib/collections";
import { listTemplates } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Where your work and the library report: your saved collections and templates, plus live catalog coverage and status.",
  robots: { index: false, follow: false },
};

/**
 * Dashboard — /dashboard ("Data Rebellion" night surface).
 *
 * Reads the session, so it is dynamic. Signed out → a sign-in prompt. Signed
 * in → the greeting, "Continue", and activity feed are the viewer's real saved
 * work (collections, templates), read under their session (RLS-scoped); the
 * tiles and status ladder report the live catalog.
 */

export const dynamic = "force-dynamic";

const BANKED: ComponentStatus[] = ["audited", "reusable"];
const PUBLISHED: ComponentStatus[] = ["built", "audited", "reusable"];

const LADDER: { key: ComponentStatus; label: string }[] = [
  { key: "idea", label: "Idea" },
  { key: "drafting", label: "Draft" },
  { key: "built", label: "Built" },
  { key: "audited", label: "Audited" },
  { key: "reusable", label: "Reusable" },
];

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const secs = Math.max(0, (Date.now() - then) / 1000);
  if (secs < 90) return "just now";
  const mins = secs / 60;
  if (mins < 60) return `${Math.round(mins)}m`;
  const hrs = mins / 60;
  if (hrs < 24) return `${Math.round(hrs)}h`;
  const days = hrs / 24;
  if (days < 14) return `${Math.round(days)}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

export default async function DashboardPage() {
  const viewer = await getViewer();

  // --- Signed out: prompt. --------------------------------------------------
  if (!viewer) {
    return (
      <main className="dsh">
        <div className="dsh-canvas">
          <div className="dsh-gate">
            <h1 className="dsh-greet">Sign in to see your dashboard.</h1>
            <p className="dsh-gate__lede">
              Your dashboard reports on your own saved work — collections and
              templates, private to you — alongside the live library coverage.
              Sign in to see it.
            </p>
            <div className="dsh-gate__actions">
              <Link href="/login?next=/dashboard" className="dsh-btn dsh-btn--primary">
                Sign in
              </Link>
              <Link href="/knowledge" className="dsh-btn dsh-btn--ghost">
                Browse the library
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- Signed in: real work + live library report. --------------------------
  const components = getAllComponents();
  const categories = getCategories();
  const [collections, templates] = await Promise.all([
    listCollections(),
    listTemplates(),
  ]);

  const total = components.length;
  const families = categories.length;
  const banked = components.filter((c) => BANKED.includes(c.status)).length;
  const attention = components.filter((c) => !PUBLISHED.includes(c.status)).length;
  const coverage = total ? Math.round((banked / total) * 100) : 0;

  const counts = LADDER.map((s) => ({
    ...s,
    count: components.filter((c) => c.status === s.key).length,
  }));
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  const savedComponents = new Set(
    collections.flatMap((c) => c.items.map((i) => i.slug)),
  ).size;

  // "Continue" points at the most recently saved template, else the first
  // collection — the user's real work, not an arbitrary catalog pick.
  const latestTemplate = templates[0] ?? null;
  const firstCollection = collections[0] ?? null;

  // Real activity feed from the viewer's saved work.
  const feed = [
    ...templates.slice(0, 3).map((t) => ({
      kind: "gold" as const,
      head: (
        <>
          Template <b>{t.name}</b> saved
        </>
      ),
      meta: `${t.itemCount} component${t.itemCount === 1 ? "" : "s"} · ${timeAgo(t.updatedAt)}`,
    })),
    ...collections.slice(0, 2).map((c) => ({
      kind: "g" as const,
      head: (
        <>
          Collection <b>{c.name}</b> · {c.items.length} item{c.items.length === 1 ? "" : "s"}
        </>
      ),
      meta: "saved to your library",
    })),
  ].slice(0, 4);

  const firstName = viewer.displayName?.split(" ")[0] ?? null;

  const actions = [
    { href: "/knowledge", label: "Browse components", primary: true },
    { href: "/workspace", label: "▷ Open the Playground" },
    { href: "/build", label: "⚒ Open the composer" },
    { href: "/account", label: "◱ Manage account" },
  ];

  return (
    <main className="dsh">
      <div className="dsh-canvas">
        <h1 className="dsh-greet">
          Welcome back{firstName ? <>, <b>{firstName}</b></> : null} — here&rsquo;s where things stand.
        </h1>

        <div className="dsh-tiles">
          <div className="dsh-tile dsh-tile--total">
            <span className="dsh-tile__edge" />
            <div className="dsh-tile__cap">Your collections</div>
            <div className="dsh-tile__val">{collections.length}</div>
            <div className="dsh-tile__sub">{savedComponents} components saved</div>
          </div>

          <div className="dsh-tile dsh-tile--aud">
            <span className="dsh-tile__edge" />
            <div className="dsh-tile__cap">Saved templates</div>
            <div className="dsh-tile__val">{templates.length}</div>
            <Link href="/build" className="dsh-tile__sub dsh-tile__link">
              compose one ›
            </Link>
          </div>

          <div className="dsh-tile dsh-tile--cov">
            <span className="dsh-tile__edge" />
            <div className="dsh-tile__cap">Library coverage</div>
            <div className="dsh-covrow">
              <div className="dsh-ring" style={{ "--p": coverage } as CSSProperties}>
                <i>{coverage}%</i>
              </div>
              <div className="dsh-tile__sub">
                audited ÷ total
                <br />
                {coverage >= 50 ? "growing steadily" : "early days"}
              </div>
            </div>
          </div>

          <div className="dsh-tile dsh-tile--attn">
            <span className="dsh-tile__edge" />
            <div className="dsh-tile__cap">
              Needs attention
              {attention > 0 && <span className="dsh-badge">{attention}</span>}
            </div>
            <div className="dsh-tile__val">{attention}</div>
            <Link href="/knowledge" className="dsh-tile__sub dsh-tile__link">
              {attention > 0 ? "resolve now ›" : "all published ›"}
            </Link>
          </div>
        </div>
        <p className="dsh-asof">
          Your figures read live from your account · library figures from the component docs
        </p>

        <div className="dsh-row">
          <div className="dsh-card">
            <h2>▤ Continue where you left off</h2>
            {latestTemplate ? (
              <div className="dsh-cont">
                <div className="dsh-thumb" />
                <div>
                  <div className="dsh-cont__nm">{latestTemplate.name}</div>
                  <div className="dsh-cont__mt">
                    Template · {latestTemplate.itemCount} components · {timeAgo(latestTemplate.updatedAt)}
                  </div>
                  <Link className="dsh-resume" href="/build">
                    Open the composer →
                  </Link>
                </div>
              </div>
            ) : firstCollection ? (
              <div className="dsh-cont">
                <div className="dsh-thumb" />
                <div>
                  <div className="dsh-cont__nm">{firstCollection.name}</div>
                  <div className="dsh-cont__mt">
                    Collection · {firstCollection.items.length} items
                  </div>
                  <Link className="dsh-resume" href="/account">
                    Open your collections →
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="dsh-tile__sub">Nothing saved yet.</p>
                <Link className="dsh-resume" href="/knowledge">
                  Browse the library and save your first component →
                </Link>
              </div>
            )}
          </div>

          <div className="dsh-card">
            <h2>⚡ Quick actions</h2>
            <div className="dsh-qa">
              {actions.map((a) => (
                <Link
                  key={a.href + a.label}
                  href={a.href}
                  className={`dsh-btn ${a.primary ? "dsh-btn--primary" : "dsh-btn--ghost"}`}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="dsh-row">
          <div className="dsh-card">
            <h2>◈ Recent activity</h2>
            <div className="dsh-feed">
              {feed.length === 0 ? (
                <div className="dsh-fi">
                  <span className="dsh-dot dsh-dot--g" />
                  <div>
                    <div className="dsh-ft">Nothing saved yet</div>
                    <div className="dsh-fm">
                      Save a component or compose a template and it shows up here
                    </div>
                  </div>
                </div>
              ) : (
                feed.map((f, i) => (
                  <div key={i} className="dsh-fi">
                    <span className={`dsh-dot dsh-dot--${f.kind}`} />
                    <div>
                      <div className="dsh-ft">{f.head}</div>
                      <div className="dsh-fm">{f.meta}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dsh-card dsh-card--build">
            <h2>⚒ Library build progress</h2>
            <div className="dsh-ladder">
              {counts.map((s) => (
                <div key={s.key} className={`dsh-seg dsh-seg--${s.key}`}>
                  <div className="dsh-seg__track">
                    <div
                      className="dsh-seg__fill"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="dsh-seg__lb">{s.label}</div>
                  <div className="dsh-seg__n">{s.count}</div>
                </div>
              ))}
            </div>
            <div className="dsh-rollup">
              Ladder rollup · {banked} banked · {total} total across {families} families
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
