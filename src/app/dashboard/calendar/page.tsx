import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function mondayOfWeek(now: Date): Date {
  const d = new Date(now);
  const day = d.getDay();
  const adjust = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + adjust);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function CalendarPage() {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const start = mondayOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const posts = await prisma.scheduledPost.findMany({
    where: {
      organizationId: org.id,
      scheduledFor: { gte: start, lt: end },
    },
    orderBy: { scheduledFor: "asc" },
    include: {
      generatedContent: true,
    },
  });

  const byDay = new Map<string, typeof posts>();
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    byDay.set(key, []);
  }
  for (const p of posts) {
    const key = p.scheduledFor.toISOString().slice(0, 10);
    const list = byDay.get(key) ?? [];
    list.push(p);
    byDay.set(key, list);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Semana actual (lun–dom) · `ScheduledPost` + Buffer
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...byDay.entries()].map(([day, list]) => {
          const label = new Date(day + "T12:00:00");
          const weekday = label.toLocaleDateString("es", { weekday: "short", day: "numeric" });
          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{weekday}</CardTitle>
                <CardDescription>{list.length} publicaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.length === 0 ? (
                  <p className="text-sm text-zinc-500">Vacío</p>
                ) : (
                  list.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-800"
                    >
                      <Badge variant="outline" className="mb-1">
                        {p.status}
                      </Badge>
                      <p className="line-clamp-3 text-zinc-700 dark:text-zinc-300">
                        {p.generatedContent.body.slice(0, 120)}
                        …
                      </p>
                      {p.bufferUpdateId && (
                        <p className="mt-1 font-mono text-[10px] text-zinc-500">
                          buffer:{p.bufferUpdateId.slice(0, 8)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
