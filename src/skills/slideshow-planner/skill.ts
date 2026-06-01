import { z } from "zod";

import type { SkillDefinition } from "../types";

export const SlideSchema = z.object({
  heading: z.string().min(1),
  body: z.string().default(""),
  voiceover: z.string().default(""),
  imagePrompt: z.string().default(""),
  durationMs: z.number().int().min(1500).max(15000).default(4000),
});

export const SlideshowPlannerInputSchema = z.object({
  prompt: z.string().min(3),
  platform: z.string().default("instagram"),
  tone: z.string().default("profesional pero cercano"),
  targetAudience: z.string().default("audiencia general"),
  slideCount: z.number().int().min(2).max(10).default(5),
  language: z.string().default("es"),
});

export const SlideshowPlanSchema = z.object({
  title: z.string().min(1),
  slides: z.array(SlideSchema).min(1),
  caption: z.string().default(""),
  hashtags: z.array(z.string()).default([]),
});

export type SlideshowPlan = z.infer<typeof SlideshowPlanSchema>;
export type Slide = z.infer<typeof SlideSchema>;

function pickModel(providerId: string): string {
  switch (providerId) {
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-3-5-haiku-20241022";
    case "gemini":
      return "gemini-2.0-flash";
    case "openrouter":
      return "openai/gpt-4o-mini";
    default:
      return "gpt-4o-mini";
  }
}

export const slideshowPlannerSkill: SkillDefinition = {
  id: "slideshow-planner",
  name: "Slideshow planner",
  version: "1.0.0",
  category: "video",
  inputSchema: SlideshowPlannerInputSchema,
  outputSchema: SlideshowPlanSchema,
  async execute(inputUnknown, ctx) {
    const input = SlideshowPlannerInputSchema.parse(inputUnknown);
    const model = pickModel(ctx.ai.providerId);

    const systemPrompt = [
      "Eres un director creativo experto en slideshows animados para redes sociales.",
      "Conviertes un brief en un guion de diapositivas listo para producir como video vertical.",
      "Devuelve EXCLUSIVAMENTE JSON válido que cumpla el esquema indicado, sin texto extra.",
      "Cada slide debe tener: 'heading' (titular corto y potente, máx ~8 palabras),",
      "'body' (1-2 frases de apoyo), 'voiceover' (texto natural para voz en off),",
      "'imagePrompt' (descripción visual en inglés para generar/buscar una imagen de fondo),",
      "y 'durationMs' (entre 2500 y 6000).",
      "El primer slide es un gancho; el último es un cierre con llamada a la acción.",
    ].join(" ");

    const userPrompt = [
      `Idioma del contenido: ${input.language}.`,
      `Plataforma: ${input.platform}.`,
      `Tono: ${input.tone}.`,
      `Audiencia objetivo: ${input.targetAudience}.`,
      `Número de slides: ${input.slideCount}.`,
      "",
      "Brief del usuario:",
      input.prompt,
      "",
      `Genera un slideshow de exactamente ${input.slideCount} slides.`,
      "Incluye además 'title' (título interno), 'caption' (texto para el post) y 'hashtags'",
      "(array de 5-10 hashtags sin el símbolo #).",
    ].join("\n");

    return ctx.ai.generateJSON({
      model,
      systemPrompt,
      userPrompt,
      schema: SlideshowPlanSchema,
    });
  },
};
