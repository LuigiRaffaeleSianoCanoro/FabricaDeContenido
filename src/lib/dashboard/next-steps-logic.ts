export type NextStepsState = {
  channelsSynced: boolean;
  hasContent: boolean;
  contentInProgress: boolean;
  autopilotActive: boolean;
  pendingApproval: number;
};

export type NextStepDefinition = {
  id: "channels" | "content" | "autopilot" | "approval";
  done: boolean;
  inProgress?: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
  badge?: string;
};

/**
 * Pure builder for the checklist items shown in the UI.
 * Keeps presentation logic testable without hitting the database.
 */
export function buildNextSteps(state: NextStepsState): NextStepDefinition[] {
  const steps: NextStepDefinition[] = [
    {
      id: "channels",
      done: state.channelsSynced,
      title: "Conectá tus canales de Buffer",
      description: "Sincronizá las redes donde vas a publicar.",
      href: "/dashboard/settings",
      cta: state.channelsSynced ? "Administrar" : "Sincronizar",
    },
    {
      id: "content",
      done: state.hasContent,
      ...( !state.hasContent && state.contentInProgress ? { inProgress: true as const } : {}),
      title: "Creá tu primer slideshow",
      description: state.contentInProgress
        ? "Tu slideshow se está generando. Actualizamos el panel cuando termine."
        : "Describí un tema y generá un video con IA.",
      href: "/dashboard/studio",
      cta: state.hasContent ? "Crear otro" : state.contentInProgress ? "Ver trabajos" : "Ir al Studio",
    },
    {
      id: "autopilot",
      done: state.autopilotActive,
      title: "Activá el autopiloto",
      description: "Definí horarios y publicá en automático.",
      href: "/dashboard/automation",
      cta: state.autopilotActive ? "Ajustar" : "Configurar",
    },
  ];

  if (state.pendingApproval > 0) {
    steps.push({
      id: "approval",
      done: false,
      title: "Revisá contenido pendiente",
      description: "Tenés contenido esperando tu aprobación.",
      href: "/dashboard/content",
      cta: "Revisar",
      badge: String(state.pendingApproval),
    });
  }

  return sortNextSteps(steps);
}

export function sortNextSteps(steps: NextStepDefinition[]): NextStepDefinition[] {
  return [...steps].sort((a, b) => {
    const rank = (step: NextStepDefinition) => {
      if (step.done) return 2;
      if (step.inProgress) return 0;
      return 1;
    };
    return rank(a) - rank(b);
  });
}

export function isNextStepsComplete(state: NextStepsState): boolean {
  return (
    state.channelsSynced &&
    state.hasContent &&
    state.autopilotActive &&
    state.pendingApproval === 0
  );
}
