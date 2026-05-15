import "server-only";

import { cookies } from "next/headers";

import { prisma } from "@/lib/db/prisma";

const COOKIE_NAME = "fabrica_active_org_id";

export type OrgWithRole = {
  organizationId: string;
  slug: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
};

export async function listUserOrganizations(userId: string): Promise<OrgWithRole[]> {
  const rows = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    organizationId: r.organizationId,
    slug: r.organization.slug,
    name: r.organization.name,
    role: r.role,
  }));
}

export async function getActiveOrganizationForUser(userId: string) {
  const rows = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  if (rows.length === 0) return null;

  const jar = await cookies();
  const fromCookie = jar.get(COOKIE_NAME)?.value;
  if (fromCookie) {
    const hit = rows.find((r) => r.organizationId === fromCookie);
    if (hit) return hit.organization;
  }
  return rows[0].organization;
}

export async function setActiveOrganizationCookie(organizationId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, organizationId, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}
