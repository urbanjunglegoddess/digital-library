import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReference, getReferenceSlugs } from "@/lib/reference";
import { Markdown } from "@/components/catalog/Markdown";

export function generateStaticParams() {
  return getReferenceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getReference(slug);
  if (!doc) return { title: "Not found" };
  return { title: doc.title, description: doc.summary };
}

export default async function ReferenceDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getReference(slug);
  if (!doc) notFound();

  return (
    <main className="page detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/reference">Reference</Link>
        <span aria-hidden="true">/</span>
        <span>{doc.group}</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumb__current">{doc.title}</span>
      </nav>

      <header className="detail__head">
        <div className="detail__headtop">
          <h1 className="detail__title">{doc.title}</h1>
        </div>
        {doc.summary && <p className="detail__summary">{doc.summary}</p>}
        <div className="detail__tags">
          <span className="detail__cat">{doc.group}</span>
        </div>
      </header>

      {doc.body && (
        <section className="detail__block">
          <Markdown>{doc.body}</Markdown>
        </section>
      )}
    </main>
  );
}
