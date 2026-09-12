#!/usr/bin/env node
/**
 * Row-Level Security regression test.
 *
 *   node scripts/verify-rls.mjs
 *
 * RLS is this project's authorization boundary: the API layer deliberately does
 * not re-check ownership, so a policy that silently stops working would expose
 * one user's collections to another with no visible symptom. This script proves
 * the boundary still holds, from the outside, using the same anon key the
 * browser gets.
 *
 * It creates two throwaway users, exercises the positive and negative paths,
 * and deletes them again. Exits non-zero if any assertion fails, so it can gate
 * a deploy.
 *
 * Requires the secret/service-role key (user creation is an admin operation),
 * so it runs from a developer machine or CI — never from the app.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./lib/env.mjs";

const { supabaseUrl, anonKey, secretKey } = loadEnv();

if (!supabaseUrl || !anonKey || !secretKey) {
  console.error(
    "Missing Supabase credentials. Needs NEXT_PUBLIC_SUPABASE_URL, the anon/publishable key, and the service-role/secret key in .env.local.",
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });

let failures = 0;
const created = [];

function check(label, passed, detail = "") {
  const mark = passed ? "PASS" : "FAIL";
  if (!passed) failures++;
  console.log(`  ${mark}  ${label}${detail ? `  — ${detail}` : ""}`);
}

async function makeUser(tag) {
  const email = `dal-rls-${tag}-${Date.now()}@example.invalid`;
  const password = `pw-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `RLS ${tag}` },
  });
  if (error) throw new Error(`could not create test user: ${error.message}`);
  created.push(data.user.id);

  const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`could not sign in test user: ${signInError.message}`);

  return { id: data.user.id, email, client };
}

async function main() {
  console.log(`RLS check against ${supabaseUrl}\n`);

  const alice = await makeUser("alice");
  const bob = await makeUser("bob");
  const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  // --- profile provisioning ------------------------------------------------
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, role")
    .eq("id", alice.id)
    .maybeSingle();
  check(
    "signing up provisions a profiles row",
    Boolean(profile),
    profile ? `role=${profile.role}` : "no row — handle_new_user() trigger missing?",
  );
  check("new users are not admins", profile?.role === "user", `role=${profile?.role}`);

  // --- owner can use their own collections ---------------------------------
  const { data: collection, error: createError } = await alice.client
    .from("collections")
    .insert({ owner_id: alice.id, name: "RLS check" })
    .select()
    .single();
  check("owner can create a collection", !createError, createError?.message);

  const { data: component } = await anon
    .from("components")
    .select("id")
    .limit(1)
    .maybeSingle();
  check("anonymous can read the published catalog", Boolean(component));

  if (collection && component) {
    const { error: itemError } = await alice.client
      .from("collection_items")
      .insert({ collection_id: collection.id, component_id: component.id });
    check("owner can add an item", !itemError, itemError?.message);
  }

  // --- another signed-in user is isolated ----------------------------------
  const { data: bobSees } = await bob.client.from("collections").select("id");
  check(
    "another user cannot read the collection",
    (bobSees ?? []).length === 0,
    `saw ${bobSees?.length ?? 0} row(s)`,
  );

  if (collection) {
    const { error: stealError } = await bob.client
      .from("collections")
      .update({ name: "stolen" })
      .eq("id", collection.id);
    const { data: afterSteal } = await admin
      .from("collections")
      .select("name")
      .eq("id", collection.id)
      .single();
    check(
      "another user cannot rename the collection",
      afterSteal?.name === "RLS check",
      stealError ? `rejected: ${stealError.message}` : `name is now "${afterSteal?.name}"`,
    );

    // Writing a row owned by someone else must be refused outright.
    const { error: forgeError } = await bob.client
      .from("collections")
      .insert({ owner_id: alice.id, name: "forged" });
    check("cannot create a collection owned by someone else", Boolean(forgeError));
  }

  // --- anonymous is locked out of user data --------------------------------
  const { data: anonCollections } = await anon.from("collections").select("id");
  check(
    "anonymous cannot read any collection",
    (anonCollections ?? []).length === 0,
    `saw ${anonCollections?.length ?? 0} row(s)`,
  );

  const { data: anonProfiles } = await anon.from("profiles").select("id");
  check(
    "anonymous cannot read profiles",
    (anonProfiles ?? []).length === 0,
    `saw ${anonProfiles?.length ?? 0} row(s)`,
  );

  // --- privilege escalation ------------------------------------------------
  await alice.client.from("profiles").update({ role: "admin" }).eq("id", alice.id);
  const { data: escalated } = await admin
    .from("profiles")
    .select("role")
    .eq("id", alice.id)
    .single();
  check(
    "a user cannot promote themselves to admin",
    escalated?.role !== "admin",
    `role=${escalated?.role}`,
  );

  // --- draft components stay hidden ----------------------------------------
  const { data: draft } = await admin
    .from("components")
    .insert({ slug: `rls-draft-${Date.now()}`, name: "RLS draft", status: "drafting" })
    .select()
    .single();
  if (draft) {
    const { data: seen } = await anon.from("components").select("id").eq("id", draft.id);
    check(
      "unpublished components are hidden from anonymous readers",
      (seen ?? []).length === 0,
      `saw ${seen?.length ?? 0} row(s)`,
    );
    await admin.from("components").delete().eq("id", draft.id);
  }

  // --- cleanup -------------------------------------------------------------
  for (const id of created) await admin.auth.admin.deleteUser(id);
  console.log(`\ncleaned up ${created.length} test user(s)`);

  if (failures > 0) {
    console.error(`\n${failures} check(s) FAILED — the authorization boundary has a hole.`);
    process.exit(1);
  }
  console.log("\nall checks passed.");
}

main().catch(async (err) => {
  console.error(err);
  for (const id of created) await admin.auth.admin.deleteUser(id).catch(() => {});
  process.exit(1);
});
