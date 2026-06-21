import { z } from "zod";

import { defaultTextModel } from "@/lib/ai/models";

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
    const model = defaultTextModel(ctx.ai.providerId);

    return ctx.ai.generateJSON({
      model,
      systemPrompt:
        "Eres un estratega de social media. Devuelve solo JSON según el esquema.",
      userPrompt: `Genera ${input.count} ganchos cortos para ${input.platform} sobre: ${input.topic}`,
      schema: HookGeneratorOutputSchema,
    });
  },
};
