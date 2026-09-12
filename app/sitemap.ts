import type { MetadataRoute } from "next";
import { getAllComponents } from "@/lib/content";
import { getAllReference } from "@/lib/reference";
import { SITE_URL } from "@/lib/site";

/**
 * sitemap.xml — every publicly indexable page.
 *
 * Built from the MDX content layer rather than from Supabase so the sitemap is
 * generated at build time with no database round trip, and so it can never list
 * a page that has no document behind it.
 *
 * Account-only and auth routes are deliberately absent; robots.ts disallows
 * them too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { path: "/", changeFrequency: "weekly", priority: 1 },
      { path: "/knowledge", changeFrequency: "weekly", priority: 0.9 },
      { path: "/search", changeFrequency: "weekly", priority: 0.8 },
      { path: "/reference", changeFrequency: "monthly", priority: 0.7 },
      { path: "/templates", changeFrequency: "monthly", priority: 0.6 },
      { path: "/build", changeFrequency: "monthly", priority: 0.6 },
      { path: "/workspace", changeFrequency: "monthly", priority: 0.5 },
      { path: "/portal", changeFrequency: "monthly", priority: 0.5 },
      { path: "/dashboard", changeFrequency: "monthly", priority: 0.4 },
    ] as const
  ).map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const components: MetadataRoute.Sitemap = getAllComponents().map((doc) => ({
    url: `${SITE_URL}/knowledge/${doc.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    // Audited and reusable components are the ones worth ranking hardest for.
    priority: doc.status === "reusable" ? 0.9 : doc.status === "audited" ? 0.8 : 0.7,
  }));

  const references: MetadataRoute.Sitemap = getAllReference().map((doc) => ({
    url: `${SITE_URL}/reference/${doc.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...components, ...references];
}
