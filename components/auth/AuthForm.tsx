"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { FormState } from "@/app/(auth)/actions";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * The sign-in / sign-up form.
 *
 * Both modes share one component because they share almost everything: the
 * same fields, the same error surface, the same magic-link escape hatch. The
 * differences are the heading, the submit label and one extra field.
 *
 * Submission goes through server actions, so this works before hydration —
 * the browser posts the form and the server responds. `useActionState` only
 * adds the inline error and pending states on top.
 */
export function AuthForm({
  mode,
  next,
  signInAction,
  signUpAction,
  magicLinkAction,
  oauthProviders,
}: {
  mode: "signin" | "signup";
  next: string;
  signInAction: Action;
  signUpAction: Action;
  magicLinkAction: Action;
  oauthProviders: { id: string; label: string }[];
}) {
  const isSignUp = mode === "signup";
  const primaryAction = isSignUp ? signUpAction : signInAction;

  const [state, formAction] = useActionState<FormState, FormData>(primaryAction, {});
  const [magicState, magicAction] = useActionState<FormState, FormData>(
    magicLinkAction,
    {},
  );
  const [showMagic, setShowMagic] = useState(false);

  const notice = state.notice ?? magicState.notice;
  const error = state.error ?? magicState.error;

  return (
    <div className="auth">
      <div className="auth__card">
        <p className="auth__eyebrow">
          {isSignUp ? "Create an account" : "Welcome back"}
        </p>
        <h1 className="auth__title">
          {isSignUp ? "Join the library" : "Sign in"}
        </h1>
        <p className="auth__lede">
          {isSignUp
            ? "An account lets you save components into collections, keep your own templates, and pick up where you left off."
            : "Sign in to reach your collections, saved snippets and templates."}
        </p>

        {/* Status messages own a live region so a screen reader hears the
            result of a submit without the focus moving. */}
        <div aria-live="polite" className="auth__messages">
          {error && (
            <p className="auth__msg auth__msg--error" role="alert">
              {error}
            </p>
          )}
          {notice && <p className="auth__msg auth__msg--notice">{notice}</p>}
        </div>

        {!showMagic ? (
          <form action={formAction} className="auth__form" noValidate>
            <input type="hidden" name="next" value={next} />

            {isSignUp && (
              <label className="auth__field">
                <span className="auth__label">Display name</span>
                <input
                  type="text"
                  name="display_name"
                  className="auth__input"
                  autoComplete="name"
                  placeholder="How you want to be credited"
                />
              </label>
            )}

            <label className="auth__field">
              <span className="auth__label">Email</span>
              <input
                type="email"
                name="email"
                className="auth__input"
                required
                autoComplete="email"
                defaultValue={state.email ?? ""}
                placeholder="you@example.com"
              />
            </label>

            <label className="auth__field">
              <span className="auth__label">Password</span>
              <input
                type="password"
                name="password"
                className="auth__input"
                required
                minLength={isSignUp ? 8 : undefined}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder={isSignUp ? "At least 8 characters" : ""}
              />
              {isSignUp && (
                <span className="auth__hint">At least 8 characters.</span>
              )}
            </label>

            <Submit label={isSignUp ? "Create account" : "Sign in"} />
          </form>
        ) : (
          <form action={magicAction} className="auth__form" noValidate>
            <input type="hidden" name="next" value={next} />
            <label className="auth__field">
              <span className="auth__label">Email</span>
              <input
                type="email"
                name="email"
                className="auth__input"
                required
                autoComplete="email"
                defaultValue={magicState.email ?? state.email ?? ""}
                placeholder="you@example.com"
              />
              <span className="auth__hint">
                We&rsquo;ll email you a one-time link — no password needed.
              </span>
            </label>
            <Submit label="Email me a link" />
          </form>
        )}

        <button
          type="button"
          className="auth__switch"
          onClick={() => setShowMagic((v) => !v)}
        >
          {showMagic ? "Use a password instead" : "Email me a magic link instead"}
        </button>

        {oauthProviders.length > 0 && (
          <>
            <div className="auth__divider">
              <span>or continue with</span>
            </div>
            <div className="auth__oauth">
              {oauthProviders.map((p) => (
                <a
                  key={p.id}
                  className="auth__oauth-btn"
                  href={`/auth/oauth?provider=${encodeURIComponent(p.id)}&next=${encodeURIComponent(next)}`}
                >
                  {p.label}
                </a>
              ))}
            </div>
          </>
        )}

        <p className="auth__alt">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
            </>
          ) : (
            <>
              No account yet?{" "}
              <Link href={`/signup?next=${encodeURIComponent(next)}`}>
                Create one
              </Link>
            </>
          )}
        </p>
      </div>

      <aside className="auth__aside">
        <p className="auth__aside-eyebrow">What an account unlocks</p>
        <ul className="auth__aside-list">
          <li>
            <strong>Collections</strong>
            Save any component into named sets you can come back to.
          </li>
          <li>
            <strong>Templates</strong>
            Keep your own compositions and export them as a project.
          </li>
          <li>
            <strong>Workspace</strong>
            Your saved snippets and drafts, on every device you sign in from.
          </li>
        </ul>
        <p className="auth__aside-foot">
          The catalog itself stays open — browsing and searching never require
          an account.
        </p>
      </aside>
    </div>
  );
}

/** Submit button that knows when its own form is in flight. */
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="auth__submit" disabled={pending}>
      {pending ? "Working…" : label}
    </button>
  );
}
