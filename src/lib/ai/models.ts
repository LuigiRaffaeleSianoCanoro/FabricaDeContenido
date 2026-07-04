import type { AIProviderId } from "./types";

/**
 * Default text-generation model per provider, kept in one place so a retired
 * model id only has to be updated once (instead of being duplicated across every
 * skill).
 *
 * NOTE: Anthropic uses a pinned, versioned id rather than a `-latest` alias.
 * The previous default `claude-3-5-haiku-20241022` was retired on 2026-02-19
 * and returned a 404 `not_found_error` on every request; `claude-haiku-4-5-*`
 * is its recommended replacement. Prefer pinned ids for production stability.
 */
export const DEFAULT_TEXT_MODELS: Record<AIProviderId, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
  gemini: "gemini-2.0-flash",
  openrouter: "openai/gpt-4o-mini",
  minimax: "MiniMax-M2.5",
  groq: "llama-3.3-70b-versatile",
  mistral: "mistral-small-latest",
  deepseek: "deepseek-chat",
  xai: "grok-4-fast",
  // CUSTOM keys should set their own model via metadata; this is a last-resort fallback.
  together: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  custom: "gpt-4o-mini",
};

export function defaultTextModel(provider: AIProviderId): string {
  return DEFAULT_TEXT_MODELS[provider] ?? DEFAULT_TEXT_MODELS.openai;
}

/**
 * Model to use for a resolved provider instance: an explicit per-instance
 * override (CUSTOM keys / platform AI) wins over the catalog default.
 */
export function modelForProvider(ai: {
  providerId: AIProviderId;
  defaultModel?: string;
}): string {
  return ai.defaultModel ?? defaultTextModel(ai.providerId);
}
