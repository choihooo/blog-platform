import { describe, expect, it } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/editor";
import { analyticsLinksForEditorDocument } from "./analytics-links";

describe("analyticsLinksForEditorDocument", () => {
  it("only enables public links for published posts", () => {
    const draft = createEmptyEditorDocument(new Date("2026-07-30"));
    expect(analyticsLinksForEditorDocument(draft).publicPostUrl).toBeUndefined();
    draft.frontmatter = { title: "Hello", status: "published", slug: "hello" };
    expect(analyticsLinksForEditorDocument(draft).publicPostUrl).toBe(
      "http://localhost:3000/posts/hello",
    );
  });
});
