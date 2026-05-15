import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario</CardTitle>
        <CardDescription>
          Vista semanal/mensual de publicaciones programadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
        TODO: usar `ScheduledPost` + integración Buffer.
      </CardContent>
    </Card>
  );
}
