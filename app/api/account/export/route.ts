import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/account/export — everything the account holds, as one JSON file.
 *
 * Data portability, and a way to see exactly what is stored about you without
 * asking anyone. Every query runs under the caller's own session, so RLS
 * guarantees the export contains their rows and nobody else's — there is no
 * `owner_id` filter here to get wrong.
 *
 * Files are listed by name and path, not embedded: the objects live in Storage
 * and are reachable through the account page's signed links.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "not_signed_in", message: "Sign in to export your data." },
      { status: 401 },
    );
  }

  const [profile, collections, templates, assets] = await Promise.all([
    supabase.from("profiles").select("display_name, role, preferences").eq("id", user.id).maybeSingle(),
    supabase
      .from("collections")
      .select("id, name, collection_items ( components ( slug, name ) )"),
    supabase.from("templates").select("id, name, description, config, created_at, updated_at"),
    supabase
      .from("assets")
      .select("id, type, title, storage_path, meta, is_public, created_at")
      .eq("owner_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at ?? null,
      display_name: profile.data?.display_name ?? null,
      role: profile.data?.role ?? "user",
      preferences: profile.data?.preferences ?? {},
    },
    collections: (collections.data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      components: (c.collection_items ?? [])
        .map((ci: any) => (Array.isArray(ci.components) ? ci.components[0] : ci.components))
        .filter(Boolean)
        .map((comp: any) => ({ slug: comp.slug, name: comp.name })),
    })),
    templates: templates.data ?? [],
    files: assets.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="digital-asset-library-export.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
