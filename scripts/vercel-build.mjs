#!/usr/bin/env node
/**
 * Vercel build entrypoint. Applies Prisma schema when DATABASE_URL is available,
 * then runs the standard Next.js production build.
 *
 * Neon pooler URLs cannot run DDL — we prefer DIRECT_DATABASE_URL or derive a
 * direct host by stripping "-pooler" from the pooled connection string.
 */
import { spawnSync } from "node:child_process";

/** @param {string} cmd @param {string[]} args @param {NodeJS.ProcessEnv} [env] */
function run(cmd, args, env = process.env) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  return result.status ?? 1;
}

function migrationDatabaseUrl() {
  const direct = process.env.DIRECT_DATABASE_URL?.trim();
  if (direct) return direct;

  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (url.includes("-pooler.")) {
    const derived = url.replace("-pooler.", ".");
    console.warn(
      "[vercel-build] DATABASE_URL uses a Neon pooler; running db push via direct host.",
    );
    return derived;
  }

  return url;
}

let status = run("npx", ["prisma", "generate"]);
if (status !== 0) process.exit(status);

const migrateUrl = migrationDatabaseUrl();
const buildEnv = { ...process.env };

if (migrateUrl) {
  buildEnv.DATABASE_URL = migrateUrl;

  status = run(
    "npx",
    ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"],
    buildEnv,
  );
  if (status !== 0) {
    const preview = process.env.VERCEL_ENV === "preview";
    console.error(
      "[vercel-build] prisma db push failed. Set DIRECT_DATABASE_URL in Vercel " +
        "(Neon direct connection, no -pooler) or verify DATABASE_URL. See VERCEL.md.",
    );
    if (preview) {
      console.warn(
        "[vercel-build] Preview deploy: continuing with next build despite db push failure.",
      );
    } else {
      process.exit(status);
    }
  } else {
    status = run("npx", ["prisma", "db", "seed"], buildEnv);
    if (status !== 0) {
      const preview = process.env.VERCEL_ENV === "preview";
      console.error("[vercel-build] prisma db seed failed.");
      if (preview) {
        console.warn(
          "[vercel-build] Preview deploy: continuing with next build despite seed failure.",
        );
      } else {
        process.exit(status);
      }
    }
  }
} else {
  console.warn(
    "[vercel-build] DATABASE_URL is not set — skipping db push/seed. " +
      "The Next.js build will continue; configure DATABASE_URL in Vercel for runtime DB access.",
  );
}

status = run("npm", ["run", "build"], process.env);
process.exit(status);
