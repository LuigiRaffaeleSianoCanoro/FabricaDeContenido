import { AiProviderError, aiErrorFromResponse } from "../errors";
import type { TextGenerationParams, TextGenerationResult } from "../types";
import { BaseProvider } from "./base";

export class MinimaxProvider extends BaseProvider {
  readonly providerId = "minimax" as const;
  readonly providerName = "MiniMax";

  constructor(
    private readonly apiKey: string,
    private readonly options: { baseUrl?: string } = {},
  ) {
    super();
  }

  protected async chatCompletion(params: TextGenerationParams): Promise<TextGenerationResult> {
    const url = `${this.options.baseUrl ?? "https://api.minimax.io/v1"}/chat/completions`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
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
      model: string;
      choices: { message?: { content?: string }; finish_reason?: string }[];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const choice = data.choices[0];
    const content = choice?.message?.content ?? "";

    return {
      content,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      model: data.model,
      finishReason: choice?.finish_reason ?? "unknown",
    };
  }
}
