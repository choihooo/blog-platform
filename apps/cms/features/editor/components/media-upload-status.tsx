import type { UploadEditorMediaResult } from "../model/media";

export function MediaUploadStatus({
  result,
  pending,
}: {
  result?: UploadEditorMediaResult;
  pending?: boolean;
}) {
  if (pending) return <p className="text-xs text-muted-foreground">Uploading image...</p>;
  if (!result) return null;
  if (result.ok) return <p className="text-xs text-muted-foreground">{result.message}</p>;
  return (
    <p className="text-xs text-destructive">
      {result.message}
      {result.retryable ? " Try again." : ""}
    </p>
  );
}
