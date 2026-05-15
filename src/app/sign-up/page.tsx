import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Regístrate para usar el panel y onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignUp
            routing="hash"
            forceRedirectUrl="/dashboard"
            signInUrl="/login"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent p-0",
              },
            }}
          />
          <p className="text-center text-sm text-zinc-500">
            <Link href="/login" className="underline-offset-4 hover:underline">
              ¿Ya tienes cuenta? Entrar
            </Link>
            {" · "}
            <Link href="/" className="underline-offset-4 hover:underline">
              Inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
