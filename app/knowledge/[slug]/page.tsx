import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getComponent, STYLE_NAMES } from "@/lib/content";
import { StyleSwitcher } from "@/components/catalog/StyleSwitcher";
import { CodeTabs } from "@/components/catalog/CodeTabs";
import { Markdown } from "@/components/catalog/Markdown";
import { SaveToCollection } from "@/components/account/SaveToCollection";

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
  if (!doc) return { title: "Not found" };
  return {
    title: doc.name,
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

  return (
    <main className="page detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/knowledge">Knowledge Hub</Link>
        <span aria-hidden="true">/</span>
        <span>{doc.category}</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumb__current">{doc.name}</span>
      </nav>

      <header className="detail__head">
        <div className="detail__headtop">
          <h1 className="detail__title">{doc.name}</h1>
          <span className={`status status--${doc.status}`}>{doc.status}</span>
          {/* Hydrates against /api/collections so this page stays static. */}
          <SaveToCollection slug={doc.slug} name={doc.name} />
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

      <section className="detail__block">
        <Link href={`/workspace?c=${doc.slug}`} className="detail__playcta">
          <span>
            <strong>Open in the Playground</strong>
            <span className="detail__playcta-sub">
              Flip props and switch across every skin in the Workspace.
            </span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </section>

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
