import type { z } from "zod";

import type { AIProvider } from "@/lib/ai";

export type SkillContext = {
  organizationId: string;
  jobId: string;
  ai: AIProvider;
  log: (message: string, meta?: unknown) => Promise<void>;
};

export type SkillDefinition = {
  id: string;
  name: string;
  version: string;
  category: string;
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
  execute: (input: unknown, ctx: SkillContext) => Promise<unknown>;
};
