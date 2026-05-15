import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido generado</CardTitle>
        <CardDescription>
          Biblioteca y cola de aprobación (vacío hasta conectar pipeline).
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
        TODO: listar `GeneratedContent` con filtros por estado y plataforma.
      </CardContent>
    </Card>
  );
}
