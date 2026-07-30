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
});
