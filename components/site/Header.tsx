import Link from "next/link";

/** Global site header / primary nav. */
export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brandmark">
          <span className="brandmark__glyph" aria-hidden="true">
            ◈
          </span>
          <span className="brandmark__text">
            Digital Asset Library
            <span className="brandmark__sub">Urban Jungle Goddess</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/catalog">Catalog</Link>
          <a
            href="https://www.w3.org/WAI/ARIA/apg/"
            target="_blank"
            rel="noreferrer noopener"
          >
            A11y
          </a>
        </nav>
      </div>
    </header>
  );
}
