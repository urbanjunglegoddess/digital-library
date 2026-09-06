/**
 * Per-component composer metadata: which props the inspector exposes, what the
 * canvas renders, and the accessibility guarantees the doc claims.
 *
 * Client-safe. Keyed by the component slug so it lines up 1:1 with
 * content/docs/<slug>.mdx — a component with no entry here still appears in
 * the tray and drops onto the canvas, it just renders as a labelled block
 * until its renderer is written.
 */

export type FieldKind = "text" | "toggle" | "select";

export interface PropField {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[];
}

export interface ComposerSpec {
  /** Inspector controls, in display order. */
  fields: PropField[];
  /** Starting prop values for a freshly dropped instance. */
  defaults: Record<string, string | boolean>;
  /** What the doc's a11y section guarantees — shown in the inspector. */
  a11y: string[];
}

const LABEL: PropField = { key: "label", label: "Label", kind: "text" };
const HELP: PropField = { key: "help", label: "Help text", kind: "text" };
const REQUIRED: PropField = { key: "required", label: "Required", kind: "toggle" };
const ERROR: PropField = { key: "error", label: "Error state", kind: "toggle" };

export const COMPOSER_SPECS: Record<string, ComposerSpec> = {
  field: {
    fields: [
      LABEL,
      { key: "type", label: "Type", kind: "select", options: ["text", "email", "password", "tel", "url"] },
      { key: "placeholder", label: "Placeholder", kind: "text" },
      HELP,
      REQUIRED,
      ERROR,
    ],
    defaults: {
      label: "Email address",
      type: "email",
      placeholder: "you@example.com",
      help: "We'll only use this to sign you in.",
      required: true,
      error: false,
    },
    a11y: [
      "Label bound to the control via for/id",
      "Help text referenced by aria-describedby",
      "Error announced with role=\"alert\" and aria-invalid",
      "44px minimum target · 3px focus ring",
    ],
  },
  checkbox: {
    fields: [LABEL, { key: "checked", label: "Checked", kind: "toggle" }, HELP],
    defaults: { label: "Send me build digests", checked: false, help: "" },
    a11y: [
      "Native input[type=checkbox] — keyboard and AT support for free",
      "Indeterminate set via the DOM property, not an attribute",
      "44px target including the label",
    ],
  },
  button: {
    fields: [
      { key: "label", label: "Label", kind: "text" },
      { key: "variant", label: "Variant", kind: "select", options: ["primary", "secondary", "ghost", "gold", "destructive", "text"] },
      { key: "size", label: "Size", kind: "select", options: ["xs", "sm", "md", "lg", "xl"] },
      { key: "block", label: "Full width", kind: "toggle" },
      { key: "loading", label: "Loading", kind: "toggle" },
    ],
    defaults: { label: "Create account", variant: "primary", size: "lg", block: false, loading: false },
    a11y: [
      "Real <button> semantics — Enter and Space for free",
      "loading implies disabled, so no double submit",
      "aria-busy set while loading",
    ],
  },
  alert: {
    fields: [
      { key: "label", label: "Message", kind: "text" },
      { key: "tone", label: "Tone", kind: "select", options: ["info", "success", "warning", "danger"] },
    ],
    defaults: { label: "Check your inbox to confirm your address.", tone: "warning" },
    a11y: [
      "role=\"status\" for info, role=\"alert\" for danger",
      "Tone never carries meaning on colour alone — an icon and text back it up",
    ],
  },
  badge: {
    fields: [
      { key: "label", label: "Text", kind: "text" },
      { key: "tone", label: "Tone", kind: "select", options: ["neutral", "info", "success", "warning", "danger"] },
    ],
    defaults: { label: "Beta", tone: "info" },
    a11y: ["Decorative badges are aria-hidden; meaningful ones carry visible text"],
  },
  divider: {
    fields: [{ key: "label", label: "Label (optional)", kind: "text" }],
    defaults: { label: "" },
    a11y: ["Presentational by default; role=\"separator\" when it divides groups"],
  },
  blockquote: {
    fields: [
      { key: "label", label: "Quote", kind: "text" },
      { key: "help", label: "Attribution", kind: "text" },
    ],
    defaults: { label: "We build systems that work in real life, not just on paper.", help: "Omegea Hunter" },
    a11y: ["<blockquote> + <cite> so the attribution is programmatically tied to the quote"],
  },
};

/** Fallback for a component that has a doc but no renderer yet. */
export const FALLBACK_SPEC: ComposerSpec = {
  fields: [{ key: "label", label: "Label", kind: "text" }],
  defaults: { label: "" },
  a11y: ["Documented to the 17-section bar — renderer pending"],
};

export function specFor(slug: string): ComposerSpec {
  return COMPOSER_SPECS[slug] ?? FALLBACK_SPEC;
}

export function hasRenderer(slug: string): boolean {
  return slug in COMPOSER_SPECS;
}
