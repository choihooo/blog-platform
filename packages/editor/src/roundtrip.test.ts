import { describe, expect, it } from "vitest";

import { createEmptyEditorDocument } from "./document.js";
import { roundTripEditorDocument } from "./roundtrip.js";

describe("roundTripEditorDocument", () => {
  it("preserves supported content meaning", () => {
    const document = createEmptyEditorDocument();
    document.frontmatter.title = "Round";
    document.body = [
      { type: "paragraph", text: "Hello" },
      { type: "heading", depth: 2, text: "Heading" },
      { type: "bulletList", text: "Item" },
      { type: "blockquote", text: "Quote" },
      { type: "horizontalRule" },
      { type: "image", src: "/media/posts/round/image.webp", alt: "Alt" },
      { type: "codeBlock", language: "ts", text: "const x = 1;" },
    ];
    const result = roundTripEditorDocument(document);
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.document.body.map((node) => node.type)).toEqual(
        document.body.map((node) => node.type),
      );
  });
});
