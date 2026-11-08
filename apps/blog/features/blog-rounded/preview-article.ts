import { analyzeEditorNodes } from "@blog-platform/core/content";
import type { PublicPost } from "../blog/server/content-source-types";

export function preparePreviewArticle(post: Pick<PublicPost, "title" | "bodyNodes" | "toc">) {
  const first = post.bodyNodes[0];
  const repeatedTitle =
    first?.type === "heading" && first.depth === 1 && first.text.trim() === post.title.trim();
  if (!repeatedTitle) return { nodes: post.bodyNodes, toc: post.toc };
  const nodes = post.bodyNodes.slice(1);
  return { nodes, toc: analyzeEditorNodes(nodes).headings };
}
