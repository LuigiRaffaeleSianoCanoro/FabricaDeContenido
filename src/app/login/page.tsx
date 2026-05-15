import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Te enviamos un enlace mágico — sin contraseña para el MVP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginForm />
          <p className="text-center text-sm text-zinc-500">
            <Link href="/" className="underline-offset-4 hover:underline">
              Volver al inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
