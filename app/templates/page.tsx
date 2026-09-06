import type { Metadata } from "next";
import { SurfacePlaceholder } from "@/components/site/SurfacePlaceholder";

export const metadata: Metadata = {
  title: "Template Hub — Digital Asset Library",
  description: "Reusable starters and kits, ready to configure and export.",
};

export default function TemplateHubPage() {
  return (
    <SurfacePlaceholder
      eyebrow="Template Hub"
      title="Starters & kits"
      lede="Prebuilt compositions — landing pages, dashboards, auth flows, forms — assembled from library components and exportable as a boilerplate ZIP."
      phase="🚧 Template builder + export lands in Phase 4."
      points={[
        {
          heading: "Curated templates",
          body: "Page skeletons (Landing, Dashboard, Detail, Settings, Blog, Auth, E-commerce) built from the component catalog.",
        },
        {
          heading: "Configure & theme",
          body: "Choose the visual style and language target, swap components, then export a ready-to-run starter.",
        },
        {
          heading: "Owner-scoped saves",
          body: "Your own templates live in the `templates` table (Supabase), private to you via row-level security.",
        },
      ]}
      cta={{ href: "/knowledge", label: "See the components templates draw from" }}
    />
  );
}
