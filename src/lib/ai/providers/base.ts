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
    const raw = JSON.parse(res.content) as unknown;
    return params.schema.parse(raw);
  }

  async *generateStreaming(params: TextGenerationParams): AsyncIterable<string> {
    const full = await this.chatCompletion({ ...params, jsonMode: false });
    yield full.content;
  }
}
