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

const STYLE_BLOCK = `
<style>
  * { box-sizing: border-box; }
  @keyframes ef-fade-up {
    from { opacity: 0; transform: translateY(48px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ef-kenburns {
    from { transform: scale(1.05); }
    to   { transform: scale(1.18); }
  }
  @keyframes ef-progress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .ef-slide-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .ef-scrim { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
  .ef-stack { position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 28px; padding: 9% 8%; text-align: center; }
  .ef-heading { color: #fff; font-weight: 800; line-height: 1.05;
    font-size: clamp(48px, 7vw, 120px); letter-spacing: -0.02em;
    text-shadow: 0 6px 30px rgba(0,0,0,0.45); }
  .ef-body { color: rgba(255,255,255,0.88); font-weight: 500; line-height: 1.3;
    font-size: clamp(26px, 3.2vw, 52px); max-width: 90%;
    text-shadow: 0 4px 18px rgba(0,0,0,0.4); }
  .ef-progress-track { position: absolute; left: 0; right: 0; bottom: 0; height: 12px;
    background: rgba(255,255,255,0.15); }
  .ef-progress-fill { height: 100%; transform-origin: left center; }
</style>
`;

function renderSlide(
  slide: SlideshowPlan["slides"][number],
  index: number,
  opts: { accent: string; imageUrl?: string | null; audioUrl?: string | null },
): string {
  const durationSec = Math.max(2.5, Math.min(15, slide.durationMs / 1000));
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const background = opts.imageUrl
    ? `<ef-image src="${escapeAttr(opts.imageUrl)}" class="ef-slide-bg" style="animation: ef-kenburns ${durationSec}s ease-out both"></ef-image>`
    : `<div class="ef-slide-bg" style="background:${gradient}"></div>`;

  const body = slide.body?.trim()
    ? `<div class="ef-body" style="animation: ef-fade-up 0.8s ease-out 0.25s both">${escapeHtml(slide.body)}</div>`
    : "";

  const audio = opts.audioUrl
    ? `<ef-audio src="${escapeAttr(opts.audioUrl)}"></ef-audio>`
    : "";

  return `
    <ef-timegroup mode="fixed" duration="${durationSec}s" class="absolute w-full h-full overflow-hidden">
      ${background}
      <div class="ef-scrim"></div>
      <div class="ef-stack">
        <div class="ef-heading" style="animation: ef-fade-up 0.8s ease-out both">${escapeHtml(slide.heading)}</div>
        ${body}
      </div>
      <div class="ef-progress-track">
        <div class="ef-progress-fill" style="background:${opts.accent}; animation: ef-progress ${durationSec}s linear both"></div>
      </div>
      ${audio}
    </ef-timegroup>`;
}

/**
 * Builds an Editframe HTML composition (using ef-* web components) from a slideshow plan.
 * Pure function — safe to import on both server and client.
 */
export function buildSlideshowHtml(
  plan: SlideshowPlan,
  opts: BuildSlideshowOptions = {},
): SlideshowComposition {
  const { width, height } = resolveDimensions(opts.aspectRatio);
  const fps = opts.fps ?? 30;
  const accent = opts.accent ?? "#f97316";

  const slidesHtml = plan.slides
    .map((slide, i) =>
      renderSlide(slide, i, {
        accent,
        imageUrl: opts.fallbackImageUrls?.[i] ?? undefined,
        audioUrl: opts.slideAudioUrls?.[i] ?? undefined,
      }),
    )
    .join("\n");

  const audioHtml = opts.audioUrl
    ? `<ef-audio src="${escapeAttr(opts.audioUrl)}"></ef-audio>`
    : "";

  const durationMs = plan.slides.reduce(
    (sum, s) => sum + Math.max(2500, Math.min(15000, s.durationMs)),
    0,
  );

  const html = `${STYLE_BLOCK}
<ef-timegroup mode="contain" class="w-[${width}px] h-[${height}px] bg-[#0a0a0a]" style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;">
  <ef-timegroup mode="sequence" class="absolute w-full h-full">
${slidesHtml}
  </ef-timegroup>
  ${audioHtml}
</ef-timegroup>`;

  return { html, width, height, fps, durationMs };
}
