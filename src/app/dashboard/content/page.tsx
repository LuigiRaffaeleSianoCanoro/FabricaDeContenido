import { FileText, Sparkles, Video, MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const contentTypes = [
  { icon: Sparkles, label: "Hooks IA", count: 0 },
  { icon: Video, label: "Videos", count: 0 },
  { icon: MessageSquare, label: "Posts", count: 0 },
];

export default function ContentPage() {
  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contenido</h1>
            <p className="text-sm text-muted-foreground">
              Biblioteca y cola de aprobación
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            {contentTypes.map((type) => (
              <div
                key={type.label}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 p-4 text-center transition-colors hover:border-primary/50"
              >
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <type.icon className="size-5" />
                </div>
                <span className="text-2xl font-bold">{type.count}</span>
                <span className="text-xs text-muted-foreground">{type.label}</span>
              </div>
            ))}
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="size-7" />
            </div>
            <h3 className="font-semibold">Sin contenido aún</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              El contenido generado aparecerá aquí una vez conectes el pipeline de IA.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              TODO: listar GeneratedContent con filtros por estado y plataforma.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
