import type { EditorDocument } from "./document.js";
import { editorDocumentToMdx } from "./editor-to-mdx.js";
import { mdxToEditorDocument } from "./mdx-to-editor.js";

export function roundTripEditorDocument(document: EditorDocument) {
  const serialized = editorDocumentToMdx(document);
  if (!serialized.ok) return serialized;
  return mdxToEditorDocument({
    path: document.path ?? "content/posts/draft.mdx",
    sha: document.sourceSha ?? "roundtrip",
    source: serialized.source,
  });
}
