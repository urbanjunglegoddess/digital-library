import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/site/AppShell";
import { ALL_STYLES } from "@/lib/styles";
import { ALL_TARGETS } from "@/lib/targets";

export const metadata: Metadata = {
  title: "Digital Asset Library — Urban Jungle Goddess",
  description: `A searchable catalog of reusable, accessibility-audited UI components and code assets across ${ALL_STYLES.length} visual styles and ${ALL_TARGETS.length} language targets.`,
};

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
