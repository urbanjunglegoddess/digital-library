import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings — Digital Asset Library",
  description:
    "Workspace preferences: the default visual style and language target the Playground and composer open with.",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
