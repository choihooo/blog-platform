import { describe, expect, it } from "vitest";
import { assertAllowedPath, normalizeRepositoryPath } from "./paths.js";

describe("repository path boundaries", () => {
  it("allows content and media paths", () => {
    expect(assertAllowedPath("db/posts/a")?.kind).toBe("post");
    expect(assertAllowedPath("content/authors/ho.md")?.kind).toBe("author");
    expect(assertAllowedPath("content/site.json")?.kind).toBe("site-config");
    expect(assertAllowedPath("public/media/posts/a.webp")?.kind).toBe("media");
  });

  it("rejects traversal, absolute, and hidden workflow paths", () => {
    expect(normalizeRepositoryPath("../db/posts/a")).toBeNull();
    expect(assertAllowedPath("/db/posts/a")).toBeNull();
    expect(assertAllowedPath(".github/workflows/ci.yml")).toBeNull();
    expect(assertAllowedPath("README.md")).toBeNull();
  });
});
