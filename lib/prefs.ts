/**
 * Workspace preferences — the default skin and language target the Playground,
 * the Build Hub composer and the style switcher open with.
 *
 * Two tiers, deliberately:
 *
 *   localStorage  read synchronously at mount, so a component can pick its
 *                 opening state without waiting on a request and without a
 *                 hydration mismatch.
 *   the account   `profiles.preferences`, via /api/preferences. Durable and
 *                 shared across devices, which is the reason to have an
 *                 account at all.
 *
 * The account is the source of truth when signed in; the app shell mirrors it
 * into localStorage once per navigation (see AppShell), so every synchronous
 * `getPref` reader below gets the account value without knowing accounts exist.
 * Signed out, localStorage is simply the whole story.
 *
 * Every accessor is guarded: a private window or blocked storage degrades to
 * the built-in defaults rather than throwing.
 */

export const PREF_SKIN = "dl-pref-skin";
export const PREF_TARGET = "dl-pref-target";

/** Shape of `profiles.preferences`, as the API stores it. */
export interface AccountPreferences {
  default_style?: string;
  default_target?: string;
}

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

/**
 * Copy account preferences into localStorage so the synchronous readers pick
 * them up. Called by the app shell after it learns who the viewer is.
 *
 * A preference the account does not set is cleared rather than left behind:
 * otherwise a value from a previous session on a shared browser would outlive
 * the account that set it.
 */
export function mirrorAccountPreferences(prefs: AccountPreferences | null): void {
  if (!prefs) return;
  if (prefs.default_style) setPref(PREF_SKIN, prefs.default_style);
  else clearPref(PREF_SKIN);
  if (prefs.default_target) setPref(PREF_TARGET, prefs.default_target);
  else clearPref(PREF_TARGET);
}

/**
 * Persist the full preference set to the account. Returns false when the
 * caller is signed out (or the write fails), so the UI can say the value is
 * per-browser only rather than silently implying it synced.
 */
export async function saveAccountPreferences(
  prefs: AccountPreferences,
): Promise<boolean> {
  try {
    const res = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    return res.ok;
  } catch {
    return false;
  }
}
