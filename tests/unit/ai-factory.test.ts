import { describe, expect, it } from "vitest";

import { createAIProvider } from "@/lib/ai/factory";
import { modelForProvider, DEFAULT_TEXT_MODELS, defaultTextModel } from "@/lib/ai/models";
import type { AIProviderId } from "@/lib/ai/types";

const ALL_PROVIDERS: AIProviderId[] = [
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
  "minimax",
  "groq",
  "mistral",
  "deepseek",
  "xai",
  "together",
];

describe("createAIProvider", () => {
  it("creates an adapter for every known provider id", () => {
    for (const id of ALL_PROVIDERS) {
      const provider = createAIProvider(id, "test-key");
      expect(provider.providerId).toBe(id);
      expect(provider.providerName.length).toBeGreaterThan(0);
    }
  });

  it("supports CUSTOM (any OpenAI-compatible endpoint) with a base URL", () => {
    const provider = createAIProvider("custom", "test-key", {
      baseUrl: "https://api.example.com/v1",
      displayName: "Mi proveedor",
      defaultModel: "my-model",
    });
    expect(provider.providerId).toBe("custom");
    expect(provider.providerName).toBe("Mi proveedor");
    expect(provider.defaultModel).toBe("my-model");
  });

  it("rejects CUSTOM without a base URL (no more dead-end keys)", () => {
    expect(() => createAIProvider("custom", "test-key")).toThrow(/URL base/);
  });

  it("passes model overrides through OpenAI-compatible adapters", () => {
    const provider = createAIProvider("groq", "test-key", { defaultModel: "override-model" });
    expect(provider.defaultModel).toBe("override-model");
  });
});

describe("default models", () => {
  it("has a default text model for every provider id", () => {
    for (const id of [...ALL_PROVIDERS, "custom" as const]) {
      expect(DEFAULT_TEXT_MODELS[id]).toBeTruthy();
      expect(defaultTextModel(id)).toBe(DEFAULT_TEXT_MODELS[id]);
    }
  });

  it("modelForProvider prefers the per-instance override", () => {
    expect(modelForProvider({ providerId: "groq", defaultModel: "special" })).toBe("special");
    expect(modelForProvider({ providerId: "groq" })).toBe(DEFAULT_TEXT_MODELS.groq);
  });
});
