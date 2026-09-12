import type { Metadata } from "next";
import { getAllComponents } from "@/lib/content";
import { hasRenderer } from "@/lib/composer";
import { extractBodySnippets } from "@/lib/snippets";
import { Playground } from "@/components/workspace/Playground";
import type { TrayItem } from "@/components/build/types";

export const metadata: Metadata = {
  title: "Workspace",
  description:
    "Your playground: pick a component, flip its props, switch across every skin, and read the generated code.",
};

/**
 * Workspace — /workspace
 *
 * Home of the Playground (moved here from the Knowledge Hub detail page): a
 * single-component sandbox. Saved snippets, collections and drafts land here
 * too once auth ships in Phase 3.
 */
export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const tray: TrayItem[] = getAllComponents().map((comp) => ({
    slug: comp.slug,
    name: comp.name,
    category: comp.category,
    status: comp.status,
    renderable: hasRenderer(comp.slug),
    // Prefer the curated frontmatter snippets; fall back to code documented in
    // the Markdown body so every component shows real doc code where it exists.
    snippets: comp.snippets?.length ? comp.snippets : extractBodySnippets(comp.body),
  }));

  return <Playground tray={tray} initialSlug={c} />;
}
