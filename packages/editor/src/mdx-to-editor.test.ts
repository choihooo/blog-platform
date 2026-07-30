import { describe, expect, it } from "vitest";

import { mdxToEditorDocument } from "./mdx-to-editor.js";

describe("mdxToEditorDocument", () => {
  it("loads supported frontmatter and body", () => {
    const result = mdxToEditorDocument({
      path: "content/posts/hello.mdx",
      sha: "sha",
      source: "---\ntitle: Hello\nstatus: draft\n---\n\n# Hello\n\nBody",
    });
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.document.body.map((node) => node.type)).toEqual(["heading", "paragraph"]);
  });

  it("blocks unsupported MDX", () => {
    const result = mdxToEditorDocument({
      path: "content/posts/bad.mdx",
      sha: "sha",
      source: "---\ntitle: Bad\nstatus: draft\n---\n\nimport X from './x'\n\n<X />",
    });
    expect(result.ok).toBe(false);
  });
});
