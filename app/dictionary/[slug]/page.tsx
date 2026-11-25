import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTerm, getTermSlugs, getAllTerms } from "@/lib/dictionary";
import { Markdown } from "@/components/catalog/Markdown";

export function generateStaticParams() {
  return getTermSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) return { title: "Not found" };
  return { title: term.term, description: term.summary };
}

export default async function TermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) notFound();

  const related = term.related
    .map((s) => getAllTerms().find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <main className="page detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/dictionary">Dictionary</Link>
        <span aria-hidden="true">/</span>
        <span>{term.domain}</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumb__current">{term.term}</span>
      </nav>

      <header className="detail__head">
        <div className="detail__headtop">
          <h1 className="detail__title">{term.term}</h1>
          <span className={`status status--${term.status}`}>{term.status}</span>
        </div>
        {term.summary && <p className="detail__summary">{term.summary}</p>}
        <div className="detail__tags">
          <span className="detail__cat">{term.domain}</span>
          {term.aliases.map((a) => (
            <span key={a} className="detail__tag">also: {a}</span>
          ))}
          {term.tags.map((t) => (
            <span key={t} className="detail__tag">{t}</span>
          ))}
        </div>
      </header>

      {term.body && (
        <section className="detail__block">
          <Markdown>{term.body}</Markdown>
        </section>
      )}

      {term.sources.length > 0 && (
        <section className="detail__block">
          <h2 className="detail__h2">Sources</h2>
          <ul className="reflist">
            {term.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
                {s.kind && <span className="reflist__src">{s.kind}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="detail__block">
          <h2 className="detail__h2">Related terms</h2>
          <ul className="reflist">
            {related.map((t) => (
              <li key={t.slug}>
                <Link href={`/dictionary/${t.slug}`}>{t.term}</Link>
                <span className="reflist__src">{t.domain}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
