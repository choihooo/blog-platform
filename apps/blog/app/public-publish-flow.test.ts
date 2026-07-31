import { expect, test } from "vitest";

test(
  "public publish flow files are importable",
  async () => {
    const content = await import("../lib/content");

    expect(typeof content.getPublishedPosts).toBe("function");
  },
  30000,
);
