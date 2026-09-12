/**
 * Shared env loading for the repo's Node scripts.
 *
 * Reads `.env.local` first, then `.env` (first writer wins, matching Next.js
 * precedence), and normalizes the two generations of Supabase key names:
 *
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   <- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   SUPABASE_SERVICE_ROLE_KEY       <- SUPABASE_SECRET_KEY
 *
 * It also derives a Postgres connection string. Supabase's direct host
 * (`db.<ref>.supabase.co`) is IPv6-only on the free tier and fails to resolve
 * on most networks, so the Session-mode pooler (port 5432) is preferred: it
 * speaks the full protocol, which DDL needs, unlike transaction mode (6543).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

function parseDotenv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Free-form fallbacks: the raw `.env` also carries a bare psql URL and a
 *  dashboard-pasted host/port/user/password block. Mine those too. */
function parseLoose(text) {
  const url = text.match(/postgresql:\/\/\S+/)?.[0]?.trim();
  const hosts = [...text.matchAll(/^\s*host=(\S+)/gm)].map((m) => m[1].trim());
  const ports = [...text.matchAll(/^\s*port=(\S+)/gm)].map((m) => m[1].trim());
  const users = [...text.matchAll(/^\s*user=(\S+)/gm)].map((m) => m[1].trim());
  const password = text.match(/^\s*password=(\S+)/m)?.[1]?.trim();
  return { url, hosts, ports, users, password };
}

export function loadEnv(cwd = process.cwd()) {
  const files = [".env.local", ".env"].map((f) => path.join(cwd, f));
  const env = { ...process.env };
  let loose = { hosts: [], ports: [], users: [] };

  for (const file of files) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const [k, v] of Object.entries(parseDotenv(text))) {
      if (env[k] === undefined || env[k] === "") env[k] = v;
    }
    const l = parseLoose(text);
    loose = {
      url: loose.url ?? l.url,
      hosts: loose.hosts.length ? loose.hosts : l.hosts,
      ports: loose.ports.length ? loose.ports : l.ports,
      users: loose.users.length ? loose.users : l.users,
      password: loose.password ?? l.password,
    };
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "";
  const anonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    "";
  const secretKey =
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "";
  const projectRef = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\./)?.[1] ?? "";

  return {
    env,
    supabaseUrl,
    anonKey,
    secretKey,
    projectRef,
    databaseUrl: resolveDatabaseUrl(env, loose),
  };
}

function resolveDatabaseUrl(env, loose) {
  if (env.SUPABASE_DB_URL) return env.SUPABASE_DB_URL;
  if (env.DATABASE_URL) return env.DATABASE_URL;

  // Prefer a pooler host from the pasted connection block, forced to session
  // mode (5432) so DDL and multi-statement transactions work.
  const poolerIndex = loose.hosts.findIndex((h) => h.includes("pooler."));
  if (poolerIndex !== -1 && loose.password) {
    const host = loose.hosts[poolerIndex];
    const user = loose.users[poolerIndex];
    return `postgresql://${user}:${encodeURIComponent(loose.password)}@${host}:5432/postgres`;
  }

  return loose.url ?? "";
}

/** node-postgres client options. Supabase terminates TLS at the pooler with a
 *  cert chain Node doesn't ship, so verification is relaxed for this hop. */
export function pgConfig(databaseUrl) {
  return {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
    statement_timeout: 120000,
  };
}
