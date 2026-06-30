import { describe, expect, it } from "vitest";

import { buildAutopilotIdempotencyKey } from "@/lib/inngest/idempotency";
import { resolveAutopilotSlotStart } from "@/lib/publishing/schedule";
import { mapBufferPostStatus } from "@/lib/publishing/reconcile-buffer";

describe("buildAutopilotIdempotencyKey", () => {
  it("builds deterministic key from config and slot", () => {
    const slot = new Date("2026-06-29T09:00:00.000Z");
    expect(buildAutopilotIdempotencyKey("cfg_abc", slot)).toBe(
      "autopilot:cfg_abc:2026-06-29T09:00:00.000Z",
    );
  });
});

describe("resolveAutopilotSlotStart", () => {
  it("uses nextRunAt when due", () => {
    const now = new Date("2026-06-29T10:00:00.000Z");
    const nextRunAt = new Date("2026-06-29T09:00:00.000Z");
    expect(resolveAutopilotSlotStart(nextRunAt, ["09:00", "18:00"], now)).toEqual(nextRunAt);
  });

  it("finds most recent past slot when nextRunAt is null", () => {
    const now = new Date("2026-06-29T10:30:00.000Z");
    const slot = resolveAutopilotSlotStart(null, ["09:00", "18:00"], now);
    expect(slot.toISOString()).toBe("2026-06-29T09:00:00.000Z");
  });
});

describe("mapBufferPostStatus", () => {
  it("maps published-like statuses", () => {
    expect(mapBufferPostStatus("sent")).toBe("PUBLISHED");
    expect(mapBufferPostStatus("Published")).toBe("PUBLISHED");
  });

  it("maps scheduled-like statuses", () => {
    expect(mapBufferPostStatus("scheduled")).toBe("SCHEDULED");
    expect(mapBufferPostStatus("pending")).toBe("SCHEDULED");
  });

  it("maps failure statuses", () => {
    expect(mapBufferPostStatus("failed")).toBe("FAILED");
  });
});
