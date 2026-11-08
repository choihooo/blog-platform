import { expect, it } from "vitest";
import { editorNodesToTiptap, tiptapToEditorNodes } from "./tiptap-content.js";

it("round trips partial marks, nested numbered lists, table spans and image captions", () => {
  const json = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Before " },
          { type: "text", text: "bold", marks: [{ type: "bold" }] },
          {
            type: "text",
            text: " link",
            marks: [{ type: "link", attrs: { href: "https://example.com" } }],
          },
        ],
      },
      {
        type: "orderedList",
        attrs: { start: 3 },
        content: [
          {
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "one" }] },
              {
                type: "bulletList",
                content: [
                  {
                    type: "listItem",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "nested" }] }],
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "two" }] }],
          },
        ],
      },
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                attrs: { colspan: 2, rowspan: 1 },
                content: [{ type: "paragraph", content: [{ type: "text", text: "heading" }] }],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [{ type: "paragraph", content: [{ type: "text", text: "a" }] }],
              },
              {
                type: "tableCell",
                content: [{ type: "paragraph", content: [{ type: "text", text: "b" }] }],
              },
            ],
          },
        ],
      },
      {
        type: "image",
        attrs: {
          src: "/media/a.webp",
          alt: "Alt",
          caption: "Caption",
          href: "https://example.com",
        },
      },
    ],
  };
  const nodes = tiptapToEditorNodes(json);
  expect(nodes[0]).toMatchObject({
    text: "Before bold link",
    content: [
      { text: "Before " },
      { text: "bold", marks: ["bold"] },
      { text: " link", href: "https://example.com" },
    ],
  });
  expect(nodes[1]).toMatchObject({
    type: "orderedList",
    start: 3,
    items: [
      [{ text: "one" }, { type: "bulletList", items: [[{ text: "nested" }]] }],
      [{ text: "two" }],
    ],
  });
  expect(nodes[2]).toMatchObject({
    type: "table",
    rows: [
      [{ header: true, colspan: 2, body: [{ text: "heading" }] }],
      [{ body: [{ text: "a" }] }, { body: [{ text: "b" }] }],
    ],
  });
  expect(tiptapToEditorNodes(editorNodesToTiptap(nodes))).toEqual(nodes);
});

it("refuses unknown editor blocks instead of silently deleting their content", () => {
  expect(() =>
    tiptapToEditorNodes({
      type: "doc",
      content: [{ type: "unsupportedWidget", content: [{ type: "text", text: "Do not lose me" }] }],
    }),
  ).toThrow(/unsupported/i);
});

it("keeps literal Markdown typed as plain text literal on reopening", () => {
  const stored = tiptapToEditorNodes({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "**literal**" }] }],
  });
  expect(editorNodesToTiptap(stored).content?.[0]?.content).toEqual([
    { type: "text", text: "**literal**" },
  ]);
});
