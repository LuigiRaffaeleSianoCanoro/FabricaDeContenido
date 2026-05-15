import { redirect } from "next/navigation";
import { Briefcase, Clock, CheckCircle2, AlertCircle, Circle } from "lucide-react";

import { markJobDeadLetter, retryJobAction } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

function jobBadge(status: string) {
  if (status === "SUCCEEDED")
    return "border-emerald-500/30 text-emerald-500";
  if (status === "RUNNING" || status === "QUEUED" || status === "PENDING")
    return "border-primary/30 text-primary";
  if (status === "FAILED" || status === "DEAD_LETTER")
    return "border-destructive/30 text-destructive";
  return "border-muted-foreground/30 text-muted-foreground";
}

export default async function JobsPage() {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const jobs = await prisma.contentJob.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      skillExecutions: { include: { skill: true }, orderBy: { startedAt: "asc" } },
    },
  });

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trabajos</h1>
            <p className="text-sm text-muted-foreground">ContentJob e Inngest</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Ejecuciones recientes</h2>
            <div className="flex flex-wrap gap-2">
              <form action={retryJobAction}>
                <input type="hidden" name="organizationId" value={org.id} />
                <Button type="submit" size="sm" variant="secondary">
                  Reintentar pipeline
                </Button>
              </form>
            </div>
          </div>

          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay trabajos.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      {job.status === "SUCCEEDED" ? (
                        <CheckCircle2 className="size-5 text-emerald-500" />
                      ) : job.status === "RUNNING" ? (
                        <Clock className="size-5 animate-pulse text-primary" />
                      ) : job.status === "FAILED" || job.status === "DEAD_LETTER" ? (
                        <AlertCircle className="size-5 text-destructive" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {job.type} · <span className="text-muted-foreground">{job.id.slice(0, 12)}…</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.createdAt.toLocaleString()} {job.errorMessage ? `· ${job.errorMessage}` : ""}
                      </p>
                      {job.skillExecutions.length > 0 && (
                        <ul className="mt-2 space-y-1 border-l-2 border-primary/20 pl-3 text-xs text-muted-foreground">
                          {job.skillExecutions.map((ex) => (
                            <li key={ex.id}>
                              <span className="font-medium text-foreground">{ex.skill.name}</span> ({ex.attempt}){" "}
                              {ex.completedAt ? "· listo" : "· en curso"}
                              {ex.errorMessage ? ` — ${ex.errorMessage}` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge variant="outline" className={jobBadge(job.status)}>
                      {job.status}
                    </Badge>
                    {(job.status === "FAILED" || job.status === "RUNNING") && (
                      <form action={markJobDeadLetter}>
                        <input type="hidden" name="organizationId" value={org.id} />
                        <input type="hidden" name="jobId" value={job.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          Dead-letter
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
