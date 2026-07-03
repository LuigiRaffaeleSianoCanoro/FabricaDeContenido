/**
 * Single source of truth for the freemium/premium plan catalog.
 *
 * - FREE / STARTER: BYOK-only — the tenant brings their own AI key (any provider).
 * - PRO / ENTERPRISE: "agent usage" premium — the platform AI key is available and
 *   each generation consumes agent credits from the monthly allowance.
 *
 * Pure module (no server deps) so both server code and UI can import it.
 */

export type PlanId = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export type PlanEntitlements = {
  id: PlanId;
  label: string;
  tagline: string;
  /** Monthly price in USD; null = custom pricing (contact sales). */
  priceMonthlyUsd: number | null;
  /** When true the org can generate using the platform's AI key (consumes credits). */
  platformAiIncluded: boolean;
  /** Agent credits included per calendar month (only meaningful when platformAiIncluded). */
  monthlyAgentCredits: number;
  /** Max AI text generations per calendar month (BYOK or platform); null = unlimited. */
  monthlyTextGenerations: number | null;
  /** Max slideshow/video renders per calendar month; null = unlimited. */
  monthlyVideoRenders: number | null;
  /** Max members per organization; null = unlimited. */
  maxMembers: number | null;
};

/** Credits consumed per action when generating with the platform AI key. */
export const AGENT_CREDIT_COSTS = {
  text: 1,
  video: 5,
} as const;

export type CreditedAction = keyof typeof AGENT_CREDIT_COSTS;

export const PLANS: Record<PlanId, PlanEntitlements> = {
  FREE: {
    id: "FREE",
    label: "Freemium",
    tagline: "Traé tus propias keys (BYOK) y probá el autopiloto.",
    priceMonthlyUsd: 0,
    platformAiIncluded: false,
    monthlyAgentCredits: 0,
    monthlyTextGenerations: 40,
    monthlyVideoRenders: 15,
    maxMembers: 2,
  },
  STARTER: {
    id: "STARTER",
    label: "Starter",
    tagline: "BYOK con límites amplios para publicar todos los días.",
    priceMonthlyUsd: 19,
    platformAiIncluded: false,
    monthlyAgentCredits: 0,
    monthlyTextGenerations: 300,
    monthlyVideoRenders: 60,
    maxMembers: 3,
  },
  PRO: {
    id: "PRO",
    label: "Premium Agente",
    tagline: "Sin keys propias: usá la IA de la plataforma con créditos incluidos.",
    priceMonthlyUsd: 49,
    platformAiIncluded: true,
    monthlyAgentCredits: 500,
    monthlyTextGenerations: 1500,
    monthlyVideoRenders: 300,
    maxMembers: 10,
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    label: "Enterprise",
    tagline: "Volumen, soporte y límites a medida para agencias.",
    priceMonthlyUsd: null,
    platformAiIncluded: true,
    monthlyAgentCredits: 5000,
    monthlyTextGenerations: null,
    monthlyVideoRenders: null,
    maxMembers: null,
  },
};

export const PLAN_ORDER: PlanId[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

export function getPlan(planId: string | null | undefined): PlanEntitlements {
  if (planId && planId in PLANS) return PLANS[planId as PlanId];
  return PLANS.FREE;
}
