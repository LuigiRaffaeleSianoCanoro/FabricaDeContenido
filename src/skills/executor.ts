import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

import { getSkill } from "./registry";
import type { SkillContext } from "./types";

export async function executeSkill(
  skillId: string,
  rawInput: unknown,
  ctx: SkillContext,
): Promise<unknown> {
  const skill = getSkill(skillId);
  if (!skill) {
    throw new Error(`Unknown skill: ${skillId}`);
  }

  const input = skill.inputSchema.parse(rawInput);
  const started = await prisma.skillExecution.create({
    data: {
      jobId: ctx.jobId,
      skillId,
      input: input as Prisma.InputJsonValue,
    },
  });

  try {
    const output = await skill.execute(input, ctx);
    const parsedOutput = skill.outputSchema.parse(output);
    await prisma.skillExecution.update({
      where: { id: started.id },
      data: {
        output: parsedOutput as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
    return parsedOutput;
  } catch (err) {
    await prisma.skillExecution.update({
      where: { id: started.id },
      data: {
        errorMessage: err instanceof Error ? err.message : "Skill failed",
        completedAt: new Date(),
      },
    });
    throw err;
  }
}
