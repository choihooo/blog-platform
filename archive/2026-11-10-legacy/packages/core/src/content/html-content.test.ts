import { expect, it } from "vitest";
import { htmlToEditorNodes } from "./html-content.js";
import { createEmptyEditorDocument } from "./document.js";
import { validateEditorDocument } from "./validation.js";

it("preserves escaped JSX, generic code, h1, tables and explicit figcaption", () => {
  const nodes = htmlToEditorNodes(
    '<h1>Title</h1><pre><code class="language-tsx">function App&lt;T&gt;() {\n\n  return &lt;RouterProvider /&gt;;\n}</code></pre><table><tr><th colspan="2">Header</th></tr><tr><td>A</td><td><strong>B</strong></td></tr></table><figure><a href="https://example.com"><img src="/media/a.webp" alt="A"></a><figcaption><em>Source</em></figcaption></figure><p>Introduction</p>',
  );
  expect(nodes).toMatchObject([
    { type: "heading", depth: 1, text: "Title" },
    { type: "codeBlock", text: "function App<T>() {\n\n  return <RouterProvider />;\n}" },
    {
      type: "table",
      rows: [
        [{ header: true, colspan: 2 }],
        [
          { body: [{ text: "A" }] },
          { body: [{ text: "B", content: [{ text: "B", marks: ["bold"] }] }] },
        ],
      ],
    },
    {
      type: "image",
      caption: "Source",
      href: "https://example.com",
      captionContent: [{ text: "Source", marks: ["italic"] }],
    },
    { type: "paragraph", text: "Introduction" },
  ]);
});

it("does not execute or retain unsafe HTML/URLs", () => {
  const nodes = htmlToEditorNodes(
    '<script>alert(1)</script><p onclick="alert(1)"><a href="javascript:alert(1)">Safe text</a></p><img src="data:image/png,abc">',
  );
  expect(nodes).toMatchObject([{ type: "paragraph", text: "Safe text" }]);
  expect(JSON.stringify(nodes)).not.toMatch(/javascript:|data:|onclick|alert/);
});

it("validates unsafe URLs inside nested tables and inline runs before storage", () => {
  const doc = createEmptyEditorDocument();
  doc.frontmatter.title = "Test";
  doc.body = [
    {
      type: "table",
      rows: [
        [
          {
            body: [
              {
                type: "paragraph",
                text: "unsafe",
                content: [{ text: "unsafe", href: "javascript:alert(1)" }],
              },
            ],
          },
        ],
      ],
    },
  ];
  expect(validateEditorDocument(doc).some((issue) => issue.code === "editor.link.unsafe")).toBe(
    true,
  );
});

it("keeps Tistory span-wrapped images and text around linked images", () => {
  expect(
    htmlToEditorNodes(
      '<figure class="imageblock"><span data-url="x"><img src="/media/a.webp"></span><figcaption>Caption</figcaption></figure>',
    ),
  ).toMatchObject([{ type: "image", src: "/media/a.webp", caption: "Caption" }]);
  expect(
    htmlToEditorNodes(
      '<p><a href="https://example.com">before<img src="/media/a.webp">after</a></p>',
    ),
  ).toMatchObject([
    { type: "paragraph", text: "before" },
    { type: "image", src: "/media/a.webp", href: "https://example.com" },
    { type: "paragraph", text: "after" },
  ]);
});

it("preserves an original HTML code block terminal newline exactly", () => {
  expect(htmlToEditorNodes("<pre><code>a\n\n</code></pre>")).toEqual([
    { type: "codeBlock", text: "a\n\n" },
  ]);
});
