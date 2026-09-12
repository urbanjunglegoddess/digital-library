import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/site/AppShell";
import { ALL_STYLES } from "@/lib/styles";
import { ALL_TARGETS } from "@/lib/targets";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, IS_PRODUCTION } from "@/lib/site";

// Counts are read from the canonical lists, not written out, so the copy
// cannot drift from the library the way a hardcoded "11 styles" did.
const DESCRIPTION = `A searchable catalog of reusable, accessibility-audited UI components and code assets across ${ALL_STYLES.length} visual styles and ${ALL_TARGETS.length} language targets.`;

export const metadata: Metadata = {
  // Absolute base for canonical, OpenGraph and sitemap URLs. Without it every
  // page's canonical link resolves against whatever host served the request,
  // so preview deploys would advertise themselves as canonical.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Page titles that set only their own name still get the site suffix.
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "component library",
    "design system",
    "design tokens",
    "accessibility",
    "UI components",
    "Urban Jungle Goddess",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DESCRIPTION,
  },
  // Preview deployments must not be indexed; robots.ts says the same thing.
  robots: IS_PRODUCTION
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/**
 * Deliberately NOT async and deliberately reading no cookies: touching the
 * session here would make every route in the app dynamic, so the catalog could
 * neither be prerendered nor cached. The shell fetches the viewer itself from
 * /api/auth/me.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* UJG 4-font system. Loaded via <link> (not next/font) so the build
            never depends on a font fetch; the browser pulls them at runtime. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* App Router root layout applies to every page, so this is not the
            single-page pitfall the rule guards against. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&family=Fredoka:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
