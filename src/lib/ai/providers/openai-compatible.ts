import { AiProviderError, aiErrorFromResponse } from "../errors";
import type { AIProviderId, TextGenerationParams, TextGenerationResult } from "../types";
import { BaseProvider } from "./base";

/**
 * Generic adapter for any OpenAI-compatible Chat Completions API. Powers the
 * Groq/Mistral/DeepSeek/xAI/Together adapters (fixed base URLs) and CUSTOM
 * tenant keys (tenant-provided base URL), plus the platform AI when configured
 * with a custom endpoint.
 */
export class OpenAICompatibleProvider extends BaseProvider {
  readonly providerId: AIProviderId;
  readonly providerName: string;
  readonly defaultModel?: string;

  constructor(
    private readonly config: {
      providerId: AIProviderId;
      providerName: string;
      apiKey: string;
      baseUrl: string;
      defaultModel?: string;
    },
  ) {
    super();
    this.providerId = config.providerId;
    this.providerName = config.providerName;
    this.defaultModel = config.defaultModel;
  }

  protected async chatCompletion(params: TextGenerationParams): Promise<TextGenerationResult> {
    const base = this.config.baseUrl.replace(/\/$/, "");
    const url = `${base}/chat/completions`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: params.model,
          messages: [
            ...(params.systemPrompt
              ? [{ role: "system" as const, content: params.systemPrompt }]
              : []),
            { role: "user" as const, content: params.userPrompt },
          ],
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens,
          ...(params.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });
    } catch (cause) {
      throw new AiProviderError({
        provider: this.providerId,
        code: "network",
        model: params.model,
        detail: String(cause),
        cause,
      });
    }

    if (!res.ok) {
      throw await aiErrorFromResponse(this.providerId, res, params.model);
    }

    const data = (await res.json()) as {
      model?: string;
      choices: { message?: { content?: string }; finish_reason?: string }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";

    return {
      content,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      model: data.model ?? params.model,
      finishReason: choice?.finish_reason ?? "unknown",
    };
  }
}

/** Fixed base URLs for well-known OpenAI-compatible providers. */
export const OPENAI_COMPATIBLE_BASE_URLS: Partial<Record<AIProviderId, string>> = {
  groq: "https://api.groq.com/openai/v1",
  mistral: "https://api.mistral.ai/v1",
  deepseek: "https://api.deepseek.com/v1",
  xai: "https://api.x.ai/v1",
  together: "https://api.together.xyz/v1",
};
