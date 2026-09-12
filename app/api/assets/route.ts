import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * /api/assets — user file uploads backed by Supabase Storage (Phase 4).
 *
 *   GET               list the caller's assets, each with a short-lived signed URL
 *   POST  (multipart) upload a file, then record it in the `assets` table
 *   DELETE ?id=…      remove the row and the stored object
 *
 * Objects are keyed `<user-id>/<timestamp>-<name>`. That first path segment is
 * what the storage policies in migration 0003 compare against `auth.uid()`, so
 * a user is confined to their own folder by the database rather than by this
 * code remembering to filter.
 *
 * The bucket is private. Files are read through signed URLs with a short expiry
 * instead of being made public, so sharing is a deliberate act rather than a
 * consequence of uploading.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "assets";
const MAX_BYTES = 10 * 1024 * 1024; // must not exceed the bucket's own limit
const SIGNED_URL_TTL = 60 * 60; // one hour

/** Mirrors `allowed_mime_types` on the bucket; rejected here for a clear error. */
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "application/json",
  "text/plain",
  "text/css",
  "text/markdown",
  "application/zip",
]);

/** Which `assets.type` an upload is recorded as, from its MIME type. */
function assetTypeFor(mime: string): "image" | "snippet" | "template" | "token" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/zip") return "template";
  if (mime === "text/css") return "token";
  return "snippet";
}

/**
 * Storage keys must not contain path separators beyond the ones we add, or a
 * crafted filename could write outside the user's folder.
 */
function safeName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  return (
    base
      .normalize("NFKD")
      .replace(/[^\w.\- ]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/^[.\-]+/, "")
      .slice(0, 100) || "file"
  );
}

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function unauthorized() {
  return NextResponse.json(
    { error: "not_signed_in", message: "Sign in to manage files." },
    { status: 401 },
  );
}

export async function GET() {
  const { supabase, user } = await currentUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("assets")
    .select("id, type, title, storage_path, meta, is_public, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "read_failed", message: error.message }, { status: 500 });
  }

  // One signing round trip for the whole page rather than one per row.
  const paths = (data ?? []).map((a) => a.storage_path).filter(Boolean) as string[];
  const signed = paths.length
    ? (await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL)).data ?? []
    : [];
  const urlByPath = new Map(signed.map((s) => [s.path, s.signedUrl]));

  return NextResponse.json(
    {
      assets: (data ?? []).map((a) => ({
        ...a,
        url: a.storage_path ? (urlByPath.get(a.storage_path) ?? null) : null,
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await currentUser();
  if (!user) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Expected a multipart form upload." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "bad_request", message: "No file in the `file` field." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "empty_file", message: "That file is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "too_large", message: `Files are limited to ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      { error: "unsupported_type", message: `${mime} files are not accepted.` },
      { status: 415 },
    );
  }

  const title = String(form.get("title") ?? "").trim() || file.name;
  const storagePath = `${user.id}/${Date.now()}-${safeName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: mime, upsert: false });

  if (uploadError) {
    return NextResponse.json(
      { error: "upload_failed", message: uploadError.message },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("assets")
    .insert({
      owner_id: user.id,
      type: assetTypeFor(mime),
      title: title.slice(0, 200),
      storage_path: storagePath,
      is_public: false,
      meta: { mime, size: file.size, original_name: file.name },
    })
    .select("id, type, title, storage_path, meta, is_public, created_at")
    .single();

  if (error) {
    // The object landed but the row did not; drop the orphan so the bucket
    // does not accumulate files nothing points at.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: "record_failed", message: error.message }, { status: 400 });
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  return NextResponse.json(
    { asset: { ...data, url: signed?.signedUrl ?? null } },
    { status: 201 },
  );
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await currentUser();
  if (!user) return unauthorized();

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "bad_request", message: "`id` is required." }, { status: 400 });
  }

  // Read the path first — after the row is gone we could not find the object.
  const { data: asset } = await supabase
    .from("assets")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!asset) {
    return NextResponse.json({ error: "not_found", message: "No such file." }, { status: 404 });
  }

  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "delete_failed", message: error.message }, { status: 400 });
  }

  if (asset.storage_path) {
    await supabase.storage.from(BUCKET).remove([asset.storage_path]);
  }

  return NextResponse.json({ deleted: id });
}
