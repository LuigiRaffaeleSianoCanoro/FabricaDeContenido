"use client";

import { useState } from "react";

import { sendMagicLink } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);
    const res = await sendMagicLink(email);
    if (!res.ok) {
      setStatus("error");
      setMessage(res.message);
      return;
    }
    setStatus("sent");
    setMessage("Revisa tu correo para el enlace mágico.");
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />
      </div>
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Entrar con enlace mágico"}
      </Button>
      {message ? (
        <p
          className={
            status === "error" ? "text-sm text-red-600" : "text-sm text-zinc-600"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
