import type { Metadata } from "next";
import Link from "next/link";
import { getReferenceGroups } from "@/lib/reference";

export const metadata: Metadata = {
  title: "Reference — Digital Asset Library",
  description:
    "Library-wide reference: design and layout style languages, the atomic design map, screen taxonomies, and feature references by app type.",
};

/**
 * Reference index — /reference
 *
 * Browsable design-system and product references, grouped. Distinct from the
 * component catalog (Knowledge Hub); these apply library-wide.
 */
export default function ReferenceIndexPage() {
  const groups = getReferenceGroups();

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Reference</p>
        <h1 className="page__title">The reference library</h1>
        <p className="page__lede">
          The system-level references the whole catalog draws on — visual and
          structural style languages, the atomic design map, and the screen and
          feature taxonomies by app type.
        </p>
        <p className="page__lede">
          Looking for a specific component? That&rsquo;s the{" "}
          <Link href="/knowledge">Knowledge Hub</Link>.
        </p>
      </div>

      {groups.map(({ group, docs }) => (
        <section key={group} className="catalog-group">
          <h2 className="catalog-group__title">{group}</h2>
          <div className="card-grid">
            {docs.map((d) => (
              <Link key={d.slug} href={`/reference/${d.slug}`} className="card">
                <div className="card__head">
                  <span className="card__name">{d.title}</span>
                </div>
                <p className="card__summary">{d.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
