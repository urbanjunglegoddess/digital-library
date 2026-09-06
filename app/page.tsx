import Link from "next/link";
import { Button } from "@/components/button/Button";
import { getAllComponents, getCategories, STYLE_NAMES } from "@/lib/content";

/**
 * Home / Landing — the front door. Sets the frame and routes into the eight
 * product surfaces. Live figures read from content/docs.
 */

const STYLES = Object.keys(STYLE_NAMES);

const SURFACES: { href: string; label: string; glyph: string; blurb: string }[] = [
  { href: "/portal", label: "Portal", glyph: "⇄", blurb: "Where items move — runs, pipeline, and what's in flight." },
  { href: "/dashboard", label: "Dashboard", glyph: "▤", blurb: "Where items report — coverage, status, and health at a glance." },
  { href: "/knowledge", label: "Knowledge Hub", glyph: "❋", blurb: "The reference library — every component, doc, and skin." },
  { href: "/build", label: "Build Hub", glyph: "⚒", blurb: "Compose and assemble components into real output." },
  { href: "/templates", label: "Template Hub", glyph: "❐", blurb: "Reusable starters and kits, ready to export." },
  { href: "/workspace", label: "Workspace", glyph: "◱", blurb: "Your saved snippets, collections, and drafts." },
  { href: "/settings", label: "Settings", glyph: "⚙", blurb: "Account, theme, and configuration." },
];

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
          <Link
            href="/knowledge"
            className="btn btn--primary btn--lg"
            style={{ textDecoration: "none" }}
          >
            Open the Knowledge Hub{count ? ` · ${count}` : ""}
          </Link>
          <Link href="/portal" className="hero__link">
            Go to the Portal →
          </Link>
        </div>
      </section>

      <section className="home-surfaces">
        <h2 className="home-styles__title">The eight surfaces</h2>
        <p className="home-styles__lede">
          Everything in the library lives in one of these. Pick where you&rsquo;re
          headed.
        </p>
        <div className="surface-grid">
          {SURFACES.map((s) => (
            <Link key={s.href} href={s.href} className="surface-card">
              <span className="surface-card__glyph" aria-hidden="true">
                {s.glyph}
              </span>
              <span className="surface-card__name">{s.label}</span>
              <span className="surface-card__blurb">{s.blurb}</span>
            </Link>
          ))}
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
              <Link key={c.category} href="/knowledge" className="cat-cell">
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
