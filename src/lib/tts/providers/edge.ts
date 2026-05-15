import { UniversalEdgeTTS } from "edge-tts-universal";

import type { TTSParams, TTSProvider, TTSResult } from "../types";

export class EdgeTTSProvider implements TTSProvider {
  readonly providerId = "edge-tts-universal";

  async generateVoice(params: TTSParams): Promise<TTSResult> {
    const voice = params.voice ?? "en-US-GuyNeural";
    const tts = new UniversalEdgeTTS(params.text, voice);
    const result = await tts.synthesize();
    const buf = Buffer.from(await result.audio.arrayBuffer());
    return {
      audio: buf,
      mimeType: result.audio.type || "audio/mpeg",
      subtitle: result.subtitle,
    };
  }
}

export function createDefaultTTSProvider(): TTSProvider {
  return new EdgeTTSProvider();
}
