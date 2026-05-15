import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  getActiveOrganizationForUser,
} from "@/lib/auth/active-org";
import { prisma } from "@/lib/db/prisma";

import { OnboardingWizard } from "./onboarding-wizard";

const AI_PROVIDERS = ["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER"] as const;

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const activeOrg = await getActiveOrganizationForUser(user.id);

  let initialStep = 1;
  const initialOrgId: string | null = activeOrg?.id ?? null;

  if (activeOrg) {
    const hasAi = await prisma.encryptedApiKey.findFirst({
      where: {
        organizationId: activeOrg.id,
        provider: { in: [...AI_PROVIDERS] },
        isActive: true,
        revokedAt: null,
      },
    });
    const hasConfig = await prisma.contentConfig.findFirst({
      where: { organizationId: activeOrg.id, isDefault: true },
    });

    if (hasConfig) {
      redirect("/dashboard");
    }
    if (hasAi) {
      initialStep = 3;
    } else {
      initialStep = 2;
    }
  }

  const stepLabels = [
    "Cuenta y organización",
    "Clave de IA",
    "Buffer (opcional)",
    "Preferencias de contenido",
  ];

  const stepDone = [initialStep > 1, initialStep > 2, initialStep > 3, false];

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rocket className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
            <p className="text-sm text-muted-foreground">
              Conecta IA, Buffer y define el tono de tu contenido
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg space-y-6">
        <div className="glass animate-scale-in rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Progreso</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Paso {initialStep} de 4
            </Badge>
          </div>
          <div className="space-y-3">
            {stepLabels.map((label, index) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/30"
              >
                <div className="flex size-8 shrink-0 items-center justify-center">
                  {stepDone[index] ? (
                    <CheckCircle2 className="size-6 text-primary" />
                  ) : (
                    <Circle className="size-6 text-muted-foreground/35" />
                  )}
                </div>
                <span
                  className={
                    index + 1 === initialStep ? "font-medium text-foreground" : "text-muted-foreground"
                  }
                >
                  {index + 1}. {label}
                </span>
                {index + 1 === initialStep && (
                  <Badge className="ml-auto bg-primary text-primary-foreground">Actual</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <OnboardingWizard initialStep={initialStep} initialOrgId={initialOrgId} />
      </div>
    </div>
  );
}
