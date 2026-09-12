import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/account.css";
import { getViewer } from "@/lib/auth";
import { ProfileCard } from "@/components/account/ProfileCard";
import { PreferencesCard } from "@/components/account/PreferencesCard";
import { updateProfile } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account, defaults, and configuration.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const viewer = await getViewer();

  // Settings is not in the middleware's protected list, because a signed-out
  // visitor arriving here should be invited in rather than bounced.
  if (!viewer) {
    return (
      <main className="page">
        <div className="page__intro">
          <p className="eyebrow">Settings</p>
          <h1 className="page__title">Account &amp; configuration</h1>
          <p className="page__lede">
            Settings live on your account.{" "}
            <Link href="/login?next=/settings">Sign in</Link> or{" "}
            <Link href="/signup?next=/settings">create an account</Link> to set
            a display name, choose the visual style and language target the
            catalog opens with, and manage your data.
          </p>
          <p className="page__lede">
            Browsing and searching the library never require an account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Settings</p>
        <h1 className="page__title">Account &amp; configuration</h1>
        <p className="page__lede">
          Your profile and the defaults the catalog opens with. Collections and
          uploaded files live on <Link href="/account">your account page</Link>.
        </p>
      </div>

      <div className="acct">
        <ProfileCard
          email={viewer.email}
          displayName={viewer.displayName}
          role={viewer.role}
          memberSince={viewer.createdAt}
          updateAction={updateProfile}
        />

        <PreferencesCard />
      </div>

      <section className="acct__card acct__card--wide">
        <h2 className="acct__card-title">Data &amp; privacy</h2>
        <p className="acct__card-lede">
          Everything you save — collections, templates and uploaded files — is
          private to your account and enforced by row-level security in the
          database, not by the pages that read it.
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
    </main>
  );
}
