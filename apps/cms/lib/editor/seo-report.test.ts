import { describe, expect, it } from "vitest";
import { createEmptyEditorDocument, createTextNode } from "@blog-platform/editor";
import { seoReportForEditorDocument } from "./seo-report";

describe("seoReportForEditorDocument", () => {
  it("returns blocking issues for incomplete documents", () => {
    const report = seoReportForEditorDocument(createEmptyEditorDocument(new Date("2026-07-30")));
    expect(report.status).toBe("blocking");
  });

  it("scores complete editor documents", () => {
    const doc = createEmptyEditorDocument(new Date("2026-07-30"));
    doc.frontmatter = {
      title: "A Practical Guide to MDX",
      status: "published",
      slug: "guide",
      excerpt: "A practical guide to MDX content.",
      author: "ho",
      publishedAt: "2026-07-30",
    };
    doc.body = [
      createTextNode("heading", "A Practical Guide to MDX", { depth: 1 }),
      createTextNode("heading", "Intro", { depth: 2 }),
      createTextNode("heading", "Details", { depth: 2 }),
      { type: "image", src: "/media/cover.webp", alt: "cover" },
      createTextNode("paragraph", "Read more", { href: "/posts/other" }),
    ];
    expect(seoReportForEditorDocument(doc).score).toBeGreaterThanOrEqual(70);
  });
});
