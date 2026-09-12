#!/usr/bin/env node
/**
 * Authenticated end-to-end smoke test against a running server.
 *
 *   npm run build && npm run start      # in one terminal
 *   npm run verify:app                  # in another
 *
 * Where verify-rls.mjs checks the database boundary directly, this exercises
 * the whole stack: it signs a throwaway user in, forges the session cookie
 * exactly as @supabase/ssr writes it, and drives the real HTTP surface —
 * middleware, route handlers, server components — as that user. It is the test
 * that would catch a changed cookie format, a middleware matcher that skips the
 * API, or an account page that renders for the wrong person.
 *
 * Set BASE_URL to point it at a deployment instead of localhost.
 *
 * Requires the secret/service-role key (it creates and deletes the test user),
 * so it runs from a developer machine or CI — never from the app.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./lib/env.mjs";

const { supabaseUrl, anonKey, secretKey, projectRef } = loadEnv();
const admin = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const email = `dal-e2e-${Date.now()}@example.invalid`;
const password = `pw-${Date.now()}-abc`;

const { data: created, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: "E2E Tester" },
});
if (error) {
  console.error("createUser failed:", error.message);
  process.exit(1);
}

const user = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
const { data: signIn, error: signInErr } = await user.auth.signInWithPassword({
  email,
  password,
});
if (signInErr) {
  console.error("signIn failed:", signInErr.message);
  process.exit(1);
}

// Reproduce the cookie @supabase/ssr writes: base64url of the session JSON,
// prefixed with "base64-", under sb-<ref>-auth-token (chunked when large).
const s = signIn.session;
const payload = {
  access_token: s.access_token,
  token_type: s.token_type,
  expires_in: s.expires_in,
  expires_at: s.expires_at,
  refresh_token: s.refresh_token,
  user: s.user,
};
const encoded =
  "base64-" + Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const CHUNK = 3180;
const cookies = [];
if (encoded.length <= CHUNK) {
  cookies.push(`sb-${projectRef}-auth-token=${encoded}`);
} else {
  for (let i = 0, n = 0; i < encoded.length; i += CHUNK, n++) {
    cookies.push(`sb-${projectRef}-auth-token.${n}=${encoded.slice(i, i + CHUNK)}`);
  }
}
const Cookie = cookies.join("; ");

let fails = 0;
async function check(label, fn) {
  try {
    const detail = await fn();
    console.log(`  PASS  ${label}${detail ? `  — ${detail}` : ""}`);
  } catch (e) {
    fails++;
    console.log(`  FAIL  ${label}  — ${e.message}`);
  }
}

const get = (p) => fetch(BASE + p, { headers: { Cookie }, redirect: "manual" });
const post = (p, body) =>
  fetch(BASE + p, {
    method: "POST",
    headers: { Cookie, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

console.log(`\nauthenticated end-to-end as ${email}\n`);

await check("session cookie is accepted (/api/auth/me)", async () => {
  const j = await (await get("/api/auth/me")).json();
  if (!j.signed_in) throw new Error("server did not see the session");
  return `display_name="${j.display_name}"`;
});

await check("/account renders instead of redirecting", async () => {
  const r = await get("/account");
  if (r.status !== 200) throw new Error(`status ${r.status}`);
  const html = await r.text();
  if (!html.includes("Collections")) throw new Error("no collections panel");
  return "profile + collections + files";
});

await check("/settings renders the signed-in form", async () => {
  const r = await get("/settings");
  if (r.status !== 200) throw new Error(`status ${r.status}`);
  const html = await r.text();
  if (!html.includes("Defaults")) throw new Error("no defaults card");
  return "profile + defaults";
});

let collectionId;
await check("create a collection over the API", async () => {
  const r = await post("/api/collections", { action: "create", name: "E2E set" });
  if (r.status !== 201) throw new Error(`status ${r.status}: ${await r.text()}`);
  collectionId = (await r.json()).collection.id;
  return collectionId;
});

await check("save a component into it", async () => {
  const r = await post("/api/collections", {
    action: "toggle",
    collection_id: collectionId,
    slug: "button",
    member: true,
  });
  if (!r.ok) throw new Error(`status ${r.status}: ${await r.text()}`);
  const back = await (await get("/api/collections?slug=button")).json();
  if (!back.member_of.includes(collectionId)) throw new Error("not reflected on read-back");
  return "membership round-trips";
});

await check("remove it again", async () => {
  await post("/api/collections", {
    action: "toggle",
    collection_id: collectionId,
    slug: "button",
    member: false,
  });
  const back = await (await get("/api/collections?slug=button")).json();
  if (back.member_of.includes(collectionId)) throw new Error("still a member");
  return "membership cleared";
});

let templateId;
await check("save a template", async () => {
  const r = await post("/api/templates", {
    name: "E2E template",
    config: { components: ["field", "button"], skin: "aurora" },
  });
  if (r.status !== 201) throw new Error(`status ${r.status}: ${await r.text()}`);
  templateId = (await r.json()).template.id;
  return templateId;
});

await check("list templates back", async () => {
  const j = await (await get("/api/templates")).json();
  if (!j.templates.some((t) => t.id === templateId)) throw new Error("not listed");
  return `${j.templates.length} template(s)`;
});

await check("save preferences and read them back", async () => {
  const r = await fetch(BASE + "/api/preferences", {
    method: "PUT",
    headers: { Cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ default_style: "brut", default_target: "vue" }),
  });
  if (!r.ok) throw new Error(`status ${r.status}`);
  const j = await (await get("/api/preferences")).json();
  if (j.preferences.default_style !== "brut") throw new Error("not persisted");
  return "default_style=brut";
});

await check("preferences reject an invalid style", async () => {
  const r = await fetch(BASE + "/api/preferences", {
    method: "PUT",
    headers: { Cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ default_style: "../../etc/passwd" }),
  });
  if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
  return "rejected with 400";
});

await check("account export returns this user's data", async () => {
  const r = await get("/api/account/export");
  if (!r.ok) throw new Error(`status ${r.status}`);
  const j = await r.json();
  if (j.account.email !== email) throw new Error("wrong account");
  if (!j.templates.length) throw new Error("templates missing from export");
  return `${j.collections.length} collection(s), ${j.templates.length} template(s)`;
});

await check("delete the template", async () => {
  const r = await fetch(`${BASE}/api/templates?id=${templateId}`, {
    method: "DELETE",
    headers: { Cookie },
  });
  if (!r.ok) throw new Error(`status ${r.status}`);
  const j = await (await get("/api/templates")).json();
  if (j.templates.some((t) => t.id === templateId)) throw new Error("still present");
  return "gone";
});

await check("login page redirects an authenticated visitor away", async () => {
  const r = await get("/login");
  if (r.status !== 307) throw new Error(`expected 307, got ${r.status}`);
  return `-> ${r.headers.get("location")}`;
});

await admin.auth.admin.deleteUser(created.user.id);
console.log("\ncleaned up test user");

if (fails) {
  console.error(`\n${fails} check(s) FAILED`);
  process.exit(1);
}
console.log("\nall authenticated checks passed.");
