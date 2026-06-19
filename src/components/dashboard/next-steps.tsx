import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Film,
  Repeat,
  Share2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type NextStepsState = {
  channelsSynced: boolean;
  hasContent: boolean;
  autopilotActive: boolean;
  pendingApproval: number;
};

type Step = {
  done: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
  badge?: string;
};

/**
 * Guided "what to do next" checklist shown on the dashboard home once onboarding
 * is complete. Replaces the old static "complete your setup" banner that linked
 * back to onboarding (a dead-end for users who had already finished it).
 */
export function NextSteps({
  channelsSynced,
  hasContent,
  autopilotActive,
  pendingApproval,
}: NextStepsState) {
  const steps: Step[] = [
    {
      done: channelsSynced,
      icon: Share2,
      title: "Conectá tus canales de Buffer",
      description: "Sincronizá las redes donde vas a publicar.",
      href: "/dashboard/settings",
      cta: channelsSynced ? "Administrar" : "Sincronizar",
    },
    {
      done: hasContent,
      icon: Film,
      title: "Creá tu primer slideshow",
      description: "Describí un tema y generá un video con IA.",
      href: "/dashboard/studio",
      cta: hasContent ? "Crear otro" : "Ir al Studio",
    },
    {
      done: autopilotActive,
      icon: Repeat,
      title: "Activá el autopiloto",
      description: "Definí horarios y publicá en automático.",
      href: "/dashboard/automation",
      cta: autopilotActive ? "Ajustar" : "Configurar",
    },
  ];

  if (pendingApproval > 0) {
    steps.push({
      done: false,
      icon: FileText,
      title: "Revisá contenido pendiente",
      description: "Tenés contenido esperando tu aprobación.",
      href: "/dashboard/content",
      cta: "Revisar",
      badge: String(pendingApproval),
    });
  }

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;

  return (
    <div className="glass gradient-border overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Próximos pasos</h3>
          <p className="text-sm text-muted-foreground">
            Completá la configuración para que tu fábrica publique sola.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {completed}/{total} listo
        </span>
      </div>

      <ul className="space-y-2.5">
        {steps.map((step) => (
          <li key={step.href + step.title}>
            <Link
              href={step.href}
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
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
                )}
              >
                {step.done ? <Check className="size-5" /> : <step.icon className="size-5" />}
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
                </div>
                <p className="truncate text-sm text-muted-foreground">{step.description}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {step.cta}
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
