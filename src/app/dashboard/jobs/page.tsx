import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function JobsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trabajos</CardTitle>
        <CardDescription>
          Seguimiento de `ContentJob`, logs de skills y errores.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        TODO: tabla con estados y enlace a ejecución Inngest. Dead-letter: marcar
        `JobStatus.DEAD_LETTER` tras máximo de reintentos.
      </CardContent>
    </Card>
  );
}
