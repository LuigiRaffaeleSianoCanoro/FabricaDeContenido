import { NextResponse } from "next/server";

import { checkDatabase, checkSchema, type DbHealth } from "@/lib/db/health";
import { checkAllServicesHealth, isCriticalServiceFailure } from "@/lib/health/services";

export const dynamic = "force-dynamic";

/**
 * Diagnostics endpoint. Reports whether the app can reach the database, whether
 * the schema has been applied, dependency services (Inngest, R2, Buffer API,
 * Pexels), and which env vars are present (booleans only — never values).
 */
export async function GET() {
  const db = await checkDatabase();
  const schema: DbHealth = db.ok
    ? await checkSchema()
    : { ok: false, kind: "unreachable", error: "skipped: database unreachable" };

  const encryptionKeyValid = /^[0-9a-fA-F]{64}$/.test(
    process.env.ENCRYPTION_MASTER_KEY ?? "",
  );

  const services = await checkAllServicesHealth();

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
    ENCRYPTION_MASTER_KEY: Boolean(process.env.ENCRYPTION_MASTER_KEY),
    ENCRYPTION_MASTER_KEY_valid: encryptionKeyValid,
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    INNGEST_EVENT_KEY: Boolean(process.env.INNGEST_EVENT_KEY),
    R2_CONFIGURED: Boolean(
      process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME,
    ),
    PEXELS_API_KEY: Boolean(process.env.PEXELS_API_KEY),
  };

  const servicesCriticalFailure = (
    Object.entries(services) as [keyof typeof services, (typeof services)[keyof typeof services]][]
  ).some(([name, health]) => isCriticalServiceFailure(health, name));

  const ok = db.ok && schema.ok && encryptionKeyValid && !servicesCriticalFailure;

  return NextResponse.json({ ok, db, schema, env, services }, { status: ok ? 200 : 503 });
}
