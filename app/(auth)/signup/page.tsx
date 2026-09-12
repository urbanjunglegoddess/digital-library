import type { Metadata } from "next";
import "@/styles/auth.css";
import { AuthForm } from "@/components/auth/AuthForm";
import { signIn, signUp, signInWithMagicLink } from "../actions";
import { oauthProviders } from "@/lib/oauth";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to save components into collections and keep your own templates.",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <main className="page page--auth">
      <AuthForm
        mode="signup"
        next={target}
        signInAction={signIn}
        signUpAction={signUp}
        magicLinkAction={signInWithMagicLink}
        oauthProviders={oauthProviders()}
      />
    </main>
  );
}
