import { z } from "zod";

import type { SkillDefinition } from "../types";

export const HookGeneratorInputSchema = z.object({
  topic: z.string().min(3),
  platform: z.string(),
  count: z.number().min(1).max(10).default(5),
});

export const HookGeneratorOutputSchema = z.object({
  hooks: z.array(z.string()),
});

export const hookGeneratorSkill: SkillDefinition = {
  id: "hook-generator",
  name: "Hook generator",
  version: "1.0.0",
  category: "copy",
  inputSchema: HookGeneratorInputSchema,
  outputSchema: HookGeneratorOutputSchema,
  async execute(inputUnknown, ctx) {
    const input = HookGeneratorInputSchema.parse(inputUnknown);
    const model = (() => {
      switch (ctx.ai.providerId) {
        case "openai":
          return "gpt-4o-mini";
        case "anthropic":
          return "claude-3-5-haiku-20241022";
        case "gemini":
          return "gemini-2.0-flash";
        case "openrouter":
          return "openai/gpt-4o-mini";
        default: {
          const _: never = ctx.ai.providerId;
          return _;
        }
      }
    })();

    return ctx.ai.generateJSON({
      model,
      systemPrompt:
        "Eres un estratega de social media. Devuelve solo JSON según el esquema.",
      userPrompt: `Genera ${input.count} ganchos cortos para ${input.platform} sobre: ${input.topic}`,
      schema: HookGeneratorOutputSchema,
    });
  },
};
