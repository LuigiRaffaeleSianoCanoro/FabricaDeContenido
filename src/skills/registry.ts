import { hookGeneratorSkill } from "./hook-generator/skill";

import type { SkillDefinition } from "./types";

const skills: SkillDefinition[] = [hookGeneratorSkill];

const byId = new Map(skills.map((s) => [s.id, s]));

export function listSkills(): SkillDefinition[] {
  return skills;
}

export function getSkill(id: string): SkillDefinition | undefined {
  return byId.get(id);
}
