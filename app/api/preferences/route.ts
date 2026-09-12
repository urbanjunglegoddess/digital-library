import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ALL_STYLES } from "@/lib/styles";
import { TARGETS_BY_KEY } from "@/lib/targets";

/**
 * /api/preferences — per-account UI defaults (Phase 4).
 *
 *   GET  the caller's preferences (empty object when signed out)
 *   PUT  {default_style?, default_target?}
 *
 * Stored in `profiles.preferences` rather than localStorage so they follow the
 * user between devices — which is the whole reason to attach them to an account.
 *
 * Both values are validated against the canonical lists here. They are written
 * into a jsonb column and later used to pick a CSS attribute and a code
 * generator, so an unchecked value would propagate somewhere it does not belong.
 */
export const dynamic = "force-dynamic";

const STYLE_KEYS = new Set<string>(ALL_STYLES);

/** Index signature so this satisfies the jsonb column's `Record` type. */
export interface Preferences {
  [key: string]: unknown;
  default_style?: string;
  default_target?: string;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { signed_in: false, preferences: {} },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const { data } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json(
    { signed_in: true, preferences: data?.preferences ?? {} },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "not_signed_in", message: "Sign in to save preferences." },
      { status: 401 },
    );
  }

  let body: Preferences;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const next: Preferences = {};

  if (body.default_style !== undefined) {
    if (body.default_style === "" || body.default_style === null) {
      // Explicit clear — fall back to the built-in default.
    } else if (!STYLE_KEYS.has(body.default_style)) {
      return NextResponse.json(
        { error: "bad_request", message: `Unknown visual style “${body.default_style}”.` },
        { status: 400 },
      );
    } else {
      next.default_style = body.default_style;
    }
  }

  if (body.default_target !== undefined) {
    if (body.default_target === "" || body.default_target === null) {
      // Explicit clear.
    } else if (!TARGETS_BY_KEY[body.default_target]) {
      return NextResponse.json(
        { error: "bad_request", message: `Unknown target “${body.default_target}”.` },
        { status: 400 },
      );
    } else {
      next.default_target = body.default_target;
    }
  }

  // Replace rather than merge: the settings form always sends the full set, and
  // a merge would make a cleared preference impossible to express.
  const { error } = await supabase
    .from("profiles")
    .update({ preferences: next })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "save_failed", message: error.message }, { status: 400 });
  }

  return NextResponse.json({ preferences: next });
}
