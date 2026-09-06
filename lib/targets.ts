/**
 * The 12 language / framework targets a build can be emitted as.
 *
 * Client-safe (no fs), same pattern as lib/styles.ts — the composer runs in
 * the browser and needs these names without pulling the content layer in.
 *
 * `emit` marks which targets have a real generator today. The rest are listed
 * because the library documents snippets for them (see the `snippets`
 * frontmatter in content/docs/*.mdx); their generators land with the export
 * pipeline in Phase 4.
 */

export interface Target {
  key: string;
  label: string;
  /** File extension the generated component is written to. */
  ext: string;
  /** True when the composer can generate this target right now. */
  emit: boolean;
}

export const ALL_TARGETS: Target[] = [
  { key: "html", label: "HTML + CSS", ext: "html", emit: true },
  { key: "react", label: "React (JSX)", ext: "jsx", emit: true },
  { key: "react-ts", label: "React + TypeScript", ext: "tsx", emit: true },
  { key: "next", label: "Next.js (App Router)", ext: "tsx", emit: false },
  { key: "vue", label: "Vue 3 (SFC)", ext: "vue", emit: false },
  { key: "svelte", label: "Svelte", ext: "svelte", emit: false },
  { key: "angular", label: "Angular", ext: "ts", emit: false },
  { key: "tailwind", label: "Tailwind (utility)", ext: "html", emit: false },
  { key: "web-components", label: "Web Components", ext: "js", emit: false },
  { key: "react-native", label: "React Native", ext: "tsx", emit: false },
  { key: "swiftui", label: "SwiftUI", ext: "swift", emit: false },
  { key: "compose", label: "Jetpack Compose", ext: "kt", emit: false },
];

export const TARGETS_BY_KEY: Record<string, Target> = Object.fromEntries(
  ALL_TARGETS.map((t) => [t.key, t]),
);

export const DEFAULT_TARGET = "react-ts";
