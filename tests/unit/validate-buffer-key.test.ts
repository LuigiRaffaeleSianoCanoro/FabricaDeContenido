import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/publishing/providers/buffer", () => ({
  createBufferProvider: vi.fn(),
}));

import { createBufferProvider } from "@/lib/publishing/providers/buffer";
import { validateBufferApiKey } from "@/lib/publishing/validate-buffer-key";

describe("validateBufferApiKey", () => {
  beforeEach(() => {
    vi.mocked(createBufferProvider).mockReset();
  });

  it("rejects short keys without calling Buffer", async () => {
    const result = await validateBufferApiKey("abc");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("auth");
  });

  it("returns account info on valid key", async () => {
    vi.mocked(createBufferProvider).mockReturnValue({
      providerId: "buffer",
      getAccount: vi.fn().mockResolvedValue({
        id: "acc_1",
        email: "user@example.com",
        name: "User",
        organizations: [],
      }),
      listChannels: vi.fn(),
      createPost: vi.fn(),
      getPost: vi.fn(),
    });

    const result = await validateBufferApiKey("valid-buffer-key-12345");
    expect(result).toEqual({
      ok: true,
      accountEmail: "user@example.com",
      accountName: "User",
    });
  });

  it("classifies auth errors", async () => {
    vi.mocked(createBufferProvider).mockReturnValue({
      providerId: "buffer",
      getAccount: vi.fn().mockRejectedValue(new Error("Buffer API 401: unauthorized")),
      listChannels: vi.fn(),
      createPost: vi.fn(),
      getPost: vi.fn(),
    });

    const result = await validateBufferApiKey("invalid-key-12345678");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("auth");
      expect(result.message).toMatch(/no es válida/i);
    }
  });
});
