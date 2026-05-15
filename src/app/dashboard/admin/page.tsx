import { Shield, Building2, Webhook } from "lucide-react";

import { adminRetryWebhookEvent } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isPlatformAdminEmail } from "@/lib/auth/admin";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPage() {
  const { user } = await requireSession();
  const email = user.emailAddresses[0]?.emailAddress ?? "";

  if (!isPlatformAdminEmail(email)) {
    return (
      <div className="relative flex h-full flex-col p-6 lg:p-8">
        <div className="glass rounded-2xl p-8 text-center">
          <Shield className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Sin acceso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu email no está en <code className="rounded bg-muted px-1">ADMIN_EMAILS</code>.
          </p>
        </div>
      </div>
    );
  }

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      _count: {
        select: {
          members: true,
          contentJobs: true,
        },
      },
    },
  });

  const orgIds = orgs.map((o) => o.id);
  const contentCounts = await prisma.generatedContent.groupBy({
    by: ["organizationId"],
    where: { organizationId: { in: orgIds } },
    _count: { _all: true },
  });
  const contentByOrg = new Map(contentCounts.map((c) => [c.organizationId, c._count._all]));

  const failedHooks = await prisma.webhookEvent.findMany({
    where: { status: "FAILED" },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { endpoint: true },
  });

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="size-5" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
            <Badge className="bg-primary text-primary-foreground">Plataforma</Badge>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Organizaciones y webhooks</p>
      </div>

      <div className="relative z-10 flex-1 space-y-6">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <h2 className="font-semibold">Organizaciones</h2>
            <Badge variant="secondary">{orgs.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 pr-4">Nombre</th>
                  <th className="pb-2 pr-4">Slug</th>
                  <th className="pb-2 pr-4">Miembros</th>
                  <th className="pb-2 pr-4">Contenidos</th>
                  <th className="pb-2">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => (
                  <tr key={o.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">{o.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{o.slug}</td>
                    <td className="py-2 pr-4">{o._count.members}</td>
                    <td className="py-2 pr-4">{contentByOrg.get(o.id) ?? 0}</td>
                    <td className="py-2">{o._count.contentJobs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Webhook className="size-5 text-primary" />
            <h2 className="font-semibold">Webhooks fallidos</h2>
          </div>
          {failedHooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada en cola con estado FAILED.</p>
          ) : (
            <ul className="space-y-3">
              {failedHooks.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/50 p-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{e.eventType}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.endpoint.url} · intentos {e.attempts}
                    </p>
                    {e.lastError && (
                      <p className="mt-1 text-xs text-destructive">{e.lastError}</p>
                    )}
                  </div>
                  <form action={adminRetryWebhookEvent}>
                    <input type="hidden" name="eventId" value={e.id} />
                    <Button type="submit" size="sm" variant="secondary">
                      Reset intentos
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
