import { Shield, Building2, Activity, Webhook, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const adminSections = [
  { icon: Building2, label: "Organizaciones", value: "0", status: "active" },
  { icon: Activity, label: "Uso agregado", value: "0 req", status: "normal" },
  { icon: Webhook, label: "Webhooks fallidos", value: "0", status: "ok" },
];

export default function AdminPage() {
  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="size-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
            <Badge className="bg-primary text-primary-foreground">
              Solo internos
            </Badge>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Métricas globales, moderación y soporte
        </p>
      </div>

      {/* Admin panels */}
      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold">Panel de administración</h2>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Rol requerido
            </Badge>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {adminSections.map((section) => (
              <div
                key={section.label}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 p-6 text-center transition-colors hover:border-primary/50"
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <section.icon className="size-6" />
                </div>
                <span className="text-2xl font-bold">{section.value}</span>
                <span className="text-sm text-muted-foreground">{section.label}</span>
                <Badge
                  variant="outline"
                  className="mt-2 border-emerald-500/30 text-emerald-500"
                >
                  {section.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              TODO: proteger con rol interno; listar organizaciones, uso agregado y
              reenvío de webhooks fallidos.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
