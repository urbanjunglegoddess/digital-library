"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Collection mutations (Phase 3).
 *
 * `owner_id` is set from the authenticated user, never from the form, and the
 * `collections_owner_all` policy rejects a row whose owner is anyone else. The
 * update and delete actions likewise pass only the id: RLS turns "someone
 * else's collection" into "no such row" rather than an authorization error, so
 * an attacker learns nothing about what exists.
 */

export interface ActionResult {
  error?: string;
  notice?: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createCollection(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give the collection a name." };
  if (name.length > 80) return { error: "Keep the name under 80 characters." };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase
    .from("collections")
    .insert({ owner_id: user.id, name });

  if (error) return { error: error.message };

  revalidatePath("/account");
  return { notice: `Created “${name}”.` };
}

export async function renameCollection(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { error: "Give the collection a name." };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase.from("collections").update({ name }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { notice: "Renamed." };
}

export async function deleteCollection(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Nothing to delete." };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  // collection_items cascades on the foreign key, so the rows go with it.
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { notice: "Collection deleted." };
}

/**
 * Add or remove a component from a collection. One action for both directions
 * so the save menu can send a single desired state ("should be in") rather than
 * having to work out which call to make.
 */
export async function setCollectionMembership(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const collectionId = String(formData.get("collection_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const shouldBeIn = formData.get("member") === "1";

  if (!collectionId || !slug) return { error: "Missing collection or component." };

  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { data: component } = await supabase
    .from("components")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!component) return { error: "That component is not in the catalog." };

  if (shouldBeIn) {
    const { error } = await supabase
      .from("collection_items")
      .upsert(
        { collection_id: collectionId, component_id: component.id },
        { onConflict: "collection_id,component_id", ignoreDuplicates: true },
      );
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("component_id", component.id);
    if (error) return { error: error.message };
  }

  revalidatePath("/account");
  revalidatePath(`/knowledge/${slug}`);
  return {
    notice: shouldBeIn
      ? `Saved ${component.name}.`
      : `Removed ${component.name}.`,
  };
}
