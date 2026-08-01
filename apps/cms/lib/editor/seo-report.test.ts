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
      title: "A Practical Guide to Structured Content",
      status: "published",
      slug: "guide",
      excerpt: "A practical guide to Structured Content content.",
      author: "ho",
      publishedAt: "2026-07-30",
    };
    doc.body = [
      createTextNode("heading", "A Practical Guide to Structured Content", { depth: 1 }),
      createTextNode("heading", "Intro", { depth: 2 }),
      createTextNode("heading", "Details", { depth: 2 }),
      { type: "image", src: "/media/cover.webp", alt: "cover" },
      createTextNode("paragraph", "Read more", { href: "/posts/other" }),
    ];
    expect(seoReportForEditorDocument(doc).score).toBeGreaterThanOrEqual(70);
  });

  it("uses the configured site URL in search preview", () => {
    const doc = createEmptyEditorDocument(new Date("2026-07-30"));
    doc.frontmatter.title = "Configured URL";
    doc.frontmatter.slug = "configured-url";
    const report = seoReportForEditorDocument(doc, { siteUrl: "https://example.com" });
    expect(report.searchPreview.url).toBe("https://example.com/posts/configured-url");
  });
});
