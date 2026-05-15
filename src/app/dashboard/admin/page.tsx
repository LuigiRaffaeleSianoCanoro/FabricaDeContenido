import { currentUser } from "@clerk/nextjs/server";

import { adminRetryWebhookEvent } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isPlatformAdminEmail } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!isPlatformAdminEmail(email)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>
            Define `ADMIN_EMAILS` en el servidor (coma-separado) con tu email.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: {
        select: { usageRecords: true, members: true },
      },
    },
  });

  const failedEvents = await prisma.webhookEvent.findMany({
    where: { status: "FAILED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { endpoint: true },
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Operaciones internas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizaciones</CardTitle>
          <CardDescription>{orgs.length} registros</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {orgs.map((o) => (
              <li key={o.id} className="flex justify-between gap-4 border-b border-zinc-100 py-2 dark:border-zinc-900">
                <span className="font-medium">{o.name}</span>
                <span className="text-zinc-500">
                  miembros {o._count.members} · uso {o._count.usageRecords}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks fallidos</CardTitle>
          <CardDescription>Reintento marca PENDING (tu worker debe re-procesar).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {failedEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin eventos FAILED.</p>
          ) : (
            failedEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div>
                  <Badge variant="destructive">FAILED</Badge>
                  <p className="mt-1 font-mono text-xs">{ev.eventType}</p>
                  <p className="text-xs text-zinc-500">{ev.lastError ?? ""}</p>
                </div>
                <form action={adminRetryWebhookEvent}>
                  <input type="hidden" name="eventId" value={ev.id} />
                  <Button type="submit" size="sm" variant="outline">
                    Reintentar
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
