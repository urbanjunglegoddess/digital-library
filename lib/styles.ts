/**
 * Client-safe visual-style constants. Kept separate from lib/content.ts (which
 * is server-only, using fs) so client components can import the style names
 * without pulling the filesystem code into the browser bundle.
 *
 * The keys match the `[data-style="…"]` attribute in styles/tokens.css.
 */

export const ALL_STYLES = [
  "ujg",
  "flat",
  "material",
  "glass",
  "liquid",
  "neu",
  "skeu",
  "brut",
  "clay",
  "aurora",
  "swiss",
] as const;

export type StyleKey = (typeof ALL_STYLES)[number];

export const STYLE_NAMES: Record<string, string> = {
  ujg: "UJG",
  flat: "Flat",
  material: "Material",
  glass: "Glassmorphism",
  liquid: "Liquid Glass",
  neu: "Neumorphism",
  skeu: "Skeuomorphism",
  brut: "Neo-Brutalism",
  clay: "Claymorphism",
  aurora: "Aurora",
  swiss: "Swiss",
};
