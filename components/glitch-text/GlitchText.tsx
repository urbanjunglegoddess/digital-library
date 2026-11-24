"use client";

import * as React from "react";

export type GlitchVariant = "scramble" | "slice" | "signal" | "chroma";
export type GlitchSize = "inline" | "sm" | "md" | "lg" | "xl";
export type GlitchTrigger = "mount" | "in-view" | "hover" | "manual";

/**
 * The substitute pool for the scramble pass.
 *
 * Deliberately restricted to glyphs present in the UJG display subset. Block-drawing
 * characters look better but render as tofu boxes whenever the display face is subset,
 * which reads to a visitor as a broken font — because it is one.
 */
export const DEFAULT_CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789/\\|<>#*+=-";

/** Uppercase reads better as noise but measures far wider than lowercase copy — 484px of
 *  pool against 362px of real text at 58px. The box is pinned either way (see the width
 *  pin below), so this only governs how much the noise overflows its reserved box. Pass
 *  it explicitly when the headline is itself uppercase. */
export const UPPERCASE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|<>#*+=-";

/** useLayoutEffect on the client, useEffect on the server, so SSR stays warning-free. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export interface UseGlitchOptions {
  text: string;
  variant?: GlitchVariant;
  duration?: number;
  trigger?: GlitchTrigger;
  once?: boolean;
  charset?: string;
}

/**
 * Headless: owns the pass lifecycle and nothing else. No markup, no class names.
 *
 * The correctness that is easy to get wrong lives here — the spent flag, the settle
 * net, the reduced-motion early return, and cleanup — so every skin inherits it.
 */
export function useGlitch({
  text,
  variant = "scramble",
  duration = 900,
  trigger = "in-view",
  once = true,
  charset = DEFAULT_CHARSET,
}: UseGlitchOptions) {
  const reduced = usePrefersReducedMotion();
  const hostRef = React.useRef<HTMLElement | null>(null);
  const [state, setState] = React.useState<"idle" | "glitching">("idle");
  const [noise, setNoise] = React.useState(text);
  const [enhanced, setEnhanced] = React.useState(false);
  const spent = React.useRef(false);
  const rafRef = React.useRef<number | null>(null);
  const settleRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Take over the glyphs only once we know JS runs AND motion is allowed. Until then
     the truth node renders — which is also the no-JS, crawler and print path. */
  React.useEffect(() => {
    setEnhanced(variant === "scramble" && !reduced);
  }, [variant, reduced]);

  const stop = React.useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (settleRef.current !== null) clearTimeout(settleRef.current);
    rafRef.current = null;
    settleRef.current = null;
  }, []);

  const land = React.useCallback(() => {
    stop();
    setNoise(text);
    setState("idle");
  }, [stop, text]);

  const run = React.useCallback(() => {
    if (reduced) {
      land();
      return;
    }
    if (once && spent.current) return;
    spent.current = true;
    stop();
    setState("glitching");

    /* The settle net. requestAnimationFrame is throttled or paused in a background
       tab and animationend genuinely may never fire, so this timer is what
       guarantees the element reaches its final state. It is an invariant, not a
       fallback — see the stubbed-rAF test in the suite. */
    settleRef.current = setTimeout(land, duration + 120);

    if (variant !== "scramble") return; // CSS owns slice, signal and chroma

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const upTo = Math.floor(progress * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < upTo || ch === " " ? ch : charset[(Math.random() * charset.length) | 0];
      }
      setNoise(out);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else land();
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [charset, duration, land, once, reduced, stop, text, variant]);

  /** Explicit user request: a replay overrides the once-flag. */
  const replay = React.useCallback(() => {
    spent.current = false;
    run();
  }, [run]);

  React.useEffect(() => () => stop(), [stop]);

  React.useEffect(() => {
    if (reduced || trigger === "manual" || trigger === "hover") return;
    if (trigger === "mount") {
      run();
      return;
    }

    const el = hostRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          run();
          if (once) io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, reduced, run, trigger]);

  return {
    hostRef,
    state,
    noise,
    enhanced,
    reduced,
    run,
    replay,
    isGlitching: state === "glitching",
  };
}

type GlitchTextOwnProps<T extends React.ElementType> = {
  /**
   * Typed as string, not ReactNode, on purpose: the component cannot do its job on
   * arbitrary nodes, and a type error at the call site beats silently scrambling
   * "[object Object]".
   */
  children: string;
  as?: T;
  variant?: GlitchVariant;
  size?: GlitchSize;
  trigger?: GlitchTrigger;
  duration?: number;
  once?: boolean;
  charset?: string;
  scanline?: boolean;
  className?: string;
};

export type GlitchTextProps<T extends React.ElementType> = GlitchTextOwnProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof GlitchTextOwnProps<T>>;

export function GlitchText<T extends React.ElementType = "span">({
  children,
  as,
  variant = "scramble",
  size = "lg",
  trigger = "in-view",
  duration = 900,
  once = true,
  charset = DEFAULT_CHARSET,
  scanline = true,
  className,
  ...rest
}: GlitchTextProps<T>) {
  const Host = (as ?? "span") as React.ElementType;
  const { hostRef, state, noise, enhanced, reduced } = useGlitch({
    text: children,
    variant,
    duration,
    trigger,
    once,
    charset,
  });

  /* The width pin. The scramble pool is proportional — an uppercase pool measures ~45%
     wider than lowercase copy at hero size — so without a reserved width the line's
     measured box changes every frame and everything below it hops. Measure the truth node
     while it is still in normal flow (before enhancement), then pin the noise node to that
     px value. `ch` is too coarse for a display face, which is why this is measured px. */
  const truthRef = React.useRef<HTMLSpanElement | null>(null);
  const [pinnedWidth, setPinnedWidth] = React.useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (variant !== "scramble" || enhanced) return;
    const node = truthRef.current;
    if (!node) return;
    const measured = node.getBoundingClientRect().width;
    if (measured > 0) setPinnedWidth(measured);
    /* Measured on the live node rather than a probe: getComputedStyle(el).font serializes
       to an empty or partial shorthand whenever the font-family list is non-trivial, and a
       probe seeded from it silently falls back to 16px — which reports 100px for text that
       actually renders at 362px, and makes the pin wrong rather than absent. */
  }, [variant, enhanced, children]);

  return (
    <Host
      ref={hostRef as React.Ref<never>}
      className={["glitch", enhanced ? "is-enhanced" : "", className].filter(Boolean).join(" ")}
      data-glitch={variant}
      data-glitch-size={size}
      data-glitch-state={state}
      data-glitch-trigger={trigger}
      style={{
        ["--glitch-duration" as string]: `${duration}ms`,
        ...(pinnedWidth !== null
          ? { ["--glitch-width" as string]: `${pinnedWidth}px` }
          : null),
      }}
      {...rest}
    >
      {/* Noise: decorative, always hidden from assistive tech. */}
      {variant === "scramble" && enhanced ? (
        <span className="glitch__out" aria-hidden="true">
          {noise}
        </span>
      ) : null}

      {/* Truth: always rendered, always in the accessibility tree. */}
      <span ref={truthRef} className="glitch__truth">
        {children}
      </span>

      {scanline && !reduced ? <span className="glitch__scan" aria-hidden="true" /> : null}
    </Host>
  );
}

GlitchText.displayName = "GlitchText";
