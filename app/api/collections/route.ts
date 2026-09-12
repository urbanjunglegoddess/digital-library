import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCollections, collectionsContaining } from "@/lib/collections";

/**
 * /api/collections — the signed-in user's saved sets (Phase 3).
 *
 *   GET  /api/collections            every collection with its items
 *   GET  /api/collections?slug=card  collections + which ones already hold `card`
 *   POST /api/collections            create one, or toggle a component's membership
 *
 * This exists alongside the server actions in app/account/actions.ts because
 * the component detail pages are statically generated: they cannot read
 * per-user state at build time, so the save control hydrates against this
 * endpoint instead of forcing the whole page to render per request.
 *
 * Ownership is enforced by RLS, not here. An unauthenticated caller simply
 * sees no rows, so the 401 below is a courtesy for the client, not a gate.
 */
export const dynamic = "force-dynamic";

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const { user } = await currentUser();
  if (!user) {
    return NextResponse.json(
      { signed_in: false, collections: [], member_of: [] },
      { status: 200, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const slug = request.nextUrl.searchParams.get("slug");

  if (slug) {
    const { collections, memberOf } = await collectionsContaining(slug);
    return NextResponse.json(
      { signed_in: true, collections, member_of: memberOf },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    { signed_in: true, collections: await listCollections() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await currentUser();
  if (!user) {
    return NextResponse.json(
      { error: "not_signed_in", message: "Sign in to save components." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const action = String(body.action ?? "");

  if (action === "create") {
    const name = String(body.name ?? "").trim();
    if (!name || name.length > 80) {
      return NextResponse.json(
        { error: "bad_request", message: "Give the collection a name of 1–80 characters." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("collections")
      .insert({ owner_id: user.id, name })
      .select("id, name")
      .single();

    if (error) {
      return NextResponse.json({ error: "insert_failed", message: error.message }, { status: 400 });
    }
    return NextResponse.json({ collection: data }, { status: 201 });
  }

  if (action === "toggle") {
    const collectionId = String(body.collection_id ?? "");
    const slug = String(body.slug ?? "");
    const member = Boolean(body.member);

    if (!collectionId || !slug) {
      return NextResponse.json(
        { error: "bad_request", message: "collection_id and slug are required." },
        { status: 400 },
      );
    }

    const { data: component } = await supabase
      .from("components")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!component) {
      return NextResponse.json(
        { error: "not_found", message: "No such component." },
        { status: 404 },
      );
    }

    if (member) {
      const { error } = await supabase
        .from("collection_items")
        .upsert(
          { collection_id: collectionId, component_id: component.id },
          { onConflict: "collection_id,component_id", ignoreDuplicates: true },
        );
      if (error) {
        return NextResponse.json({ error: "save_failed", message: error.message }, { status: 400 });
      }
    } else {
      const { error } = await supabase
        .from("collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("component_id", component.id);
      if (error) {
        return NextResponse.json({ error: "remove_failed", message: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ collection_id: collectionId, slug, member });
  }

  return NextResponse.json(
    { error: "bad_request", message: `Unknown action “${action}”.` },
    { status: 400 },
  );
}
