import type { TextGenerationParams, TextGenerationResult } from "../types";
import { BaseProvider } from "./base";

export class GeminiProvider extends BaseProvider {
  readonly providerId = "gemini" as const;
  readonly providerName = "Google Gemini";

  constructor(
    private readonly apiKey: string,
    private readonly options: { baseUrl?: string } = {},
  ) {
    super();
  }

  protected async chatCompletion(params: TextGenerationParams): Promise<TextGenerationResult> {
    const base =
      this.options.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
    const url = `${base}/models/${encodeURIComponent(params.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const parts: { text: string }[] = [];
    if (params.systemPrompt) {
      parts.push({ text: params.systemPrompt });
    }
    parts.push({ text: params.userPrompt });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: params.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens,
          ...(params.jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      candidates?: {
        content?: { parts?: { text?: string }[] };
        finishReason?: string;
      }[];
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };

    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    return {
      content: text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
      model: params.model,
      finishReason: data.candidates?.[0]?.finishReason ?? "unknown",
    };
  }
}
