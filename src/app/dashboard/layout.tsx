import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardSignOut } from "@/components/dashboard/dashboard-sign-out";
import {
  getActiveOrganizationForUser,
  listUserOrganizations,
} from "@/lib/auth/active-org";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const orgs = await listUserOrganizations(user.id);
  const active = await getActiveOrganizationForUser(user.id);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppSidebar
        email={email}
        organizations={orgs}
        activeOrganizationId={active?.id ?? null}
      />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <DashboardSignOut />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
