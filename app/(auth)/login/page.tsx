import type { Metadata } from "next";
import "@/styles/auth.css";
import { AuthForm } from "@/components/auth/AuthForm";
import { signIn, signUp, signInWithMagicLink } from "../actions";
import { oauthProviders } from "@/lib/oauth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to reach your collections, saved snippets and templates.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <main className="page page--auth">
      <AuthForm
        mode="signin"
        next={target}
        signInAction={signIn}
        signUpAction={signUp}
        magicLinkAction={signInWithMagicLink}
        oauthProviders={oauthProviders()}
      />
    </main>
  );
}
