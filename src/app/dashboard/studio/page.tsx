import { redirect } from "next/navigation";
import { Film, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireOnboardingComplete } from "@/lib/auth/onboarding-status";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";
import { isR2Configured } from "@/lib/storage/r2";

import { StudioClient } from "./studio-client";

export default async function StudioPage() {
  const { userId } = await requireSession();
  await requireOnboardingComplete();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const keys = await prisma.encryptedApiKey.findMany({
    where: { organizationId: org.id, isActive: true, revokedAt: null },
    select: { provider: true },
  });
  const providers = new Set(keys.map((k) => k.provider));
  const hasAiKey = ["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER"].some((p) =>
    providers.has(p as never),
  );
  const hasOpenAiKey = providers.has("OPENAI");
  const hasPexels = Boolean(process.env.PEXELS_API_KEY);
  const hasR2 = isR2Configured();

  const renders = await prisma.videoRender.findMany({
    where: { organizationId: org.id, compositionId: "Slideshow" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Film className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
            <p className="text-sm text-muted-foreground">
              Prompt → slideshow animado (HyperFrames) · {org.name}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-6">
        <StudioClient
          organizationId={org.id}
          hasAiKey={hasAiKey}
          hasOpenAiKey={hasOpenAiKey}
          hasPexels={hasPexels}
          hasR2={hasR2}
        />

        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Video className="size-5 text-primary" />
            <h2 className="font-semibold">Renders recientes</h2>
          </div>
          {renders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no has renderizado slideshows.</p>
          ) : (
            <ul className="space-y-2">
              {renders.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {r.aspectRatio}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-xs text-primary">
                      {r.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {r.createdAt.toLocaleString("es")}
                    </span>
                  </div>
                  {r.outputUrl && (
                    <a
                      href={r.outputUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      ver video
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
