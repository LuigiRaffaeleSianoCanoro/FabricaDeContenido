/**
 * Pure quota/credit arithmetic for the freemium/premium model. All DB access
 * lives in `src/services/usage.ts`; this module stays unit-testable.
 */

import { AGENT_CREDIT_COSTS, type CreditedAction, type PlanEntitlements } from "./plans";

export type MonthlyUsage = {
  textGenerations: number;
  videoRenders: number;
  agentCreditsUsed: number;
};

export type QuotaCheck = {
  allowed: boolean;
  /** User-safe Spanish message explaining the denial. */
  reason?: string;
  /** Remaining units for the requested action (null = unlimited). */
  remaining: number | null;
};

/** Start (inclusive) and end (exclusive) of the UTC calendar month containing `now`. */
export function monthWindow(now: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

/** Agent credits still available this month (plan allowance + bonus − used). */
export function remainingAgentCredits(
  plan: PlanEntitlements,
  usage: MonthlyUsage,
  bonusCredits: number,
): number {
  return Math.max(0, plan.monthlyAgentCredits + bonusCredits - usage.agentCreditsUsed);
}

/** Whether the org can run `action` using the platform AI key (credit-based). */
export function canUsePlatformAi(
  plan: PlanEntitlements,
  usage: MonthlyUsage,
  bonusCredits: number,
  action: CreditedAction,
): boolean {
  if (!plan.platformAiIncluded) return false;
  return remainingAgentCredits(plan, usage, bonusCredits) >= AGENT_CREDIT_COSTS[action];
}

export function checkTextGenerationQuota(
  plan: PlanEntitlements,
  usage: MonthlyUsage,
): QuotaCheck {
  const limit = plan.monthlyTextGenerations;
  if (limit === null) return { allowed: true, remaining: null };
  const remaining = Math.max(0, limit - usage.textGenerations);
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Alcanzaste el límite de ${limit} generaciones de texto de tu plan ${plan.label} este mes. Mejorá tu plan en Facturación para seguir generando.`,
    };
  }
  return { allowed: true, remaining };
}

export function checkVideoRenderQuota(
  plan: PlanEntitlements,
  usage: MonthlyUsage,
): QuotaCheck {
  const limit = plan.monthlyVideoRenders;
  if (limit === null) return { allowed: true, remaining: null };
  const remaining = Math.max(0, limit - usage.videoRenders);
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Alcanzaste el límite de ${limit} videos de tu plan ${plan.label} este mes. Mejorá tu plan en Facturación para seguir creando.`,
    };
  }
  return { allowed: true, remaining };
}

export function checkMemberQuota(
  plan: PlanEntitlements,
  currentMembers: number,
): QuotaCheck {
  const limit = plan.maxMembers;
  if (limit === null) return { allowed: true, remaining: null };
  const remaining = Math.max(0, limit - currentMembers);
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Tu plan ${plan.label} permite hasta ${limit} miembros. Mejorá tu plan en Facturación para invitar a más personas.`,
    };
  }
  return { allowed: true, remaining };
}
