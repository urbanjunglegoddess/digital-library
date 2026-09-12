import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * /api/templates — a signed-in user's saved compositions (Phase 4).
 *
 *   GET                     list the caller's templates, newest first
 *   POST   {name, config}   create, or update when `id` is supplied
 *   DELETE ?id=…            remove one
 *
 * `templates.owner_id` is set from the session, never from the body, and the
 * `templates_owner_all` policy rejects any row owned by someone else. A request
 * for another user's template returns "not found" rather than "forbidden",
 * because RLS filters it out before this code ever sees it.
 */
export const dynamic = "force-dynamic";

const MAX_COMPONENTS = 200;

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function unauthorized() {
  return NextResponse.json(
    { error: "not_signed_in", message: "Sign in to save templates." },
    { status: 401 },
  );
}

export async function GET() {
  const { supabase, user } = await currentUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("templates")
    .select("id, name, description, config, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "read_failed", message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { templates: data ?? [] },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await currentUser();
  if (!user) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim() || null;
  const id = body.id ? String(body.id) : null;
  const config = body.config;

  if (!name || name.length > 80) {
    return NextResponse.json(
      { error: "bad_request", message: "Give the template a name of 1–80 characters." },
      { status: 400 },
    );
  }
  if (!config || typeof config !== "object") {
    return NextResponse.json(
      { error: "bad_request", message: "`config` must be an object." },
      { status: 400 },
    );
  }

  // Bound the payload: `config` is user-supplied JSON going straight into a
  // jsonb column, so cap the one field that can grow without limit.
  const components = (config as { components?: unknown }).components;
  if (Array.isArray(components) && components.length > MAX_COMPONENTS) {
    return NextResponse.json(
      { error: "too_large", message: `A template is limited to ${MAX_COMPONENTS} components.` },
      { status: 413 },
    );
  }

  if (id) {
    const { data, error } = await supabase
      .from("templates")
      .update({ name, description, config: config as Record<string, unknown> })
      .eq("id", id)
      .select("id, name, description, config, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "update_failed", message: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "not_found", message: "No such template." },
        { status: 404 },
      );
    }
    return NextResponse.json({ template: data });
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      owner_id: user.id,
      name,
      description,
      config: config as Record<string, unknown>,
    })
    .select("id, name, description, config, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "insert_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ template: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await currentUser();
  if (!user) return unauthorized();

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "bad_request", message: "`id` is required." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "delete_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ deleted: id });
}
