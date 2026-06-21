import assert from "node:assert";

import { z } from "zod";

import { AiProviderError, userMessageForAiError } from "../src/lib/ai/errors";
import { AnthropicProvider } from "../src/lib/ai/providers/anthropic";

// Mirrors how a real skill calls generateJSON, without importing skill files
// (which use `@/` path aliases that this runner does not resolve).
const SlideshowPlanSchema = z.object({ title: z.string().min(1) });

const realFetch = globalThis.fetch;

function mockFetch(impl: () => Promise<Response> | Response) {
  globalThis.fetch = (async () => impl()) as typeof fetch;
}
function restoreFetch() {
  globalThis.fetch = realFetch;
}

async function expectThrows(fn: () => Promise<unknown>): Promise<AiProviderError> {
  try {
    await fn();
  } catch (err) {
    assert(err instanceof AiProviderError, `expected AiProviderError, got ${err}`);
    return err;
  }
  throw new Error("expected to throw, but resolved");
}

async function main() {
  const provider = new AnthropicProvider("sk-fake");
  const genJSON = () =>
    provider.generateJSON({
      model: "claude-haiku-4-5-20251001",
      userPrompt: "hola",
      schema: SlideshowPlanSchema,
    });

  console.log("== Scenario 1: the REPORTED bug — 404 retired model ==");
  mockFetch(
    () =>
      new Response(
        JSON.stringify({
          type: "error",
          error: { type: "not_found_error", message: "model: claude-3-5-haiku-20241022" },
          request_id: "req_011CcFQCi34hQ1SQyzm39EqZ",
        }),
        { status: 404 },
      ),
  );
  {
    const err = await expectThrows(genJSON);
    console.log("  user message:", err.message);
    assert.equal(err.code, "not_found");
    assert.equal(err.status, 404);
    assert(!/request_id|not_found_error|\{/.test(err.message), "raw JSON must NOT leak to user");
    assert(/no está disponible/.test(err.message));
    assert(err.detail?.includes("request_id"), "raw detail kept for server logs");
  }

  console.log("== Scenario 2: 401 invalid key ==");
  mockFetch(() => new Response("unauthorized", { status: 401 }));
  {
    const err = await expectThrows(genJSON);
    console.log("  user message:", err.message);
    assert.equal(err.code, "auth");
    assert(/API key/.test(err.message));
  }

  console.log("== Scenario 3: 429 rate limit ==");
  mockFetch(() => new Response("slow down", { status: 429 }));
  {
    const err = await expectThrows(genJSON);
    console.log("  user message:", err.message);
    assert.equal(err.code, "rate_limit");
  }

  console.log("== Scenario 4: 500 provider outage ==");
  mockFetch(() => new Response("boom", { status: 500 }));
  {
    const err = await expectThrows(genJSON);
    console.log("  user message:", err.message);
    assert.equal(err.code, "server");
  }

  console.log("== Scenario 5: network failure ==");
  mockFetch(() => {
    throw new TypeError("fetch failed");
  });
  {
    const err = await expectThrows(genJSON);
    console.log("  user message:", err.message);
    assert.equal(err.code, "network");
  }

  console.log("== Scenario 6: 200 but non-JSON model output (bad_response) ==");
  mockFetch(
    () =>
      new Response(
        JSON.stringify({ content: [{ type: "text", text: "no soy json" }], usage: {} }),
        { status: 200 },
      ),
  );
  {
    const err = await expectThrows(genJSON);
    console.log("  user message:", err.message);
    assert.equal(err.code, "bad_response");
  }

  console.log("== Scenario 7: 200 valid JSON but schema mismatch (bad_response) ==");
  mockFetch(
    () =>
      new Response(
        JSON.stringify({ content: [{ type: "text", text: '{"foo":1}' }], usage: {} }),
        { status: 200 },
      ),
  );
  {
    const err = await expectThrows(genJSON);
    console.log("  user message:", err.message);
    assert.equal(err.code, "bad_response");
  }

  console.log("== Scenario 8: userMessageForAiError fallback for non-AI errors ==");
  {
    const msg = userMessageForAiError(new Error("ECONNRESET stacktrace..."), "fallback amigable");
    console.log("  fallback:", msg);
    assert.equal(msg, "fallback amigable");
  }

  restoreFetch();
  console.log("\nALL ASSERTIONS PASSED");
}

void main();
