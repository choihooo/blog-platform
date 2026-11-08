import type { EditorDocument } from "@blog-platform/core/content";
import { previewEditorDocument } from "@blog-platform/core/content";

type PreviewPanelProps = {
  document: EditorDocument;
  html: string;
};

export function PreviewPanel({ document, html }: PreviewPanelProps) {
  const preview = previewEditorDocument(document);

  return (
    <section className="space-y-4 border-t border-border p-4">
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{preview.readingTime.label}</span>
        <span>{preview.headings.length} headings</span>
        <span>{preview.codeBlocks.length} code blocks</span>
      </div>
      {preview.warnings.length > 0 ? (
        <div className="space-y-1 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {preview.warnings.map((warning) => (
            <p key={`${warning.path}-${warning.message}`}>{warning.message}</p>
          ))}
        </div>
      ) : null}
      <div className="cms-live-preview post-preview space-y-2">
        <h3 className="text-sm font-semibold">Document preview</h3>
        <article
          className="main-content-preview cms-live-preview-body rounded-md border border-border bg-background p-4"
          dangerouslySetInnerHTML={{
            __html:
              html.trim() ||
              "<p class='text-sm text-muted-foreground'>미리보기에 표시할 내용이 없습니다.</p>",
          }}
        />
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
