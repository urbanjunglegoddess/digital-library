/**
 * Shared types for the Build Hub composer.
 *
 * A `TrayItem` is a component as it appears in the left tray (derived from the
 * content docs on the server). A `StackItem` is one instance placed on the
 * canvas, carrying its own editable props.
 */

/** A code snippet as documented in a component's content/docs frontmatter. */
export interface DocSnippet {
  language: string;
  framework?: string | null;
  label?: string;
  code: string;
  primary?: boolean;
}

export interface TrayItem {
  slug: string;
  name: string;
  category: string;
  status: string;
  /** Whether the composer has a live canvas renderer for this slug. */
  renderable: boolean;
  /** Real code snippets from the component's doc (content/docs), if any. */
  snippets?: DocSnippet[];
}

export interface StackItem {
  /** Stable per-instance id (a slug can appear on the canvas more than once). */
  uid: string;
  slug: string;
  name: string;
  category: string;
  /** Editable prop values, keyed by the field keys in the component's spec. */
  props: Record<string, string | boolean>;
  /** Free position + depth, used only by the "layered" canvas layout. */
  layer?: { x: number; y: number; z: number };
}

export type LayoutKey =
  | "flow"
  | "two-col"
  | "asym"
  | "split"
  | "bento"
  | "layered";
