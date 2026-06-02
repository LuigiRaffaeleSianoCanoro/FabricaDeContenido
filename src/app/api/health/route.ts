import { NextResponse } from "next/server";

import { checkDatabase } from "@/lib/db/health";

export const dynamic = "force-dynamic";

/**
 * Diagnostics endpoint. Reports whether the app can reach the database and which
 * env vars are present (booleans only — never values). Useful to debug deploys.
 */
export async function GET() {
  const db = await checkDatabase();
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
    ENCRYPTION_MASTER_KEY: Boolean(process.env.ENCRYPTION_MASTER_KEY),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };
  return NextResponse.json({ ok: db.ok, db, env }, { status: db.ok ? 200 : 503 });
}
