import { describe, expect, it } from "vitest";

import { buildSlideshowHtml } from "@/lib/video/editframe-composition";
import { buildSlideshowRenderGuide } from "@/lib/video/render-guide";
import type { SlideshowPlan } from "@/skills/slideshow-planner/skill";

const samplePlan: SlideshowPlan = {
  title: "Tips de productividad",
  caption: "5 hábitos que cambian tu semana",
  hashtags: ["productividad", "emprendedores"],
  slides: [
    {
      heading: "Empezá temprano",
      body: "Los primeros 90 minutos definen el día.",
      voiceover: "Empezá temprano: los primeros noventa minutos definen tu día.",
      imagePrompt: "sunrise desk minimal",
      durationMs: 4000,
    },
    {
      heading: "Una cosa a la vez",
      body: "El multitasking es un mito.",
      voiceover: "Enfocate en una sola tarea importante.",
      imagePrompt: "focused workspace",
      durationMs: 3500,
    },
  ],
};

describe("buildSlideshowHtml", () => {
  it("produces a HyperFrames-ready HTML document", () => {
    const composition = buildSlideshowHtml(samplePlan, { aspectRatio: "9:16" });

    expect(composition.html).toContain("<!doctype html>");
    expect(composition.html).toContain('data-composition-id="slideshow"');
    expect(composition.html).toContain("window.__timelines.slideshow");
    expect(composition.width).toBe(1080);
    expect(composition.height).toBe(1920);
    expect(composition.durationMs).toBeGreaterThan(0);
  });
});

describe("buildSlideshowRenderGuide", () => {
  it("mentions hyperframes CLI without requiring API keys", () => {
    const composition = buildSlideshowHtml(samplePlan);
    const guide = buildSlideshowRenderGuide(composition, { title: samplePlan.title });

    expect(guide).toContain("HyperFrames");
    expect(guide).toContain("npx hyperframes render");
    expect(guide.toLowerCase()).not.toContain("api key de editframe");
  });
});
