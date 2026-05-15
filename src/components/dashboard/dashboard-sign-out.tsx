"use client";

import { SignOutButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function DashboardSignOut() {
  return (
    <SignOutButton signOutOptions={{ redirectUrl: "/login" }}>
      <Button type="button" variant="ghost" size="sm">
        Salir
      </Button>
    </SignOutButton>
  );
}
