import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin</CardTitle>
        <CardDescription>
          Fundamentos para métricas globales, moderación y soporte.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        TODO: proteger con rol interno; listar organizaciones, uso agregado y
        reenvío de webhooks fallidos (`WebhookEvent.status=FAILED`).
      </CardContent>
    </Card>
  );
}
