import { describe, expect, it } from "vitest";

import { createEmptyEditorDocument } from "./document.js";
import { previewEditorDocument } from "./preview.js";

describe("previewEditorDocument", () => {
  it("returns headings and code block analysis", () => {
    const document = createEmptyEditorDocument();
    document.frontmatter.title = "Hello";
    document.body = [
      { type: "heading", depth: 2, text: "Intro" },
      { type: "codeBlock", language: "ts", text: "const x = 1;" },
    ];
    const preview = previewEditorDocument(document);
    expect(preview.headings[0]?.text).toBe("Intro");
    expect(preview.codeBlocks[0]?.language).toBe("ts");
  });
});
