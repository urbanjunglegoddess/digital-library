import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/account.css";
import { getViewer } from "@/lib/auth";
import { ProfileCard } from "@/components/account/ProfileCard";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { updateProfile } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Workspace preferences: the default visual style and language target the Playground and composer open with, plus your profile and data.",
};

export const dynamic = "force-dynamic";

/**
 * Settings.
 *
 * Preferences work signed out (per-browser) and sync to the account when
 * signed in — so this page is deliberately not in the middleware's protected
 * list. A signed-out visitor gets the working controls plus an invitation,
 * not a redirect.
 */
export default async function SettingsPage() {
  const viewer = await getViewer();

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Settings</p>
        <h1 className="page__title">Preferences</h1>
        <p className="page__lede">
          The skin and language target you choose here are what the Playground
          and the Build Hub composer open with.
          {viewer
            ? " They are saved to your account, so they follow you between devices."
            : " They are saved in this browser for now."}
        </p>
      </div>

      <SettingsPanel signedIn={Boolean(viewer)} />

      {viewer ? (
        <>
          <div className="acct">
            <ProfileCard
              email={viewer.email}
              displayName={viewer.displayName}
              role={viewer.role}
              memberSince={viewer.createdAt}
              updateAction={updateProfile}
            />
          </div>

          <section className="acct__card acct__card--wide">
            <h2 className="acct__card-title">Data &amp; privacy</h2>
            <p className="acct__card-lede">
              Everything you save — collections, templates and uploaded files —
              is private to your account and enforced by row-level security in
              the database, not just by the pages that read it. Collections and
              files live on <Link href="/account">your account page</Link>.
            </p>
            <p className="acct__card-lede">
              <a href="/api/account/export" download>
                Download your data
              </a>{" "}
              as JSON. To delete your account and everything in it, email{" "}
              <a href="mailto:hello@urbanjunglegoddess.com">
                hello@urbanjunglegoddess.com
              </a>{" "}
              — deletion cascades across your collections, templates and files.
            </p>
          </section>

          <form action="/auth/signout" method="post" className="acct__signout">
            <button type="submit" className="acct__btn acct__btn--ghost">
              Sign out
            </button>
          </form>
        </>
      ) : (
        <section className="set-card set-card--muted" aria-label="With an account">
          <h2 className="set-card__title">With an account</h2>
          <ul className="set-list">
            <li>
              <strong>Profile</strong> — a display name, backed by the{" "}
              <code>profiles</code> table.
            </li>
            <li>
              <strong>Sync</strong> — these preferences follow you across
              devices instead of living in one browser.
            </li>
            <li>
              <strong>Collections, templates and files</strong> — saved work,
              private to you.
            </li>
            <li>
              <strong>Data &amp; privacy</strong> — export everything as JSON at
              any time.
            </li>
          </ul>
          <p className="set-note">
            <Link href="/login?next=/settings">Sign in</Link> or{" "}
            <Link href="/signup?next=/settings">create an account</Link>.
            Browsing and searching the library never require one.
          </p>
        </section>
      )}
    </main>
  );
}
