"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth server actions (Phase 3).
 *
 * These run on the server, so the session cookies Supabase issues are written
 * by the framework rather than handed to client JavaScript. Nothing here trusts
 * the form for anything but credentials: role, ownership and visibility are all
 * decided by Row-Level Security once the user is authenticated.
 *
 * Every action returns a `FormState` instead of throwing, so the form can show
 * an error inline. Actual navigation happens through `redirect`, which throws a
 * control-flow signal Next.js catches — never wrap a redirect in try/catch.
 */

export interface FormState {
  error?: string;
  notice?: string;
  /** Echoed back so the field is not cleared when validation fails. */
  email?: string;
}

/**
 * Only allow redirects to a path on this site. An open redirect here would let
 * a crafted login link bounce a freshly-authenticated user to another origin.
 */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  if (!next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    next: safeNext(formData.get("next")),
  };
}

/** The site's own origin, for the links in confirmation emails. */
async function siteOrigin(): Promise<string> {
  const envOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  if (envOrigin) return envOrigin.replace(/\/$/, "");

  // Fall back to the request's own host so preview deploys and localhost work
  // without extra configuration.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { email, password, next } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase deliberately does not say which half was wrong; don't invent a
    // more specific message, it would leak whether an account exists.
    return { error: error.message, email };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { email, password, next } = readCredentials(formData);
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || !password) {
    return { error: "Enter your email and a password.", email };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters for your password.", email };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // `handle_new_user()` (migration 0001) copies this into profiles.display_name.
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { error: error.message, email };

  // With email confirmation on, Supabase returns a user but no session.
  if (!data.session) {
    return {
      notice: `Check ${email} for a confirmation link to finish creating your account.`,
      email,
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/** Passwordless sign-in — works without the user ever setting a password. */
export async function signInWithMagicLink(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(formData.get("next"));

  if (!email) return { error: "Enter your email address." };

  const supabase = await createClient();
  const origin = await siteOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { error: error.message, email };

  return {
    notice: `Magic link sent to ${email}. Open it on this device to sign in.`,
    email,
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Update the signed-in user's own profile. RLS restricts this to their row. */
export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const displayName = String(formData.get("display_name") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not signed in." };

  // `role` is deliberately not read from the form. The profiles_protect_role
  // trigger would reject the change anyway, but not sending it makes the
  // intent explicit at the call site too.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  revalidatePath("/settings");
  return { notice: "Profile saved." };
}
