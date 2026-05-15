import type { TextGenerationParams, TextGenerationResult } from "../types";
import { BaseProvider } from "./base";

export class OpenAIProvider extends BaseProvider {
  readonly providerId = "openai" as const;
  readonly providerName = "OpenAI";

  constructor(
    private readonly apiKey: string,
    private readonly options: { baseUrl?: string } = {},
  ) {
    super();
  }

  protected async chatCompletion(params: TextGenerationParams): Promise<TextGenerationResult> {
    const url = `${this.options.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`;
    const res = await fetch(url, {
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

    if (!res.ok) {
      throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
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
