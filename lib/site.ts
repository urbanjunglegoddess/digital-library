/**
 * Canonical site origin.
 *
 * Metadata, the sitemap and robots.txt all need an absolute URL, and getting it
 * wrong means canonical links pointing at the wrong host. Resolution order:
 *
 *   1. NEXT_PUBLIC_SITE_URL      — set this in production; it is the only one
 *                                  that survives a custom domain.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the project's stable production host,
 *                                  not the per-deployment URL.
 *   3. VERCEL_URL                — the current deployment (preview builds).
 *   4. localhost                 — development.
 */
function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolve();

/** True only for the real production deployment — gates search indexing. */
export const IS_PRODUCTION =
  process.env.VERCEL_ENV === "production" || Boolean(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "Digital Asset Library";
export const SITE_TAGLINE = "Urban Jungle Goddess";
