import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { NextStepsState } from "@/lib/dashboard/next-steps-logic";

export type { NextStepsState } from "@/lib/dashboard/next-steps-logic";
export {
  buildNextSteps,
  isNextStepsComplete,
  sortNextSteps,
  type NextStepDefinition,
} from "@/lib/dashboard/next-steps-logic";

/**
 * Loads the real org state that drives the dashboard "Próximos pasos" checklist.
 * All queries run in parallel to avoid waterfalls on the home page.
 */
export async function getNextStepsState(organizationId: string): Promise<NextStepsState> {
  const [
    channelCount,
    contentCount,
    slideshowJobsInProgress,
    pendingApproval,
    defaultConfig,
  ] = await Promise.all([
    prisma.socialAccount.count({
      where: { organizationId, platform: "buffer", isActive: true },
    }),
    prisma.generatedContent.count({ where: { organizationId } }),
    prisma.contentJob.count({
      where: {
        organizationId,
        type: "VIDEO_RENDER",
        status: { in: ["PENDING", "QUEUED", "RUNNING"] },
      },
    }),
    prisma.generatedContent.count({
      where: { organizationId, status: "PENDING_APPROVAL" },
    }),
    prisma.contentConfig.findFirst({
      where: { organizationId, isDefault: true },
      select: { isAutopilotActive: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const hasContent = contentCount > 0;

  return {
    channelsSynced: channelCount > 0,
    hasContent,
    contentInProgress: !hasContent && slideshowJobsInProgress > 0,
    autopilotActive: Boolean(defaultConfig?.isAutopilotActive),
    pendingApproval,
  };
}
