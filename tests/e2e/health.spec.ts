import { test, expect } from "@playwright/test";

test.describe("Health API", () => {
  test("returns ok status with dependency checks", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toMatchObject({ ok: true });
    expect(body.services).toMatchObject({
      inngest: expect.objectContaining({ ok: expect.any(Boolean) }),
      r2: expect.objectContaining({ ok: expect.any(Boolean) }),
      buffer: expect.objectContaining({ ok: expect.any(Boolean) }),
      pexels: expect.objectContaining({ ok: expect.any(Boolean) }),
    });
  });
});
