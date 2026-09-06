import Link from "next/link";

/**
 * A consistent starter page for surfaces whose full experience lands in a
 * later phase. States the surface's purpose, what it will hold, and the phase
 * it ships in — so the architecture is navigable now and each surface has a
 * clear home to grow into.
 */
export function SurfacePlaceholder({
  eyebrow,
  title,
  lede,
  phase,
  points,
  cta,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  phase: string;
  points: { heading: string; body: string }[];
  cta?: { href: string; label: string };
}) {
  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page__title">{title}</h1>
        <p className="page__lede">{lede}</p>
        <p className="surface-phase">{phase}</p>
      </div>

      <div className="surface-points">
        {points.map((p) => (
          <div key={p.heading} className="surface-point">
            <h2 className="surface-point__heading">{p.heading}</h2>
            <p className="surface-point__body">{p.body}</p>
          </div>
        ))}
      </div>

      {cta && (
        <div className="surface-cta">
          <Link
            href={cta.href}
            className="btn btn--primary btn--md"
            style={{ textDecoration: "none" }}
          >
            {cta.label}
          </Link>
        </div>
      )}
    </main>
  );
}
