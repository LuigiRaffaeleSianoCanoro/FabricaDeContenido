import { redirect } from "next/navigation";
import { CreditCard, Gauge, Sparkles, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireOnboardingComplete } from "@/lib/auth/onboarding-status";
import { requireSession } from "@/lib/auth/require-session";
import { AGENT_CREDIT_COSTS, PLANS, PLAN_ORDER, getPlan } from "@/lib/billing/plans";
import { getOrgBillingSnapshot } from "@/services/usage";

import { UpgradeForm } from "./upgrade-form";

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const pct = limit === null ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const over = limit !== null && used >= limit;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={over ? "font-semibold text-destructive" : "text-muted-foreground"}>
          {used}
          {limit === null ? " · ilimitado" : ` / ${limit}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
          style={{ width: limit === null ? "4%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const { userId } = await requireSession();
  await requireOnboardingComplete();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const snapshot = await getOrgBillingSnapshot(org.id);
  const current = getPlan(org.plan);
  const creditAllowance = current.monthlyAgentCredits + snapshot.bonusCredits;

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Facturación</h1>
            <p className="text-sm text-muted-foreground">Plan, uso y créditos · {org.name}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-6">
        {/* Current plan + usage */}
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Gauge className="size-5 text-primary" />
            <h2 className="font-semibold">Tu plan</h2>
            <Badge className="bg-primary text-primary-foreground">{current.label}</Badge>
            <span className="text-sm text-muted-foreground">
              {current.priceMonthlyUsd === null
                ? "Precio a medida"
                : current.priceMonthlyUsd === 0
                  ? "Gratis"
                  : `US$${current.priceMonthlyUsd}/mes`}
            </span>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">{current.tagline}</p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <UsageBar
              label="Generaciones de texto"
              used={snapshot.usage.textGenerations}
              limit={current.monthlyTextGenerations}
            />
            <UsageBar
              label="Videos (slideshows)"
              used={snapshot.usage.videoRenders}
              limit={current.monthlyVideoRenders}
            />
            {current.platformAiIncluded ? (
              <UsageBar
                label="Créditos de agente"
                used={snapshot.usage.agentCreditsUsed}
                limit={creditAllowance}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                <Sparkles className="mb-1 size-4 text-primary" />
                Los créditos de agente (IA de la plataforma, sin traer tus keys) están disponibles
                desde el plan Premium Agente. 1 texto = {AGENT_CREDIT_COSTS.text} crédito · 1 video ={" "}
                {AGENT_CREDIT_COSTS.video} créditos.
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            El uso se reinicia el día 1 de cada mes (UTC). Con tus propias keys (BYOK) no consumís
            créditos: solo cuentan los límites mensuales del plan.
          </p>
        </div>

        {/* Plan catalog */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLAN_ORDER.map((planId) => {
            const p = PLANS[planId];
            const isCurrent = p.id === current.id;
            return (
              <div
                key={p.id}
                className={`glass animate-scale-in flex flex-col rounded-2xl p-5 ${
                  isCurrent ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-semibold">{p.label}</h3>
                  {isCurrent && <Badge variant="secondary">Actual</Badge>}
                </div>
                <p className="mb-3 text-lg font-bold">
                  {p.priceMonthlyUsd === null
                    ? "A medida"
                    : p.priceMonthlyUsd === 0
                      ? "Gratis"
                      : `US$${p.priceMonthlyUsd}`}
                  {p.priceMonthlyUsd ? (
                    <span className="text-xs font-normal text-muted-foreground">/mes</span>
                  ) : null}
                </p>
                <p className="mb-4 min-h-10 text-xs text-muted-foreground">{p.tagline}</p>
                <ul className="mb-5 flex-1 space-y-1.5 text-xs">
                  <li className="flex items-start gap-1.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {p.platformAiIncluded
                      ? `IA de la plataforma · ${p.monthlyAgentCredits} créditos/mes`
                      : "BYOK: traé tu key de cualquier proveedor"}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {p.monthlyTextGenerations === null
                      ? "Textos ilimitados"
                      : `${p.monthlyTextGenerations} textos/mes`}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {p.monthlyVideoRenders === null
                      ? "Videos ilimitados"
                      : `${p.monthlyVideoRenders} videos/mes`}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {p.maxMembers === null ? "Miembros ilimitados" : `${p.maxMembers} miembros`}
                  </li>
                </ul>
                {!isCurrent && (
                  <UpgradeForm
                    organizationId={org.id}
                    targetPlan={p.id}
                    label={p.priceMonthlyUsd === null ? "Contactar ventas" : `Pasar a ${p.label}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
