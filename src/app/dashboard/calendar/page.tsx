import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const dates = Array.from({ length: 7 }, (_, i) => 12 + i);

export default function CalendarPage() {
  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
            <p className="text-sm text-muted-foreground">
              Vista semanal de publicaciones programadas
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronLeft className="size-4" />
              </Button>
              <h2 className="font-semibold">Mayo 2026</h2>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Semana 20
            </Badge>
          </div>
          
          {/* Week grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => (
              <div key={day} className="text-center">
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  {day}
                </div>
                <div
                  className={`flex h-20 flex-col items-center rounded-xl border border-border/50 p-2 transition-colors hover:border-primary/50 ${
                    i === 3 ? "border-primary bg-primary/5" : "bg-card/50"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      i === 3 ? "text-primary" : ""
                    }`}
                  >
                    {dates[i]}
                  </span>
                  {i === 1 && (
                    <div className="mt-1 size-2 rounded-full bg-primary" />
                  )}
                  {i === 4 && (
                    <div className="mt-1 size-2 rounded-full bg-primary/50" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              TODO: integración con ScheduledPost y Buffer API.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
