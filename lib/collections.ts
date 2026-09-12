import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Collections — a signed-in user's saved sets of components (Phase 3).
 *
 * Every read and write here goes through the anon client under the caller's
 * session, so the `collections_owner_all` / `collection_items_owner_all`
 * policies from migration 0001 are what actually enforce ownership. None of
 * these functions filter by `owner_id` in JavaScript: doing so would imply the
 * database was not already doing it, which is the wrong mental model to leave
 * in the codebase.
 */

export interface CollectionItem {
  component_id: string;
  slug: string;
  name: string;
  summary: string | null;
  status: string;
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
}

export async function listCollections(): Promise<Collection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .select(
      `id, name,
       collection_items ( components ( id, slug, name, summary, status ) )`,
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("[collections] list:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    items: (row.collection_items ?? [])
      .map((ci: any) => (Array.isArray(ci.components) ? ci.components[0] : ci.components))
      .filter(Boolean)
      .map((c: any) => ({
        component_id: c.id,
        slug: c.slug,
        name: c.name,
        summary: c.summary,
        status: c.status,
      }))
      .sort((a: CollectionItem, b: CollectionItem) => a.name.localeCompare(b.name)),
  }));
}

/**
 * The collections a given component is already in — drives the checked state
 * of the save menu on a component page.
 */
export async function collectionsContaining(
  componentSlug: string,
): Promise<{ collections: { id: string; name: string }[]; memberOf: string[] }> {
  const supabase = await createClient();

  const [{ data: collections }, { data: component }] = await Promise.all([
    supabase.from("collections").select("id, name").order("name"),
    supabase.from("components").select("id").eq("slug", componentSlug).maybeSingle(),
  ]);

  if (!collections?.length || !component) {
    return { collections: collections ?? [], memberOf: [] };
  }

  const { data: items } = await supabase
    .from("collection_items")
    .select("collection_id")
    .eq("component_id", component.id);

  return {
    collections,
    memberOf: (items ?? []).map((i) => i.collection_id),
  };
}
