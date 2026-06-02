import "server-only";

import { prisma } from "./prisma";

export type DbErrorKind = "unreachable" | "schema" | "config" | "unknown";

export type DbHealth = { ok: true } | { ok: false; error: string; kind: DbErrorKind };

function classify(message: string): DbErrorKind {
  const m = message.toLowerCase();
  if (m.includes("environment variable") || m.includes("datasource") || m.includes("database_url")) {
    return "config";
  }
  if (
    m.includes("can't reach") ||
    m.includes("connection") ||
    m.includes("econnrefused") ||
    m.includes("timeout") ||
    m.includes("getaddrinfo")
  ) {
    return "unreachable";
  }
  if (
    m.includes("does not exist") ||
    m.includes("relation") ||
    m.includes("column") ||
    m.includes("p2021") ||
    m.includes("p2022")
  ) {
    return "schema";
  }
  return "unknown";
}

export function describeDbError(e: unknown): { error: string; kind: DbErrorKind } {
  const error = e instanceof Error ? e.message : String(e);
  return { error, kind: classify(error) };
}

/** Connectivity check (SELECT 1). Passes even if tables/columns are missing. */
export async function checkDatabase(): Promise<DbHealth> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (e) {
    const { error, kind } = describeDbError(e);
    return { ok: false, error, kind };
  }
}

/**
 * Schema check: exercises core tables AND a model with recently-added columns
 * (ContentConfig). `findFirst()` issues a SELECT of every column, so a missing
 * column (e.g. when `prisma db push` wasn't re-run after a schema change) fails
 * here even with zero rows. This is the most common cause of post-login crashes.
 */
export async function checkSchema(): Promise<DbHealth> {
  try {
    await prisma.organizationMember.count();
    await prisma.contentConfig.findFirst();
    return { ok: true };
  } catch (e) {
    const { error, kind } = describeDbError(e);
    return { ok: false, error, kind: kind === "unknown" ? "schema" : kind };
  }
}
