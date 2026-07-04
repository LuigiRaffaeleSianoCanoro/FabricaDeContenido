import { describe, expect, it } from "vitest";

import {
  AGENT_CREDIT_COSTS,
  PLANS,
  PLAN_ORDER,
  getPlan,
} from "@/lib/billing/plans";

describe("plan catalog", () => {
  it("exposes the four plans in upgrade order", () => {
    expect(PLAN_ORDER).toEqual(["FREE", "STARTER", "PRO", "ENTERPRISE"]);
    for (const id of PLAN_ORDER) {
      expect(PLANS[id].id).toBe(id);
    }
  });

  it("FREE is the freemium BYOK plan: $0, no platform AI, finite limits", () => {
    const free = PLANS.FREE;
    expect(free.priceMonthlyUsd).toBe(0);
    expect(free.platformAiIncluded).toBe(false);
    expect(free.monthlyAgentCredits).toBe(0);
    expect(free.monthlyTextGenerations).toBeGreaterThan(0);
    expect(free.monthlyVideoRenders).toBeGreaterThan(0);
  });

  it("PRO is the premium agent plan: platform AI + credits included", () => {
    const pro = PLANS.PRO;
    expect(pro.platformAiIncluded).toBe(true);
    expect(pro.monthlyAgentCredits).toBeGreaterThan(0);
    expect(pro.priceMonthlyUsd).toBeGreaterThan(0);
  });

  it("ENTERPRISE has unlimited generation quotas", () => {
    expect(PLANS.ENTERPRISE.monthlyTextGenerations).toBeNull();
    expect(PLANS.ENTERPRISE.monthlyVideoRenders).toBeNull();
    expect(PLANS.ENTERPRISE.maxMembers).toBeNull();
  });

  it("limits grow monotonically from FREE to PRO", () => {
    expect(PLANS.STARTER.monthlyTextGenerations!).toBeGreaterThan(
      PLANS.FREE.monthlyTextGenerations!,
    );
    expect(PLANS.PRO.monthlyTextGenerations!).toBeGreaterThan(
      PLANS.STARTER.monthlyTextGenerations!,
    );
    expect(PLANS.PRO.monthlyVideoRenders!).toBeGreaterThan(PLANS.STARTER.monthlyVideoRenders!);
  });

  it("getPlan falls back to FREE for unknown or missing plan ids", () => {
    expect(getPlan(null).id).toBe("FREE");
    expect(getPlan(undefined).id).toBe("FREE");
    expect(getPlan("NOPE").id).toBe("FREE");
    expect(getPlan("PRO").id).toBe("PRO");
  });

  it("video generations cost more credits than text", () => {
    expect(AGENT_CREDIT_COSTS.video).toBeGreaterThan(AGENT_CREDIT_COSTS.text);
  });
});
