import "server-only";

import { type DbErrorKind, classifyDbError } from "./errors";
import { prisma } from "./prisma";

export { type DbErrorKind, classifyDbError };

export type DbHealth = { ok: true } | { ok: false; error: string; kind: DbErrorKind };

/** Lightweight connectivity check used by the dashboard and /api/health. */
export async function checkDatabase(): Promise<DbHealth> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error, kind: classifyDbError(error) };
  }
}

/**
 * Verifies the expected schema is present by touching a core table. Connectivity
 * can succeed (`SELECT 1`) while tables are still missing because
 * `npm run db:push` was never run against the database — this catches that case
 * so `/api/health` reports it instead of a misleading `ok`.
 */
export async function checkSchema(): Promise<DbHealth> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "OrganizationMember" LIMIT 1`;
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error, kind: classifyDbError(error) };
  }
}
