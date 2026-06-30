import { describe, expect, it } from "vitest";

import {
  buildNextSteps,
  isNextStepsComplete,
  sortNextSteps,
  type NextStepDefinition,
  type NextStepsState,
} from "@/lib/dashboard/next-steps-logic";

const emptyState: NextStepsState = {
  channelsSynced: false,
  hasContent: false,
  contentInProgress: false,
  autopilotActive: false,
  pendingApproval: 0,
};

describe("buildNextSteps", () => {
  it("returns three core steps when nothing is done", () => {
    const steps = buildNextSteps(emptyState);
    expect(steps).toHaveLength(3);
    expect(steps.every((s) => !s.done)).toBe(true);
    expect(steps.map((s) => s.id)).toEqual(["channels", "content", "autopilot"]);
  });

  it("marks channels step done when Buffer is synced", () => {
    const steps = buildNextSteps({ ...emptyState, channelsSynced: true });
    const channels = steps.find((s) => s.id === "channels");
    expect(channels?.done).toBe(true);
    expect(channels?.cta).toBe("Administrar");
  });

  it("shows content in progress when a slideshow job is running", () => {
    const steps = buildNextSteps({ ...emptyState, contentInProgress: true });
    const content = steps.find((s) => s.id === "content");
    expect(content?.done).toBe(false);
    expect(content?.inProgress).toBe(true);
    expect(content?.description).toMatch(/generando/i);
  });

  it("marks content done when org has generated content", () => {
    const steps = buildNextSteps({ ...emptyState, hasContent: true });
    const content = steps.find((s) => s.id === "content");
    expect(content?.done).toBe(true);
    expect(content?.inProgress).toBeUndefined();
  });

  it("does not show in-progress when content already exists", () => {
    const steps = buildNextSteps({
      ...emptyState,
      hasContent: true,
      contentInProgress: true,
    });
    const content = steps.find((s) => s.id === "content");
    expect(content?.done).toBe(true);
    expect(content?.inProgress).toBeUndefined();
  });

  it("adds approval step when there is pending content", () => {
    const steps = buildNextSteps({ ...emptyState, pendingApproval: 3 });
    expect(steps).toHaveLength(4);
    const approval = steps.find((s) => s.id === "approval");
    expect(approval?.badge).toBe("3");
    expect(approval?.done).toBe(false);
  });

  it("omits approval step when pending count is zero", () => {
    const steps = buildNextSteps({ ...emptyState, pendingApproval: 0 });
    expect(steps.find((s) => s.id === "approval")).toBeUndefined();
  });
});

describe("sortNextSteps", () => {
  it("puts incomplete steps before in-progress and done", () => {
    const steps: NextStepDefinition[] = [
      {
        id: "autopilot",
        done: true,
        title: "Autopilot",
        description: "",
        href: "/dashboard/automation",
        cta: "Ajustar",
      },
      {
        id: "content",
        done: false,
        inProgress: true,
        title: "Content",
        description: "",
        href: "/dashboard/studio",
        cta: "Ver trabajos",
      },
      {
        id: "channels",
        done: false,
        title: "Channels",
        description: "",
        href: "/dashboard/settings",
        cta: "Sincronizar",
      },
    ];

    const sorted = sortNextSteps(steps);
    expect(sorted.map((s) => s.id)).toEqual(["content", "channels", "autopilot"]);
  });
});

describe("isNextStepsComplete", () => {
  it("is false until all core steps and approvals are done", () => {
    expect(isNextStepsComplete(emptyState)).toBe(false);
    expect(
      isNextStepsComplete({
        channelsSynced: true,
        hasContent: true,
        contentInProgress: false,
        autopilotActive: true,
        pendingApproval: 2,
      }),
    ).toBe(false);
  });

  it("is true when everything is configured and nothing pending", () => {
    expect(
      isNextStepsComplete({
        channelsSynced: true,
        hasContent: true,
        contentInProgress: false,
        autopilotActive: true,
        pendingApproval: 0,
      }),
    ).toBe(true);
  });
});
