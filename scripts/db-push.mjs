#!/usr/bin/env node
/**
 * Apply `supabase/migrations/*.sql` to the linked Supabase Postgres.
 *
 * The Supabase CLI is the documented path (`supabase link` + `supabase db
 * push`), but it needs Docker and a global install. This runner is the
 * dependency-light equivalent for environments that have neither: it connects
 * straight to Postgres over the session-mode pooler and applies each migration
 * once, inside a transaction, recording it in `public.schema_migrations`.
 *
 *   node scripts/db-push.mjs            # apply anything not yet applied
 *   node scripts/db-push.mjs --status   # list applied / pending, change nothing
 *   node scripts/db-push.mjs --dry-run  # show what would run
 *
 * Migrations must be idempotent (`create ... if not exists`, guarded policies)
 * so a partially-applied database converges rather than erroring.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import pg from "pg";
import { loadEnv, pgConfig } from "./lib/env.mjs";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

const args = new Set(process.argv.slice(2));
const statusOnly = args.has("--status");
const dryRun = args.has("--dry-run");

function migrations() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((file) => {
      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      return {
        file,
        sql,
        checksum: crypto.createHash("sha256").update(sql).digest("hex").slice(0, 16),
      };
    });
}

async function main() {
  const { databaseUrl, projectRef } = loadEnv();
  if (!databaseUrl) {
    console.error(
      "No database connection string. Set SUPABASE_DB_URL in .env.local\n" +
        "(Supabase dashboard -> Project Settings -> Database -> Connection string -> Session pooler).",
    );
    process.exit(1);
  }

  const client = new pg.Client(pgConfig(databaseUrl));
  await client.connect();
  const host = new URL(databaseUrl).host;
  console.log(`connected: ${host}${projectRef ? `  (project ${projectRef})` : ""}`);

  await client.query(`
    create table if not exists public.schema_migrations (
      version     text primary key,
      checksum    text not null,
      applied_at  timestamptz not null default now()
    );
  `);

  const { rows } = await client.query(
    "select version, checksum from public.schema_migrations",
  );
  const applied = new Map(rows.map((r) => [r.version, r.checksum]));
  const all = migrations();

  if (statusOnly) {
    for (const m of all) {
      const was = applied.get(m.file);
      const state = !was
        ? "PENDING"
        : was === m.checksum
          ? "applied"
          : "applied (FILE CHANGED SINCE)";
      console.log(`  ${state.padEnd(28)} ${m.file}`);
    }
    await client.end();
    return;
  }

  const pending = all.filter((m) => !applied.has(m.file));
  if (pending.length === 0) {
    console.log("nothing to apply — database is up to date.");
    // Still flag drift so an edited-after-apply migration is not silent.
    for (const m of all) {
      if (applied.get(m.file) !== m.checksum) {
        console.warn(`  ! ${m.file} changed since it was applied (re-run needs a new migration file)`);
      }
    }
    await client.end();
    return;
  }

  for (const m of pending) {
    if (dryRun) {
      console.log(`would apply ${m.file} (${m.sql.split(/\r?\n/).length} lines)`);
      continue;
    }
    process.stdout.write(`applying ${m.file} ... `);
    try {
      await client.query("begin");
      await client.query(m.sql);
      await client.query(
        "insert into public.schema_migrations (version, checksum) values ($1, $2) on conflict (version) do update set checksum = excluded.checksum, applied_at = now()",
        [m.file, m.checksum],
      );
      await client.query("commit");
      console.log("ok");
    } catch (err) {
      await client.query("rollback").catch(() => {});
      console.log("FAILED");
      console.error(`\n${m.file}: ${err.message}`);
      if (err.position) {
        const upto = m.sql.slice(0, Number(err.position));
        console.error(`  at line ${upto.split(/\r?\n/).length}`);
      }
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log(`done — ${pending.length} migration(s) applied.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
