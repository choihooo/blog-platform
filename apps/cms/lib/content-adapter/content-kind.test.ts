import { describe, expect, it } from "vitest";
import { classifyRepositoryPath } from "./paths.js";

describe("content kind classification", () => {
  it("classifies sample paths", () => {
    expect(classifyRepositoryPath("content/posts/hello-world.mdx")).toBe("post");
    expect(classifyRepositoryPath("content/authors/ho.md")).toBe("author");
    expect(classifyRepositoryPath("content/categories.json")).toBe("category-config");
    expect(classifyRepositoryPath("content/tags.json")).toBe("tag-config");
    expect(classifyRepositoryPath("public/media/covers/cover.webp")).toBe("media");
  });
});
