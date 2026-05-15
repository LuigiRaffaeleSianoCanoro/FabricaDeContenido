import { requireSession } from "@/lib/auth/require-session";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";

import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireSession();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppSidebar email={user.email ?? ""} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
