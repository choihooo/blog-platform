import { previewEditorDocument, type EditorDocument } from "@blog-platform/editor";

export function PreviewPanel({ document }: { document: EditorDocument }) {
  const preview = previewEditorDocument(document);

  return (
    <section className="space-y-4 border-t border-border p-4">
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{preview.readingTime.label}</span>
        <span>{preview.headings.length} headings</span>
        <span>{preview.codeBlocks.length} code blocks</span>
      </div>
      {preview.headings.length > 0 ? (
        <ol className="space-y-1 text-sm">
          {preview.headings.map((heading) => (
            <li key={heading.slug}>{heading.text}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">No headings yet.</p>
      )}
    </section>
  );
}
