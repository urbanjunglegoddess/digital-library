import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/env";

/**
 * Server-side account helpers (Phase 3).
 *
 * `getCurrentUser` uses `auth.getUser()`, which revalidates the access token
 * against the auth server, rather than `auth.getSession()`, which only decodes
 * the cookie the browser sent and is therefore forgeable. Anything that gates
 * on identity must go through here.
 *
 * Both readers are wrapped in React's `cache`, so a page that asks for the user
 * in the layout, the header and a child component still makes one request per
 * render pass.
 */

export interface Viewer {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
  isAdmin: boolean;
  createdAt: string | null;
}

export const getCurrentUser = cache(async () => {
  if (!hasSupabasePublicEnv) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    // An unreachable auth server should render the site signed-out, not 500.
    return null;
  }
});

/** The signed-in user joined with their `profiles` row, or null when anonymous. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "user";
    return {
      id: user.id,
      email: user.email ?? null,
      // Fall back to the signup metadata, then the local part of the email, so
      // a profile row that has not been filled in still shows a human name.
      displayName:
        profile?.display_name ??
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split("@")[0] ??
        null,
      role,
      isAdmin: role === "admin",
      createdAt: user.created_at ?? null,
    };
  } catch {
    return null;
  }
});
