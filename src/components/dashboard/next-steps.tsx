import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Film,
  Loader2,
  Repeat,
  Share2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  buildNextSteps,
  isNextStepsComplete,
  type NextStepDefinition,
  type NextStepsState,
} from "@/lib/dashboard/next-steps-logic";

export type { NextStepsState } from "@/lib/dashboard/next-steps-logic";

type Props = NextStepsState;

/**
 * Guided "what to do next" checklist shown on the dashboard home once onboarding
 * is complete. Replaces the old static "complete your setup" banner that linked
 * back to onboarding (a dead-end for users who had already finished it).
 */
export function NextSteps(props: Props) {
  const steps = buildNextSteps(props);
  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = isNextStepsComplete(props);

  if (allDone) {
    return (
      <div
        className="glass gradient-border overflow-hidden rounded-2xl p-5 sm:p-6"
        data-testid="next-steps-complete"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold">¡Configuración completa!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu fábrica está lista. Podés crear contenido en el Studio o dejar que el autopiloto
              publique por vos.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/dashboard/studio"
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Ir al Studio
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/content"
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground"
              >
                Ver contenido
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass gradient-border overflow-hidden rounded-2xl p-5 sm:p-6" data-testid="next-steps">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Próximos pasos</h3>
          <p className="text-sm text-muted-foreground">
            Completá la configuración para que tu fábrica publique sola.
          </p>
        </div>
        <span
          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          data-testid="next-steps-progress"
        >
          {completed}/{total} listo
        </span>
      </div>

      <ul className="space-y-2.5">
        {steps.map((step) => (
          <NextStepRow key={step.id} step={step} />
        ))}
      </ul>
    </div>
  );
}

const stepIcons: Record<NextStepDefinition["id"], LucideIcon> = {
  channels: Share2,
  content: Film,
  autopilot: Repeat,
  approval: FileText,
};

function NextStepRow({ step }: { step: NextStepDefinition }) {
  const Icon = stepIcons[step.id];
  const href = step.inProgress ? "/dashboard/jobs" : step.href;
  const cta = step.inProgress ? "Ver trabajos" : step.cta;

  return (
    <li data-testid={`next-step-${step.id}`} data-done={step.done ? "true" : "false"}>
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 transition-all hover:border-primary/40 hover:bg-primary/5",
          step.done && "opacity-80",
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            step.done
              ? "bg-emerald-500/15 text-emerald-500"
              : step.inProgress
                ? "bg-amber-500/15 text-amber-500"
                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          {step.done ? (
            <Check className="size-5" />
          ) : step.inProgress ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Icon className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={cn("font-medium", step.done && "text-muted-foreground line-through")}>
              {step.title}
            </p>
            {step.badge && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {step.badge}
              </span>
            )}
            {step.inProgress && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                En progreso
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{step.description}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          {cta}
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </li>
  );
}
