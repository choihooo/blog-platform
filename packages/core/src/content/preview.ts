import type { EditorDocument, PreviewResult } from "./document.js";
import { previewEditorDocumentFromNodes } from "./post-content.js";

export function previewEditorDocument(document: EditorDocument): PreviewResult {
  return previewEditorDocumentFromNodes(document);
}
