import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { expect, it } from "vitest";
import { previewSlugCandidate } from "./preview-slug";

it("keeps the saved path ahead of a changed title for preview fallback", () => {
  const document = createEmptyEditorDocument();
  document.path = "db/posts/original-slug";
  document.frontmatter.title = "Changed title";
  expect(previewSlugCandidate(document)).toBe("original-slug");
  document.frontmatter.slug = "explicit-slug";
  expect(previewSlugCandidate(document)).toBe("explicit-slug");
});

it("normalizes an ID fallback for preview without changing the client policy", () => {
  const document = createEmptyEditorDocument();
  document.id = "Draft ID";
  document.frontmatter.title = "한글 제목";
  expect(previewSlugCandidate(document)).toBe("draft-id");
});
