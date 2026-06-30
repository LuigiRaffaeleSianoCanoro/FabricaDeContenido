import type { SlideshowPlan } from "@/skills/slideshow-planner/skill";

export type AspectRatio = "9:16" | "1:1" | "4:5" | "16:9";

export type SlideshowComposition = {
  html: string;
  width: number;
  height: number;
  fps: number;
  durationMs: number;
};

export type BuildSlideshowOptions = {
  aspectRatio?: string;
  fps?: number;
  /** Optional voiceover/music track played across the whole slideshow. */
  audioUrl?: string;
  /** Brand accent color (hex) used for progress + highlights. */
  accent?: string;
  /** Background image URL per slide (index-aligned with plan.slides). */
  fallbackImageUrls?: (string | null | undefined)[];
  /** Voiceover audio URL per slide (index-aligned with plan.slides). */
  slideAudioUrls?: (string | null | undefined)[];
};

const DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "16:9": { width: 1920, height: 1080 },
};

export function resolveDimensions(aspectRatio?: string): {
  width: number;
  height: number;
  ratio: AspectRatio;
} {
  const ratio = (aspectRatio as AspectRatio) in DIMENSIONS ? (aspectRatio as AspectRatio) : "9:16";
  return { ...DIMENSIONS[ratio], ratio };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

const GRADIENTS = [
  "linear-gradient(135deg,#1e1b4b,#0f172a)",
  "linear-gradient(135deg,#3b0764,#1e1b4b)",
  "linear-gradient(135deg,#7c2d12,#0f172a)",
  "linear-gradient(135deg,#0c4a6e,#0f172a)",
  "linear-gradient(135deg,#134e4a,#0f172a)",
];

function slideDurationMs(slide: SlideshowPlan["slides"][number]): number {
  return Math.max(2500, Math.min(15000, slide.durationMs));
}

function renderSlideClip(
  slide: SlideshowPlan["slides"][number],
  index: number,
  startSec: number,
  opts: { accent: string; imageUrl?: string | null; audioUrl?: string | null },
): { html: string; gsapLines: string[]; durationSec: number } {
  const durationSec = slideDurationMs(slide) / 1000;
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const slideId = `slide-${index + 1}`;

  const background = opts.imageUrl
    ? `<img class="slide-bg" src="${escapeAttr(opts.imageUrl)}" alt="" />`
    : `<div class="slide-bg" style="background:${gradient}"></div>`;

  const body = slide.body?.trim()
    ? `<div class="slide-body">${escapeHtml(slide.body)}</div>`
    : "";

  const audio = opts.audioUrl
    ? `<audio class="clip" src="${escapeAttr(opts.audioUrl)}" data-start="${startSec}" data-duration="${durationSec}" data-track-index="2" data-volume="1"></audio>`
    : "";

  const html = `
    <div id="${slideId}" class="clip slide" data-start="${startSec}" data-duration="${durationSec}" data-track-index="0">
      ${background}
      <div class="slide-scrim"></div>
      <div class="slide-stack">
        <div class="slide-heading">${escapeHtml(slide.heading)}</div>
        ${body}
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="background:${opts.accent}"></div>
      </div>
      ${audio}
    </div>`;

  const gsapLines = [
    `tl.from("#${slideId} .slide-heading", { opacity: 0, y: 48, duration: 0.8, ease: "power2.out" }, ${startSec});`,
    ...(slide.body?.trim()
      ? [`tl.from("#${slideId} .slide-body", { opacity: 0, y: 48, duration: 0.8, ease: "power2.out" }, ${startSec + 0.25});`]
      : []),
    `tl.fromTo("#${slideId} .progress-fill", { scaleX: 0 }, { scaleX: 1, duration: ${durationSec}, ease: "none" }, ${startSec});`,
    ...(opts.imageUrl
      ? [`tl.fromTo("#${slideId} .slide-bg", { scale: 1.05 }, { scale: 1.18, duration: ${durationSec}, ease: "power1.out" }, ${startSec});`]
      : []),
  ];

  return { html, gsapLines, durationSec };
}

/**
 * Builds a HyperFrames HTML composition from a slideshow plan.
 * Pure function — safe to import on both server and client.
 */
export function buildSlideshowHtml(
  plan: SlideshowPlan,
  opts: BuildSlideshowOptions = {},
): SlideshowComposition {
  const { width, height } = resolveDimensions(opts.aspectRatio);
  const fps = opts.fps ?? 30;
  const accent = opts.accent ?? "#f97316";

  let cursorSec = 0;
  const slideParts: string[] = [];
  const gsapLines: string[] = [];

  for (let i = 0; i < plan.slides.length; i += 1) {
    const slide = plan.slides[i]!;
    const part = renderSlideClip(slide, i, cursorSec, {
      accent,
      imageUrl: opts.fallbackImageUrls?.[i] ?? undefined,
      audioUrl: opts.slideAudioUrls?.[i] ?? undefined,
    });
    slideParts.push(part.html);
    gsapLines.push(...part.gsapLines);
    cursorSec += part.durationSec;
  }

  const totalDurationSec = cursorSec;
  const durationMs = Math.round(totalDurationSec * 1000);

  const globalAudio = opts.audioUrl
    ? `<audio class="clip" src="${escapeAttr(opts.audioUrl)}" data-start="0" data-duration="${totalDurationSec}" data-track-index="2" data-volume="1"></audio>`
    : "";

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=${width}, height=${height}" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: #0a0a0a;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    }
    .slide { position: absolute; inset: 0; overflow: hidden; }
    .slide-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: center center; }
    .slide-scrim { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
    .slide-stack {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 28px; padding: 9% 8%; text-align: center;
    }
    .slide-heading {
      color: #fff; font-weight: 800; line-height: 1.05; font-size: clamp(48px, 7vw, 120px);
      letter-spacing: -0.02em; text-shadow: 0 6px 30px rgba(0,0,0,0.45);
    }
    .slide-body {
      color: rgba(255,255,255,0.88); font-weight: 500; line-height: 1.3;
      font-size: clamp(26px, 3.2vw, 52px); max-width: 90%;
      text-shadow: 0 4px 18px rgba(0,0,0,0.4);
    }
    .progress-track { position: absolute; left: 0; right: 0; bottom: 0; height: 12px; background: rgba(255,255,255,0.15); }
    .progress-fill { height: 100%; transform-origin: left center; transform: scaleX(0); }
  </style>
</head>
<body>
  <div id="root"
    data-composition-id="slideshow"
    data-start="0"
    data-duration="${totalDurationSec}"
    data-width="${width}"
    data-height="${height}">
${slideParts.join("\n")}
    ${globalAudio}
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
${gsapLines.map((l) => `    ${l}`).join("\n")}
    window.__timelines.slideshow = tl;
  </script>
</body>
</html>`;

  return { html, width, height, fps, durationMs };
}
