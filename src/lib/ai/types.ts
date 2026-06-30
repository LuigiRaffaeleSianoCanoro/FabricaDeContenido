export type AIProviderId = "openai" | "anthropic" | "gemini" | "openrouter" | "minimax";

export type TextGenerationParams = {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  /** Hints the provider to constrain output as JSON when supported. */
  jsonMode?: boolean;
};

export type TextGenerationResult = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
};

export type JSONGenerationParams<T> = TextGenerationParams & {
  /** Zod schema or Standard Schema used to validate model output (provider may still return raw JSON). */
  schema: { parse: (data: unknown) => T };
};

export interface AIProvider {
  readonly providerId: AIProviderId;
  readonly providerName: string;

  generateText(params: TextGenerationParams): Promise<TextGenerationResult>;

  /**
   * Asks the model for JSON matching `schema`. Implementations should request JSON-only output
   * and validate with the provided schema (retry logic can be added at the orchestration layer).
   */
  generateJSON<T>(params: JSONGenerationParams<T>): Promise<T>;

  generateStreaming(params: TextGenerationParams): AsyncIterable<string>;
}
