import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils/slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips accents and special characters", () => {
    expect(slugify("Café & Té!")).toBe("cafe-te");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("foo   bar")).toBe("foo-bar");
  });
});
