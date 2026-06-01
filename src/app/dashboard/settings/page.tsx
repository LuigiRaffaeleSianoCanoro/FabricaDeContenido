import { redirect } from "next/navigation";
import { Settings, Key, Users, AlertCircle, Share2 } from "lucide-react";

import {
  inviteMemberAction,
  settingsAddApiKey,
  settingsRevokeApiKey,
  syncBufferChannelsAction,
} from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function SettingsPage() {
  const { userId } = await requireSession();
  const org = await getActiveOrganizationForUser(userId);
  if (!org) redirect("/dashboard/onboarding");

  const keys = await prisma.encryptedApiKey.findMany({
    where: { organizationId: org.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const hasBufferKey = keys.some((k) => k.provider === "BUFFER" && k.isActive);

  const channels = await prisma.socialAccount.findMany({
    where: { organizationId: org.id, platform: "buffer", isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative flex h-full flex-col p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
            <p className="text-sm text-muted-foreground">
              Claves cifradas · {org.name}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-6">
        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Key className="size-5 text-primary" />
            <h2 className="font-semibold">Claves API</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Solo se muestra huella; los secretos nunca se exponen al cliente.
          </p>

          <ul className="mb-6 space-y-2">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium">{k.provider}</span>
                  <span className="ml-2 text-muted-foreground">
                    {k.keyFingerprint?.slice(0, 12) ?? "sin huella"}…
                  </span>
                  {!k.isActive && (
                    <Badge variant="destructive" className="ml-2">
                      inactiva
                    </Badge>
                  )}
                </div>
                {k.isActive && (
                  <form action={settingsRevokeApiKey}>
                    <input type="hidden" name="organizationId" value={org.id} />
                    <input type="hidden" name="id" value={k.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Revocar
                    </Button>
                  </form>
                )}
              </li>
            ))}
            {keys.length === 0 && (
              <li className="text-sm text-muted-foreground">No hay claves guardadas.</li>
            )}
          </ul>

          <form action={settingsAddApiKey} className="space-y-3 rounded-xl border border-dashed border-primary/30 p-4">
            <input type="hidden" name="organizationId" value={org.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <select
                  name="provider"
                  className="flex h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm"
                  defaultValue="OPENAI"
                >
                  <option value="OPENAI">OpenAI</option>
                  <option value="ANTHROPIC">Anthropic</option>
                  <option value="GEMINI">Gemini</option>
                  <option value="OPENROUTER">OpenRouter</option>
                  <option value="EDITFRAME">Editframe (video)</option>
                  <option value="BUFFER">Buffer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Nueva clave</Label>
                <Input id="apiKey" name="apiKey" type="password" autoComplete="off" required />
              </div>
            </div>
            <Button type="submit" className="bg-primary">
              Guardar clave
            </Button>
          </form>
        </div>

        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Share2 className="size-5 text-primary" />
            <h2 className="font-semibold">Canales de Buffer</h2>
          </div>
          <p className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            Guarda tu <strong className="mx-1">API key de Buffer</strong> (Settings → API en Buffer) en
            Claves API, luego sincroniza tus canales conectados.
          </p>

          <ul className="mb-4 space-y-2">
            {channels.map((c) => {
              const meta = (c.metadata ?? {}) as { service?: string };
              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {meta.service ?? "buffer"}
                    </Badge>
                    <span className="font-medium">{c.displayName ?? c.bufferId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.bufferId}</span>
                </li>
              );
            })}
            {channels.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No hay canales sincronizados todavía.
              </li>
            )}
          </ul>

          <form action={syncBufferChannelsAction}>
            <input type="hidden" name="organizationId" value={org.id} />
            <Button type="submit" variant="secondary" disabled={!hasBufferKey}>
              {hasBufferKey ? "Sincronizar canales de Buffer" : "Añade tu API key de Buffer primero"}
            </Button>
          </form>
        </div>

        <div className="glass animate-scale-in rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="font-semibold">Invitar miembro</h2>
          </div>
          <p className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            El email debe existir como UserProfile (usuario ya sincronizado con Clerk).
          </p>
          <form action={inviteMemberAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="organizationId" value={org.id} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="min-w-[240px]" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <select
                name="role"
                className="flex h-10 rounded-md border border-input bg-background/60 px-3 text-sm"
                defaultValue="MEMBER"
              >
                <option value="VIEWER">VIEWER</option>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <Button type="submit" variant="secondary">
              Invitar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
