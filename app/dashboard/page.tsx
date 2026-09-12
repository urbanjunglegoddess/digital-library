import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import "@/styles/dashboard.css";
import {
  getAllComponents,
  getCategories,
  type ComponentStatus,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Where the library reports: live coverage, status, and what needs attention across the component catalog.",
};

/**
 * Dashboard — /dashboard ("Data Rebellion" night surface).
 *
 * Every figure reads live from content/docs. The activity feed is sample
 * event data until Phase 2 wires an events table; the status ladder, tiles and
 * coverage ring are all computed from the real catalog.
 */

const BANKED: ComponentStatus[] = ["audited", "reusable"];
const PUBLISHED: ComponentStatus[] = ["built", "audited", "reusable"];

const LADDER: { key: ComponentStatus; label: string }[] = [
  { key: "idea", label: "Idea" },
  { key: "drafting", label: "Draft" },
  { key: "built", label: "Built" },
  { key: "audited", label: "Audited" },
  { key: "reusable", label: "Reusable" },
];

export default function DashboardPage() {
  const components = getAllComponents();
  const categories = getCategories();

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

  // "Continue" points at the first component still short of published, else the first overall.
  const resume =
    components.find((c) => !PUBLISHED.includes(c.status)) ?? components[0];

  const actions = [
    { href: "/knowledge", label: "Browse components", primary: true },
    { href: "/workspace", label: "▷ Open the Playground" },
    { href: "/templates", label: "▤ New from template" },
    { href: "/build", label: "⚒ Open the composer" },
  ];

  return (
    <main className="dsh">
      <div className="dsh-canvas">
        <div className="dsh-greet">
          Welcome back, <b>Omegea</b> — the jungle&rsquo;s been growing.
        </div>

        <div className="dsh-tiles">
          <div className="dsh-tile dsh-tile--total">
            <span className="dsh-tile__edge" />
            <div className="dsh-tile__cap">Total components</div>
            <div className="dsh-tile__val">{total}</div>
            <div className="dsh-tile__sub">across {families} families</div>
          </div>

          <div className="dsh-tile dsh-tile--aud">
            <span className="dsh-tile__edge" />
            <div className="dsh-tile__cap">Audited · banked</div>
            <div className="dsh-tile__val">{banked}</div>
            <Link href="/knowledge" className="dsh-tile__sub dsh-tile__link">
              view audited ›
            </Link>
          </div>

          <div className="dsh-tile dsh-tile--cov">
            <span className="dsh-tile__edge" />
            <div className="dsh-tile__cap">Coverage</div>
            <div className="dsh-covrow">
              <div
                className="dsh-ring"
                style={{ "--p": coverage } as CSSProperties}
              >
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
        <p className="dsh-asof">Aggregates read live from the component docs · refreshed on build, not polled</p>

        <div className="dsh-row">
          <div className="dsh-card">
            <h3>▤ Continue where you left off</h3>
            {resume ? (
              <div className="dsh-cont">
                <div className="dsh-thumb" />
                <div>
                  <div className="dsh-cont__nm">{resume.name}</div>
                  <div className="dsh-cont__mt">
                    {resume.category} · status {resume.status}
                  </div>
                  <Link className="dsh-resume" href={`/knowledge/${resume.slug}`}>
                    Resume →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="dsh-tile__sub">Nothing in progress.</p>
            )}
          </div>

          <div className="dsh-card">
            <h3>⚡ Quick actions</h3>
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
            <h3>◈ Recent activity</h3>
            <div className="dsh-feed">
              <div className="dsh-fi">
                <span className="dsh-dot dsh-dot--gold" />
                <div>
                  <div className="dsh-ft">
                    <b>{banked}</b> components banked at Audited or Reusable
                  </div>
                  <div className="dsh-fm">live rollup · {coverage}% coverage</div>
                </div>
              </div>
              <div className="dsh-fi">
                <span className="dsh-dot dsh-dot--g" />
                <div>
                  <div className="dsh-ft">
                    <b>{counts.find((c) => c.key === "built")?.count ?? 0}</b> at Built,
                    ready to audit
                  </div>
                  <div className="dsh-fm">status ladder · next up</div>
                </div>
              </div>
              <div className="dsh-fi">
                <span className={`dsh-dot ${attention > 0 ? "dsh-dot--o" : "dsh-dot--g"}`} />
                <div>
                  <div className="dsh-ft">
                    {attention > 0 ? (
                      <>
                        <b>{attention}</b> components need attention
                      </>
                    ) : (
                      <>Every component is published</>
                    )}
                  </div>
                  <div className="dsh-fm">
                    {attention > 0 ? "below Built on the ladder" : "nothing flagged"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dsh-card dsh-card--build">
            <h3>
              ⚒ Build progress <span className="dsh-own">Owner</span>
            </h3>
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
            <div className="dsh-deliv">
              <span>
                <i /> Doc
              </span>
              <span>
                <i /> Playground
              </span>
              <span>
                <i className="off" /> Audit
              </span>
              <span style={{ marginLeft: "auto", color: "var(--gold)" }}>
                2 / 3 deliverables
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
