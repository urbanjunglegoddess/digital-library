import Link from "next/link";
import "@/styles/portal.css";
import {
  ALL_STYLES,
  getAllComponents,
  getCategories,
  type ComponentStatus,
} from "@/lib/content";
import { getViewer } from "@/lib/auth";
import { listCollections } from "@/lib/collections";
import { listTemplates } from "@/lib/templates";

/**
 * /portal — your working surface. Night ground, KPI row, your saved work.
 *
 * Reads the session, so it is dynamic. Signed out, it shows a sign-in prompt;
 * signed in, every "your" figure (collections, saved components, templates)
 * is read live from Supabase under the caller's session (RLS-scoped). The
 * library-wide panels (domain spread, audited coverage) read from the catalog.
 */

// Reads the session → never prerender.
export const dynamic = "force-dynamic";

const AUDITED: ComponentStatus[] = ["audited", "reusable"];

const DOMAIN_MAP = [
  { name: "Websites", categories: ["Marketing & Content", "Navigation", "Layout & Structure", "Media"] },
  { name: "Data reports", categories: ["Data Display", "Feedback & Status"] },
  { name: "Mobile", categories: ["Actions", "Inputs & Forms", "Overlays & Popouts", "Utilities"] },
];

/** Compact "4h" / "3d" / "2w" / "5mo" since an ISO timestamp. */
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

export default async function Portal() {
  const viewer = await getViewer();

  const components = getAllComponents();
  const categories = getCategories();
  const written = components.length;
  const audited = components.filter((c) => AUDITED.includes(c.status)).length;
  const auditedPct = written ? Math.round((audited / written) * 100) : 0;
  const countIn = (names: string[]) =>
    components.filter((c) => names.includes(c.category)).length;

  // --- Signed out: prompt, don't fake a workspace. --------------------------
  if (!viewer) {
    return (
      <div className="pt">
        <main className="pt-main">
          <section className="pt-gate">
            <p className="pt-eyebrow pt-eyebrow--muted">Portal</p>
            <h1 className="pt-h1">Sign in to open your workspace.</h1>
            <p className="pt-gate__lede">
              Your Portal shows your own collections, saved templates and recent
              work — read live from your account, private to you. Sign in to see
              it, or browse the public library first.
            </p>
            <div className="pt-gate__actions">
              <Link href="/login?next=/portal" className="pt-btn pt-btn--primary">
                Sign in
              </Link>
              <Link href="/knowledge" className="pt-btn">
                Browse the library
              </Link>
            </div>
            <p className="pt-note">
              {written} component specs · {categories.length} categories ·{" "}
              {ALL_STYLES.length} skins live — all public.
            </p>
          </section>
        </main>
      </div>
    );
  }

  // --- Signed in: real saved work. ------------------------------------------
  const [collections, templates] = await Promise.all([
    listCollections(),
    listTemplates(),
  ]);

  const savedComponentSlugs = new Set(
    collections.flatMap((c) => c.items.map((i) => i.slug)),
  );
  const savedComponents = savedComponentSlugs.size;

  // Recent saved work: newest templates first, then collections, capped.
  const activity = [
    ...templates.map((t) => ({
      label: `Template · ${t.name}`,
      when: timeAgo(t.updatedAt),
      sort: t.updatedAt ? new Date(t.updatedAt).getTime() : 0,
    })),
    ...collections.map((c) => ({
      label: `Collection · ${c.name}`,
      when: `${c.items.length} item${c.items.length === 1 ? "" : "s"}`,
      sort: 0,
    })),
  ]
    .sort((a, b) => b.sort - a.sort)
    .slice(0, 5);

  const kpis = [
    { label: "Collections", value: String(collections.length) },
    { label: "Saved components", value: String(savedComponents) },
    { label: "Saved templates", value: String(templates.length) },
    { label: "Library audited", value: String(audited), unit: `/ ${written}`, keyline: true },
  ];

  const firstName = viewer.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="pt">
      <main className="pt-main">
        <header className="pt-top">
          <div>
            <p className="pt-eyebrow">Portal · {viewer.displayName ?? "Your workspace"}</p>
            <h1 className="pt-h1">Welcome back, {firstName}.</h1>
          </div>
          <div className="pt-top__actions">
            <Link href="/knowledge" className="pt-btn">
              Open Knowledge Hub
            </Link>
            <Link href="/build" className="pt-btn pt-btn--primary">
              Start a build
            </Link>
          </div>
        </header>

        <section className="pt-kpis" aria-label="Your work at a glance">
          {kpis.map((k) => (
            <div key={k.label} className={`pt-kpi${k.keyline ? " pt-kpi--keyline" : ""}`}>
              <span className="pt-kpi__label">{k.label}</span>
              <span className="pt-kpi__value">
                {k.value}
                {k.unit ? <em className="pt-kpi__unit">{k.unit}</em> : null}
              </span>
            </div>
          ))}
        </section>

        <div className="pt-cols">
          <div className="pt-col">
            <div className="pt-colhead">
              <h2 className="pt-h2">Your collections</h2>
              <span className="pt-meta">
                {collections.length} total · {savedComponents} components
              </span>
            </div>

            {collections.length === 0 ? (
              <div className="pt-empty">
                <strong>No collections yet.</strong> Save components into a
                collection from any component page in the{" "}
                <Link href="/knowledge">Knowledge Hub</Link>, and they land here.
              </div>
            ) : (
              <div className="pt-table" role="table" aria-label="Your collections">
                <div className="pt-row pt-row--head" role="row">
                  <span role="columnheader">Collection</span>
                  <span role="columnheader" className="pt-right">Items</span>
                </div>
                {collections.map((c) => (
                  <div key={c.id} className="pt-row" role="row">
                    <div className="pt-run" role="cell">
                      <div className="pt-run__name">{c.name}</div>
                      <div className="pt-run__detail">
                        {c.items.slice(0, 3).map((i) => i.name).join(" · ") || "Empty"}
                        {c.items.length > 3 ? ` +${c.items.length - 3} more` : ""}
                      </div>
                    </div>
                    <span className="pt-cell pt-right" role="cell">{c.items.length}</span>
                  </div>
                ))}
              </div>
            )}

            <h2 className="pt-h2 pt-h2--spaced">Saved templates</h2>
            {templates.length === 0 ? (
              <div className="pt-empty">
                <strong>No saved templates yet.</strong> Compose a set in the{" "}
                <Link href="/build">Build Hub</Link> and save it to reuse later.
              </div>
            ) : (
              <div className="pt-table" role="table" aria-label="Saved templates">
                <div className="pt-row pt-row--head" role="row">
                  <span role="columnheader">Template</span>
                  <span role="columnheader">Components</span>
                  <span role="columnheader" className="pt-right">Updated</span>
                </div>
                {templates.map((t) => (
                  <div key={t.id} className="pt-row" role="row">
                    <div className="pt-run" role="cell">
                      <div className="pt-run__name">{t.name}</div>
                      {t.description ? (
                        <div className="pt-run__detail">{t.description}</div>
                      ) : null}
                    </div>
                    <span className="pt-cell" role="cell">{t.itemCount}</span>
                    <span className="pt-cell pt-right" role="cell">{timeAgo(t.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}

            <h2 className="pt-h2 pt-h2--spaced">Where the {written} specs sit</h2>
            <div className="pt-domains">
              {DOMAIN_MAP.map((d) => {
                const ready = countIn(d.categories);
                const pct = written ? Math.round((ready / written) * 100) : 0;
                return (
                  <div key={d.name} className="pt-domain">
                    <div className="pt-domain__name">{d.name}</div>
                    <div className="pt-domain__count">{ready}</div>
                    <div className="pt-track">
                      <div className="pt-track__fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="pt-side">
            <section className="pt-panel">
              <p className="pt-eyebrow pt-eyebrow--muted">Pick up</p>
              <h3 className="pt-panel__title">Keep building</h3>
              <div className="pt-resume">
                <div>
                  <div className="pt-resume__name">Compose a template</div>
                  <div className="pt-resume__meta">
                    {savedComponents} saved component{savedComponents === 1 ? "" : "s"} to draw from
                  </div>
                </div>
                <Link href="/build" className="pt-btn pt-btn--primary pt-btn--full">
                  Open the composer
                </Link>
                <hr className="pt-rule" />
                <div>
                  <div className="pt-resume__name">Your account</div>
                  <div className="pt-resume__meta">Profile, collections &amp; assets</div>
                </div>
                <Link href="/account" className="pt-btn pt-btn--full">
                  Manage account
                </Link>
              </div>
            </section>

            <section className="pt-card pt-card--keyline">
              <p className="pt-eyebrow">Library readiness</p>
              <div className="pt-meter">
                <div className="pt-meter__head">
                  <span>Specs audited</span>
                  <span>{auditedPct}%</span>
                </div>
                <div className="pt-track">
                  <div className="pt-track__fill" style={{ width: `${auditedPct}%` }} />
                </div>
              </div>
              <p className="pt-note">
                {categories.length} categories seeded · {ALL_STYLES.length} skins live
              </p>
            </section>

            <section className="pt-card">
              <p className="pt-eyebrow pt-eyebrow--muted">Recent saved work</p>
              {activity.length === 0 ? (
                <p className="pt-note">Nothing saved yet — your activity shows up here.</p>
              ) : (
                <ul className="pt-activity">
                  {activity.map((a, i) => (
                    <li key={i}><span>{a.label}</span><span>{a.when}</span></li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
