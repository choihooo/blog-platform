import { describe, expect, it } from "vitest";
import {
  analyzeEditorNodes,
  legacyMarkdownToPostContent,
  loadPostContent,
  serializePostContent,
} from "./post-content.js";

describe("content preservation regressions", () => {
  it("analyzes nested headings and code in the same order as the renderer", () => {
    expect(
      analyzeEditorNodes([
        {
          type: "blockquote",
          text: "",
          children: [
            { type: "heading", text: "Same", depth: 2 },
            { type: "codeBlock", text: "code", language: "ts" },
          ],
        },
        { type: "heading", text: "Same", depth: 2 },
      ]),
    ).toMatchObject({
      headings: [{ slug: "same" }, { slug: "same-2" }],
      codeBlocks: [{ language: "ts" }],
    });
  });
  it("preserves fenced JSX and generics with blank lines and indentation", () => {
    const code =
      'function App<T>() {\n  const label = "<literal>";\n\n  return <RouterProvider router={router} />;\n}';
    const result = legacyMarkdownToPostContent(`## Example\n\n\`\`\`tsx\n${code}\n\`\`\`\n\nAfter`);
    expect(result.nodes).toMatchObject([
      { type: "heading", text: "Example" },
      { type: "codeBlock", language: "tsx", text: code },
      { type: "paragraph", text: "After" },
    ]);
  });

  it("keeps table cell boundaries instead of flattening rows into a paragraph", () => {
    const result = legacyMarkdownToPostContent(
      "| Region | Rate |\n| --- | --- |\n| 서울 | **55.9%** |",
    );
    expect(result.nodes[0]).toMatchObject({
      type: "table",
      rows: [
        [
          { header: true, body: [{ text: "Region" }] },
          { header: true, body: [{ text: "Rate" }] },
        ],
        [{ body: [{ text: "서울" }] }, { body: [{ text: "55.9%" }] }],
      ],
    });
    expect(loadPostContent(serializePostContent(result))).toEqual(result);
  });

  it("preserves separate inline mark ranges", () => {
    const result = legacyMarkdownToPostContent("**First** plain **second** and `a_b`");
    expect(result.nodes[0]).toMatchObject({
      type: "paragraph",
      text: "First plain second and a_b",
      content: [
        { text: "First", marks: ["bold"] },
        { text: " plain " },
        { text: "second", marks: ["bold"] },
        { text: " and " },
        { text: "a_b", marks: ["inlineCode"] },
      ],
    });
  });

  it("does not turn the paragraph following an image into a caption", () => {
    expect(
      legacyMarkdownToPostContent("![Alt](/media/a.webp)\n\nThis is the introduction.").nodes,
    ).toMatchObject([
      { type: "image", src: "/media/a.webp", alt: "Alt" },
      { type: "paragraph", text: "This is the introduction." },
    ]);
  });

  it("preserves a linked image and explicit numbered list start", () => {
    const result = legacyMarkdownToPostContent(
      "[![Alt](/media/a.webp)](https://example.com)\n\n3. first\n4. second",
    );
    expect(result.nodes).toMatchObject([
      { type: "image", src: "/media/a.webp", href: "https://example.com" },
      { type: "orderedList", start: 3, items: [[{ text: "first" }], [{ text: "second" }]] },
    ]);
  });
});
