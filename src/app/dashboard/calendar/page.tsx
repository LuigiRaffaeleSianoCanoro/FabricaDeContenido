import { redirect } from "next/navigation";
import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireOnboardingComplete } from "@/lib/auth/onboarding-status";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

function startOfIsoWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default async function CalendarPage() {
  const { userId } = await requireSession();
  await requireOnboardingComplete();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

  const posts = await prisma.scheduledPost.findMany({
    where: {
      organizationId: org.id,
      scheduledFor: { gte: weekStart, lt: weekEnd },
    },
    orderBy: { scheduledFor: "asc" },
    include: { generatedContent: true },
  });

  const byDay = new Map<string, typeof posts>();
  for (const p of posts) {
    const key = p.scheduledFor.toDateString();
    const arr = byDay.get(key) ?? [];
    arr.push(p);
    byDay.set(key, arr);
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + i);
    return dt;
  });

  const title = weekStart.toLocaleString("es", { month: "long", year: "numeric" });

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
            <p className="text-sm text-muted-foreground">Vista semanal · ScheduledPost / Buffer</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="capitalize font-semibold">{title}</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Semana actual
            </Badge>
          </div>

          <div className="-mx-2 overflow-x-auto px-2 pb-1">
          <div className="grid min-w-[34rem] grid-cols-7 gap-2">
            {days.map((dt, i) => {
              const list = byDay.get(dt.toDateString()) ?? [];
              const isToday = dt.toDateString() === new Date().toDateString();
              return (
                <div key={dt.toISOString()} className="text-center">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">{DOW[i]}</div>
                  <div
                    className={`flex min-h-24 flex-col gap-1 rounded-xl border border-border/50 p-2 text-left transition-colors hover:border-primary/50 ${
                      isToday ? "border-primary bg-primary/5" : "bg-card/50"
                    }`}
                  >
                    <span className={`text-center text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                      {dt.getDate()}
                    </span>
                    {list.map((p) => (
                      <div
                        key={p.id}
                        className="truncate rounded-md bg-primary/10 px-1 py-0.5 text-[10px] text-primary"
                        title={p.generatedContent.body}
                      >
                        <Badge variant="outline" className="mr-1 border-primary/30 px-1 py-0 text-[9px]">
                          {p.status}
                        </Badge>
                        {p.scheduledFor.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
