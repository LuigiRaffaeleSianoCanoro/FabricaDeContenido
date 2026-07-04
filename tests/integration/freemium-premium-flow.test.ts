/**
 * End-to-end (service level) test of the freemium → premium journey:
 *
 * 1. FREE org without keys can't generate (BYOK required on freemium).
 * 2. Saving a CUSTOM BYOK key (any OpenAI-compatible endpoint) enables generation.
 * 3. Skills actually run through the custom adapter against a local mock server.
 * 4. Exhausting the FREE text quota blocks further generations.
 * 5. Upgrading to PRO without any tenant key switches to the platform AI and
 *    consumes agent credits; running out of credits blocks the platform path.
 *
 * Requires the `fabrica_test` Postgres database (see tests/README.md); skips
 * gracefully when unavailable. The AI provider is a local mock — no real keys.
 */
import http from "node:http";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PLANS } from "@/lib/billing/plans";
import { encryptSecret, fingerprintSecret } from "@/lib/encryption/cipher";
import { prisma } from "@/lib/db/prisma";
import { AiUnavailableError, resolveAiForOrg } from "@/services/ai-resolver";
import {
  USAGE_METRICS,
  checkTextQuota,
  getMonthlyUsage,
  getOrgBillingSnapshot,
  recordGenerationUsage,
  recordUsage,
} from "@/services/usage";
import { getSkill } from "@/skills/registry";

const HOOKS_JSON = JSON.stringify({
  hooks: ["Hook uno", "Hook dos", "Hook tres"],
});

// Fixed port so the platform AI env can be set before getServerEnv() caches.
const MOCK_PORT = 41414;
const baseUrl = `http://localhost:${MOCK_PORT}/v1`;

// Platform AI config (premium plans). Set at module load — getServerEnv() caches
// on first call, which happens inside the tests. FREE orgs still can't use it.
process.env.PLATFORM_AI_PROVIDER = "custom";
process.env.PLATFORM_AI_API_KEY = "platform-secret-456";
process.env.PLATFORM_AI_BASE_URL = baseUrl;
process.env.PLATFORM_AI_MODEL = "mock-model-1";

let dbAvailable = false;
let server: http.Server;
let userId = "";
let orgId = "";
const requestLog: { auth: string }[] = [];

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
    return;
  }

  // Local OpenAI-compatible mock (stands in for "any possible AI provider").
  server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url?.includes("/chat/completions")) {
      requestLog.push({ auth: String(req.headers.authorization ?? "") });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          model: "mock-model-1",
          choices: [{ message: { content: HOOKS_JSON }, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
      );
      return;
    }
    res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(MOCK_PORT, resolve));

  const stamp = Date.now();
  userId = `user_flow_${stamp}`;
  await prisma.userProfile.create({
    data: { id: userId, email: `flow-test-${stamp}@example.com` },
  });
  const org = await prisma.organization.create({
    data: {
      name: "Flow Test Org",
      slug: `flow-test-${stamp}`,
      ownerId: userId,
      members: { create: { userId, role: "OWNER" } },
    },
  });
  orgId = org.id;
});

afterAll(async () => {
  server?.close();
  if (!dbAvailable) return;
  await prisma.usageRecord.deleteMany({ where: { organizationId: orgId } });
  await prisma.encryptedApiKey.deleteMany({ where: { organizationId: orgId } });
  await prisma.organization.deleteMany({ where: { id: orgId } });
  await prisma.userProfile.deleteMany({ where: { id: userId } });
  await prisma.$disconnect();
});

describe.sequential("freemium → premium flow (integration)", () => {
  it("FREE org without keys cannot generate: BYOK is required on freemium", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    await expect(resolveAiForOrg(orgId, "text")).rejects.toMatchObject({
      name: "AiUnavailableError",
      code: "no_key",
    });
  });

  it("a CUSTOM BYOK key (any OpenAI-compatible endpoint) unlocks generation", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    const masterKey = process.env.ENCRYPTION_MASTER_KEY!;
    const enc = encryptSecret("byok-secret-123", masterKey);
    await prisma.encryptedApiKey.create({
      data: {
        organizationId: orgId,
        provider: "CUSTOM",
        label: "Mock AI Inc",
        encryptedPayload: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        keyFingerprint: fingerprintSecret("byok-secret-123"),
        metadata: { baseUrl, model: "mock-model-1" },
      },
    });

    const resolved = await resolveAiForOrg(orgId, "text");
    expect(resolved.source).toBe("byok");
    expect(resolved.provider).toBe("custom");
    expect(resolved.ai.providerName).toBe("Mock AI Inc");
    expect(resolved.ai.defaultModel).toBe("mock-model-1");

    // Run a real product skill through the adapter against the mock server.
    const skill = getSkill("hook-generator")!;
    const out = (await skill.execute(
      { topic: "autopiloto de contenido", platform: "instagram", count: 3 },
      { organizationId: orgId, jobId: "test-job", ai: resolved.ai, log: async () => {} },
    )) as { hooks: string[] };
    expect(out.hooks).toHaveLength(3);

    // The mock server saw the decrypted tenant key, proving true BYOK flow.
    expect(requestLog.at(-1)?.auth).toBe("Bearer byok-secret-123");

    await recordGenerationUsage({ organizationId: orgId, action: "text", source: "byok" });
    const usage = await getMonthlyUsage(orgId);
    expect(usage.textGenerations).toBe(1);
    expect(usage.agentCreditsUsed).toBe(0); // BYOK never consumes credits
  });

  it("exhausting the FREE text quota blocks generation with an upgrade CTA", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    const usage = await getMonthlyUsage(orgId);
    await recordUsage({
      organizationId: orgId,
      metric: USAGE_METRICS.textGeneration,
      quantity: PLANS.FREE.monthlyTextGenerations! - usage.textGenerations,
    });

    const quota = await checkTextQuota(orgId);
    expect(quota.allowed).toBe(false);
    expect(quota.reason).toMatch(/Facturación/);
  });

  it("PRO without tenant keys uses the platform AI and consumes credits", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    await prisma.organization.update({ where: { id: orgId }, data: { plan: "PRO" } });
    await prisma.encryptedApiKey.updateMany({
      where: { organizationId: orgId },
      data: { isActive: false, revokedAt: new Date() },
    });

    const resolved = await resolveAiForOrg(orgId, "text");
    expect(resolved.source).toBe("platform");

    const skill = getSkill("hook-generator")!;
    const out = (await skill.execute(
      { topic: "premium agente", platform: "tiktok", count: 3 },
      { organizationId: orgId, jobId: "test-job-2", ai: resolved.ai, log: async () => {} },
    )) as { hooks: string[] };
    expect(out.hooks.length).toBeGreaterThan(0);

    // Platform generations use OUR key, not a tenant key.
    expect(requestLog.at(-1)?.auth).toBe("Bearer platform-secret-456");

    await recordGenerationUsage({ organizationId: orgId, action: "video", source: "platform" });
    const snapshot = await getOrgBillingSnapshot(orgId);
    expect(snapshot.plan.id).toBe("PRO");
    expect(snapshot.usage.agentCreditsUsed).toBe(5); // video = 5 credits
    expect(snapshot.remainingCredits).toBe(PLANS.PRO.monthlyAgentCredits - 5);
  });

  it("running out of agent credits blocks the platform path", async (ctx) => {
    if (!dbAvailable) return ctx.skip();

    const snapshot = await getOrgBillingSnapshot(orgId);
    await recordUsage({
      organizationId: orgId,
      metric: USAGE_METRICS.agentCredits,
      quantity: snapshot.remainingCredits,
    });

    await expect(resolveAiForOrg(orgId, "text")).rejects.toMatchObject({
      name: "AiUnavailableError",
      code: "no_credits",
    });

    // A bonus top-up (admin) restores access.
    await prisma.organization.update({ where: { id: orgId }, data: { bonusCredits: 10 } });
    const resolved = await resolveAiForOrg(orgId, "text");
    expect(resolved.source).toBe("platform");
  });

  it("AiUnavailableError carries a user-safe Spanish message", () => {
    const err = new AiUnavailableError("no_credits", "mensaje");
    expect(err.code).toBe("no_credits");
    expect(err.message).toBe("mensaje");
  });
});
