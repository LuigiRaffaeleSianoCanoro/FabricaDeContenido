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
  if (m.includes("does not exist") || m.includes("relation") || m.includes("column")) {
    return "schema";
  }
  return "unknown";
}

/** Lightweight connectivity check used by the dashboard and /api/health. */
export async function checkDatabase(): Promise<DbHealth> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error, kind: classify(error) };
  }
}
