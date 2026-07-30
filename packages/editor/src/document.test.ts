import { describe, expect, it } from "vitest";

import { createEmptyEditorDocument, createTextNode } from "./document.js";

describe("editor document", () => {
  it("creates an empty draft document", () => {
    const document = createEmptyEditorDocument(new Date("2026-07-30T00:00:00.000Z"));
    expect(document.frontmatter.status).toBe("draft");
    expect(document.frontmatter.title).toBe("");
    expect(document.dirty).toBe(false);
    expect(document.body).toEqual([]);
  });

  it("creates supported text nodes", () => {
    expect(createTextNode("heading", "Title", { depth: 2 })).toMatchObject({
      type: "heading",
      text: "Title",
      depth: 2,
    });
  });
});
