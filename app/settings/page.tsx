import type { Metadata } from "next";
import { SurfacePlaceholder } from "@/components/site/SurfacePlaceholder";

export const metadata: Metadata = {
  title: "Settings — Digital Asset Library",
  description: "Account, theme, and configuration.",
};

export default function SettingsPage() {
  return (
    <SurfacePlaceholder
      eyebrow="Settings"
      title="Account & configuration"
      lede="Manage your profile, the default visual style and language target, and workspace preferences."
      phase="🚧 Account settings arrive with auth in Phase 3; theme preferences follow."
      points={[
        {
          heading: "Profile",
          body: "Display name and role, backed by the `profiles` table (1:1 with your auth user).",
        },
        {
          heading: "Defaults",
          body: "Pick the visual style and language/framework target the catalog opens with.",
        },
        {
          heading: "Data & privacy",
          body: "Export or delete your workspace data — deletion cascades across your collections and templates.",
        },
      ]}
    />
  );
}
