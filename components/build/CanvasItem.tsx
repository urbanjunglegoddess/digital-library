"use client";

import { Button } from "@/components/button/Button";
import type { StackItem } from "./types";

/**
 * Canvas renderers — the live preview of one stacked component.
 *
 * These reuse the real library components where they exist (Button) and render
 * the token-driven markup for the ones whose components ship later, so the
 * skin switch in the composer header is genuinely exercising styles/tokens.css
 * rather than faking a screenshot.
 */
export function CanvasItem({ item }: { item: StackItem }) {
  const p = item.props;
  const uid = `preview-${item.uid}`;

  switch (item.slug) {
    case "field":
      return (
        <div className={`cv-field${p.error ? " is-error" : ""}`}>
          <label className="cv-field__label" htmlFor={uid}>
            {String(p.label)}
            {p.required ? <span aria-hidden="true"> *</span> : null}
          </label>
          <input
            id={uid}
            className="cv-field__control"
            type={String(p.type ?? "text")}
            placeholder={String(p.placeholder ?? "")}
            aria-describedby={p.help ? `${uid}-help` : undefined}
            aria-invalid={p.error ? true : undefined}
            readOnly
          />
          {p.error ? (
            <p className="cv-field__error" role="alert">
              Enter a valid {String(p.type ?? "value")}.
            </p>
          ) : p.help ? (
            <p className="cv-field__help" id={`${uid}-help`}>
              {String(p.help)}
            </p>
          ) : null}
        </div>
      );

    case "checkbox":
      return (
        <div className="cv-check">
          <input
            id={uid}
            type="checkbox"
            className="cv-check__input"
            checked={Boolean(p.checked)}
            readOnly
          />
          <label className="cv-check__label" htmlFor={uid}>
            {String(p.label)}
          </label>
        </div>
      );

    case "button":
      return (
        <Button
          variant={String(p.variant) as "primary"}
          size={String(p.size) as "md"}
          block={Boolean(p.block)}
          loading={Boolean(p.loading)}
        >
          {String(p.label)}
        </Button>
      );

    case "alert":
      return (
        <div
          className={`cv-alert cv-alert--${String(p.tone)}`}
          role={p.tone === "danger" ? "alert" : "status"}
        >
          <span className="cv-alert__icon" aria-hidden="true">
            {p.tone === "success" ? "✓" : p.tone === "danger" ? "!" : "▲"}
          </span>
          <p className="cv-alert__text">{String(p.label)}</p>
        </div>
      );

    case "badge":
      return (
        <span className={`cv-badge cv-badge--${String(p.tone)}`}>
          {String(p.label)}
        </span>
      );

    case "divider":
      return p.label ? (
        <div className="cv-divider cv-divider--labelled" role="separator">
          <span>{String(p.label)}</span>
        </div>
      ) : (
        <hr className="cv-divider" />
      );

    case "blockquote":
      return (
        <blockquote className="cv-quote">
          <p>{String(p.label)}</p>
          {p.help ? <cite>{String(p.help)}</cite> : null}
        </blockquote>
      );

    default:
      return (
        <div className="cv-pending">
          <span className="cv-pending__name">{item.name}</span>
          <span className="cv-pending__note">
            Documented · composer renderer pending
          </span>
        </div>
      );
  }
}
