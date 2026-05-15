import { Settings, Key, Users, Bell, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const settingsSections = [
  { icon: Key, label: "Claves API", description: "Gestiona tus claves de IA cifradas" },
  { icon: Users, label: "Miembros", description: "Invita a tu equipo al workspace" },
  { icon: Bell, label: "Notificaciones", description: "Configura alertas y webhooks" },
];

export default function SettingsPage() {
  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
            <p className="text-sm text-muted-foreground">
              Claves cifradas, miembros y preferencias
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold">Configuración</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              3 secciones
            </Badge>
          </div>
          
          <div className="space-y-3">
            {settingsSections.map((section) => (
              <div
                key={section.label}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-muted/50"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <section.icon className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{section.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  TODO
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              TODO: UI de rotación de EncryptedApiKey sin exponer valores al cliente.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
