import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajustes</CardTitle>
        <CardDescription>
          Claves cifradas, miembros del workspace y preferencias.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
        TODO: UI de rotación/revocado de `EncryptedApiKey` sin exponer valores al
        cliente.
      </CardContent>
    </Card>
  );
}
