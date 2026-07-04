import { describe, expect, it } from "vitest";

import { PLANS } from "@/lib/billing/plans";
import {
  canUsePlatformAi,
  checkMemberQuota,
  checkTextGenerationQuota,
  checkVideoRenderQuota,
  monthWindow,
  remainingAgentCredits,
  type MonthlyUsage,
} from "@/lib/billing/quota";

const zeroUsage: MonthlyUsage = {
  textGenerations: 0,
  videoRenders: 0,
  agentCreditsUsed: 0,
};

describe("monthWindow", () => {
  it("returns the UTC calendar month containing the date", () => {
    const { start, end } = monthWindow(new Date("2026-07-15T13:45:00Z"));
    expect(start.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("handles December → January rollover", () => {
    const { start, end } = monthWindow(new Date("2026-12-31T23:59:59Z"));
    expect(start.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("remainingAgentCredits", () => {
  it("adds bonus credits to the plan allowance", () => {
    const usage = { ...zeroUsage, agentCreditsUsed: 100 };
    expect(remainingAgentCredits(PLANS.PRO, usage, 50)).toBe(
      PLANS.PRO.monthlyAgentCredits + 50 - 100,
    );
  });

  it("never goes negative", () => {
    const usage = { ...zeroUsage, agentCreditsUsed: 999999 };
    expect(remainingAgentCredits(PLANS.PRO, usage, 0)).toBe(0);
  });
});

describe("canUsePlatformAi", () => {
  it("is false on BYOK-only plans regardless of credits", () => {
    expect(canUsePlatformAi(PLANS.FREE, zeroUsage, 1000, "text")).toBe(false);
    expect(canUsePlatformAi(PLANS.STARTER, zeroUsage, 1000, "video")).toBe(false);
  });

  it("is true on premium plans with credits remaining", () => {
    expect(canUsePlatformAi(PLANS.PRO, zeroUsage, 0, "text")).toBe(true);
    expect(canUsePlatformAi(PLANS.PRO, zeroUsage, 0, "video")).toBe(true);
  });

  it("is false when credits are exhausted, true again with a bonus top-up", () => {
    const exhausted = { ...zeroUsage, agentCreditsUsed: PLANS.PRO.monthlyAgentCredits };
    expect(canUsePlatformAi(PLANS.PRO, exhausted, 0, "text")).toBe(false);
    expect(canUsePlatformAi(PLANS.PRO, exhausted, 10, "text")).toBe(true);
  });

  it("respects the per-action credit cost (video costs more)", () => {
    // Leave exactly 1 credit: enough for text, not for video.
    const usage = {
      ...zeroUsage,
      agentCreditsUsed: PLANS.PRO.monthlyAgentCredits - 1,
    };
    expect(canUsePlatformAi(PLANS.PRO, usage, 0, "text")).toBe(true);
    expect(canUsePlatformAi(PLANS.PRO, usage, 0, "video")).toBe(false);
  });
});

describe("checkTextGenerationQuota", () => {
  it("allows under the limit and reports remaining", () => {
    const res = checkTextGenerationQuota(PLANS.FREE, { ...zeroUsage, textGenerations: 10 });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(PLANS.FREE.monthlyTextGenerations! - 10);
  });

  it("denies at the limit with an actionable Spanish message", () => {
    const res = checkTextGenerationQuota(PLANS.FREE, {
      ...zeroUsage,
      textGenerations: PLANS.FREE.monthlyTextGenerations!,
    });
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.reason).toMatch(/Facturación/);
  });

  it("treats null limits as unlimited", () => {
    const res = checkTextGenerationQuota(PLANS.ENTERPRISE, {
      ...zeroUsage,
      textGenerations: 1_000_000,
    });
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBeNull();
  });
});

describe("checkVideoRenderQuota", () => {
  it("denies once the monthly video limit is reached", () => {
    const res = checkVideoRenderQuota(PLANS.FREE, {
      ...zeroUsage,
      videoRenders: PLANS.FREE.monthlyVideoRenders!,
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toMatch(/videos/i);
  });
});

describe("checkMemberQuota", () => {
  it("enforces plan member caps", () => {
    expect(checkMemberQuota(PLANS.FREE, PLANS.FREE.maxMembers! - 1).allowed).toBe(true);
    expect(checkMemberQuota(PLANS.FREE, PLANS.FREE.maxMembers!).allowed).toBe(false);
    expect(checkMemberQuota(PLANS.ENTERPRISE, 5000).allowed).toBe(true);
  });
});
