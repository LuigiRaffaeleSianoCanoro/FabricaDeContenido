import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar email={email} />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
