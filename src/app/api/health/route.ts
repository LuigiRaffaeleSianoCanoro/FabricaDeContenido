import { NextResponse } from "next/server";

import { checkDatabase, checkSchema, type DbHealth } from "@/lib/db/health";

export const dynamic = "force-dynamic";

/**
 * Diagnostics endpoint. Reports whether the app can reach the database, whether
 * the schema has been applied, and which env vars are present (booleans only —
 * never values). Useful to debug deploys.
 */
export async function GET() {
  const db = await checkDatabase();
  // Only probe the schema once connectivity is confirmed; otherwise the schema
  // error would just echo the connection failure.
  const schema: DbHealth = db.ok
    ? await checkSchema()
    : { ok: false, kind: "unreachable", error: "skipped: database unreachable" };

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
    ENCRYPTION_MASTER_KEY: Boolean(process.env.ENCRYPTION_MASTER_KEY),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };

  const ok = db.ok && schema.ok;
  return NextResponse.json({ ok, db, schema, env }, { status: ok ? 200 : 503 });
}
