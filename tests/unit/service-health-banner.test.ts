import { beforeEach, describe, expect, it, vi } from "vitest";

const checkAllServicesHealth = vi.fn();

vi.mock("@/lib/health/services", () => ({
  checkAllServicesHealth: () => checkAllServicesHealth(),
}));

import { ServiceHealthBanner } from "@/components/dashboard/service-health-banner";

const unhealthySnapshot = {
  inngest: { ok: false, configured: false, error: "no key" },
  r2: { ok: false, configured: false, error: "R2 env vars missing" },
  buffer: { ok: true, configured: true },
  pexels: { ok: true, configured: false },
} as const;

describe("ServiceHealthBanner admin gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkAllServicesHealth.mockResolvedValue(unhealthySnapshot);
  });

  it("renders nothing and skips service probes for non-admins", async () => {
    const result = await ServiceHealthBanner({ isPlatformAdmin: false });

    expect(result).toBeNull();
    expect(checkAllServicesHealth).not.toHaveBeenCalled();
  });

  it("renders the warning banner for platform admins when services are unhealthy", async () => {
    const result = await ServiceHealthBanner({ isPlatformAdmin: true });

    expect(result).not.toBeNull();
    expect(checkAllServicesHealth).toHaveBeenCalledTimes(1);
  });
});
