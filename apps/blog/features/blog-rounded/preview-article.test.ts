import { describe, expect, it } from "vitest";
import { preparePreviewArticle } from "./preview-article";
import type { EditorNode } from "@blog-platform/core/content";

describe("preview article title", () => {
  it("shows the page title once and keeps body anchors consistent without editing source content", () => {
    const nodes: EditorNode[] = [
      { type: "heading", depth: 1, text: "Nest DI" },
      { type: "heading", depth: 2, text: "왜 필요할까" },
    ];
    const result = preparePreviewArticle({ title: "Nest DI", bodyNodes: nodes, toc: [] });
    expect(result.nodes).toEqual([nodes[1]]);
    expect(result.toc).toEqual([{ depth: 2, text: "왜 필요할까", slug: "왜-필요할까" }]);
    expect(nodes).toHaveLength(2);
  });
  it("preserves a heading with a different meaning", () => {
    const nodes: EditorNode[] = [{ type: "heading", depth: 1, text: "다른 이야기" }];
    expect(preparePreviewArticle({ title: "Nest DI", bodyNodes: nodes, toc: [] }).nodes).toBe(
      nodes,
    );
  });
});
