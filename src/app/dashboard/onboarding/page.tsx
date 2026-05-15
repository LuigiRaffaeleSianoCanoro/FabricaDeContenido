import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle2, Circle } from "lucide-react";

const steps = [
  { label: "Cuenta y organización", done: true },
  { label: "Clave de IA (OpenAI / Anthropic / Gemini)", done: false },
  { label: "Buffer y cuentas sociales", done: false },
  { label: "Preferencias de contenido", done: false },
  { label: "Revisión y activación", done: false },
];

export default function OnboardingPage() {
  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rocket className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
            <p className="text-sm text-muted-foreground">
              Configura tu flujo de contenido paso a paso
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="relative z-10 flex-1">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold">Pasos de configuración</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              1 de 5
            </Badge>
          </div>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 items-center justify-center">
                  {step.done ? (
                    <CheckCircle2 className="size-6 text-primary" />
                  ) : (
                    <Circle className="size-6 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                    {index + 1}. {step.label}
                  </span>
                </div>
                {index === 1 && (
                  <Badge className="bg-primary text-primary-foreground">
                    Actual
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
            <Badge variant="outline" className="border-primary/30 text-primary">
              TODO: wizard
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              TODO: Buffer OAuth
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
