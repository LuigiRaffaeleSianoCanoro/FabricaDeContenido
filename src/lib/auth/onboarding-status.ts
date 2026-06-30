import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { getActiveOrganizationForUser } from "./active-org";
import { requireSession } from "./require-session";

const AI_PROVIDERS = [
  "OPENAI",
  "ANTHROPIC",
  "GEMINI",
  "OPENROUTER",
  "MINIMAX",
  "CUSTOM",
] as const;

export type OnboardingStatus = {
  complete: boolean;
  hasOrg: boolean;
  hasAiKey: boolean;
  hasBuffer: boolean;
  hasConfig: boolean;
  organizationId: string | null;
  /** First incomplete step (1-based) for resuming the wizard. */
  step: number;
};

/**
 * Single source of truth for whether a user has finished the mandatory
 * onboarding (workspace + AI key + Buffer key + content config). Memoized per
 * request so the layout, page guards and the wizard share one set of queries.
 */
export const getOnboardingStatus = cache(
  async (userId: string): Promise<OnboardingStatus> => {
    const org = await getActiveOrganizationForUser(userId);
    if (!org) {
      return {
        complete: false,
        hasOrg: false,
        hasAiKey: false,
        hasBuffer: false,
        hasConfig: false,
        organizationId: null,
        step: 1,
      };
    }

    const [aiKey, bufferKey, config] = await Promise.all([
      prisma.encryptedApiKey.findFirst({
        where: {
          organizationId: org.id,
          provider: { in: [...AI_PROVIDERS] },
          isActive: true,
          revokedAt: null,
        },
        select: { id: true },
      }),
      prisma.encryptedApiKey.findFirst({
        where: {
          organizationId: org.id,
          provider: "BUFFER",
          isActive: true,
          revokedAt: null,
        },
        select: { id: true },
      }),
      prisma.contentConfig.findFirst({
        where: { organizationId: org.id, isDefault: true },
        select: { id: true },
      }),
    ]);

    const hasAiKey = Boolean(aiKey);
    const hasBuffer = Boolean(bufferKey);
    const hasConfig = Boolean(config);

    const step = !hasAiKey ? 2 : !hasBuffer ? 3 : !hasConfig ? 4 : 4;

    return {
      complete: hasAiKey && hasBuffer && hasConfig,
      hasOrg: true,
      hasAiKey,
      hasBuffer,
      hasConfig,
      organizationId: org.id,
      step,
    };
  },
);

/** Redirects to the guided onboarding unless every required step is done. */
export async function requireOnboardingComplete(): Promise<void> {
  const { userId } = await requireSession();
  const status = await getOnboardingStatus(userId);
  if (!status.complete) {
    redirect("/dashboard/onboarding");
  }
}
