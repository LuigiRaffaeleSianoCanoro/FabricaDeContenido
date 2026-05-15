import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
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
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <AppSidebar
        email={email}
        organizations={orgs}
        activeOrganizationId={active?.id ?? null}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
