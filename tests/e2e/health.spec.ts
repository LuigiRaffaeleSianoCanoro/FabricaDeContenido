import { test, expect } from "@playwright/test";

test.describe("Health API", () => {
  test("returns ok status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toMatchObject({ ok: true });
  });
});
