import "server-only";

import { AGENT_CREDIT_COSTS, getPlan, type CreditedAction } from "@/lib/billing/plans";
import {
  checkMemberQuota,
  checkTextGenerationQuota,
  checkVideoRenderQuota,
  monthWindow,
  remainingAgentCredits,
  type MonthlyUsage,
  type QuotaCheck,
} from "@/lib/billing/quota";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

/** Metric names persisted in UsageRecord (keep stable — used in aggregations). */
export const USAGE_METRICS = {
  textGeneration: "text_generation",
  videoRender: "video_render",
  agentCredits: "agent_credits",
  publish: "publish",
} as const;

export async function recordUsage(params: {
  organizationId: string;
  metric: string;
  quantity?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.usageRecord.create({
    data: {
      organizationId: params.organizationId,
      metric: params.metric,
      quantity: params.quantity ?? 1,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

/**
 * Records the usage produced by one successful generation: the base metric plus
 * agent credits when the platform AI key was used (BYOK never consumes credits).
 */
export async function recordGenerationUsage(params: {
  organizationId: string;
  action: CreditedAction;
  source: "byok" | "platform";
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const metric =
    params.action === "text" ? USAGE_METRICS.textGeneration : USAGE_METRICS.videoRender;
  await recordUsage({
    organizationId: params.organizationId,
    metric,
    metadata: { ...params.metadata, source: params.source },
  });
  if (params.source === "platform") {
    await recordUsage({
      organizationId: params.organizationId,
      metric: USAGE_METRICS.agentCredits,
      quantity: AGENT_CREDIT_COSTS[params.action],
      metadata: { action: params.action },
    });
  }
}

/** Aggregated usage for the current UTC calendar month. */
export async function getMonthlyUsage(
  organizationId: string,
  now: Date = new Date(),
): Promise<MonthlyUsage> {
  const { start, end } = monthWindow(now);
  const rows = await prisma.usageRecord.groupBy({
    by: ["metric"],
    where: {
      organizationId,
      createdAt: { gte: start, lt: end },
      metric: {
        in: [
          USAGE_METRICS.textGeneration,
          USAGE_METRICS.videoRender,
          USAGE_METRICS.agentCredits,
        ],
      },
    },
    _sum: { quantity: true },
  });
  const byMetric = new Map(rows.map((r) => [r.metric, r._sum.quantity ?? 0]));
  return {
    textGenerations: byMetric.get(USAGE_METRICS.textGeneration) ?? 0,
    videoRenders: byMetric.get(USAGE_METRICS.videoRender) ?? 0,
    agentCreditsUsed: byMetric.get(USAGE_METRICS.agentCredits) ?? 0,
  };
}

export type OrgBillingSnapshot = {
  plan: ReturnType<typeof getPlan>;
  bonusCredits: number;
  usage: MonthlyUsage;
  remainingCredits: number;
};

export async function getOrgBillingSnapshot(
  organizationId: string,
  now: Date = new Date(),
): Promise<OrgBillingSnapshot> {
  const [org, usage] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, bonusCredits: true },
    }),
    getMonthlyUsage(organizationId, now),
  ]);
  const plan = getPlan(org?.plan);
  const bonusCredits = org?.bonusCredits ?? 0;
  return {
    plan,
    bonusCredits,
    usage,
    remainingCredits: remainingAgentCredits(plan, usage, bonusCredits),
  };
}

/** Quota gate for starting a text generation (hooks pipeline / previews). */
export async function checkTextQuota(organizationId: string): Promise<QuotaCheck> {
  const snap = await getOrgBillingSnapshot(organizationId);
  return checkTextGenerationQuota(snap.plan, snap.usage);
}

/** Quota gate for starting a slideshow/video render. */
export async function checkVideoQuota(organizationId: string): Promise<QuotaCheck> {
  const snap = await getOrgBillingSnapshot(organizationId);
  return checkVideoRenderQuota(snap.plan, snap.usage);
}

/** Quota gate for adding a member to the organization. */
export async function checkMembersQuota(organizationId: string): Promise<QuotaCheck> {
  const [org, members] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    }),
    prisma.organizationMember.count({ where: { organizationId } }),
  ]);
  return checkMemberQuota(getPlan(org?.plan), members);
}
