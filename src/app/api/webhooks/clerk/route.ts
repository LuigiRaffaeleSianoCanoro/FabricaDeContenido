import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { prisma } from "@/lib/db/prisma";

type ClerkWebhookUser = {
  id: string;
  email_addresses?: { email_address: string }[];
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
};

type ClerkWebhookPayload = {
  type: string;
  data: ClerkWebhookUser & { id?: string };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 501 },
    );
  }

  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTs = h.get("svix-timestamp");
  const svixSig = h.get("svix-signature");
  if (!svixId || !svixTs || !svixSig) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const rawBody = await req.text();
  let evt: ClerkWebhookPayload;
  try {
    evt = new Webhook(secret).verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTs,
      "svix-signature": svixSig,
    }) as ClerkWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const data = evt.data;
    const email = data.email_addresses?.[0]?.email_address ?? "";
    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || null;

    await prisma.userProfile.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        email: email || `pending-${data.id}@clerk.placeholder`,
        fullName,
        avatarUrl: data.image_url ?? null,
      },
      update: {
        ...(email ? { email } : {}),
        fullName,
        avatarUrl: data.image_url ?? null,
      },
    });
  }

  if (evt.type === "user.deleted") {
    const id = (evt.data as { id?: string }).id;
    if (id) {
      await prisma.userProfile.deleteMany({ where: { id } });
    }
  }

  return NextResponse.json({ ok: true });
}
