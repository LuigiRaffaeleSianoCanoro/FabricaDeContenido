import type { AIProvider, AIProviderId } from "./types";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";
import { OpenRouterProvider } from "./providers/openrouter";

export type AIProviderFactoryOptions = {
  baseUrl?: string;
};

export function createAIProvider(
  providerId: AIProviderId,
  apiKey: string,
  options: AIProviderFactoryOptions = {},
): AIProvider {
  switch (providerId) {
    case "openai":
      return new OpenAIProvider(apiKey, options);
    case "anthropic":
      return new AnthropicProvider(apiKey, options);
    case "gemini":
      return new GeminiProvider(apiKey, options);
    case "openrouter":
      return new OpenRouterProvider(apiKey);
    default: {
      const _: never = providerId;
      return _;
    }
  }
}

export type { AIProvider, AIProviderId } from "./types";
export type { JSONGenerationParams, TextGenerationParams, TextGenerationResult } from "./types";
