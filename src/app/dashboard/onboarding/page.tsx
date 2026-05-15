import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  "Cuenta y organización",
  "Clave de IA (OpenAI / Anthropic / Gemini / OpenRouter)",
  "Buffer y cuentas sociales",
  "Preferencias de contenido y calendario",
  "Revisión y activación",
];

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
        <p className="text-muted-foreground">
          Asistente por pasos (placeholder UI). La persistencia irá a Prisma +
          flujos server actions.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pasos previstos</CardTitle>
          <CardDescription>Implementación incremental en siguientes PRs.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">TODO: wizard</Badge>
            <Badge variant="secondary">TODO: Buffer OAuth</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
