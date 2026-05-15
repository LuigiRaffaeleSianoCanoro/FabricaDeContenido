import "server-only";

import type { MemberRole } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function getOrgMembership(userId: string, organizationId: string) {
  return prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
  });
}

export async function assertOrgRole(
  userId: string,
  organizationId: string,
  allowed: MemberRole[],
): Promise<void> {
  const m = await getOrgMembership(userId, organizationId);
  if (!m || !allowed.includes(m.role)) {
    throw new Error("No tienes permiso para esta acción.");
  }
}

export function roleAtLeast(role: MemberRole, minimum: MemberRole): boolean {
  const order: MemberRole[] = ["VIEWER", "MEMBER", "ADMIN", "OWNER"];
  return order.indexOf(role) >= order.indexOf(minimum);
}
