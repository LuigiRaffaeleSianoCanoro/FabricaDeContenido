import "server-only";

import { getServerEnv } from "@/config/env.server";

export function isPlatformAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  let raw: string | undefined;
  try {
    raw = getServerEnv().ADMIN_EMAILS;
  } catch {
    raw = process.env.ADMIN_EMAILS;
  }
  if (!raw?.trim()) return false;
  const allowed = new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
  return allowed.has(email.trim().toLowerCase());
}
