import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Saved templates — a signed-in user's stored compositions (Phase 4).
 *
 * Like `lib/collections.ts`, every read goes through the anon client under the
 * caller's session, so the `templates_owner_all` policy is what enforces
 * ownership — nothing here filters by `owner_id` in JavaScript. This is the
 * server-side read used to render the user's own surfaces (Portal, Dashboard);
 * writes still go through /api/templates.
 */

export interface SavedTemplate {
  id: string;
  name: string;
  description: string | null;
  /** How many components the saved composition holds, best-effort from `config`. */
  itemCount: number;
  updatedAt: string | null;
}

/** Count the components in a stored template config, whatever shape it took. */
function countItems(config: unknown): number {
  if (Array.isArray(config)) return config.length;
  if (config && typeof config === "object") {
    const items = (config as Record<string, unknown>).items ?? (config as Record<string, unknown>).components;
    if (Array.isArray(items)) return items.length;
  }
  return 0;
}

export async function listTemplates(): Promise<SavedTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("templates")
    .select("id, name, description, config, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[templates] list:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    itemCount: countItems(row.config),
    updatedAt: row.updated_at ?? null,
  }));
}
