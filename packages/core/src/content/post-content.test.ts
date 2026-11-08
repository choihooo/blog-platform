import { describe, expect, it } from "vitest";

import { createEmptyEditorDocument } from "./document.js";
import {
  analyzeEditorNodes,
  editorDocumentToPostContent,
  legacyMarkdownToPostContent,
  loadPostContent,
  postRecordToEditorDocument,
  serializePostContent,
  textFromEditorNodes,
} from "./post-content.js";

describe("post content", () => {
  it("serializes editor documents as structured JSON", () => {
    const document = createEmptyEditorDocument(new Date("2026-08-01T00:00:00.000Z"));
    document.frontmatter.title = "Hello";
    document.body = [
      { type: "heading", depth: 2, text: "Intro" },
      { type: "paragraph", text: "Body" },
    ];

    const content = editorDocumentToPostContent(document);
    const source = serializePostContent(content);

    expect(JSON.parse(source)).toMatchObject({ version: 1 });
    expect(JSON.parse(source).nodes[0]).toMatchObject({ type: "heading", text: "Intro" });
    expect(loadPostContent(source).nodes).toHaveLength(2);
  });

  it("converts legacy markdown strings only as a fallback", () => {
    const content = legacyMarkdownToPostContent("# Title\n\nBody\n\n![Alt](/media/a.webp)");

    expect(content.nodes).toMatchObject([
      { type: "heading", text: "Title" },
      { type: "paragraph", text: "Body" },
      { type: "image", src: "/media/a.webp" },
    ]);
  });

  it("maps post records directly to editor documents", () => {
    const content = serializePostContent({
      version: 1,
      nodes: [{ type: "paragraph", text: "Stored body" }],
    });
    const document = postRecordToEditorDocument({
      id: "post_1",
      slug: "hello",
      title: "Hello",
      content,
      summary: "Summary",
      publishedAt: null,
      updatedAt: "2026-08-01T00:00:00.000Z",
      isPublished: 0,
      viewCount: 0,
      categoryPath: "dev",
      heroImageKey: null,
      tags: ["next"],
    });

    expect(document.frontmatter).toMatchObject({
      title: "Hello",
      status: "draft",
      slug: "hello",
      category: "dev",
      tags: ["next"],
    });
    expect(document.body).toEqual([{ type: "paragraph", text: "Stored body" }]);
  });

  it("drops temporary attachment media when mapping stored records", () => {
    const content = serializePostContent({
      version: 1,
      nodes: [
        { type: "image", src: "attachment:abc:image.png", alt: "broken" },
        { type: "paragraph", text: "Stored body" },
        { type: "image", src: "/media/posts/hello/cover.webp", alt: "valid" },
      ],
    });
    const document = postRecordToEditorDocument({
      id: "post_1",
      slug: "hello",
      title: "Hello",
      content,
      summary: "Summary",
      heroImageKey: "attachment:cover:image.png",
      publishedAt: null,
      updatedAt: "2026-08-01T00:00:00.000Z",
      isPublished: 0,
      viewCount: 0,
    });

    expect(document.frontmatter.coverImage).toBeUndefined();
    expect(document.body).toEqual([
      { type: "paragraph", text: "Stored body" },
      { type: "image", src: "/media/posts/hello/cover.webp", alt: "valid" },
    ]);
  });

  it("analyzes headings, reading time, and plain text without Structured Content", () => {
    const nodes = [
      { type: "heading" as const, depth: 2, text: "Intro" },
      { type: "heading" as const, depth: 2, text: "Intro" },
      { type: "paragraph" as const, text: "one two three" },
    ];

    expect(textFromEditorNodes(nodes)).toContain("one two three");
    expect(analyzeEditorNodes(nodes)).toMatchObject({
      headings: [
        { slug: "intro", text: "Intro" },
        { slug: "intro-2", text: "Intro" },
      ],
      readingTime: { label: "1 min read" },
    });
  });
});
