import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSlugs,
  getComponent,
  playgroundExists,
  STYLE_NAMES,
} from "@/lib/content";
import { StyleSwitcher } from "@/components/catalog/StyleSwitcher";
import { CodeTabs } from "@/components/catalog/CodeTabs";
import { Markdown } from "@/components/catalog/Markdown";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getComponent(slug);
  if (!doc) return { title: "Not found — Digital Asset Library" };
  return {
    title: `${doc.name} — Digital Asset Library`,
    description: doc.summary,
  };
}

const SOURCE_LABEL: Record<string, string> = {
  mdn: "MDN",
  so: "Stack Overflow",
  github: "GitHub",
  apg: "WAI-ARIA APG",
  other: "Reference",
};

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getComponent(slug);
  if (!doc) notFound();

  const styles = doc.styles?.length ? doc.styles : Object.keys(STYLE_NAMES);
  const hasPlayground = playgroundExists(doc.playground);

  return (
    <main className="page detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/catalog">Catalog</Link>
        <span aria-hidden="true">/</span>
        <span>{doc.category}</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumb__current">{doc.name}</span>
      </nav>

      <header className="detail__head">
        <div className="detail__headtop">
          <h1 className="detail__title">{doc.name}</h1>
          <span className={`status status--${doc.status}`}>{doc.status}</span>
        </div>
        {doc.summary && <p className="detail__summary">{doc.summary}</p>}
        <div className="detail__tags">
          <span className="detail__cat">{doc.category}</span>
          {doc.tags.map((t) => (
            <span key={t} className="detail__tag">
              {t}
            </span>
          ))}
        </div>
      </header>

      <section className="detail__block">
        <h2 className="detail__h2">Preview · {styles.length} skins</h2>
        <StyleSwitcher
          name={doc.name}
          styles={styles}
          label={doc.preview?.label}
        />
      </section>

      {hasPlayground && (
        <section className="detail__block">
          <h2 className="detail__h2">Interactive playground</h2>
          <div className="playground-frame">
            <iframe
              src={`/playgrounds/${doc.playground}.html`}
              title={`${doc.name} interactive playground`}
              loading="lazy"
              className="playground-frame__iframe"
            />
          </div>
        </section>
      )}

      {doc.snippets && doc.snippets.length > 0 && (
        <section className="detail__block">
          <h2 className="detail__h2">Code</h2>
          <CodeTabs snippets={doc.snippets} />
        </section>
      )}

      {doc.body && (
        <section className="detail__block">
          <Markdown>{doc.body}</Markdown>
        </section>
      )}

      {doc.references && doc.references.length > 0 && (
        <section className="detail__block">
          <h2 className="detail__h2">References</h2>
          <ul className="reflist">
            {doc.references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer noopener">
                  {r.title}
                </a>
                <span className="reflist__src">
                  {SOURCE_LABEL[r.source ?? "other"] ?? "Reference"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {doc.clickup_page_id && (
        <footer className="detail__foot">
          Source spec: ClickUp <code>{doc.clickup_page_id}</code> · doc{" "}
          <code>838qa-81211</code>
        </footer>
      )}
    </main>
  );
}
