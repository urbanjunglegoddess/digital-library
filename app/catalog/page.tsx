import type { Metadata } from "next";
import {
  getAllComponents,
  getAllTags,
  getCategories,
} from "@/lib/content";
import { CatalogBrowser, type CatalogItem } from "@/components/catalog/CatalogBrowser";

export const metadata: Metadata = {
  title: "Catalog — Digital Asset Library",
  description:
    "Browse the Urban Jungle Goddess component catalog by category and tag — each component documented, previewable across 11 visual styles, and copy-ready.",
};

export default function CatalogPage() {
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
        <p className="eyebrow">Catalog</p>
        <h1 className="page__title">Component catalog</h1>
        <p className="page__lede">
          {components.length} reusable, accessibility-audited components. Each
          one is documented, previewable across the 11 visual styles, and
          copy-ready across language targets.
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
