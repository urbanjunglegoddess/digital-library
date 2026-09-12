import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * 404. Offers the two things someone who lands here actually wants — search,
 * and the catalog index — rather than only an apology.
 */
export default function NotFound() {
  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">404</p>
        <h1 className="page__title">That page isn&rsquo;t here</h1>
        <p className="page__lede">
          The link may be out of date, or the component may not be documented
          yet.
        </p>
        <p className="page__lede">
          Try <Link href="/search">searching the library</Link>, or browse
          everything in the <Link href="/knowledge">Knowledge Hub</Link>.
        </p>
      </div>
    </main>
  );
}
