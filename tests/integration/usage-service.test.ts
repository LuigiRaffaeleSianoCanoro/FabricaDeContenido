/**
 * Integration tests for the usage/quota service against a real Postgres
 * (`fabrica_test`, see tests/README.md). Skips gracefully when the DB is not
 * reachable so unit-only environments can still run `npm test`.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PLANS } from "@/lib/billing/plans";
import { prisma } from "@/lib/db/prisma";
import {
  USAGE_METRICS,
  checkMembersQuota,
  checkTextQuota,
  checkVideoQuota,
  getMonthlyUsage,
  getOrgBillingSnapshot,
  recordGenerationUsage,
  recordUsage,
} from "@/services/usage";

let dbAvailable = false;
let userId = "";
let orgId = "";

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
    return;
  }

  const stamp = Date.now();
  userId = `user_test_${stamp}`;
  const user = await prisma.userProfile.create({
    data: { id: userId, email: `usage-test-${stamp}@example.com` },
  });
  const org = await prisma.organization.create({
    data: {
      name: "Usage Test Org",
      slug: `usage-test-${stamp}`,
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  orgId = org.id;
});

afterAll(async () => {
  if (!dbAvailable) return;
  await prisma.usageRecord.deleteMany({ where: { organizationId: orgId } });
  await prisma.organization.deleteMany({ where: { id: orgId } });
  await prisma.userProfile.deleteMany({ where: { id: userId } });
  await prisma.$disconnect();
});

describe.sequential("usage service (integration)", () => {
  it("aggregates monthly usage per metric", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    await recordUsage({ organizationId: orgId, metric: USAGE_METRICS.textGeneration });
    await recordUsage({ organizationId: orgId, metric: USAGE_METRICS.textGeneration });
    await recordUsage({ organizationId: orgId, metric: USAGE_METRICS.videoRender });

    const usage = await getMonthlyUsage(orgId);
    expect(usage.textGenerations).toBe(2);
    expect(usage.videoRenders).toBe(1);
    expect(usage.agentCreditsUsed).toBe(0);
  });

  it("BYOK generations never consume agent credits", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    await recordGenerationUsage({ organizationId: orgId, action: "text", source: "byok" });
    const usage = await getMonthlyUsage(orgId);
    expect(usage.textGenerations).toBe(3);
    expect(usage.agentCreditsUsed).toBe(0);
  });

  it("platform generations consume credits (video costs 5)", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    await recordGenerationUsage({ organizationId: orgId, action: "video", source: "platform" });
    const usage = await getMonthlyUsage(orgId);
    expect(usage.videoRenders).toBe(2);
    expect(usage.agentCreditsUsed).toBe(5);
  });

  it("checkTextQuota blocks a FREE org that exhausted its monthly texts", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    const before = await checkTextQuota(orgId);
    expect(before.allowed).toBe(true);

    const usage = await getMonthlyUsage(orgId);
    const missing = PLANS.FREE.monthlyTextGenerations! - usage.textGenerations;
    await recordUsage({
      organizationId: orgId,
      metric: USAGE_METRICS.textGeneration,
      quantity: missing,
    });

    const after = await checkTextQuota(orgId);
    expect(after.allowed).toBe(false);
    expect(after.reason).toMatch(/Facturación/);

    // Video quota is independent and still available.
    const video = await checkVideoQuota(orgId);
    expect(video.allowed).toBe(true);
  });

  it("upgrading the plan unblocks the org and enables credits", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    await prisma.organization.update({
      where: { id: orgId },
      data: { plan: "PRO", bonusCredits: 25 },
    });

    const text = await checkTextQuota(orgId);
    expect(text.allowed).toBe(true);

    const snapshot = await getOrgBillingSnapshot(orgId);
    expect(snapshot.plan.id).toBe("PRO");
    expect(snapshot.bonusCredits).toBe(25);
    // 500 (PRO) + 25 bonus − 5 already consumed by the platform video above.
    expect(snapshot.remainingCredits).toBe(
      PLANS.PRO.monthlyAgentCredits + 25 - snapshot.usage.agentCreditsUsed,
    );
  });

  it("enforces member caps per plan", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    // PRO allows 10 members; the org has 1 → allowed.
    const asPro = await checkMembersQuota(orgId);
    expect(asPro.allowed).toBe(true);

    await prisma.organization.update({ where: { id: orgId }, data: { plan: "FREE" } });
    // FREE allows 2; add one more member to hit the cap.
    const extra = await prisma.userProfile.create({
      data: { id: `${userId}_b`, email: `usage-test-b-${Date.now()}@example.com` },
    });
    await prisma.organizationMember.create({
      data: { organizationId: orgId, userId: extra.id, role: "MEMBER" },
    });

    const atCap = await checkMembersQuota(orgId);
    expect(atCap.allowed).toBe(false);
    expect(atCap.reason).toMatch(/miembros/i);

    await prisma.organizationMember.deleteMany({
      where: { organizationId: orgId, userId: extra.id },
    });
    await prisma.userProfile.delete({ where: { id: extra.id } });
  });
});
