import { serve } from "inngest/edge";

import { inngest } from "@/lib/inngest/client";
import { inngestFunctions } from "@/lib/inngest/functions";

export const dynamic = "force-dynamic";

const handler = serve({
  client: inngest,
  functions: inngestFunctions,
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
