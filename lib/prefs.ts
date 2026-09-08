/**
 * Client-side workspace preferences (localStorage-backed).
 *
 * Lightweight, per-browser defaults until accounts land in Phase 3 (which will
 * persist these to `profiles`). Every accessor is guarded so a private window
 * or blocked storage degrades to the built-in defaults rather than throwing.
 */

export const PREF_SKIN = "dl-pref-skin";
export const PREF_TARGET = "dl-pref-target";

export function getPref(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setPref(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked — ignore */
  }
}

export function clearPref(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
