import { analyzeMdx } from "@blog-platform/markdown";

import { editorDocumentToMdx } from "./editor-to-mdx.js";
import { createEditorIssue, type EditorDocument, type PreviewResult } from "./document.js";

export function previewEditorDocument(document: EditorDocument): PreviewResult {
  const serialized = editorDocumentToMdx(document);
  if (!serialized.ok) {
    return {
      headings: [],
      codeBlocks: [],
      readingTime: { minutes: 0, words: 0, label: "0 min read" },
      warnings: serialized.issues,
    };
  }
  const analysis = analyzeMdx({
    path: document.path ?? "content/posts/draft.mdx",
    source: serialized.source,
  });
  if (!analysis.success || !analysis.data) {
    return {
      headings: [],
      codeBlocks: [],
      readingTime: { minutes: 0, words: 0, label: "0 min read" },
      warnings: analysis.issues.map((issue) =>
        createEditorIssue(issue.code, issue.message, issue.path, issue.severity ?? "warning"),
      ),
    };
  }
  return {
    headings: analysis.data.headings,
    codeBlocks: analysis.data.codeBlocks,
    readingTime: analysis.data.readingTime,
    warnings: analysis.data.warnings.map((issue) =>
      createEditorIssue(issue.code, issue.message, issue.path, issue.severity ?? "warning"),
    ),
  };
}
