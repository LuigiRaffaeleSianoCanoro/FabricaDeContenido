import { Briefcase, Clock, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const jobs = [
  { id: 1, name: "Hook generation", status: "completed", time: "2m ago" },
  { id: 2, name: "Video render", status: "running", time: "in progress" },
  { id: 3, name: "Buffer publish", status: "pending", time: "queued" },
];

export default function JobsPage() {
  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trabajos</h1>
            <p className="text-sm text-muted-foreground">
              Seguimiento de ContentJob, logs y errores
            </p>
          </div>
        </div>
      </div>

      {/* Jobs list */}
      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold">Ejecuciones recientes</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              3 jobs
            </Badge>
          </div>
          
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  {job.status === "completed" && (
                    <CheckCircle2 className="size-5 text-emerald-500" />
                  )}
                  {job.status === "running" && (
                    <Clock className="size-5 animate-pulse text-primary" />
                  )}
                  {job.status === "pending" && (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{job.name}</p>
                  <p className="text-sm text-muted-foreground">{job.time}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    job.status === "completed"
                      ? "border-emerald-500/30 text-emerald-500"
                      : job.status === "running"
                      ? "border-primary/30 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }
                >
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              TODO: tabla con estados y enlace a ejecución Inngest. Dead-letter tracking.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
