import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION } from "@/lib/site";

/**
 * robots.txt.
 *
 * Preview deployments are disallowed wholesale: duplicate copies of the catalog
 * on *.vercel.app would compete with production in search results.
 *
 * Account, auth and API paths are excluded even in production — they are
 * per-user or non-HTML, so there is nothing there worth indexing.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/auth/", "/login", "/signup", "/settings"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
