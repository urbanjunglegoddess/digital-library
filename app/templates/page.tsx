import type { Metadata } from "next";
import { getAllComponents } from "@/lib/content";
import { hasRenderer } from "@/lib/composer";
import { TemplateHub } from "@/components/templates/TemplateHub";
import type { TrayItem } from "@/components/build/types";

export const metadata: Metadata = {
  title: "Template Hub — Digital Asset Library",
  description:
    "Curated compositions you can edit: add and remove components, reorder them, and preview under any of the 11 skins.",
};

/**
 * Template Hub — /templates
 *
 * Edit curated templates: add/remove components, reorder, preview live.
 * Local state for now; Phase 4 persists to the Supabase `templates` table.
 */
export default function TemplateHubPage() {
  const tray: TrayItem[] = getAllComponents().map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
    status: c.status,
    renderable: hasRenderer(c.slug),
  }));

  return <TemplateHub tray={tray} />;
}
