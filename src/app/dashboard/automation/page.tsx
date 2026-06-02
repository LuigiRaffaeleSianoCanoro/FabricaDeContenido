import { redirect } from "next/navigation";
import Link from "next/link";
import { Repeat, Clock, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";
import { EDGE_VOICES, DEFAULT_VOICE } from "@/lib/tts/voices";

import { runAutopilotNow, saveAutomationSettings } from "./actions";

function scheduleToText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string").join(", ");
  }
  return "";
}

export default async function AutomationPage() {
  const { userId } = await requireSession();
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
              Genera y publica slideshows automáticamente · {org.name}
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

            <form action={saveAutomationSettings} className="glass animate-scale-in space-y-4 rounded-2xl p-6">
              <input type="hidden" name="organizationId" value={org.id} />

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt maestro</Label>
                <textarea
                  id="prompt"
                  name="prompt"
                  rows={4}
                  defaultValue={cfg.prompt ?? ""}
                  placeholder="Describe el contenido recurrente que quieres generar automáticamente."
                  className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Si lo dejas vacío, se usarán tus temas (`topics`) de la configuración.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Horarios (UTC, coma)</Label>
                  <Input
                    id="schedule"
                    name="schedule"
                    defaultValue={scheduleToText(cfg.postingSchedule)}
                    placeholder="09:00, 18:30"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria (referencia)</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    defaultValue={cfg.timezone ?? ""}
                    placeholder="America/Bogota"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="imageSource">Imágenes</Label>
                  <select
                    id="imageSource"
                    name="imageSource"
                    defaultValue={cfg.imageSource}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
                  >
                    <option value="none">Gradientes</option>
                    <option value="pexels">Stock Pexels</option>
                    <option value="ai">IA (OpenAI)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slideCount">Slides</Label>
                  <Input
                    id="slideCount"
                    name="slideCount"
                    type="number"
                    min={2}
                    max={10}
                    defaultValue={cfg.slideCount}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aspectRatio">Formato</Label>
                  <select
                    id="aspectRatio"
                    name="aspectRatio"
                    defaultValue={cfg.aspectRatio}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
                  >
                    <option value="9:16">9:16</option>
                    <option value="4:5">4:5</option>
                    <option value="1:1">1:1</option>
                    <option value="16:9">16:9</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceName">Voz (Edge TTS)</Label>
                <select
                  id="voiceName"
                  name="voiceName"
                  defaultValue={cfg.voiceName ?? DEFAULT_VOICE}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
                >
                  {EDGE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="voiceover" defaultChecked={cfg.voiceover} className="rounded" />
                  Voz en off
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="requireApproval" defaultChecked={cfg.requireApproval} className="rounded" />
                  Requiere aprobación
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="autoPost" defaultChecked={cfg.autoPost} className="rounded" />
                  Auto-publicar (Buffer)
                </label>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="isAutopilotActive"
                    defaultChecked={cfg.isAutopilotActive}
                    className="rounded"
                  />
                  Activar autopiloto (genera contenido en cada horario, automáticamente)
                </label>
              </div>

              <Button type="submit" className="orange-glow bg-primary">
                Guardar automatización
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
