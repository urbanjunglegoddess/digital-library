import { Button } from "@/components/button/Button";

/**
 * Phase 0 brand shell. Proof-of-life home page: renders the UJG palette, the
 * 4-font system, and the 11 visual skins through the real component-library
 * token layer — so the Vercel preview shows the brand, not a blank page.
 */

const PALETTE: { name: string; token: string; ink?: string }[] = [
  { name: "Primary", token: "var(--dl-primary)", ink: "#fff" },
  { name: "Primary hover", token: "var(--dl-primary-hover)", ink: "#fff" },
  { name: "Gold", token: "var(--dl-gold)", ink: "var(--dl-gold-ink)" },
  { name: "Danger", token: "var(--dl-danger)", ink: "#fff" },
  { name: "Success", token: "var(--dl-success)", ink: "#fff" },
  { name: "Ink", token: "var(--dl-ink)", ink: "#fff" },
  { name: "Surface", token: "var(--dl-surface)", ink: "var(--dl-ink)" },
  { name: "Surface 2", token: "var(--dl-surface-2)", ink: "var(--dl-ink)" },
];

const FONTS: { role: string; family: string; sample: string }[] = [
  { role: "Display", family: "var(--font-display)", sample: "Urban Jungle Goddess" },
  { role: "Sans / UI", family: "var(--font-sans)", sample: "Documented, audited, reusable." },
  { role: "Accent", family: "var(--font-accent)", sample: "Eleven styles, one system." },
  { role: "Mono", family: "var(--font-mono)", sample: "const asset = library[slug];" },
];

// key matches the [data-style] attribute in styles/tokens.css
const STYLES: { key: string; name: string }[] = [
  { key: "ujg", name: "UJG" },
  { key: "flat", name: "Flat" },
  { key: "material", name: "Material" },
  { key: "glass", name: "Glassmorphism" },
  { key: "liquid", name: "Liquid Glass" },
  { key: "neu", name: "Neumorphism" },
  { key: "skeu", name: "Skeuomorphism" },
  { key: "brut", name: "Neo-Brutalism" },
  { key: "clay", name: "Claymorphism" },
  { key: "aurora", name: "Aurora" },
  { key: "swiss", name: "Swiss" },
];

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "clamp(28px, 5vw, 72px) clamp(20px, 5vw, 40px)",
      }}
    >
      {/* Masthead */}
      <header style={{ marginBottom: 56 }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: ".8rem",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--dl-ink-soft)",
            margin: "0 0 14px",
          }}
        >
          Urban Jungle Goddess · Phase 0
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 6vw, 3.75rem)",
            lineHeight: 1.05,
            margin: "0 0 16px",
            color: "var(--dl-ink)",
            fontWeight: 700,
          }}
        >
          Digital Asset Library
        </h1>
        <p
          style={{
            fontSize: "1.12rem",
            lineHeight: 1.5,
            maxWidth: 640,
            color: "var(--dl-ink-soft)",
            margin: 0,
          }}
        >
          A searchable catalog of reusable, accessibility-audited UI components
          and code assets — across <strong>11 visual styles</strong> and{" "}
          <strong>12 language targets</strong>. This is the foundation shell;
          the catalog lands in Phase 1.
        </p>
      </header>

      {/* Palette */}
      <Section title="Brand palette" caption="Semantic tokens from styles/tokens.css">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 14,
          }}
        >
          {PALETTE.map((c) => (
            <div
              key={c.name}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--dl-line)",
                background: "var(--dl-surface)",
              }}
            >
              <div style={{ background: c.token, height: 68 }} />
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: ".9rem", fontWeight: 600 }}>{c.name}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Fonts */}
      <Section title="Type system" caption="The UJG 4-font system">
        <div style={{ display: "grid", gap: 18 }}>
          {FONTS.map((f) => (
            <div
              key={f.role}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: "6px 20px",
                paddingBottom: 16,
                borderBottom: "1px solid var(--dl-line)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: ".72rem",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--dl-ink-soft)",
                  minWidth: 96,
                }}
              >
                {f.role}
              </span>
              <span
                style={{
                  fontFamily: f.family,
                  fontSize: "1.7rem",
                  color: "var(--dl-ink)",
                }}
              >
                {f.sample}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 11 skins, rendered through the real token layer + Button component */}
      <Section
        title="The 11 visual styles"
        caption="One Button component; the skin comes from the [data-style] wrapper"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {STYLES.map((s) => (
            <div
              key={s.key}
              data-style={s.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                padding: "26px 18px",
                borderRadius: 14,
                border: "1px solid var(--dl-line)",
                background:
                  s.key === "swiss" || s.key === "brut"
                    ? "var(--dl-surface-2)"
                    : "linear-gradient(160deg, var(--dl-surface), var(--dl-surface-2))",
              }}
            >
              <Button variant="primary" size="md">
                {s.name}
              </Button>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: ".72rem",
                  color: "var(--dl-ink-soft)",
                }}
              >
                data-style=&quot;{s.key}&quot;
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Health link */}
      <Section title="System check" caption="Phase 0 gate">
        <p style={{ margin: "0 0 14px", color: "var(--dl-ink-soft)", lineHeight: 1.6 }}>
          The server Supabase client, keys, and RLS read path are proven by the
          health route, which counts the seeded <code>visual_styles</code> rows.
        </p>
        <a
          href="/api/health"
          className="btn btn--gold btn--md"
          style={{ textDecoration: "none" }}
        >
          GET /api/health
        </a>
      </Section>

      <footer
        style={{
          marginTop: 64,
          paddingTop: 20,
          borderTop: "1px solid var(--dl-line)",
          fontFamily: "var(--font-mono)",
          fontSize: ".76rem",
          color: "var(--dl-ink-soft)",
        }}
      >
        Digital Asset Library · Next.js + Supabase · Urban Jungle Goddess
      </footer>
    </main>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 52 }}>
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 600,
            margin: 0,
            color: "var(--dl-ink)",
          }}
        >
          {title}
        </h2>
        {caption && (
          <p style={{ margin: "4px 0 0", fontSize: ".92rem", color: "var(--dl-ink-soft)" }}>
            {caption}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
