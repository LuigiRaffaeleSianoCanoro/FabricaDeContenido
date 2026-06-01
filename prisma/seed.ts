import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.skillDefinition.upsert({
    where: { id: "hook-generator" },
    create: {
      id: "hook-generator",
      name: "Hook generator",
      version: "1.0.0",
      category: "copy",
      inputSchema: { type: "object" },
      outputSchema: { type: "object" },
    },
    update: {
      name: "Hook generator",
      version: "1.0.0",
      category: "copy",
    },
  });

  await prisma.skillDefinition.upsert({
    where: { id: "slideshow-planner" },
    create: {
      id: "slideshow-planner",
      name: "Slideshow planner",
      version: "1.0.0",
      category: "video",
      inputSchema: { type: "object" },
      outputSchema: { type: "object" },
    },
    update: {
      name: "Slideshow planner",
      version: "1.0.0",
      category: "video",
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
