import { redirect } from "next/navigation";
import Link from "next/link";
import { Repeat, Clock, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireOnboardingComplete } from "@/lib/auth/onboarding-status";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

import { AutomationForm } from "./automation-form";
import { runAutopilotNow } from "./actions";

export default async function AutomationPage() {
  const { userId } = await requireSession();
  await requireOnboardingComplete();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const cfg = await prisma.contentConfig.findFirst({
    where: { organizationId: org.id, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Repeat className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Autopiloto</h1>
            <p className="text-sm text-muted-foreground">
              Configuración única del workspace · {org.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No hay una lista de automatizaciones: guardás horarios y prompt aquí, y el autopiloto
              genera contenido en cada horario programado.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl space-y-6">
        {!cfg ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Primero completa el onboarding para crear tu configuración por defecto.
            </p>
            <Link href="/dashboard/onboarding" className="mt-3 inline-block text-primary underline">
              Ir al onboarding
            </Link>
          </div>
        ) : (
          <>
            <div className="glass animate-scale-in rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  <h2 className="font-semibold">Estado</h2>
                </div>
                <Badge
                  variant="secondary"
                  className={cfg.isAutopilotActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}
                >
                  {cfg.isAutopilotActive ? "Activo" : "Pausado"}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Próxima ejecución</p>
                  <p className="font-medium">
                    {cfg.nextRunAt ? cfg.nextRunAt.toLocaleString("es") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última ejecución</p>
                  <p className="font-medium">
                    {cfg.lastRunAt ? cfg.lastRunAt.toLocaleString("es") : "—"}
                  </p>
                </div>
              </div>
              <form action={runAutopilotNow} className="mt-4">
                <input type="hidden" name="organizationId" value={org.id} />
                <Button type="submit" variant="secondary" className="gap-2">
                  <PlayCircle className="size-4" />
                  Ejecutar ahora
                </Button>
              </form>
            </div>

            <AutomationForm
              key={cfg.updatedAt.toISOString()}
              organizationId={org.id}
              initial={{
                prompt: cfg.prompt ?? "",
                postingSchedule: cfg.postingSchedule,
                timezone: cfg.timezone ?? "",
                imageSource: cfg.imageSource,
                slideCount: cfg.slideCount,
                aspectRatio: cfg.aspectRatio,
                voiceName: cfg.voiceName,
                voiceover: cfg.voiceover,
                requireApproval: cfg.requireApproval,
                autoPost: cfg.autoPost,
                isAutopilotActive: cfg.isAutopilotActive,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
