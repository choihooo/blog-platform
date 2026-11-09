import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { describe, expect, it } from "vitest";
import { slugCandidate } from "./document-slug";

describe("editor document slug", () => {
  it("preserves an explicit slug and derives a fallback without losing document identity", () => {
    const document = createEmptyEditorDocument();
    document.frontmatter.title = "Hello World";
    expect(slugCandidate(document)).toBe("hello-world");
    document.frontmatter.slug = "Exact-Slug";
    expect(slugCandidate(document)).toBe("Exact-Slug");
    document.frontmatter.slug = "";
    document.frontmatter.title = "한글 제목";
    expect(slugCandidate(document)).toBe(document.id);
  });
});
