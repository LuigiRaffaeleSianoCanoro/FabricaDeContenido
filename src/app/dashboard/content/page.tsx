import { redirect } from "next/navigation";
import { FileText, Sparkles, Video, MessageSquare } from "lucide-react";

import { approveGeneratedContent, rejectGeneratedContent } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function ContentPage() {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const items = await prisma.generatedContent.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const hooksCount = items.filter((i) => i.type === "POST").length;
  const videoCount = items.filter((i) => i.videoUrl).length;

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contenido</h1>
            <p className="text-sm text-muted-foreground">Biblioteca y cola de aprobación</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              { icon: Sparkles, label: "Hooks IA", count: hooksCount },
              { icon: Video, label: "Con video", count: videoCount },
              { icon: MessageSquare, label: "Total", count: items.length },
            ].map((type) => (
              <div
                key={type.label}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 p-4 text-center transition-colors hover:border-primary/50"
              >
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <type.icon className="size-5" />
                </div>
                <span className="text-2xl font-bold">{type.count}</span>
                <span className="text-xs text-muted-foreground">{type.label}</span>
              </div>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="size-7" />
              </div>
              <h3 className="font-semibold">Sin contenido aún</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Ejecuta el pipeline desde el panel o completa el onboarding.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-border/50 bg-card/50 p-4 text-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {row.platform}
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-xs text-primary">
                          {row.status}
                        </Badge>
                      </div>
                      <p className="whitespace-pre-wrap text-foreground">{row.body}</p>
                      {row.videoUrl && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Video:{" "}
                          <a href={row.videoUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                            abrir
                          </a>
                        </p>
                      )}
                    </div>
                    {row.status === "PENDING_APPROVAL" && (
                      <div className="flex shrink-0 gap-2">
                        <form action={approveGeneratedContent}>
                          <input type="hidden" name="organizationId" value={org.id} />
                          <input type="hidden" name="id" value={row.id} />
                          <Button type="submit" size="sm" className="bg-primary">
                            Aprobar
                          </Button>
                        </form>
                        <form action={rejectGeneratedContent}>
                          <input type="hidden" name="organizationId" value={org.id} />
                          <input type="hidden" name="id" value={row.id} />
                          <Button type="submit" size="sm" variant="outline">
                            Rechazar
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
