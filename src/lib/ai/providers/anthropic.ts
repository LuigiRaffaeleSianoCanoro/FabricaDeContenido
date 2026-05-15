import type { TextGenerationParams, TextGenerationResult } from "../types";
import { BaseProvider } from "./base";

export class AnthropicProvider extends BaseProvider {
  readonly providerId = "anthropic" as const;
  readonly providerName = "Anthropic";

  constructor(
    private readonly apiKey: string,
    private readonly options: { baseUrl?: string } = {},
  ) {
    super();
  }

  protected async chatCompletion(params: TextGenerationParams): Promise<TextGenerationResult> {
    const url = `${this.options.baseUrl ?? "https://api.anthropic.com/v1"}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: params.maxTokens ?? 1024,
        temperature: params.temperature ?? 0.7,
        system: params.systemPrompt,
        messages: [{ role: "user", content: params.userPrompt }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      model: string;
      content: { type: string; text?: string }[];
      stop_reason?: string;
      usage?: { input_tokens: number; output_tokens: number };
    };

    const text = data.content.map((c) => c.text ?? "").join("");

    return {
      content: text,
      usage: {
        promptTokens: data.usage?.input_tokens ?? 0,
        completionTokens: data.usage?.output_tokens ?? 0,
        totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      },
      model: data.model,
      finishReason: data.stop_reason ?? "unknown",
    };
  }
}
