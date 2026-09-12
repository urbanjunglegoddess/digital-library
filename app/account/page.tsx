import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "@/styles/account.css";
import { getViewer } from "@/lib/auth";
import { listCollections } from "@/lib/collections";
import { ProfileCard } from "@/components/account/ProfileCard";
import { CollectionsPanel } from "@/components/account/CollectionsPanel";
import { AssetsPanel } from "@/components/account/AssetsPanel";
import { updateProfile } from "@/app/(auth)/actions";
import {
  createCollection,
  renameCollection,
  deleteCollection,
  setCollectionMembership,
} from "./actions";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your profile, collections and saved components.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await getViewer();

  // Middleware already redirects anonymous visitors, but a page that reads
  // user data should never depend on that alone — a matcher change or a direct
  // render must not leak an empty authenticated shell.
  if (!viewer) redirect("/login?next=/account");

  const collections = await listCollections();

  return (
    <main className="page">
      <div className="page__intro">
        <p className="eyebrow">Account</p>
        <h1 className="page__title">
          {viewer.displayName ? `Hello, ${viewer.displayName}` : "Your account"}
        </h1>
        <p className="page__lede">
          Your profile and the components you have saved. Everything here is
          private to you — enforced by row-level security in the database, not
          just by this page.
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

        <CollectionsPanel
          collections={collections}
          createAction={createCollection}
          renameAction={renameCollection}
          deleteAction={deleteCollection}
          membershipAction={setCollectionMembership}
        />

        {/* Loads over /api/assets on mount — uploads are per-viewer, so there
            is nothing useful to render on the server. */}
        <AssetsPanel />
      </div>

      <form action="/auth/signout" method="post" className="acct__signout">
        <button type="submit" className="acct__btn acct__btn--ghost">
          Sign out
        </button>
      </form>
    </main>
  );
}
