import type { Metadata } from "next";
import Link from "next/link";
import { getAllComponents, getAllTags, getCategories } from "@/lib/content";
import { ALL_STYLES } from "@/lib/styles";
import { CatalogBrowser, type CatalogItem } from "@/components/catalog/CatalogBrowser";

export const metadata: Metadata = {
  title: "Knowledge Hub — Digital Asset Library",
  description: `The reference library: every component documented, previewable across ${ALL_STYLES.length} visual styles, and copy-ready across language targets — browse by category and tag.`,
};

export default function KnowledgeHubPage() {
  const components = getAllComponents();
  const categories = getCategories().map((c) => c.category);

  const items: CatalogItem[] = components.map((c) => ({
    name: c.name,
    slug: c.slug,
    category: c.category,
    summary: c.summary,
    status: c.status,
    tags: c.tags,
    styleCount: c.styles?.length ?? ALL_STYLES.length,
  }));

  const tags = getAllTags();

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Knowledge Hub</p>
        <h1 className="page__title">Component reference library</h1>
        <p className="page__lede">
          {components.length} components, each documented to the 17-section bar,
          previewable across every skin, and copy-ready across language targets.
        </p>
        <p className="page__lede">
          For the system-level references — style languages, the atomic design
          map, and screen &amp; feature taxonomies — see the{" "}
          <Link href="/reference">Reference library</Link>.
        </p>
      </div>

      {components.length === 0 ? (
        <p className="catalog-empty">
          No components have been published yet. Docs land in{" "}
          <code>content/docs</code>.
        </p>
      ) : (
        <CatalogBrowser items={items} categoryOrder={categories} tags={tags} />
      )}
    </main>
  );
}
