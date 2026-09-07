import type { Metadata } from "next";
import { getAllComponents } from "@/lib/content";
import { hasRenderer } from "@/lib/composer";
import { extractBodySnippets } from "@/lib/snippets";
import { BuildHub } from "@/components/build/BuildHub";
import type { TrayItem } from "@/components/build/types";

export const metadata: Metadata = {
  title: "Build Hub — Digital Asset Library",
  description:
    "Compose library components into real output, and audit any markup for accessibility — pick a skin and a language target, arrange the stack, copy the code, and run the checks.",
};

/**
 * Build Hub — /build
 *
 * The rail has always linked here; this is the route. Server-side we read the
 * component docs (the same source the Knowledge Hub uses) and hand the client
 * composer a tray. Everything after that is local state until Phase 4 wires
 * export and persists builds to the `templates` table.
 */
export default function BuildHubPage() {
  const tray: TrayItem[] = getAllComponents().map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
    status: c.status,
    renderable: hasRenderer(c.slug),
    snippets: c.snippets?.length ? c.snippets : extractBodySnippets(c.body),
  }));

  return <BuildHub tray={tray} />;
}
