import { redirect } from "next/navigation";

import {
  inviteMemberAction,
  settingsAddApiKey,
  settingsRevokeApiKey,
} from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const keys = await prisma.encryptedApiKey.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      provider: true,
      label: true,
      keyFingerprint: true,
      isActive: true,
      revokedAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Claves cifradas — solo huella SHA-256, nunca el secreto en claro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claves API</CardTitle>
          <CardDescription>Altas y revocación inmediata.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{k.provider}</span>
                    <Badge variant={k.isActive && !k.revokedAt ? "default" : "secondary"}>
                      {k.isActive && !k.revokedAt ? "activa" : "revocada"}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500">
                    huella …{k.keyFingerprint.slice(-8)}
                    {k.lastUsedAt ? ` · usada ${k.lastUsedAt.toISOString().slice(0, 10)}` : ""}
                  </p>
                </div>
                {k.isActive && !k.revokedAt && (
                  <form action={settingsRevokeApiKey}>
                    <input type="hidden" name="organizationId" value={org.id} />
                    <input type="hidden" name="keyId" value={k.id} />
                    <Button type="submit" size="sm" variant="destructive">
                      Revocar
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>

          <form action={settingsAddApiKey} className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <input type="hidden" name="organizationId" value={org.id} />
            <div className="space-y-2">
              <Label htmlFor="provider">Proveedor</Label>
              <select
                id="provider"
                name="provider"
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                defaultValue="OPENAI"
              >
                <option value="OPENAI">OPENAI</option>
                <option value="ANTHROPIC">ANTHROPIC</option>
                <option value="GEMINI">GEMINI</option>
                <option value="OPENROUTER">OPENROUTER</option>
                <option value="BUFFER">BUFFER</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Nuevo secreto</Label>
              <Input id="apiKey" name="apiKey" type="password" required autoComplete="off" />
            </div>
            <Button type="submit">Guardar clave</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitar miembro</CardTitle>
          <CardDescription>
            El email debe existir como UserProfile (sync Clerk u onboarding).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={inviteMemberAction} className="space-y-4">
            <input type="hidden" name="organizationId" value={org.id} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                name="role"
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                defaultValue="MEMBER"
              >
                <option value="VIEWER">VIEWER</option>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <Button type="submit">Invitar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
