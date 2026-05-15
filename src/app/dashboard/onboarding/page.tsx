import { redirect } from "next/navigation";

import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

import { OnboardingWizard } from "./onboarding-wizard";

const AI_PROVIDERS = ["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER"] as const;

export default async function OnboardingPage() {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);

  const hasAiKey = org
    ? !!(await prisma.encryptedApiKey.findFirst({
        where: {
          organizationId: org.id,
          provider: { in: [...AI_PROVIDERS] },
          isActive: true,
          revokedAt: null,
        },
      }))
    : false;

  const hasContentConfig = org
    ? !!(await prisma.contentConfig.findFirst({
        where: { organizationId: org.id, isDefault: true },
      }))
    : false;

  if (org && hasAiKey && hasContentConfig) {
    redirect("/dashboard");
  }

  let initialStep = 1;
  if (org && !hasAiKey) initialStep = 2;
  else if (org && hasAiKey && !hasContentConfig) initialStep = 3;

  return <OnboardingWizard initialStep={initialStep} initialOrgId={org?.id ?? null} />;
}
