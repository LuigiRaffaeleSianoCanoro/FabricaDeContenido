import Link from "next/link";
import { ArrowRight, Clock, Repeat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatScheduleForDisplay } from "@/lib/publishing/schedule";
import { cn } from "@/lib/utils";

export type AutopilotSummaryData = {
  isAutopilotActive: boolean;
  postingSchedule: unknown;
  prompt: string | null;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  updatedAt: Date;
};

/**
 * Surfaces the workspace autopilot config on the dashboard so users can find
 * and edit it after saving — there is no separate "automations list".
 */
export function AutopilotSummary({ config }: { config: AutopilotSummaryData }) {
  const schedule = formatScheduleForDisplay(config.postingSchedule);
  const hasSavedSettings = Boolean(schedule || config.prompt?.trim());

  return (
    <div className="glass gradient-border overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Repeat className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">Autopiloto del workspace</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Una configuración por organización. Editá horarios y prompt desde Automatización.
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={
            config.isAutopilotActive
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          }
        >
          {config.isAutopilotActive ? "Activo" : hasSavedSettings ? "Pausado" : "Sin configurar"}
        </Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Horarios (UTC)</dt>
          <dd className="font-medium">{schedule || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Próxima ejecución</dt>
          <dd className="font-medium">
            {config.nextRunAt ? config.nextRunAt.toLocaleString("es") : "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Prompt maestro</dt>
          <dd className="line-clamp-2 font-medium">
            {config.prompt?.trim() || "Sin prompt — se usan tus temas del onboarding."}
          </dd>
        </div>
        {config.lastRunAt && (
          <div className="flex items-center gap-1.5 text-muted-foreground sm:col-span-2">
            <Clock className="size-3.5" />
            <span>Última ejecución: {config.lastRunAt.toLocaleString("es")}</span>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/automation"
          className={cn(buttonVariants({ size: "lg" }), "orange-glow bg-primary gap-2")}
        >
          {hasSavedSettings ? "Editar automatización" : "Configurar autopiloto"}
          <ArrowRight className="size-4" />
        </Link>
        {!config.isAutopilotActive && hasSavedSettings && (
          <p className="text-xs text-muted-foreground">
            Guardaste ajustes pero el autopiloto está pausado. Activá la casilla al editar.
          </p>
        )}
      </div>
    </div>
  );
}
