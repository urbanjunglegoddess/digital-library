import type { Metadata } from "next";
import { getAllComponents } from "@/lib/content";
import { hasRenderer } from "@/lib/composer";
import { Playground } from "@/components/workspace/Playground";
import type { TrayItem } from "@/components/build/types";

export const metadata: Metadata = {
  title: "Workspace — Digital Asset Library",
  description:
    "Your playground: pick a component, flip its props, switch across all 11 skins, and read the generated code.",
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
  }));

  return <Playground tray={tray} initialSlug={c} />;
}
