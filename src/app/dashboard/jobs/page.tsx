import { redirect } from "next/navigation";

import { markJobDeadLetter, retryJobAction } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const jobs = await prisma.contentJob.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      skillExecutions: {
        orderBy: { startedAt: "desc" },
        take: 5,
      },
    },
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trabajos</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Estados de pipeline Inngest y trazas de skills.
        </p>
      </div>
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sin trabajos</CardTitle>
              <CardDescription>Lanza un pipeline desde el panel.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base font-mono">
                    <span className="truncate">{job.id.slice(0, 12)}…</span>
                    <Badge variant="secondary">{job.status}</Badge>
                    <Badge variant="outline">{job.type}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {job.createdAt.toISOString()} · retries {job.retryCount}/{job.maxRetries}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.status === "FAILED" && (
                    <>
                      <form action={markJobDeadLetter}>
                        <input type="hidden" name="organizationId" value={org.id} />
                        <input type="hidden" name="jobId" value={job.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          Dead-letter
                        </Button>
                      </form>
                      <form action={retryJobAction}>
                        <input type="hidden" name="organizationId" value={org.id} />
                        <input type="hidden" name="jobId" value={job.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Reintentar
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {job.errorMessage && <p className="text-red-600">{job.errorMessage}</p>}
                {job.skillExecutions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500">Skills</p>
                    <ul className="mt-1 space-y-1 pl-4 font-mono text-xs">
                      {job.skillExecutions.map((ex) => (
                        <li key={ex.id}>
                          {ex.skillId} — {ex.completedAt ? "ok" : ex.errorMessage ?? "…"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
