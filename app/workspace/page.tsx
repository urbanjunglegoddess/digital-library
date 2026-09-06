import type { Metadata } from "next";
import { SurfacePlaceholder } from "@/components/site/SurfacePlaceholder";

export const metadata: Metadata = {
  title: "Workspace — Digital Asset Library",
  description: "Your saved snippets, collections, and drafts.",
};

export default function WorkspacePage() {
  return (
    <SurfacePlaceholder
      eyebrow="Workspace"
      title="Your saved work"
      lede="A personal space for the components you save, the collections you curate, and the builds you have in progress — all scoped to your account."
      phase="🚧 Unlocks in Phase 3 (accounts & personalization) once sign-in ships."
      points={[
        {
          heading: "Collections",
          body: "Group components into named folders you can reuse and share — backed by the `collections` table.",
        },
        {
          heading: "Saved snippets",
          body: "Pin the exact code snippets you copy most, across any language target.",
        },
        {
          heading: "Drafts",
          body: "Pick up in-progress builds where you left off, synced from the Portal.",
        },
      ]}
      cta={{ href: "/knowledge", label: "Find components to save" }}
    />
  );
}
