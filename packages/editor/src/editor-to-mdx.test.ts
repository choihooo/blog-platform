import { describe, expect, it } from "vitest";

import { createEmptyEditorDocument } from "./document.js";
import { editorDocumentToMdx } from "./editor-to-mdx.js";

describe("editorDocumentToMdx", () => {
  it("serializes frontmatter and supported blocks", () => {
    const document = createEmptyEditorDocument();
    document.frontmatter.title = "Hello";
    document.body = [
      { type: "heading", depth: 1, text: "Hello" },
      { type: "paragraph", text: "Read more", href: "/posts/next" },
      { type: "codeBlock", language: "ts", text: "const x = 1;" },
    ];
    const result = editorDocumentToMdx(document);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.source).toContain("```ts\nconst x = 1;\n```");
  });
});
