import { NextResponse } from "next/server";

import { checkDatabase, checkSchema } from "@/lib/db/health";

export const dynamic = "force-dynamic";

/**
 * Diagnostics endpoint. Reports DB connectivity, whether the schema has been
 * applied (the dashboard's core query), and which env vars are present
 * (booleans only — never values). Useful to debug deploys.
 */
export async function GET() {
  const db = await checkDatabase();
  const schema = db.ok ? await checkSchema() : ({ ok: false, error: "skipped: db unreachable", kind: "unreachable" } as const);
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
    ENCRYPTION_MASTER_KEY: Boolean(process.env.ENCRYPTION_MASTER_KEY),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    INNGEST_EVENT_KEY: Boolean(process.env.INNGEST_EVENT_KEY),
  };
  const ok = db.ok && schema.ok;
  return NextResponse.json({ ok, db, schema, env }, { status: ok ? 200 : 503 });
}
