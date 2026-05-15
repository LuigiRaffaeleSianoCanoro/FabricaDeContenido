import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function writeAuditLog(params: {
  organizationId: string;
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  const metadata = (params.metadata ?? {}) as Prisma.InputJsonValue;

  await prisma.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorUserId: params.actorUserId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata,
    },
  });
}
