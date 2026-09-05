import Link from "next/link";
import "@/styles/portal.css";
import {
  ALL_STYLES,
  getAllComponents,
  getCategories,
  type ComponentStatus,
} from "@/lib/content";

/**
 * /portal — the working surface you land in once builds are running.
 * Night ground, 248px rail, KPI row, runs table, library readiness.
 * Run history is local sample data until Phase 2 (Supabase `runs` table);
 * every library figure is read live from content/docs.
 */

const PLANNED_TOTAL = 51;
const TARGET_COUNT = 12;
const FILLED_TARGETS = 8;

type RunStatus = "shipped" | "draft" | "blocked";

interface Run {
  name: string;
  detail: string;
  domain: string;
  output: string;
  status: RunStatus;
  age: string;
}

/** Phase 2: replace with `select * from runs order by created_at desc limit 5`. */
const RUNS: Run[] = [
  {
    name: "Melanaxis report shell",
    detail: "11 assets · Obsidian Bloom skin",
    domain: "Data",
    output: "Zip · Spec · Repo",
    status: "shipped",
    age: "2d",
  },
  {
    name: "UJG marketing rebuild",
    detail: "9 assets · Vibranium Court skin",
    domain: "Website",
    output: "Zip · Spec",
    status: "shipped",
    age: "6d",
  },
  {
    name: "Intake mobile shell",
    detail: "7 assets · 44px targets held",
    domain: "Mobile",
    output: "Zip · Code",
    status: "draft",
    age: "2w",
  },
  {
    name: "Client intake dashboard",
    detail: "Stopped — Data Table and Chart Frame unwritten",
    domain: "Data",
    output: "—",
    status: "blocked",
    age: "3w",
  },
];

const RAIL: { section?: string; id?: string; label?: string; href?: string; badge?: string }[] = [
  { section: "Build" },
  { id: "overview", label: "Overview", href: "/portal" },
  { id: "composer", label: "Composer", href: "/catalog", badge: "3" },
  { id: "runs", label: "Runs", href: "/portal" },
  { id: "templates", label: "Templates", href: "/portal" },
  { section: "Library" },
  { id: "catalog", label: "Catalog", href: "/catalog" },
  { id: "specs", label: "Specs", href: "/catalog" },
  { id: "skins", label: "Skins", href: "/catalog" },
  { section: "System" },
  { id: "settings", label: "Settings", href: "/portal" },
];

const DOMAIN_MAP = [
  { name: "Websites", planned: 18, categories: ["Marketing & Content", "Navigation", "Layout & Structure"] },
  { name: "Data reports", planned: 21, categories: ["Data Display", "Feedback & Status"] },
  { name: "Mobile", planned: 12, categories: ["Actions", "Inputs & Forms", "Overlays & Popouts"] },
];

const AUDITED: ComponentStatus[] = ["audited", "reusable"];

export default function Portal() {
  const components = getAllComponents();
  const categories = getCategories();
  const written = components.length;
  const audited = components.filter((c) => AUDITED.includes(c.status)).length;
  const idea = PLANNED_TOTAL - written;
  const blocked = RUNS.filter((r) => r.status === "blocked").length;

  const countIn = (names: string[]) =>
    components.filter((c) => names.includes(c.category)).length;

  const kpis = [
    { label: "Specs written", value: String(written), unit: `/ ${PLANNED_TOTAL}`, delta: "+3 this week", trend: "up" },
    { label: "Runs generated", value: String(RUNS.length + 5), delta: "+2 this week", trend: "up" },
    { label: "Assets at Idea", value: String(idea), delta: "unchanged", trend: "flat" },
    { label: "Targets filled", value: String(FILLED_TARGETS), unit: `/ ${TARGET_COUNT}`, delta: "1 stale", trend: "down" },
  ];

  return (
    <div className="pt">
      <nav className="pt-rail" aria-label="Portal">
        <div className="pt-rail__logo">
          <span className="pt-rail__wordmark">DIGITAL ASSET</span>
          <span className="pt-rail__sub">Library · UJG</span>
        </div>
        <ul className="pt-rail__list">
          {RAIL.map((item, i) =>
            item.section ? (
              <li key={`s-${i}`} className="pt-rail__section">
                {item.section}
              </li>
            ) : (
              <li key={item.id}>
                <Link
                  href={item.href ?? "/portal"}
                  className={`pt-rail__item${item.id === "overview" ? " is-active" : ""}`}
                  aria-current={item.id === "overview" ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  {item.badge ? <span className="pt-rail__badge">{item.badge}</span> : null}
                </Link>
              </li>
            ),
          )}
        </ul>
        <div className="pt-rail__footer">
          <div>Omegea Hunter</div>
          <div className="pt-rail__ver">Phase 0 · v0.1.0</div>
        </div>
      </nav>

      <main className="pt-main">
        <header className="pt-top">
          <div>
            <p className="pt-eyebrow">Portal · Overview</p>
            <h1 className="pt-h1">Here&rsquo;s where the library stands.</h1>
          </div>
          <div className="pt-top__actions">
            <Link href="/catalog" className="pt-btn">
              Open catalog
            </Link>
            <Link href="/catalog" className="pt-btn pt-btn--primary">
              Start a run
            </Link>
          </div>
        </header>

        <section className="pt-kpis" aria-label="Library at a glance">
          {kpis.map((k) => (
            <div key={k.label} className={`pt-kpi${k.label === "Targets filled" ? " pt-kpi--keyline" : ""}`}>
              <span className="pt-kpi__label">{k.label}</span>
              <span className="pt-kpi__value">
                {k.value}
                {k.unit ? <em className="pt-kpi__unit">{k.unit}</em> : null}
              </span>
              <span className={`pt-kpi__delta pt-kpi__delta--${k.trend}`}>
                {k.trend === "up" ? "↑" : k.trend === "down" ? "↓" : "→"} {k.delta}
              </span>
            </div>
          ))}
        </section>

        <div className="pt-cols">
          <div className="pt-col">
            <div className="pt-colhead">
              <h2 className="pt-h2">Recent runs</h2>
              <span className="pt-meta">
                {RUNS.length + 5} total · {blocked} blocked
              </span>
            </div>

            <div className="pt-table" role="table" aria-label="Recent runs">
              <div className="pt-row pt-row--head" role="row">
                <span role="columnheader">Run</span>
                <span role="columnheader">Domain</span>
                <span role="columnheader">Output</span>
                <span role="columnheader">Status</span>
                <span role="columnheader" className="pt-right">Age</span>
              </div>
              {RUNS.map((r) => (
                <div key={r.name} className="pt-row" role="row">
                  <div className="pt-run" role="cell">
                    <div className="pt-run__name">{r.name}</div>
                    <div className={`pt-run__detail${r.status === "blocked" ? " is-warn" : ""}`}>
                      {r.detail}
                    </div>
                  </div>
                  <span className="pt-cell" role="cell">{r.domain}</span>
                  <span className="pt-cell" role="cell">{r.output}</span>
                  <span className={`pt-badge pt-badge--${r.status}`} role="cell">
                    {r.status === "shipped" ? "Shipped" : r.status === "draft" ? "Draft" : "Blocked"}
                  </span>
                  <span className="pt-cell pt-right" role="cell">{r.age}</span>
                </div>
              ))}
            </div>

            {blocked > 0 && (
              <div className="pt-callout">
                <strong>One run is blocked on two specs.</strong> Data Table and
                Chart Frame are on the {PLANNED_TOTAL} but still at Idea. Write
                them and the intake dashboard finishes without another decision
                from you.
              </div>
            )}

            <h2 className="pt-h2 pt-h2--spaced">Where the {PLANNED_TOTAL} sit</h2>
            <div className="pt-domains">
              {DOMAIN_MAP.map((d) => {
                const ready = countIn(d.categories);
                const pct = Math.round((ready / d.planned) * 100);
                return (
                  <div key={d.name} className="pt-domain">
                    <div className="pt-domain__name">{d.name}</div>
                    <div className="pt-domain__count">
                      {ready} / {d.planned}
                    </div>
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
              <p className="pt-eyebrow pt-eyebrow--muted">In progress</p>
              <h3 className="pt-panel__title">Pick up where you left off</h3>
              <div className="pt-resume">
                <div>
                  <div className="pt-resume__name">Client intake dashboard</div>
                  <div className="pt-resume__meta">7 assets chosen · 2 flagged</div>
                </div>
                <Link href="/catalog" className="pt-btn pt-btn--primary pt-btn--full">
                  Resume in composer
                </Link>
                <hr className="pt-rule" />
                <div>
                  <div className="pt-resume__name">Data Table spec</div>
                  <div className="pt-resume__meta">4 of 17 sections drafted</div>
                </div>
                <Link href="/catalog" className="pt-btn pt-btn--full">
                  Keep writing
                </Link>
              </div>
            </section>

            <section className="pt-card pt-card--keyline">
              <p className="pt-eyebrow">Library readiness</p>
              <div className="pt-meter">
                <div className="pt-meter__head">
                  <span>Specs audited</span>
                  <span>{Math.round((audited / PLANNED_TOTAL) * 100)}%</span>
                </div>
                <div className="pt-track">
                  <div
                    className="pt-track__fill"
                    style={{ width: `${(audited / PLANNED_TOTAL) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pt-meter">
                <div className="pt-meter__head">
                  <span>Code targets filled</span>
                  <span>{Math.round((FILLED_TARGETS / TARGET_COUNT) * 100)}%</span>
                </div>
                <div className="pt-track">
                  <div
                    className="pt-track__fill pt-track__fill--amethyst"
                    style={{ width: `${(FILLED_TARGETS / TARGET_COUNT) * 100}%` }}
                  />
                </div>
              </div>
              <p className="pt-note">
                {categories.length} categories seeded · {ALL_STYLES.length} skins live
              </p>
            </section>

            <section className="pt-card">
              <p className="pt-eyebrow pt-eyebrow--muted">Activity</p>
              <ul className="pt-activity">
                <li><span>Metric spec audited</span><span>4h</span></li>
                <li><span>Skin added · Cyber Mirage</span><span>1d</span></li>
                <li><span>Repo pushed · melanaxis-report</span><span>2d</span></li>
                <li><span>Tabs spec promoted to Reusable</span><span>5d</span></li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
