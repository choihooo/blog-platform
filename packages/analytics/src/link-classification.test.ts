import { describe, expect, it } from "vitest";
import { classifyLink } from "./link-classification.js";

describe("classifyLink", () => {
  it("classifies internal, external, and ignored links", () => {
    expect(classifyLink("/posts/hello", "https://example.com").kind).toBe("internal");
    expect(classifyLink("https://example.com/tags/content-json", "https://example.com").kind).toBe(
      "internal",
    );
    expect(classifyLink("https://openai.com", "https://example.com").kind).toBe("external");
    expect(classifyLink("#intro", "https://example.com").kind).toBe("ignored");
    expect(classifyLink("mailto:a@example.com", "https://example.com").kind).toBe("ignored");
  });
});
