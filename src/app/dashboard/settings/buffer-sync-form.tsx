"use client";

import { useActionState } from "react";

import { syncBufferChannelsAction, type SyncBufferActionState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

type Props = {
  organizationId: string;
  hasBufferKey: boolean;
};

const initialState: SyncBufferActionState = {};

export function BufferSyncForm({ organizationId, hasBufferKey }: Props) {
  const [state, action, pending] = useActionState(syncBufferChannelsAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Button type="submit" variant="secondary" disabled={!hasBufferKey || pending}>
        {pending
          ? "Sincronizando..."
          : hasBufferKey
            ? "Sincronizar canales de Buffer"
            : "Añade tu API key de Buffer primero"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-primary">
          Sincronización completada. Canales detectados: {state.synced ?? 0}.
        </p>
      )}
    </form>
  );
}
