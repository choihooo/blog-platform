import { describe, expect, it } from "vitest";

import { createEmptyEditorDocument } from "./document.js";
import { validateEditorDocument } from "./validation.js";

describe("validateEditorDocument", () => {
  it("blocks empty titles and unsafe urls", () => {
    const document = createEmptyEditorDocument();
    document.body = [
      { type: "paragraph", text: "x", href: "javascript:alert(1)" },
      { type: "image", src: "blob:http://local" },
    ];
    expect(validateEditorDocument(document).map((issue) => issue.code)).toEqual([
      "editor.title.required",
      "editor.link.unsafe",
      "editor.image.unsafe",
    ]);
  });

  it("blocks local image paths and unsafe cover paths", () => {
    const document = createEmptyEditorDocument();
    document.frontmatter.title = "Hello";
    document.frontmatter.coverImage = "file:///tmp/a.png";
    document.body = [{ type: "image", src: "/Users/me/a.png" }];
    expect(validateEditorDocument(document).map((issue) => issue.code)).toEqual([
      "editor.coverImage.unsafe",
      "editor.image.local-path",
    ]);
  });

  it("blocks browser attachment image urls", () => {
    const document = createEmptyEditorDocument();
    document.frontmatter.title = "Hello";
    document.frontmatter.coverImage = "attachment:cover:image.png";
    document.body = [{ type: "image", src: "attachment:body:image.png" }];

    expect(validateEditorDocument(document).map((issue) => issue.code)).toEqual([
      "editor.coverImage.unsafe",
      "editor.image.unsafe",
    ]);
  });
});
