import { AiProviderError } from "../errors";
import type {
  AIProvider,
  AIProviderId,
  JSONGenerationParams,
  TextGenerationParams,
  TextGenerationResult,
} from "../types";

export abstract class BaseProvider implements AIProvider {
  abstract readonly providerId: AIProviderId;
  abstract readonly providerName: string;

  protected abstract chatCompletion(
    params: TextGenerationParams,
  ): Promise<TextGenerationResult>;

  async generateText(params: TextGenerationParams): Promise<TextGenerationResult> {
    return this.chatCompletion({ ...params, jsonMode: false });
  }

  async generateJSON<T>(params: JSONGenerationParams<T>): Promise<T> {
    const jsonHint =
      "Respond with JSON only (no markdown fences) that matches the requested structure.";
    const res = await this.chatCompletion({
      ...params,
      jsonMode: true,
      systemPrompt: [params.systemPrompt, jsonHint].filter(Boolean).join("\n\n"),
      userPrompt: params.userPrompt,
    });
    let raw: unknown;
    try {
      raw = JSON.parse(res.content);
    } catch (cause) {
      throw new AiProviderError({
        provider: this.providerId,
        code: "bad_response",
        model: params.model,
        detail: res.content.slice(0, 500),
        cause,
      });
    }

    try {
      return params.schema.parse(raw);
    } catch (cause) {
      throw new AiProviderError({
        provider: this.providerId,
        code: "bad_response",
        model: params.model,
        detail: cause instanceof Error ? cause.message : String(cause),
        cause,
      });
    }
  }

  async *generateStreaming(params: TextGenerationParams): AsyncIterable<string> {
    const full = await this.chatCompletion({ ...params, jsonMode: false });
    yield full.content;
  }
}
