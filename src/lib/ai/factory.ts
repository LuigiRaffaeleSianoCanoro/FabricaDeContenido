import type { AIProvider, AIProviderId } from "./types";
import { providerLabel } from "./errors";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { MinimaxProvider } from "./providers/minimax";
import { OpenAIProvider } from "./providers/openai";
import {
  OPENAI_COMPATIBLE_BASE_URLS,
  OpenAICompatibleProvider,
} from "./providers/openai-compatible";
import { OpenRouterProvider } from "./providers/openrouter";

export type AIProviderFactoryOptions = {
  /** Required for "custom"; optional override for the rest. */
  baseUrl?: string;
  /** Per-instance model override (CUSTOM keys, platform AI). */
  defaultModel?: string;
  /** Display name for "custom" providers (e.g. the tenant's service label). */
  displayName?: string;
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
    case "minimax":
      return new MinimaxProvider(apiKey, options);
    case "groq":
    case "mistral":
    case "deepseek":
    case "xai":
    case "together": {
      const baseUrl = options.baseUrl ?? OPENAI_COMPATIBLE_BASE_URLS[providerId];
      if (!baseUrl) throw new Error(`Missing base URL for provider ${providerId}`);
      return new OpenAICompatibleProvider({
        providerId,
        providerName: providerLabel(providerId),
        apiKey,
        baseUrl,
        defaultModel: options.defaultModel,
      });
    }
    case "custom": {
      if (!options.baseUrl) {
        throw new Error(
          "Las claves «Otro» necesitan una URL base compatible con OpenAI. Editá la clave en Ajustes y agregá la URL base.",
        );
      }
      return new OpenAICompatibleProvider({
        providerId: "custom",
        providerName: options.displayName ?? "Proveedor personalizado",
        apiKey,
        baseUrl: options.baseUrl,
        defaultModel: options.defaultModel,
      });
    }
    default: {
      const _: never = providerId;
      return _;
    }
  }
}

export type { AIProvider, AIProviderId } from "./types";
export type { JSONGenerationParams, TextGenerationParams, TextGenerationResult } from "./types";
