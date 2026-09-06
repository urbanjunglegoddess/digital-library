import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllComponents,
  getAllTags,
  getCategories,
  ALL_STYLES,
  type ComponentStatus,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Dashboard — Digital Asset Library",
  description:
    "Where the library reports: coverage, status, and health across the component catalog.",
};

const STATUS_ORDER: ComponentStatus[] = [
  "idea",
  "drafting",
  "built",
  "audited",
  "reusable",
];
const PUBLISHED: ComponentStatus[] = ["built", "audited", "reusable"];

export default function DashboardPage() {
  const components = getAllComponents();
  const categories = getCategories();
  const tags = getAllTags();
  const total = components.length;

  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    count: components.filter((c) => c.status === s).length,
  }));
  const published = components.filter((c) => PUBLISHED.includes(c.status)).length;
  const maxCat = Math.max(1, ...categories.map((c) => c.components.length));

  const kpis = [
    { label: "Components", value: total },
    { label: "Published", value: published, sub: `${total ? Math.round((published / total) * 100) : 0}%` },
    { label: "Categories", value: categories.length },
    { label: "Tags", value: tags.length },
    { label: "Visual styles", value: ALL_STYLES.length },
  ];

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Dashboard</p>
        <h1 className="page__title">Where the library reports</h1>
        <p className="page__lede">
          Live coverage and status across the catalog, read straight from the
          component docs.
        </p>
      </div>

      <section className="dash-kpis" aria-label="Key figures">
        {kpis.map((k) => (
          <div key={k.label} className="dash-kpi">
            <span className="dash-kpi__value">{k.value}</span>
            <span className="dash-kpi__label">{k.label}</span>
            {k.sub && <span className="dash-kpi__sub">{k.sub}</span>}
          </div>
        ))}
      </section>

      <section className="detail__block">
        <h2 className="detail__h2">Status ladder</h2>
        <div className="dash-status">
          {statusCounts.map((s) => (
            <div key={s.status} className="dash-status__row">
              <span className={`status status--${s.status}`}>{s.status}</span>
              <div className="dash-bar">
                <div
                  className="dash-bar__fill"
                  style={{ width: `${total ? (s.count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="dash-status__count">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="detail__block">
        <h2 className="detail__h2">Coverage by category</h2>
        <div className="dash-cats">
          {categories.map((c) => (
            <Link key={c.category} href="/knowledge" className="dash-cat">
              <span className="dash-cat__name">{c.category}</span>
              <div className="dash-bar">
                <div
                  className="dash-bar__fill dash-bar__fill--gold"
                  style={{ width: `${(c.components.length / maxCat) * 100}%` }}
                />
              </div>
              <span className="dash-status__count">{c.components.length}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
