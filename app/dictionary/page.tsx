import type { Metadata } from "next";
import Link from "next/link";
import { getTermGroups, getAllTerms } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Dictionary",
  description:
    "A dictionary of terms — each defined to a fixed bar: common and rare operation instances, research findings, and proven occurrences, every claim sourced.",
};

/**
 * Dictionary index — /dictionary
 *
 * Browsable term entries, grouped by domain. The terminology counterpart to
 * the Knowledge Hub (components) and the Reference library (system-level docs);
 * each entry is authored to the Dictionary / Term Asset Template.
 */
export default function DictionaryIndexPage() {
  const groups = getTermGroups();
  const total = getAllTerms().length;

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Dictionary</p>
        <h1 className="page__title">The dictionary of terms</h1>
        <p className="page__lede">
          {total === 0
            ? "No terms are defined yet."
            : `${total} term${total === 1 ? "" : "s"}, each defined to a fixed bar`}
          {total === 0
            ? " Entries land in content/terms."
            : " — common and rare operation instances, research findings, and proven occurrences, every claim sourced."}
        </p>
        <p className="page__lede">
          Looking for a component? That&rsquo;s the{" "}
          <Link href="/knowledge">Knowledge Hub</Link>. For system-level
          references, the <Link href="/reference">Reference library</Link>.
        </p>
      </div>

      {total === 0 ? (
        <p className="catalog-empty">
          No term entries yet. Copy <code>content/terms/_TERM_TEMPLATE.mdx</code>{" "}
          to <code>content/terms/&lt;slug&gt;.mdx</code> and fill it in — see{" "}
          <code>docs/authoring-term-pages.md</code>.
        </p>
      ) : (
        groups.map(({ domain, terms }) => (
          <section key={domain} className="catalog-group">
            <h2 className="catalog-group__title">{domain}</h2>
            <div className="card-grid">
              {terms.map((t) => (
                <Link key={t.slug} href={`/dictionary/${t.slug}`} className="card">
                  <div className="card__head">
                    <span className="card__name">{t.term}</span>
                    <span className={`status status--${t.status}`}>{t.status}</span>
                  </div>
                  <p className="card__summary">{t.summary}</p>
                  {t.tags.length > 0 && (
                    <div className="card__meta">
                      {t.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="card__tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
