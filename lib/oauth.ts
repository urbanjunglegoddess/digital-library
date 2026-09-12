/**
 * OAuth providers offered on the sign-in page.
 *
 * A provider only works once it has been enabled and given a client ID/secret
 * in the Supabase dashboard (Authentication → Providers). Rendering a button
 * for a provider that has not been set up produces a dead end, so the list is
 * opt-in through an environment variable rather than hardcoded:
 *
 *   NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS=github,google
 *
 * Unset means email and magic link only, which work on a stock project.
 */

const KNOWN: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  azure: "Microsoft",
  apple: "Apple",
  discord: "Discord",
  figma: "Figma",
  notion: "Notion",
  slack_oidc: "Slack",
};

export interface OAuthProvider {
  id: string;
  label: string;
}

export function oauthProviders(): OAuthProvider[] {
  const raw = process.env.NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS ?? "";
  return raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .filter((p) => p in KNOWN)
    .map((id) => ({ id, label: KNOWN[id] }));
}

/** Guards the `provider` query parameter before it reaches Supabase. */
export function isEnabledProvider(value: string | null): value is string {
  if (!value) return false;
  return oauthProviders().some((p) => p.id === value);
}
