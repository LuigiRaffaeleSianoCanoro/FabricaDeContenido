import { describe, expect, it } from "vitest";

import { formatScheduleForDisplay } from "@/lib/publishing/schedule";

describe("formatScheduleForDisplay", () => {
  it("formats string slots", () => {
    expect(formatScheduleForDisplay(["09:00", "18:30"])).toBe("09:00, 18:30");
  });

  it("formats object slots", () => {
    expect(formatScheduleForDisplay([{ hour: 9, minute: 0 }, { hour: 18, minute: 30 }])).toBe(
      "09:00, 18:30",
    );
  });

  it("returns empty for invalid input", () => {
    expect(formatScheduleForDisplay(null)).toBe("");
    expect(formatScheduleForDisplay([])).toBe("");
  });
});
