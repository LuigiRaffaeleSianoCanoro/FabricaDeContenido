import { redirect } from "next/navigation";

import {
  approveGeneratedContent,
  rejectGeneratedContent,
} from "@/app/dashboard/actions";
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
import type { ContentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Search = { status?: string; platform?: string };

const ALL_STATUSES: ContentStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
];

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const sp = await searchParams;
  const statusFilter =
    sp.status && ALL_STATUSES.includes(sp.status as ContentStatus)
      ? (sp.status as ContentStatus)
      : undefined;
  const platformFilter = sp.platform?.toLowerCase();

  const items = await prisma.generatedContent.findMany({
    where: {
      organizationId: org.id,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(platformFilter ? { platform: platformFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contenido generado</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {items.length} piezas · filtra por estado o plataforma vía URL (?status=&platform=)
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {ALL_STATUSES.map((s) => (
          <a
            key={s}
            href={s === statusFilter ? "/dashboard/content" : `/dashboard/content?status=${s}`}
            className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {s}
          </a>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sin contenido aún</CardTitle>
              <CardDescription>Ejecuta el pipeline desde el panel principal.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          items.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-base">{c.platform}</CardTitle>
                  <CardDescription className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">{c.status}</Badge>
                    <span className="text-xs text-zinc-500">
                      {c.createdAt.toISOString().slice(0, 10)}
                    </span>
                  </CardDescription>
                </div>
                {c.status === "PENDING_APPROVAL" && (
                  <div className="flex flex-wrap gap-2">
                    <form action={approveGeneratedContent}>
                      <input type="hidden" name="organizationId" value={org.id} />
                      <input type="hidden" name="contentId" value={c.id} />
                      <input type="hidden" name="scheduleBuffer" value="on" />
                      <Button type="submit" size="sm">
                        Aprobar + Buffer
                      </Button>
                    </form>
                    <form action={approveGeneratedContent}>
                      <input type="hidden" name="organizationId" value={org.id} />
                      <input type="hidden" name="contentId" value={c.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        Solo aprobar
                      </Button>
                    </form>
                    <form action={rejectGeneratedContent}>
                      <input type="hidden" name="organizationId" value={org.id} />
                      <input type="hidden" name="contentId" value={c.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Rechazar
                      </Button>
                    </form>
                  </div>
                )}
                {c.status === "APPROVED" && (
                  <form action={approveGeneratedContent}>
                    <input type="hidden" name="organizationId" value={org.id} />
                    <input type="hidden" name="contentId" value={c.id} />
                    <input type="hidden" name="scheduleBuffer" value="on" />
                    <Button type="submit" size="sm" variant="outline">
                      Programar Buffer
                    </Button>
                  </form>
                )}
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{c.body}</p>
                {c.hashtags.length > 0 && (
                  <p className="mt-2 text-xs text-zinc-500">{c.hashtags.map((h) => `#${h}`).join(" ")}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
