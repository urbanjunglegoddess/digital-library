import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "destructive" | "text";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
}

/**
 * Button — the reference component of the Digital Library.
 *
 * Skin is applied by an ancestor `[data-style="..."]` wrapper
 * (see styles/tokens.css). This component owns behavior, not the skin:
 * - real <button> semantics (keyboard + focus for free)
 * - `loading` implies disabled (no double-submit)
 * - native props (onClick, type, aria-*, data-*) pass straight through
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", block = false, loading = false,
      leadingIcon, disabled, children, className = "", type = "button", ...rest },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const cls = [
      "btn",
      `btn--${variant}`,
      `btn--${size}`,
      block && "btn--block",
      loading && "is-loading",
      className,
    ].filter(Boolean).join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={cls}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <span className="spinner" aria-hidden="true" />}
        {!loading && leadingIcon}
        <span>{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
