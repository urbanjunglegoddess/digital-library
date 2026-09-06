import type { Metadata } from "next";
import { getAllComponents, getAllTags, getCategories } from "@/lib/content";
import { CatalogBrowser, type CatalogItem } from "@/components/catalog/CatalogBrowser";

export const metadata: Metadata = {
  title: "Knowledge Hub — Digital Asset Library",
  description:
    "The reference library: every component documented, previewable across 11 visual styles, and copy-ready across language targets — browse by category and tag.",
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
    styleCount: c.styles?.length ?? 11,
  }));

  const tags = getAllTags();

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Knowledge Hub</p>
        <h1 className="page__title">Component reference library</h1>
        <p className="page__lede">
          {components.length} reusable, accessibility-audited components. Each is
          documented to the 17-section bar, previewable across the 11 visual
          styles, and copy-ready across language targets.
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
