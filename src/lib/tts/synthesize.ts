import "server-only";

import { EdgeTTSProvider } from "./providers/edge";

export { EDGE_VOICES, DEFAULT_VOICE } from "./voices";

export type VoiceClip = {
  audio: Buffer;
  mimeType: string;
  durationMs: number;
};

type WordBoundary = { offset?: number; duration?: number };

/** Edge TTS reports timing in 100-nanosecond units; convert to milliseconds. */
function durationFromSubtitle(subtitle: unknown, fallbackText: string): number {
  if (Array.isArray(subtitle) && subtitle.length > 0) {
    const last = subtitle[subtitle.length - 1] as WordBoundary;
    if (typeof last.offset === "number" && typeof last.duration === "number") {
      return Math.round((last.offset + last.duration) / 10_000);
    }
  }
  // Fallback estimate: ~165 words/min ≈ 360ms/word.
  const words = fallbackText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1200, words * 360);
}

const provider = new EdgeTTSProvider();

/** Synthesizes a single voice clip and computes its duration in ms. */
export async function synthesizeVoice(text: string, voice?: string): Promise<VoiceClip> {
  const result = await provider.generateVoice({ text, voice });
  return {
    audio: result.audio,
    mimeType: result.mimeType || "audio/mpeg",
    durationMs: durationFromSubtitle(result.subtitle, text),
  };
}
