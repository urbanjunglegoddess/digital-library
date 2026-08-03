import Link from "next/link";
import { Button } from "@/components/button/Button";
import { getAllComponents, getCategories, STYLE_NAMES } from "@/lib/content";

/**
 * Landing page. Funnels into the catalog and shows the 11 visual skins live
 * through the real component-library token layer.
 */

const STYLES = Object.keys(STYLE_NAMES);

export default function Home() {
  const components = getAllComponents();
  const categories = getCategories();
  const count = components.length;

  return (
    <main className="page home">
      <section className="hero">
        <p className="eyebrow">Urban Jungle Goddess</p>
        <h1 className="hero__title">Digital Asset Library</h1>
        <p className="hero__lede">
          A searchable catalog of reusable, accessibility-audited UI components
          and code assets — across <strong>11 visual styles</strong> and{" "}
          <strong>12 language targets</strong>. Documented, previewable, and
          copy-ready.
        </p>
        <div className="hero__cta">
          <Link href="/catalog" className="btn btn--primary btn--lg" style={{ textDecoration: "none" }}>
            Browse the catalog{count ? ` · ${count}` : ""}
          </Link>
          <Link href="/catalog" className="hero__link">
            {categories.length} categories →
          </Link>
        </div>
      </section>

      <section className="home-styles">
        <h2 className="home-styles__title">One component, eleven skins</h2>
        <p className="home-styles__lede">
          Every component&rsquo;s structure and behavior is fixed; the skin comes
          from a <code>[data-style]</code> wrapper in the token layer.
        </p>
        <div className="skin-grid">
          {STYLES.map((key) => (
            <div key={key} className="skin-cell" data-style={key}>
              <Button variant="primary" size="md">
                {STYLE_NAMES[key]}
              </Button>
              <span className="skin-cell__key">{key}</span>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="home-cats">
          <h2 className="home-styles__title">Browse by category</h2>
          <div className="cat-grid">
            {categories.map((c) => (
              <Link key={c.category} href="/catalog" className="cat-cell">
                <span className="cat-cell__name">{c.category}</span>
                <span className="cat-cell__count">{c.components.length}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
