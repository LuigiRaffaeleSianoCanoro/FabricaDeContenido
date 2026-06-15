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
